#!/usr/bin/env babel-node
// @flow strict

import path from 'path';

import program from 'commander';
import { dumpSchema } from 'rule-of-law';

import { applySqlFile, expandInputFiles } from './core';
import Database from './Database';
import { makeEncoding } from './encodings';

const log = console.log;
const error = console.error;

type Options = {
  args: Array<string>,
  verbose: boolean,
  tables: Array<string>,
  foreignKeysLast: boolean,
  asROLSchema: boolean,
  charset?: string,
  collate?: string,
};

function runWithOptions(options: Options) {
  const serverEncoding = makeEncoding(options.charset, options.collate);
  let db: Database = new Database(serverEncoding);

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
    log(
      db.toString({
        tableNames: options.tables,
        foreignKeysLast: options.foreignKeysLast,
      }),
    );
  }
}

function collect(val, memo) {
  memo.push(val);
  return memo;
}

function run() {
  program
    // $FlowFixMe[incompatible-call] - ugh commander
    .name('mysql-simulate')
    .usage('[options] <path> [<path> ...]')
    .description('Parses SQL migration files and outputs the resulting DB state.')
    .option('-s, --charset <charset>', 'Set the (initial) default charset for the DB')
    .option('-c, --collate <collation>', 'Set the (initial) default collation for the DB')
    .option('-f, --foreign-keys-last', 'Create foreign keys last')
    .option('--table <table>', 'Dump only these tables', collect, [])
    .option('--as-rol-schema', 'Dump database as a rule-of-law schema')
    .option('-v, --verbose', 'Be verbose')
    .parse(process.argv);

  if (program.args.length < 1) {
    program.help();
  } else {
    const opts = program.opts();
    const options: Options = {
      args: program.args,
      verbose: !!opts.verbose,
      // $FlowFixMe[incompatible-type]: mixed != Array<string>
      tables: opts.table,
      asROLSchema: !!opts.asRolSchema,
      // $FlowFixMe[incompatible-type]: mixed != (string | void)
      charset: opts.charset,
      // $FlowFixMe[incompatible-type]: mixed != (string | void)
      collate: opts.collate,
      foreignKeysLast: !!opts.foreignKeysLast,
    };
    runWithOptions(options);
  }
}

run();
