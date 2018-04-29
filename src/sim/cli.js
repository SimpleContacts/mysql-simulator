#!/usr/bin/env babel-node
// @flow

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import program from 'commander';
import { sortBy } from 'lodash';

import parseSql from '../parser';
import { emptyDb } from './core';
import { applySql, dumpDb } from './lib';
import type { Database } from './types';

// eslint-disable-next-line no-console
const log = console.log;
// eslint-disable-next-line no-console
const error = console.error;

function printDb(db: Database, tables: Array<string> = []) {
  log(dumpDb(db, tables));
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
        error(`===> ${chalk.magenta(file)}`);
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
