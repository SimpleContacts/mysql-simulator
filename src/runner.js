// @flow

import chalk from 'chalk';
import { sortBy } from 'lodash';

// $FlowFixMe
import ast from '../ast.json';
import { addTable, emptyDb, removeTable, renameTable } from './db';
import type { Database, Table } from './types';

// eslint-disable-next-line no-console
const log = console.log;
// eslint-disable-next-line no-console
const error = console.error;

function makeTable(table): Table {
  const columns = table.definitions.filter(def => def.type === 'COLUMN');
  const foreignKeys = table.definitions.filter(
    def => def.type === 'FOREIGN KEY',
  );
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
    foreignKeys: foreignKeys.map(fk => {
      // eslint-disable-next-line no-shadow
      const columns = fk.indexColNames.map(def => def.colName);
      log({ fk });
      const reference = {
        table: fk.reference.tblName,
        columns: fk.reference.indexColNames.map(def => def.colName),
      };
      return {
        name: fk.name,
        columns,
        reference,
      };
    }),
  };
}

function printDb(db: Database) {
  for (const tableName of sortBy(Object.keys(db.tables))) {
    const table = db.tables[tableName];
    log('');
    log(chalk.blue(`${table.name}`));
    log(chalk.blue('-'.repeat(table.name.length)));
    for (const name of sortBy(Object.keys(table.columns))) {
      const col = table.columns[name];
      log(`  ${chalk.magenta(col.name)} ${chalk.gray(col.type)}`);
    }
    for (const name of sortBy(Object.keys(table.foreignKeys))) {
      const fk = table.foreignKeys[name];
      log(
        chalk.yellow(
          `  ${fk.name || '(unnamed)'}: ${fk.columns.join(', ')} => ${
            fk.reference.table
          } (${fk.reference.columns.join(', ')})`,
        ),
      );
    }
  }
}

function main() {
  let db: Database = emptyDb();

  for (const expr of ast) {
    if (expr.type === 'CREATE TABLE') {
      const table = makeTable(expr);
      db = addTable(db, table);
      log(chalk.green(`CREATE TABLE ${expr.tblName}`));
    } else if (expr.type === 'DROP TABLE') {
      db = removeTable(db, expr.tblName, expr.ifExists);
    } else if (expr.type === 'RENAME TABLE') {
      db = renameTable(db, expr.tblName, expr.newName);
    } else {
      error(chalk.yellow(`Unknown expression type: ${expr.type}`));
    }
  }

  log('');
  log('Done!');
  printDb(db);
}

main();
