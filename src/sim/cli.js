#!/usr/bin/env babel-node
// @flow strict

import path from 'path';

import program from 'commander';
import { dumpSchema } from 'rule-of-law';

import { makeEncoding } from '../ast/encodings';
import type { MySQLVersion } from '../printer/utils';
import { applySqlFile, expandInputFiles } from './core';
import Database from './Database';

const DEFAULT_MYSQL_VERSION: MySQLVersion = '5.7';

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
  mysqlVersion?: MySQLVersion,
};

function runWithOptions(options: Options) {
  const defaultEncoding = makeEncoding(options.charset, options.collate);
  const dbOptions = {
    defaultEncoding,
    mysqlVersion: options.mysqlVersion ?? DEFAULT_MYSQL_VERSION,
  };
  let db: Database = new Database(dbOptions);
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
    .option('--mysql-version', 'The MySQL version to simulate: "5.7" or "8.x" (default: 5.7)')
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
      // $FlowFixMe[incompatible-type]: mixed != (string | void)
      mysqlVersion: opts.mysqlVersion,
      foreignKeysLast: !!opts.foreignKeysLast,
    };
    runWithOptions(options);
  }
}

run();
