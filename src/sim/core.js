// @flow strict

import fs from 'fs';
import path from 'path';

import invariant from 'invariant';
import { maxBy, minBy, sortBy } from 'lodash';

import ast from '../ast';
import type { DataType } from '../ast';
import type { Encoding } from '../ast/encodings';
import { makeEncoding } from '../ast/encodings';
import parseSql from '../parser';
import type { AlterSpec, AlterTableStatement, ColumnDefinition, CreateTableStatement, Statement } from '../parser';
import type { MySQLVersion } from '../printer/utils';
import Column from './Column';
import Database from './Database';
import type { Options } from './Database';
import { setEncoding } from './DataType';

const DEFAULT_VERSION: MySQLVersion = '5.7';
const DEFAULT_OPTIONS = {
  mysqlVersion: DEFAULT_VERSION,
  defaultEncoding: makeEncoding(DEFAULT_VERSION, undefined, undefined),
};

function setEncodingIfNull<T: DataType>(dataType: T, encoding: Encoding): T {
  if (
    !(
      // TODO: Ideally, just use `isTextualOrEnum()` here, but Flow's %checks
      // predicates don't work across module boundaries :(
      (
        dataType._kind === 'Char' ||
        dataType._kind === 'VarChar' ||
        dataType._kind === 'Text' ||
        dataType._kind === 'MediumText' ||
        dataType._kind === 'LongText' ||
        dataType._kind === 'Enum'
      )
    )
  ) {
    // Not a textual column - ignore
    return dataType;
  }

  if (dataType.encoding === null) {
    return setEncoding(dataType, encoding);
  } else {
    return dataType;
  }
}

// Example: 0001-0005_initial.sql
export type MigrationInfo = {|
  seqFrom: number, // 1
  seqTo: number | null, // 5
  versions: Array<number>, // [1, 2, 3, 4, 5]
  title: string, // 'initial'
  filename: string, // '0001-0005_initial.sql'
  fullpath: string, // '/path/to/migrations/0001-0005_initial.sql'
|};

/**
 * Get all migration files from a given directory.
 */
export function getMigrations(dirpath: string): Array<MigrationInfo> {
  const absdir = path.resolve(dirpath);
  const fullpaths = fs.readdirSync(absdir).map((f) => path.join(absdir, f));
  const migrations = sortBy(
    fullpaths
      .map((fullpath) => {
        const filename = path.basename(fullpath);
        const match = filename.match(/^(\d+)(?:-(\d+))?_(.*)[.]sql$/);
        //                             ^^^^^    ^^^^^   ^^^^
        //                               1        2      3
        if (!match) {
          return null;
        }

        const seqFrom = Number(match[1]);
        const seqTo = match[2] ? Number(match[2]) : null;
        const title = match[3];

        const versions = [seqFrom];
        if (seqTo !== null) {
          invariant(seqTo >= seqFrom, `Invalid range: ${seqFrom}-${seqTo}`);
          for (let n = seqFrom + 1; n <= seqTo; ++n) {
            versions.push(n);
          }
        }
        return { seqFrom, seqTo, versions, title, filename, fullpath };
      })
      .filter(Boolean),
    (mig) => mig.seqFrom,
  );
  ensureConsecutive(migrations.flatMap((mig) => mig.versions));
  return migrations;
}

const error = console.error;

function makeColumn(colName, def: ColumnDefinition, tableEncoding: Encoding, target: MySQLVersion): Column {
  const dataType = def.dataType;
  let defaultValue = def.defaultValue;
  let onUpdate = def.onUpdate;

  // Whether a definition is "NOT NULL" or "NULL" by default, depends on the
  // data type. In MySQL 5.7, TIMESTAMP columns are NOT NULL unless explicitly
  // specified. All other types are NULL unless explicitly specified. In MySQL
  // 8.0, this is more consistent and TIMESTAMP columns are no longer an
  // exception.
  let nullable = def.nullable;
  if (nullable === null) {
    nullable = target !== '5.7' || dataType._kind !== 'Timestamp'; // Could also be "timestamp(6)"
  }

  if (dataType._kind === 'Timestamp') {
    if (!nullable && defaultValue === null) {
      // If explicit default value is missing, then MySQL assumes the DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      defaultValue = ast.CurrentTimestamp(dataType.fsp);
      onUpdate = ast.CurrentTimestamp(dataType.fsp);
    }
  }

  return new Column(
    colName,
    target === '5.7' ? setEncodingIfNull(def.dataType, tableEncoding) : def.dataType,
    nullable,
    defaultValue,
    onUpdate,
    def.autoIncrement,
    def.comment,
    def.generated,
  );
}

