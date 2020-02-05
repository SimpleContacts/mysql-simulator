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
  tables: Array<string>,
};

function printDb(db: Database, tables: Array<string> = []) {
  log(db.toString(tables));
}

function runWithOptions(options: Options) {
  let db: Database = new Database();

  let files = Array.from(expandInputFiles(options.args));
  for (const fullpath of files) {
    const file = path.basename(fullpath);
    if (options.verbose) {
      error(`===> ${file}`);
    }
    db = applySqlFile(db, fullpath);
  }

  printDb(db, options.tables);
}

function collect(val, memo) {
  memo.push(val);
  return memo;
}

function run() {
  program
    // $FlowFixMe - ugh commander
    .name('mysql-simulate')
    .usage('[options] <path> [<path> ...]')
    .description('Parses SQL migration files and outputs the resulting DB state.')
    .option('--table <table>', 'Dump only these tables', collect, [])
    .option('-v, --verbose', 'Be verbose')
    .parse(process.argv);

  // $FlowFixMe - options monkey-patched on program are invisible to Flow
  if (program.args.length < 1) {
    program.help();
  } else {
    // $FlowFixMe - options monkey-patched on program are invisible to Flow
    const { args, verbose, table } = program;
    const options = { args, verbose, tables: table };
    runWithOptions(options);
  }
}

run();
