// @flow strict

import fs from 'fs';
import path from 'path';

import invariant from 'invariant';
import { maxBy, minBy, sortBy } from 'lodash';

import type { DataType } from '../ast';
import ast from '../ast';
import type { Encoding } from '../ast/encodings';
import { makeEncoding } from '../ast/encodings';
import parseSql from '../parser';
import type { ColumnDefinition, CreateTableStatement, Statement } from '../parser';
import Column from './Column';
import Database from './Database';
import { setEncoding } from './DataType';

function setEncodingIfNull<T: DataType>(dataType: T, encoding: Encoding): T {
  if (
    !(
      // TODO: Ideally, just use `isTextualOrEnum()` here, but Flow's %checks
      // predicates don't work across module boundaries :(
      (
        dataType.baseType === 'char' ||
        dataType.baseType === 'varchar' ||
        dataType.baseType === 'text' ||
        dataType.baseType === 'mediumtext' ||
        dataType.baseType === 'longtext' ||
        dataType.baseType === 'enum'
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

function makeColumn(colName, def: ColumnDefinition, tableEncoding: Encoding): Column {
  const dataType = def.dataType;
  let defaultValue = def.defaultValue;
  let onUpdate = def.onUpdate;

  // Whether a definition is "NOT NULL" or "NULL" by default, depends on the
  // data type.  MySQL's TIMESTAMP columns are NOT NULL unless explicitly
  // specified.  All other types are NULL unless explicitly specified.
  let nullable = def.nullable;
  if (nullable === null) {
    nullable = dataType.baseType !== 'timestamp'; // Could also be "timestamp(6)"
  }

  if (dataType.baseType === 'timestamp') {
    if (!nullable && defaultValue === null) {
      // If explicit default value is missing, then MySQL assumes the DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      defaultValue = ast.CurrentTimestamp(dataType.fsp);
      onUpdate = ast.CurrentTimestamp(dataType.fsp);
    }
  }

  return new Column(
    colName,
    setEncodingIfNull(def.dataType, tableEncoding),
    nullable,
    defaultValue,
    onUpdate,
    def.autoIncrement,
    def.comment,
    def.generated,
  );
}

function handleCreateTable(db_: Database, stm: CreateTableStatement): Database {
  const tblName = stm.tblName;
  let encoding;
  if (stm.options?.CHARSET || stm.options?.COLLATE) {
    encoding = makeEncoding(stm.options.CHARSET, stm.options.COLLATE);
  } else {
    encoding = db_.defaultEncoding;
  }

  let db = db_.createTable(tblName, encoding);

  // One-by-one, add the columns to the table
  const columns = stm.definitions.map((def) => (def.type === 'COLUMN' ? def : null)).filter(Boolean);
  for (const coldef of columns) {
    const table = db.getTable(tblName);
    db = db.addColumn(tblName, makeColumn(coldef.colName, coldef.definition, table.defaultEncoding), null);
  }

  // Add a primary key, if any. A primary key can be added explicitly (1), or
  // defined on a column directly (2).

  const pks = [
    // (1) Explicit PRIMARY KEY definitions
    ...stm.definitions
      .map((def) => (def.type === 'PRIMARY KEY' ? def.indexColNames.map((def) => def.colName) : null))
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
      def.type === 'FOREIGN KEY' || def.type === 'FULLTEXT INDEX' || def.type === 'UNIQUE INDEX' || def.type === 'INDEX'
        ? def
        : null,
    )
    .filter(Boolean);
  for (const index of indexes) {
    if (index.type === 'FOREIGN KEY') {
      db = db.addForeignKey(
        tblName,
        index.constraint,
        index.indexName,
        index.indexColNames.map((def) => def.colName), // Local columns
        index.reference.tblName, // Foreign/target table
        index.reference.indexColNames.map((def) => def.colName), // Foreign/target columns
        index.reference.onDelete,
      );
    } else {
      const type = index.type === 'UNIQUE INDEX' ? 'UNIQUE' : index.type === 'FULLTEXT INDEX' ? 'FULLTEXT' : 'NORMAL';
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

function applySqlStatements(db_: Database, statements: Array<Statement>): Database {
  let db = db_; // So we can keep re-assigning this variable

  for (const stm of statements) {
    if (stm === null) {
      continue;
    }

    if (stm.type === 'CREATE TABLE') {
      db = handleCreateTable(db, stm);
    } else if (stm.type === 'CREATE TABLE LIKE') {
      db = db.cloneTable(stm.oldTblName, stm.tblName);
    } else if (stm.type === 'DROP TABLE') {
      db = db.removeTable(stm.tblName, stm.ifExists);
    } else if (stm.type === 'ALTER DATABASE') {
      let charset;
      let collate;
      for (const option of stm.options) {
        if (option.CHARSET) {
          charset = option.CHARSET;
        }
        if (option.COLLATE) {
          collate = option.COLLATE;
        }
      }
      const encoding = charset || collate ? makeEncoding(charset, collate) : db.defaultEncoding;
      db = db.setEncoding(encoding);
    } else if (stm.type === 'ALTER TABLE') {
      const order = ['*', 'DROP FOREIGN KEY', 'DROP COLUMN'];
      const changes = sortBy(stm.changes, (change) => order.indexOf(change.type));
      for (const change of changes) {
        if (change.type === 'RENAME TABLE') {
          db = db.renameTable(stm.tblName, change.newTblName);
        } else if (change.type === 'ADD COLUMN') {
          const table = db.getTable(stm.tblName);
          const column = makeColumn(change.colName, change.definition, table.defaultEncoding);
          db = db.addColumn(stm.tblName, column, change.position);
          if (change.definition.isPrimary) {
            db = db.addPrimaryKey(stm.tblName, [change.colName]);
          } else if (change.definition.isUnique) {
            db = db.addIndex(stm.tblName, null, 'UNIQUE', [change.colName], true);
          }
        } else if (change.type === 'CHANGE COLUMN') {
          const table = db.getTable(stm.tblName);
          const column = makeColumn(change.newColName, change.definition, table.defaultEncoding);
          db = db.replaceColumn(stm.tblName, change.oldColName, column, change.position);
          if (change.definition.isUnique) {
            db = db.addIndex(stm.tblName, null, 'UNIQUE', [change.newColName], true);
          }
        } else if (change.type === 'DROP COLUMN') {
          db = db.removeColumn(stm.tblName, change.colName);
        } else if (change.type === 'ADD PRIMARY KEY') {
          db = db.addPrimaryKey(
            stm.tblName,
            change.indexColNames.map((col) => col.colName),
          );
        } else if (change.type === 'DROP PRIMARY KEY') {
          db = db.dropPrimaryKey(stm.tblName);
        } else if (change.type === 'ADD FOREIGN KEY') {
          db = db.addForeignKey(
            stm.tblName,
            change.constraint,
            change.indexName,
            change.indexColNames.map((def) => def.colName),
            change.reference.tblName,
            change.reference.indexColNames.map((def) => def.colName),
            change.reference.onDelete,
          );
        } else if (change.type === 'ADD UNIQUE INDEX') {
          db = db.addIndex(
            stm.tblName,
            change.constraint || change.indexName,
            'UNIQUE',
            change.indexColNames.map((def) => def.colName),
            true, // UNIQUE indexes are always explicit
          );
        } else if (change.type === 'ADD FULLTEXT INDEX') {
          const $$locked = false;
          db = db.addIndex(
            stm.tblName,
            change.indexName,
            'FULLTEXT',
            change.indexColNames.map((def) => def.colName),
            $$locked,
          );
        } else if (change.type === 'ADD INDEX') {
          const $$locked = !!change.indexName;
          db = db.addIndex(
            stm.tblName,
            change.indexName,
            'NORMAL',
            change.indexColNames.map((def) => def.colName),
            $$locked,
          );
        } else if (change.type === 'DROP INDEX') {
          db = db.dropIndex(stm.tblName, change.indexName);
        } else if (change.type === 'DROP FOREIGN KEY') {
          db = db.dropForeignKey(stm.tblName, change.symbol);
        } else if (change.type === 'DROP DEFAULT') {
          db = db.dropDefault(stm.tblName, change.colName);
        } else if (change.type === 'RENAME INDEX') {
          db = db.renameIndex(stm.tblName, change.oldIndexName, change.newIndexName);
        } else if (change.type === 'CHANGE TABLE OPTIONS') {
          const charset = change.options.CHARSET;
          const collate = change.options.COLLATE;
          if (charset || collate) {
            db = db.setDefaultTableEncoding(stm.tblName, charset, collate);
          }
        } else if (change.type === 'CONVERT TO') {
          const charset = change.charset;
          const collate = change.collate;
          db = db.convertToEncoding(stm.tblName, charset, collate);
        } else {
          // Log details to the console (useful for debugging)
          error(`Unknown change type: ${change.type}`);
          error(JSON.stringify({ stm, change }, null, 2));

          // Error out
          throw new Error(`Unknown change type: ${change.type}`);
        }
      }
    } else if (stm.type === 'RENAME TABLE') {
      db = db.renameTable(stm.tblName, stm.newName);
    } else if (stm.type === 'CREATE INDEX') {
      const $$locked = !!stm.indexName;
      db = db.addIndex(
        stm.tblName,
        stm.indexName,
        stm.indexKind,
        stm.indexColNames.map((def) => def.colName),
        $$locked,
      );
    } else if (stm.type === 'DROP INDEX') {
      db = db.dropIndex(stm.tblName, stm.indexName);
    } else if (stm.type === 'CREATE FUNCTION') {
      // Ignore
    } else if (stm.type === 'CREATE TRIGGER') {
      // Ignore
    } else {
      // Log details to the console (useful for debugging)
      error(`Unknown expression type: ${stm.type}`);
      error(JSON.stringify({ stm }, null, 2));
      throw new Error(`Unknown expression type: ${stm.type}`);
    }
  }

  return db;
}

/**
 * Returns the new DB state given an initial DB state, and a SQL expression to
 * apply. The `srcFile` argument is used to provide friendly error reporting.
 * Does not modify the original input DB state.
 */
export function applySql(db: Database, sql: string, srcFile: string): Database {
  const ast: Array<Statement> = parseSql(sql, srcFile);
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
export function simulate(...paths: Array<string>): Database {
  const defaultEncoding = makeEncoding();
  return applySqlFiles(new Database(defaultEncoding), ...paths);
}