function handleCreateTable(db_: Database, stm: CreateTableStatement): Database {
  const target = db_.options.mysqlVersion;
  const tblName = stm.tblName;
  let encoding;
  if (stm.options?.CHARSET || stm.options?.COLLATE) {
    encoding = makeEncoding(target, stm.options.CHARSET ?? undefined, stm.options.COLLATE ?? undefined);
  } else {
    encoding = db_.options.defaultEncoding;
  }

  let db = db_.createTable(tblName, encoding);

  // One-by-one, add the columns to the table
  const columns = stm.definitions.map((def) => (def._kind === 'Column' ? def : null)).filter(Boolean);
  for (const coldef of columns) {
    const table = db.getTable(tblName);
    db = db.addColumn(tblName, makeColumn(coldef.colName, coldef.definition, table.defaultEncoding, target), null);
  }

  // Add a primary key, if any. A primary key can be added explicitly (1), or
  // defined on a column directly (2).

  const pks = [
    // (1) Explicit PRIMARY KEY definitions
    ...stm.definitions
      .map((def) => (def._kind === 'PrimaryKey' ? def.indexColNames.map((def) => def.colName) : null))
      .filter(Boolean),

    // (2) Primary key can also be defined on a column declaratively
    ...columns.filter((c) => c.definition.isPrimary).map((c) => [c.colName]),
  ];

  for (const pk of pks) {
    db = db.addPrimaryKey(tblName, pk);
  }

  // (2) Shorthand syntax to define index on a column directly
  for (const col of columns.filter((c) => c.definition.isUnique)) {
    db = db.addIndex(tblName, null, 'UNIQUE', [col.colName], true);
  }

  // Add indexes, if any. Indexes can be added explicitly (1), or defined on
  // a column directly (2).
  const indexes = stm.definitions
    .map((def) =>
      def._kind === 'ForeignKey' ||
      def._kind === 'FullTextIndex' ||
      def._kind === 'UniqueIndex' ||
      def._kind === 'Index'
        ? def
        : null,
    )
    .filter(Boolean);
  for (const index of indexes) {
    if (index._kind === 'ForeignKey') {
      db = db.addForeignKey(
        tblName,
        index.constraintName,
        index.indexName,
        index.indexColNames.map((def) => def.colName), // Local columns
        index.reference.tblName, // Foreign/target table
        index.reference.indexColNames.map((def) => def.colName), // Foreign/target columns
        index.reference.onDelete,
      );
    } else {
      const type = index._kind === 'UniqueIndex' ? 'UNIQUE' : index._kind === 'FullTextIndex' ? 'FULLTEXT' : 'NORMAL';
      const $$locked = true;
      db = db.addIndex(
        tblName,
        index.indexName || null,
        type,
        index.indexColNames.map((def) => def.colName),
        $$locked,
      );
    }
  }

  return db;
}

