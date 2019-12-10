// @flow strict

import fs from 'fs';
import path from 'path';

import { maxBy, minBy, sortBy } from 'lodash';

import parseSql from '../parser';
import type { ColumnDefinition, CreateTableStatement, Statement } from '../parser';
import Column from './Column';
import Database from './Database';

// eslint-disable-next-line no-console
const error = console.error;

function handleCreateTable(db_: Database, stm: CreateTableStatement): Database {
  const tblName = stm.tblName;
  let db = db_.createTable(tblName);

  // One-by-one, add the columns to the table
  const columns = stm.definitions.map(def => (def.type === 'COLUMN' ? def : null)).filter(Boolean);
  for (const coldef of columns) {
    db = db.addColumn(tblName, new Column(coldef.colName, coldef.definition), null);
  }

  // Add a primary key, if any. A primary key can be added explicitly (1), or
  // defined on a column directly (2).

  const pks = [
    // (1) Explicit PRIMARY KEY definitions
    ...stm.definitions
      .map(def => (def.type === 'PRIMARY KEY' ? def.indexColNames.map(def => def.colName) : null))
      .filter(Boolean),

    // (2) Primary key can also be defined on a column declaratively
    ...columns.filter(c => c.definition.isPrimary).map(c => [c.colName]),
  ];

  for (const pk of pks) {
    db = db.addPrimaryKey(tblName, pk);
  }

  // (2) Shorthand syntax to define index on a column directly
  for (const col of columns.filter(c => c.definition.isUnique)) {
    db = db.addIndex(tblName, null, 'UNIQUE', [col.colName], true);
  }

  // Add indexes, if any. Indexes can be added explicitly (1), or defined on
  // a column directly (2).
  const indexes = stm.definitions
    .map(def =>
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
        index.indexColNames.map(def => def.colName), // Local columns
        index.reference.tblName, // Foreign/target table
        index.reference.indexColNames.map(def => def.colName), // Foreign/target columns
      );
    } else {
      const type = index.type === 'UNIQUE INDEX' ? 'UNIQUE' : index.type === 'FULLTEXT INDEX' ? 'FULLTEXT' : 'NORMAL';
      const $$locked = true;
      db = db.addIndex(tblName, index.indexName || null, type, index.indexColNames.map(def => def.colName), $$locked);
    }
  }

  return db;
}

function* iterDumpDb(db: Database, tables_: Array<string> = []): Iterable<string> {
  const tables = tables_.length > 0 ? tables_ : db.getTables().map(t => t.name);
  for (const tableName of tables) {
    yield '';
    yield db.getTable(tableName).toString();
  }
  yield '';
}

export function dumpDb(db: Database, tables: Array<string> = []): string {
  return Array.from(iterDumpDb(db, tables)).join('\n');
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
    } else if (stm.type === 'ALTER TABLE') {
      const order = ['*', 'DROP FOREIGN KEY', 'DROP COLUMN'];
      const changes = sortBy(stm.changes, change => order.indexOf(change.type));
      for (const change of changes) {
        if (change.type === 'RENAME TABLE') {
          db = db.renameTable(stm.tblName, change.newTblName);
        } else if (change.type === 'ADD COLUMN') {
          const column = new Column(change.colName, change.definition);
          db = db.addColumn(stm.tblName, column, change.position);
          if (change.definition.isPrimary) {
            db = db.addPrimaryKey(stm.tblName, [change.colName]);
          } else if (change.definition.isUnique) {
            db = db.addIndex(stm.tblName, null, 'UNIQUE', [change.colName], true);
          }
        } else if (change.type === 'CHANGE COLUMN') {
          const column = new Column(change.newColName, change.definition);
          db = db.replaceColumn(stm.tblName, change.oldColName, column, change.position);
          if (change.definition.isUnique) {
            db = db.addIndex(stm.tblName, null, 'UNIQUE', [change.newColName], true);
          }
        } else if (change.type === 'DROP COLUMN') {
          db = db.removeColumn(stm.tblName, change.colName);
        } else if (change.type === 'ADD PRIMARY KEY') {
          db = db.addPrimaryKey(stm.tblName, change.indexColNames.map(col => col.colName));
        } else if (change.type === 'DROP PRIMARY KEY') {
          db = db.dropPrimaryKey(stm.tblName);
        } else if (change.type === 'ADD FOREIGN KEY') {
          db = db.addForeignKey(
            stm.tblName,
            change.constraint,
            change.indexName,
            change.indexColNames.map(def => def.colName),
            change.reference.tblName,
            change.reference.indexColNames.map(def => def.colName),
          );
        } else if (change.type === 'ADD UNIQUE INDEX') {
          db = db.addIndex(
            stm.tblName,
            change.constraint || change.indexName,
            'UNIQUE',
            change.indexColNames.map(def => def.colName),
            true, // UNIQUE indexes are always explicit
          );
        } else if (change.type === 'ADD FULLTEXT INDEX') {
          const $$locked = false;
          db = db.addIndex(
            stm.tblName,
            change.indexName,
            'FULLTEXT',
            change.indexColNames.map(def => def.colName),
            $$locked,
          );
        } else if (change.type === 'ADD INDEX') {
          const $$locked = !!change.indexName;
          db = db.addIndex(
            stm.tblName,
            change.indexName,
            'NORMAL',
            change.indexColNames.map(def => def.colName),
            $$locked,
          );
        } else if (change.type === 'DROP INDEX') {
          db = db.dropIndex(stm.tblName, change.indexName);
        } else if (change.type === 'DROP FOREIGN KEY') {
          db = db.dropForeignKey(stm.tblName, change.symbol);
        } else if (change.type === 'DROP DEFAULT') {
          db = db.dropDefault(stm.tblName, change.colName);
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
      db = db.addIndex(stm.tblName, stm.indexName, stm.indexKind, stm.indexColNames.map(def => def.colName), $$locked);
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
        .map(n => n.toString())
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
    throw new Error(`Missing migrations: ${missing.map(n => n.toString()).join(', ')}`);
  }
}

export function* expandInputFiles(paths: Array<string>): Iterable<string> {
  for (const inputPath of paths) {
    if (fs.statSync(inputPath).isDirectory()) {
      // Naturally sort files before processing -- order is crucial!
      let files = fs.readdirSync(inputPath).filter(f => f.endsWith('.sql'));
      ensureConsecutive(files.map(f => parseInt(f, 10)));
      files = sortBy(files, f => parseInt(f, 10)).map(f => path.join(inputPath, f));
      yield* files;
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
  return applySqlFiles(new Database(), ...paths);
}
