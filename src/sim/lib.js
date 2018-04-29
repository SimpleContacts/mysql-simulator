// @flow

import chalk from 'chalk';
import { sortBy } from 'lodash';

import {
  addColumn,
  addForeignKey,
  addIndex,
  addPrimaryKey,
  addTableLike,
  createTable,
  dropDefault,
  dropForeignKey,
  dropIndex,
  dropPrimaryKey,
  removeColumn,
  removeTable,
  renameTable,
  replaceColumn,
} from './core';
import type { Column, Database, Table } from './types';

// eslint-disable-next-line no-console
const error = console.error;

function makeColumn(colName, def): Column {
  const type = def.dataType.toLowerCase();
  let nullable = def.nullable;
  let defaultValue = def.defaultValue;
  let onUpdate = def.onUpdate;
  if (type === 'timestamp') {
    // If an explicit default value is provided, timestamps are implicitly
    // non-NULLable. Gaahhhh.
    if (defaultValue && nullable) {
      nullable = false;
    }

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
  };
}

function handleCreateTable(db: Database, expr): Database {
  const tblName = expr.tblName;
  db = createTable(db, tblName);

  // One-by-one, add the columns to the table
  const columns = expr.definitions.filter(def => def.type === 'COLUMN');
  for (const coldef of columns) {
    db = addColumn(
      db,
      tblName,
      makeColumn(coldef.colName, coldef.definition),
      null,
    );
  }

  // Add a primary key, if any. A primary key can be added explicitly (1), or
  // defined on a column directly (2).

  const pks = [
    // (1) Explicit PRIMARY KEY definitions
    ...expr.definitions
      .filter(def => def.type === 'PRIMARY KEY')
      .map(def => def.indexColNames.map(def => def.colName)),

    // (2) Primary key can also be defined on a column declaratively
    ...columns.filter(c => c.definition.isPrimary).map(c => [c.colName]),
  ];

  for (const pk of pks) {
    db = addPrimaryKey(db, tblName, pk);
  }

  // Add indexes, if any. Indexes can be added explicitly (1), or defined on
  // a column directly (2).
  const indexes = expr.definitions.filter(
    def => def.type === 'UNIQUE INDEX' || def.type === 'INDEX',
  );
  for (const index of indexes) {
    db = addIndex(
      db,
      tblName,
      index.constraint,
      index.indexColNames.map(def => def.colName),
      index.type === 'UNIQUE INDEX',
      true,
    );
  }

  // (2) Shorthand syntax to define index on a column directly
  for (const col of columns.filter(c => c.definition.isUnique)) {
    db = addIndex(db, tblName, null, [col.colName], true, true);
  }

  // Add all foreign keys we encounter
  const fks = expr.definitions.filter(def => def.type === 'FOREIGN KEY');
  // let nextFkNum = 1;
  for (const fk of fks) {
    db = addForeignKey(
      db,
      tblName,
      fk.name, // Name for this FK, from the "constraint" clause
      fk.indexColNames.map(def => def.colName), // Local columns
      fk.reference.tblName, // Foreign/target table
      fk.reference.indexColNames.map(def => def.colName), // Foreign/target columns
    );
  }

  return db;
}

function escape(s: string): string {
  return `\`${s.replace('`', '\\`')}\``;
}

function columnDefinition(col: Column) {
  let type = col.type.toLowerCase();
  let defaultValue =
    col.defaultValue !== null ? col.defaultValue : col.nullable ? 'NULL' : null;

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
  ]
    .filter(x => x)
    .join(' ');
}

