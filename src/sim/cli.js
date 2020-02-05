#!/usr/bin/env babel-node
// @flow strict

import path from 'path';
import program from 'commander';
import { applySqlFile, expandInputFiles } from './core';
import Database from './Database';

const log = console.log;
const error = console.error;

type Options = {
  args: Array<string>,
  verbose: boolean,
  limit: number,
  step: boolean,
  tables: Array<string>,
};

function printDb(db: Database, tables: Array<string> = []) {
  log(db.toString(tables));
}

function runWithOptions(options: Options) {
  let db: Database = new Database();

  let files = Array.from(expandInputFiles(options.args));
  if (options.limit) {
    files = files.slice(0, options.limit);
  }

  for (const fullpath of files) {
    const file = path.basename(fullpath);
    if (options.verbose) {
      error(`===> ${file}`);
    }
    db = applySqlFile(db, fullpath);

    if (options.step) {
      printDb(db, options.tables);
    }
  }

  printDb(db, options.tables);
}

function collect(val, memo) {
  memo.push(val);
  return memo;
}

function run() {
  program
    .usage('mysql-simulate [options] <path> [<path> ...]')
    // .command('command <inputs>')
    .description('Parses SQL migration files and outputs the resulting DB state.')
    .option('--step', 'Dump table after every alteration')
    .option('--limit <n>', 'Run only the first N migrations', parseInt)
    .option('--table <table>', 'Dump only these tables', collect, [])
    .option('-v, --verbose', 'Be verbose')
    .parse(process.argv);

  // $FlowFixMe - options monkey-patched on program are invisible to Flow
  if (program.args.length < 1) {
    program.help();
  } else {
    // $FlowFixMe - options monkey-patched on program are invisible to Flow
    const { args, verbose, limit, step, table } = program;
    const options = { args, verbose, limit, step, tables: table };
    runWithOptions(options);
  }
}

run();
