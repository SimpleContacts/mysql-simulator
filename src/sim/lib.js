// @flow

import fs from 'fs';
import path from 'path';

import { sortBy } from 'lodash';

import parseSql from '../parser';
import Database from './Database';
import Table from './Table';
import type { Column } from './types';

// eslint-disable-next-line no-console
const error = console.error;

function makeColumn(colName, def): Column {
  const type = def.dataType.toLowerCase();
  let defaultValue = def.defaultValue;
  let onUpdate = def.onUpdate;

  // Whether a definition is "NOT NULL" or "NULL" by default, depends on the
  // data type.  MySQL's TIMESTAMP columns are NOT NULL unless explicitly
  // specified.  All other types are NULL unless explicitly specified.
  let nullable = def.nullable;
  if (nullable === null) {
    nullable = type !== 'timestamp';
  }

  if (type === 'timestamp') {
    if (!nullable && defaultValue === null) {
      // If explicit default value is missing, then MySQL assumes the DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      defaultValue = 'CURRENT_TIMESTAMP';
      onUpdate = 'CURRENT_TIMESTAMP';
    }

    if (defaultValue === 'NOW()') {
      defaultValue = 'CURRENT_TIMESTAMP';
    }

    if (onUpdate === 'NOW()') {
      onUpdate = 'CURRENT_TIMESTAMP';
    }
  }

  return {
    name: colName,
    type: def.dataType,
    nullable,
    defaultValue,
    onUpdate,
    autoIncrement: def.autoIncrement,
    comment: def.comment,
  };
}

function handleCreateTable(db: Database, stm): Database {
  const tblName = stm.tblName;
  db = db.createTable(tblName);

  // One-by-one, add the columns to the table
  const columns = stm.definitions.filter(def => def.type === 'COLUMN');
  for (const coldef of columns) {
    db = db.addColumn(tblName, makeColumn(coldef.colName, coldef.definition), null);
  }

  // Add a primary key, if any. A primary key can be added explicitly (1), or
  // defined on a column directly (2).

  const pks = [
    // (1) Explicit PRIMARY KEY definitions
    ...stm.definitions.filter(def => def.type === 'PRIMARY KEY').map(def => def.indexColNames.map(def => def.colName)),

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
  const indexes = stm.definitions.filter(
    def =>
      def.type === 'FOREIGN KEY' ||
      def.type === 'FULLTEXT INDEX' ||
      def.type === 'UNIQUE INDEX' ||
      def.type === 'INDEX',
  );
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
      const $$locked = type === 'NORMAL' ? !!index.indexName : !!(index.constraint || index.indexName);
      db = db.addIndex(tblName, index.indexName, type, index.indexColNames.map(def => def.colName), $$locked);
    }
  }

  return db;
}

function escape(s: string): string {
  return `\`${s.replace('`', '\\`')}\``;
}

function normalizeType(type: string): string {
  const matches = type.match(/^([^(]+)(?:[(]([^)]+)[)])?(.*)?$/);
  if (!matches) {
    throw new Error(`Error parsing data type: ${type}`);
  }

  let basetype = matches[1];
  let params = matches[2];
  let rest = matches[3];

  basetype = basetype.toLowerCase();
  params = params ? `(${params})` : '';
  rest = rest ? `${rest.toLowerCase()}` : '';
  return [basetype, params, rest].join('');
}

function columnDefinition(col: Column) {
  let type = normalizeType(col.type);
  let defaultValue = col.defaultValue !== null ? col.defaultValue : col.nullable ? 'NULL' : null;

  // MySQL outputs number constants as strings. No idea why that would make
  // sense, but let's just replicate its behaviour... ¯\_(ツ)_/¯
  if (typeof defaultValue === 'number') {
    if (type.startsWith('decimal')) {
      defaultValue = `'${defaultValue.toFixed(2)}'`;
    } else {
      defaultValue = `'${defaultValue}'`;
    }
  } else if (type === 'tinyint(1)') {
    if (defaultValue === 'FALSE') defaultValue = "'0'";
    else if (defaultValue === 'TRUE') defaultValue = "'1'";
  }

  const nullable = !col.nullable
    ? 'NOT NULL'
    : // MySQL's TIMESTAMP columns require an explicit "NULL" spec.  Other
      // data types are "NULL" by default, so we omit the explicit NULL, like
      // MySQL does
      type === 'timestamp' ? 'NULL' : '';

  defaultValue = defaultValue ? `DEFAULT ${defaultValue}` : '';

  // Special case: MySQL does not omit an explicit DEFAULT NULL for
  // TEXT/BLOB/JSON columns
  if (type === 'text' || type === 'blob') {
    if (defaultValue === 'DEFAULT NULL') {
      defaultValue = '';
    }
  } else if (type === 'int') {
    type = 'int(11)';
  } else if (type === 'int unsigned') {
    type = 'int(10) unsigned';
  } else if (type === 'tinyint') {
    type = 'tinyint(4)';
  } else if (type === 'tinyint unsigned') {
    type = 'tinyint(3) unsigned';
  } else if (type === 'smallint') {
    type = 'smallint(6)';
  } else if (type === 'smallint unsigned') {
    type = 'smallint(5) unsigned';
  }

  return [
    escape(col.name),
    type,
    nullable,
    defaultValue,
    col.onUpdate !== null ? `ON UPDATE ${col.onUpdate}` : '',
    col.autoIncrement ? 'AUTO_INCREMENT' : '',
    col.comment !== null ? `COMMENT ${col.comment}` : '',
  ]
    .filter(x => x)
    .join(' ');
}