function tableLines(table: Table): Array<string> {
  return [
    ...table.columns.map(col => columnDefinition(col)),

    ...(table.primaryKey
      ? [`PRIMARY KEY (${table.primaryKey.map(escape).join(', ')})`]
      : []),

    ...table.indexes
      .filter(i => i.unique)
      .map(
        index =>
          `UNIQUE KEY ${escape(index.name)} (${index.columns
            .map(escape)
            .join(',')})`,
      ),

    ...table.indexes
      .filter(i => !i.unique)
      .map(
        index =>
          `KEY ${escape(index.name)} (${index.columns.map(escape).join(',')})`,
      ),

    ...sortBy(table.foreignKeys, fk => fk.name).map(
      fk =>
        `CONSTRAINT ${escape(fk.name)} FOREIGN KEY (${fk.columns
          .map(escape)
          .join(', ')}) REFERENCES ${escape(
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

function* iterDumpDb(
  db: Database,
  tables: Array<string> = [],
  includeAttrs: boolean = true,
): Iterable<string> {
  tables = tables.length > 0 ? tables : sortBy(Object.keys(db.tables));
  for (const tableName of tables) {
    yield '';
    yield* iterDumpTable(db.tables[tableName], includeAttrs);
  }
  yield '';
}

export function dumpDb(
  db: Database,
  tables: Array<string> = [],
  includeAttrs = true,
): string {
  return [...iterDumpDb(db, tables, includeAttrs)].join('\n');
}

export function applySql(db: Database, ast: Array<*>): Database {
  for (const expr of ast) {
    if (expr === null) {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (expr.type === 'CREATE TABLE') {
      db = handleCreateTable(db, expr);
    } else if (expr.type === 'CREATE TABLE LIKE') {
      db = addTableLike(db, expr.tblName, expr.oldTblName);
    } else if (expr.type === 'DROP TABLE') {
      db = removeTable(db, expr.tblName, expr.ifExists);
    } else if (expr.type === 'ALTER TABLE') {
      const order = ['*', 'DROP FOREIGN KEY', 'DROP COLUMN'];
      const changes = sortBy(expr.changes, change =>
        order.indexOf(change.type),
      );
      for (const change of changes) {
        if (change.type === 'RENAME TABLE') {
          db = renameTable(db, expr.tblName, change.newTblName);
        } else if (change.type === 'ADD COLUMN') {
          const column = makeColumn(change.colName, change.definition);
          db = addColumn(db, expr.tblName, column, change.position);
          if (change.definition.isPrimary) {
            db = addPrimaryKey(db, expr.tblName, [change.colName]);
          }
        } else if (change.type === 'CHANGE COLUMN') {
          const column = makeColumn(change.newColName, change.definition);
          db = replaceColumn(
            db,
            expr.tblName,
            change.oldColName,
            column,
            change.position,
          );
        } else if (change.type === 'DROP COLUMN') {
          db = removeColumn(db, expr.tblName, change.colName);
        } else if (change.type === 'ADD PRIMARY KEY') {
          db = addPrimaryKey(
            db,
            expr.tblName,
            change.indexColNames.map(col => col.colName),
          );
        } else if (change.type === 'DROP PRIMARY KEY') {
          db = dropPrimaryKey(db, expr.tblName);
        } else if (change.type === 'ADD FOREIGN KEY') {
          db = addForeignKey(
            db,
            expr.tblName,
            change.constraint,
            change.indexColNames.map(def => def.colName),
            change.reference.tblName,
            change.reference.indexColNames.map(def => def.colName),
          );
        } else if (change.type === 'ADD INDEX') {
          db = addIndex(
            db,
            expr.tblName,
            change.indexName,
            change.indexColNames.map(def => def.colName),
          );
        } else if (change.type === 'DROP INDEX') {
          db = dropIndex(db, expr.tblName, change.indexName);
        } else if (change.type === 'ADD UNIQUE INDEX') {
          db = addIndex(
            db,
            expr.tblName,
            change.constraint,
            change.indexColNames.map(def => def.colName),
            true,
          );
        } else if (change.type === 'DROP FOREIGN KEY') {
          db = dropForeignKey(db, expr.tblName, change.symbol);
        } else if (change.type === 'DROP DEFAULT') {
          db = dropDefault(db, expr.tblName, change.colName);
        } else {
          error(
            chalk.yellow(`Unknown change type: ${change.type}`),
            chalk.gray(JSON.stringify({ expr, change }, null, 2)),
          );
        }
      }
    } else if (expr.type === 'RENAME TABLE') {
      db = renameTable(db, expr.tblName, expr.newName);
    } else if (expr.type === 'CREATE INDEX') {
      db = addIndex(
        db,
        expr.tblName,
        expr.indexName,
        expr.indexColNames.map(def => def.colName),
      );
    } else if (expr.type === 'DROP INDEX') {
      db = dropIndex(db, expr.tblName, expr.indexName);
    } else if (expr.type === 'CREATE FUNCTION') {
      // Ignore
    } else if (expr.type === 'CREATE TRIGGER') {
      // Ignore
    } else {
      error(
        chalk.yellow(`Unknown expression type: ${expr.type}`),
        chalk.gray(JSON.stringify({ expr }, null, 2)),
      );
    }
  }

  return db;
}
