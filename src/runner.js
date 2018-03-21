// @flow

import type { Database, Table } from './types';
import { emptyDb, addTable, removeTable } from './db';

import ast from '../example.ast.json';

function makeTable(expr): Table {
  const fields = expr.definitions.filter(def => def.type === 'COLUMN');
  // const fks = expr.definitions.filter(def => def.type === 'FOREIGN KEY');
  // eslint-disable-next-line
  return {
    name: expr.name,
    fields: fields.map(f => {
      if (!f.attrs) {
        // eslint-disable-next-line
        console.log({ f });
        throw new Error('???');
      }

      const nullable = !f.attrs.includes('NOT NULL');
      const defaultValue = 'foo';
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
    if (expr.type === 'CREATE') {
      const table = makeTable(expr);
      db = addTable(db, table);
    } else if (expr.type === 'DROP TABLE') {
      db = removeTable(db, expr.tableName, expr.ifExists);
    } else {
      // eslint-disable-next-line no-console
      console.error(`Unknown expression type: ${expr.type}`);
    }
  }

  // console.log(JSON.stringify(db, null, 2));
}

main();
