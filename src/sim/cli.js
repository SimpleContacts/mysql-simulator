#!/usr/bin/env babel-node
// @flow strict

import path from 'path';

import program from 'commander';
import { dumpSchema } from 'rule-of-law';

import { applySqlFile, expandInputFiles } from './core';
import Database from './Database';

const log = console.log;
const error = console.error;

type Options = {
  args: Array<string>,
  verbose: boolean,
  tables: Array<string>,
  asROLSchema: boolean,
  mysqlVersion?: string,
};

function runWithOptions(options: Options) {
  const version = options.mysqlVersion;
  if (version !== undefined && version !== '5.7' && version !== '8.0') {
    throw new Error('Unrecognized MySQL version: ' + version);
  }
  let db: Database = new Database(version ? { version } : undefined);
  let files = Array.from(expandInputFiles(options.args));
  for (const fullpath of files) {
    const file = path.basename(fullpath);
    if (options.verbose) {
      error(`===> ${file}`);
    }
    db = applySqlFile(db, fullpath);
  }

  if (options.asROLSchema) {
    log(dumpSchema(db.toSchema()));
  } else {
    log(db.toString(options.tables));
  }
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
    .option('--as-rol-schema', 'Dump database as a rule-of-law schema')
    .option('-v, --verbose', 'Be verbose')
    .option('--mysql-version <version>', 'The MySQL version to simulate: "5.7" or "8.x" (default: 5.7)')
    .parse(process.argv);

  // $FlowFixMe - options monkey-patched on program are invisible to Flow
  if (program.args.length < 1) {
    program.help();
  } else {
    // $FlowFixMe - options monkey-patched on program are invisible to Flow
    const { args, verbose, table, mysqlVersion, asRolSchema } = program;
    const options = { args, verbose, tables: table, asROLSchema: !!asRolSchema, mysqlVersion };
    runWithOptions(options);
  }
}

run();