function applyAlterStatement(db: Database, statement: AlterTableStatement, change: AlterSpec): Database {
  const target = db.options.mysqlVersion;
  switch (change._kind) {
    case 'AlterRenameTable':
      return db.renameTable(statement.tblName, change.newTblName);

    case 'AlterAddColumn': {
      const table = db.getTable(statement.tblName);
      const column = makeColumn(change.colName, change.definition, table.defaultEncoding, target);
      let newDb = db.addColumn(statement.tblName, column, change.position);
      if (change.definition.isPrimary) {
        return newDb.addPrimaryKey(statement.tblName, [change.colName]);
      } else if (change.definition.isUnique) {
        return newDb.addIndex(statement.tblName, null, 'UNIQUE', [change.colName], true);
      } else {
        return newDb;
      }
    }

    case 'AlterChangeColumn': {
      const table = db.getTable(statement.tblName);
      const column = makeColumn(change.newColName, change.definition, table.defaultEncoding, target);
      let newDb = db.replaceColumn(statement.tblName, change.oldColName, column, change.position);
      if (change.definition.isUnique) {
        return newDb.addIndex(statement.tblName, null, 'UNIQUE', [change.newColName], true);
      } else {
        return newDb;
      }
    }

    case 'AlterDropColumn':
      return db.removeColumn(statement.tblName, change.colName);

    case 'AlterAddPrimaryKey':
      return db.addPrimaryKey(
        statement.tblName,
        change.indexColNames.map((col) => col.colName),
      );

    case 'AlterDropPrimaryKey':
      return db.dropPrimaryKey(statement.tblName);

    case 'AlterAddForeignKey':
      return db.addForeignKey(
        statement.tblName,
        change.constraintName,
        change.indexName,
        change.indexColNames.map((def) => def.colName),
        change.reference.tblName,
        change.reference.indexColNames.map((def) => def.colName),
        change.reference.onDelete,
      );

    case 'AlterAddUniqueIndex':
      return db.addIndex(
        statement.tblName,
        change.constraintName || change.indexName,
        'UNIQUE',
        change.indexColNames.map((def) => def.colName),
        true, // UNIQUE indexes are always explicit
      );

    case 'AlterAddFullTextIndex': {
      const $$locked = false;
      return db.addIndex(
        statement.tblName,
        change.indexName,
        'FULLTEXT',
        change.indexColNames.map((def) => def.colName),
        $$locked,
      );
    }

    case 'AlterAddIndex': {
      const $$locked = !!change.indexName;
      return db.addIndex(
        statement.tblName,
        change.indexName,
        'NORMAL',
        change.indexColNames.map((def) => def.colName),
        $$locked,
      );
    }

    case 'AlterDropIndex':
      return db.dropIndex(statement.tblName, change.indexName);

    case 'AlterDropForeignKey':
      return db.dropForeignKey(statement.tblName, change.symbol);

    case 'AlterDropDefault':
      return db.dropDefault(statement.tblName, change.colName);

    case 'AlterRenameIndex':
      return db.renameIndex(statement.tblName, change.oldIndexName, change.newIndexName);

    case 'AlterTableOptions': {
      const charset = change.options.CHARSET ?? undefined;
      const collate = change.options.COLLATE ?? undefined;
      if (charset || collate) {
        return db.setDefaultTableEncoding(statement.tblName, charset, collate, target);
      } else {
        return db;
      }
    }

    case 'AlterConvertTo': {
      const charset = change.charset;
      const collate = change.collate ?? undefined;
      return db.convertToEncoding(statement.tblName, charset, collate, target);
    }

    default: {
      // Log details to the console (useful for debugging)
      error(`Unknown alter spec: ${change._kind}`);
      error(JSON.stringify({ statement, change }, null, 2));

      // Error out
      throw new Error(`Unknown alter spec: ${change._kind}`);
    }
  }
}

function applyStatement(db: Database, statement: Statement): Database {
  const target = db.options.mysqlVersion;
  switch (statement._kind) {
    case 'CreateTableStatement':
      return handleCreateTable(db, statement);

    case 'CreateTableLikeStatement':
      return db.cloneTable(statement.oldTblName, statement.tblName);

    case 'DropTableStatement':
      return db.removeTable(statement.tblName, statement.ifExists);

    case 'AlterDatabaseStatement': {
      const charset = statement.options.CHARSET ?? undefined;
      const collate = statement.options.COLLATE ?? undefined;
      const encoding = charset || collate ? makeEncoding(target, charset, collate) : db.options.defaultEncoding;
      return db.setEncoding(encoding);
    }

    case 'AlterTableStatement': {
      const order = ['*', 'DROP FOREIGN KEY', 'DROP COLUMN'];
      const changes = sortBy(statement.changes, (change) => order.indexOf(change._kind));
      let newDb = db;
      for (const change of changes) {
        newDb = applyAlterStatement(newDb, statement, change);
      }
      return newDb;
    }

    case 'RenameTableStatement':
      return db.renameTable(statement.tblName, statement.newName);

    case 'CreateIndexStatement': {
      const $$locked = !!statement.indexName;
      return db.addIndex(
        statement.tblName,
        statement.indexName,
        statement.indexKind,
        statement.indexColNames.map((def) => def.colName),
        $$locked,
      );
    }

    case 'DropIndexStatement':
      return db.dropIndex(statement.tblName, statement.indexName);

    case 'CreateFunctionStatement':
    case 'CreateTriggerStatement':
      // Ignore these, these are no-ops
      return db;

    default: {
      // Log details to the console (useful for debugging)
      error(`Unknown statement type: ${statement._kind}`);
      error(JSON.stringify({ statement }, null, 2));
      throw new Error(`Unknown statement type: ${statement._kind}`);
    }
  }
}

