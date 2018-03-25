// @flow

import chalk from 'chalk';

import ast from '../ast.json';
import { addTable, emptyDb, removeTable, renameTable } from './db';
import type { Database, Table } from './types';

// eslint-disable-next-line no-console
const log = console.log;
// eslint-disable-next-line no-console
const error = console.error;

function makeTable(table): Table {
  const columns = table.definitions.filter(def => def.type === 'COLUMN');
  return {
    name: table.tblName,
    columns: columns.map(col => {
      const nullable = !col.definition.nullable;
      const defaultValue = col.definition.defaultValue;
      return {
        name: col.colName,
        type: col.definition.dataType,
        nullable,
        defaultValue,
      };
    }),
  };
}

function printDb(db: Database) {
  for (const table of Object.values(db.tables)) {
    log('');
    log(chalk.blue(`${table.name}`));
    log(chalk.blue('-'.repeat(table.name.length)));
    for (const col of table.columns) {
      log(`  ${chalk.magenta(col.name)} ${chalk.gray(col.type)}`);
    }
  }
}

function main() {
  let db: Database = emptyDb();

  // eslint-disable-next-line
  for (const expr of ast) {
    if (expr.type === 'CREATE TABLE') {
      const table = makeTable(expr);
      db = addTable(db, table);
      log(chalk.green(`CREATE TABLE ${expr.tblName}`));
    } else if (expr.type === 'DROP TABLE') {
      db = removeTable(db, expr.tableName, expr.ifExists);
    } else if (expr.type === 'RENAME TABLE') {
      db = renameTable(db, expr.tblName, expr.newName);
    } else {
      error(chalk.gray(`Unknown expression type: ${expr.type}`));
    }

    log(chalk.green(expr.type));
  }

  log('');
  log('Done!');
  printDb(db);
}

main();
