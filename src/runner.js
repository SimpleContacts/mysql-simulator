// @flow

import chalk from 'chalk';
import { sortBy } from 'lodash';

// $FlowFixMe
import ast from '../ast.json';
import {
  addColumn,
  addPrimaryKey,
  addTable,
  addTableLike,
  dropPrimaryKey,
  emptyDb,
  removeColumn,
  removeTable,
  renameTable,
  replaceColumn,
} from './db';
import type { Column, Database, Table } from './types';

// eslint-disable-next-line no-console
const log = console.log;
// eslint-disable-next-line no-console
const error = console.error;

function makeColumn(colName, def): Column {
  return {
    name: colName,
    type: def.dataType,
    nullable: def.nullable,
    defaultValue: def.defaultValue,
    autoIncrement: def.autoIncrement,
  };
}

function makeTable(table): Table {
  const columns = table.definitions.filter(def => def.type === 'COLUMN');
  const foreignKeys = table.definitions.filter(
    def => def.type === 'FOREIGN KEY',
  );

  let primaryKey =
    table.definitions
      .filter(def => def.type === 'PRIMARY KEY')
      .map(def => def.columns)[0] || null;

  // Primary key can also be defined on a column directly
  if (!primaryKey) {
    const pks = columns.filter(c => c.definition.isPrimary).map(c => c.colName);
    primaryKey = pks.length > 0 ? pks : null;
  }

  let nextFkNum = 1;
  return {
    name: table.tblName,
    columns: columns.map(def => makeColumn(def.colName, def.definition)),
    primaryKey,
    foreignKeys: foreignKeys.map(fk => {
      const columns = fk.indexColNames.map(def => def.colName);
      const reference = {
        table: fk.reference.tblName,
        columns: fk.reference.indexColNames.map(def => def.colName),
      };
      return {
        // TODO: This is doomed to become too complicated. We should be
        // assigning the FK names (and derived implicit KEY's) on table
        // creation time instead.

        // eslint-disable-next-line no-plusplus
        name: fk.name ? fk.name : `${table.tblName}_ibfk_${nextFkNum++}`,
        columns,
        reference,
      };
    }),
  };
}

function escape(s: string): string {
  return `\`${s.replace('`', '\\`')}\``;
}

function columnDefinition(col: Column) {
  let defaultValue =
    col.defaultValue !== null ? col.defaultValue : col.nullable ? 'NULL' : null;

  // MySQL outputs number constants as strings. No idea why that would make
  // sense, but let's just replicate its behaviour... ¯\_(ツ)_/¯
  if (typeof defaultValue === 'number') {
    defaultValue = `'${defaultValue}'`;
  }

  const nullable = !col.nullable
    ? 'NOT NULL'
    : // MySQL's TIMESTAMP columns require an explicit "NULL" spec.  Other
      // data types are "NULL" by default, so we omit the explicit NULL, like
      // MySQL does
      col.type === 'TIMESTAMP' ? 'NULL' : '';

  return [
    escape(col.name),
    col.type.toLowerCase(),
    nullable,
    defaultValue ? `DEFAULT ${defaultValue}` : '',
    col.autoIncrement ? 'AUTO_INCREMENT' : '',
  ]
    .filter(x => x)
    .join(' ');
}

function printTable(table: Table) {
  log(chalk.blue(`CREATE TABLE \`${table.name}\` (`));
  for (const col of table.columns) {
    log(chalk.yellow(`  ${columnDefinition(col)},`));
  }
  for (const fk of table.foreignKeys) {
    log(
      chalk.green(
        `  CONSTRAINT ${escape(fk.name)} FOREIGN KEY (${fk.columns
          .map(escape)
          .join(', ')}) REFERENCES ${escape(
          fk.reference.table,
        )} (${fk.reference.columns.map(escape).join(', ')}),`,
      ),
    );
  }
  if (table.primaryKey) {
    log(
      chalk.magenta(
        `  PRIMARY KEY (${table.primaryKey.map(escape).join(', ')}),`,
      ),
    );
  }
  log(chalk.blue(`);`));
  // log(chalk.blue('-'.repeat(table.name.length)));
  // for (const name of sortBy(Object.keys(table.columns))) {
  //   const col = table.columns[name];
  //   log(`  ${chalk.magenta(col.name)} ${chalk.gray(col.type)}`);
  // }
  // for (const name of sortBy(Object.keys(table.foreignKeys))) {
  //   const fk = table.foreignKeys[name];
  //   log(
  //     chalk.yellow(
  //       `  ${fk.name || '(unnamed)'}: ${fk.columns.join(', ')} => ${
  //         fk.reference.table
  //       } (${fk.reference.columns.join(', ')})`,
  //     ),
  //   );
  // }
}

function printDb(db: Database, tableName: string | void = undefined) {
  const tableNames = tableName ? [tableName] : sortBy(Object.keys(db.tables));
  for (const tableName of tableNames) {
    log('');
    printTable(db.tables[tableName]);
  }
}

function main() {
  let db: Database = emptyDb();

  for (const expr of ast) {
    if (expr === null) {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (expr.type === 'CREATE TABLE') {
      const table = makeTable(expr);
      db = addTable(db, table);
    } else if (expr.type === 'CREATE TABLE LIKE') {
      db = addTableLike(db, expr.tblName, expr.oldTblName);
    } else if (expr.type === 'DROP TABLE') {
      db = removeTable(db, expr.tblName, expr.ifExists);
    } else if (expr.type === 'ALTER TABLE') {
      for (const change of expr.changes) {
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
        } else {
          error(
            chalk.yellow(`Unknown change type: ${change.type}`),
            chalk.gray(JSON.stringify(change, null, 2)),
          );
        }
      }
    } else if (expr.type === 'RENAME TABLE') {
      db = renameTable(db, expr.tblName, expr.newName);
    } else {
      error(chalk.yellow(`Unknown expression type: ${expr.type}`));
    }
  }

  // log('');
  // log('Done!');
  const tableName = process.argv[2];
  if (tableName) {
    printDb(db, tableName);
  } else {
    printDb(db);
  }
}

main();