function tableLines(table: Table): Array<string> {
  return [
    ...table.columns.map(col => columnDefinition(col)),

    ...(table.primaryKey ? [`PRIMARY KEY (${table.primaryKey.map(escape).join(',')})`] : []),

    ...sortBy(
      table.indexes.filter(i => i.type === 'UNIQUE'),

      // MySQL seems to output unique indexes on *NOT* NULL columns first, then
      // all NULLable unique column indexes. Let's mimick this behaviour in our
      // output
      idx => {
        const colName = idx.columns[0];
        const column = table.columns.find(c => c.name === colName);
        return column && !column.nullable ? 0 : 1;
      },
    ).map(index => `UNIQUE KEY ${escape(index.name)} (${index.columns.map(escape).join(',')})`),

    ...table.indexes
      .filter(i => i.type === 'NORMAL')
      .map(index => `KEY ${escape(index.name)} (${index.columns.map(escape).join(',')})`),

    ...table.indexes
      .filter(i => i.type === 'FULLTEXT')
      .map(index => `FULLTEXT KEY ${escape(index.name)} (${index.columns.map(escape).join(',')})`),

    ...sortBy(table.foreignKeys, fk => fk.name).map(
      fk =>
        `CONSTRAINT ${escape(fk.name)} FOREIGN KEY (${fk.columns.map(escape).join(', ')}) REFERENCES ${escape(
          fk.reference.table,
        )} (${fk.reference.columns.map(escape).join(', ')})`,
    ),
  ];
}

function* iterDumpTable(table: Table, includeAttrs: boolean) {
  yield `CREATE TABLE \`${table.name}\` (`;
  yield tableLines(table)
    .map(line => `  ${line}`)
    .join(',\n');
  if (includeAttrs) {
    yield `) ENGINE=InnoDB DEFAULT CHARSET=utf8;`;
  } else {
    yield `);`;
  }
}

function* iterDumpDb(db: Database, tables: Array<string> = [], includeAttrs: boolean = true): Iterable<string> {
  tables = tables.length > 0 ? tables : db.tables().map(t => t.name);
  for (const tableName of tables) {
    yield '';
    yield* iterDumpTable(db.getTable(tableName), includeAttrs);
  }
  yield '';
}

export function dumpDb(db: Database, tables: Array<string> = [], includeAttrs: boolean = true): string {
  return [...iterDumpDb(db, tables, includeAttrs)].join('\n');
}

function applySqlStatements(db: Database, statements: Array<*>): Database {
  for (const stm of statements) {
    if (stm === null) {
      // eslint-disable-next-line no-continue
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
          const column = makeColumn(change.colName, change.definition);
          db = db.addColumn(stm.tblName, column, change.position);
          if (change.definition.isPrimary) {
            db = db.addPrimaryKey(stm.tblName, [change.colName]);
          } else if (change.definition.isUnique) {
            db = db.addIndex(stm.tblName, null, 'UNIQUE', [change.colName], true);
          }
        } else if (change.type === 'CHANGE COLUMN') {
          const column = makeColumn(change.newColName, change.definition);
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
          const $$locked = !!change.constraint;
          db = db.addIndex(
            stm.tblName,
            change.constraint || change.indexName,
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
  const ast: Array<*> = parseSql(sql, srcFile);
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

function* expandInputFiles(paths: Array<string>): Iterable<string> {
  for (const inputPath of paths) {
    if (fs.statSync(inputPath).isDirectory()) {
      // Naturally sort files before processing -- order is crucial!
      let files = fs.readdirSync(inputPath).filter(f => f.endsWith('.sql'));
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
export function applySqlFiles(db: Database, ...paths: Array<string>): Database {
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