function applySqlStatements(db_: Database, statements: Array<Statement>): Database {
  let db = db_; // So we can keep re-assigning this variable

  for (const statement of statements) {
    if (statement === null) {
      continue;
    }

    db = applyStatement(db, statement);
  }

  return db;
}

/**
 * Returns the new DB state given an initial DB state, and a SQL expression to
 * apply. The `srcFile` argument is used to provide friendly error reporting.
 * Does not modify the original input DB state.
 */
export function applySql(db: Database, sql: string, srcFile: string): Database {
  const ast: Array<Statement> = parseSql(sql, srcFile, { mysqlVersion: db.options.mysqlVersion });
  return applySqlStatements(db, ast);
}

/**
 * Returns the new DB state given an initial DB state, and a file on disk that
 * contains an SQL statement.  Does not modify the original input DB state.
 */
export function applySqlFile(db: Database, path: string): Database {
  const sql = fs.readFileSync(path, { encoding: 'utf-8' });
  return applySql(db, sql, path);
}

function duplicates<T: number | string>(things: Array<T>): Array<T> {
  const seen = new Set();
  const outputted = new Set();
  const result: Array<T> = [];
  for (const x of things) {
    if (seen.has(x)) {
      if (!outputted.has(x)) {
        outputted.add(x);
        result.push(x);
      }
    }
    seen.add(x);
  }
  return result;
}

/**
 * Fails if the given list of numbers is not fully consecutive. A list if
 * considered fully consecutive if every natural number from the lowest to the
 * highest is present in the list, without holes or duplicates.
 */
function ensureConsecutive(numbers: Array<number>): void {
  if (numbers.length < 2) return;

  const uniqs = new Set(numbers);
  if (uniqs.size !== numbers.length) {
    throw new Error(
      `Duplicate migrations found: ${duplicates(numbers)
        .map((n) => n.toString())
        .join(', ')}`,
    );
  }

  const min = minBy(numbers) || 0;
  const max = maxBy(numbers) || 0;
  const expectedCount = max - min + 1;
  if (numbers.length !== expectedCount) {
    const missing = [];
    for (let i = min; i <= max; ++i) {
      if (!numbers.includes(i)) {
        missing.push(i);
      }
    }
    throw new Error(`Missing migrations: ${missing.map((n) => n.toString()).join(', ')}`);
  }
}

export function* expandInputFiles(paths: Array<string>): Iterable<string> {
  for (const inputPath of paths) {
    if (fs.statSync(inputPath).isDirectory()) {
      let migrations = getMigrations(inputPath);
      yield* migrations.map((mig) => mig.fullpath);
    } else {
      yield inputPath;
    }
  }
}

/**
 * Returns the new DB state given an initial DB state, and a list of directory
 * or file names on disk.  For every directory given, it will collect
 * a naturally-sorted list of *.sql files.  Does not modify the original input
 * DB state.
 */
export function applySqlFiles(db_: Database, ...paths: Array<string>): Database {
  let db = db_; // So we can keep re-assigning this variable
  for (const path of expandInputFiles(paths)) {
    db = applySqlFile(db, path);
  }
  return db;
}

/**
 * All-in-one function call to simply return the final DB state, given
 * a collection of file or directory names.  For every directory given, it will
 * collect a naturally-sorted list of *.sql files.
 */
export function simulate(pathOrPaths: string | Array<string>, options?: Options): Database {
  const paths = typeof pathOrPaths === 'string' ? [pathOrPaths] : pathOrPaths;
  return applySqlFiles(new Database(options ?? DEFAULT_OPTIONS), ...paths);
}
