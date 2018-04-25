#!/usr/bin/env babel-node
// @flow

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import program from 'commander';
import { sortBy } from 'lodash';

import parseSql from '../parser';
import {
  addColumn,
  addForeignKey,
  addPrimaryKey,
  addTableLike,
  createTable,
  dropForeignKey,
  dropPrimaryKey,
  emptyDb,
  removeColumn,
  removeTable,
  renameTable,
  replaceColumn,
} from './core';
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

function handleCreateTable(db: Database, expr): Database {
  const tblName = expr.tblName;
  db = createTable(db, tblName);

  // One-by-one, add the columns to the table
  const columns = expr.definitions.filter(def => def.type === 'COLUMN');
  for (const coldef of columns) {
    db = addColumn(
      db,
      tblName,
      {
        name: coldef.colName,
        type: coldef.definition.dataType,
        nullable: coldef.definition.nullable,
        defaultValue: coldef.definition.defaultValue,
        autoIncrement: coldef.definition.autoIncrement,
      },
      null,
    );
  }

  // Add a primary key, if any. A primary key can be added explicitly (1), or
  // defined on a column directly (2).

  const pks = [
    // (1) Explicit PRIMARY KEY definitions
    ...expr.definitions
      .filter(def => def.type === 'PRIMARY KEY')
      .map(def => def.columns),

    // (2) Primary key can also be defined on a column declaratively
    ...columns.filter(c => c.definition.isPrimary).map(c => [c.colName]),
  ];

  for (const pk of pks) {
    db = addPrimaryKey(db, tblName, pk);
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
  for (const index of table.indexes) {
    log(
      chalk.white(
        `  KEY ${escape(index.name)} (${index.columns
          .map(escape)
          .join(', ')}),`,
      ),
    );
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
}

function printDb(db: Database, tables: Array<string> = []) {
  tables = tables.length > 0 ? tables : sortBy(Object.keys(db.tables));
  for (const tableName of tables) {
    log('');
    printTable(db.tables[tableName]);
  }
}

function applySql(db: Database, ast: Array<*>): Database {
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
        } else if (change.type === 'ADD FOREIGN KEY') {
          db = addForeignKey(
            db,
            expr.tblName,
            change.constraint,
            change.indexColNames.map(def => def.colName),
            change.reference.tblName,
            change.reference.indexColNames.map(def => def.colName),
          );
        } else if (change.type === 'DROP FOREIGN KEY') {
          db = dropForeignKey(db, expr.tblName, change.symbol);
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

  return db;
}

function main(program) {
  let db: Database = emptyDb();

  for (const dir of program.args) {
    // Naturally sort files before processing -- order is crucial!
    let files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));
    files = sortBy(files, f => parseInt(f, 10));
    if (program.limit) {
      files = files.slice(0, program.limit);
    }

    for (const file of files) {
      const fullpath = path.join(dir, file);

      if (program.verbose) {
        log(`===> ${chalk.magenta(file)}`);
      }
      const sql = fs.readFileSync(fullpath, { encoding: 'utf-8' });
      const ast: Array<*> = parseSql(sql, fullpath);
      db = applySql(db, ast);

      if (program.step) {
        printDb(db, program.table);
      }
    }
  }

  printDb(db, program.table);
}

function collect(val, memo) {
  memo.push(val);
  return memo;
}

program
  .version('0.0.1')
  .usage('[options] <path> [<path> ...]')
  // .command('command <inputs>')
  .description('Parses SQL migration files and outputs the resulting DB state.')
  .option('--step', 'Dump table after every alteration')
  .option('--limit <n>', 'Run only the first N migrations', parseInt)
  .option('--table <table>', 'Dump only these tables', collect, [])
  .option('-v, --verbose', 'Be verbose')
  .parse(process.argv);

if (program.args.length < 1) {
  program.help();
} else {
  main(program);
}
