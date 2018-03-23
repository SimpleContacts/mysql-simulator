// @flow

import chalk from 'chalk';

import ast from '../example.ast.json';
import { addTable, emptyDb, removeTable, renameTable } from './db';
import type { Database, Table } from './types';

// eslint-disable-next-line no-console
const log = console.log
// eslint-disable-next-line no-console
const error = console.error

function makeTable(expr): Table {
  const fields = expr.definitions.filter(def => def.type === 'COLUMN');
  // const fks = expr.definitions.filter(def => def.type === 'FOREIGN KEY');
  // eslint-disable-next-line
  return {
    name: expr.tblName,
    fields: fields.map(f => {
      if (!f.attrs) {
        // eslint-disable-next-line
        console.log({ f });
        throw new Error('???');
      }

      const nullable = !f.attrs.includes('NOT NULL');
      const defaultValue = f.defaultValue;
      return {
        name: f.name,
        type: f.columnType,
        nullable,
        defaultValue,
      };
    }),
  };
}

function main() {
  let db: Database = emptyDb();

  // eslint-disable-next-line
  for (const expr of ast) {
    if (expr.type === 'CREATE TABLE') {
      const table = makeTable(expr);
      db = addTable(db, table);
      log(chalk.green(`CREATE TABLE ${expr.name}`));
    } else if (expr.type === 'DROP TABLE') {
      db = removeTable(db, expr.tableName, expr.ifExists);
    } else if (expr.type === 'RENAME TABLE') {
      db = renameTable(db, expr.existingName, expr.newName);
    } else {
      error(chalk.gray(`Unknown expression type: ${expr.type}`));
    }

    log(chalk.green(expr.type));
  }

  log('');
  log('Done!');
  log(chalk.blue(JSON.stringify(db, null, 2)));
}

main();
