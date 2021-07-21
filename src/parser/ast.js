// @flow strict

// TODO
// TODO
// TODO: This file should be entirely replaced by the new AST!
// TODO
// TODO

import type { AlterSpec, CreateTableDefinition, IndexColName, TableOptions } from '../ast';

export type CreateTableStatement = {|
  type: 'CREATE TABLE',
  tblName: string,
  definitions: Array<CreateTableDefinition>,
  options: TableOptions | null,
  ifNotExists: boolean,
|};

export type CreateTableLikeStatement = {|
  type: 'CREATE TABLE LIKE', // Copy table
  tblName: string,
  oldTblName: string,
  ifNotExists: boolean | null,
|};

export type CreateIndexStatement = {|
  type: 'CREATE INDEX',
  indexName: string,
  indexKind: 'NORMAL' | 'UNIQUE' | 'FULLTEXT',
  tblName: string,
  indexColNames: Array<IndexColName>,
|};

export type CreateTriggerStatement = {|
  type: 'CREATE TRIGGER',
  triggerName: string,
  tblName: string,
|};

export type CreateFunctionStatement = {|
  type: 'CREATE FUNCTION',
|};

export type RenameTableStatement = {|
  type: 'RENAME TABLE',
  tblName: string,
  newName: string,
|};

export type AlterDbOption = {|
  CHARSET?: string,
  COLLATE?: string,
|};

export type AlterDatabaseStatement = {|
  type: 'ALTER DATABASE',
  dbName: string,
  options: Array<AlterDbOption>,
|};

export type AlterTableStatement = {|
  type: 'ALTER TABLE',
  tblName: string,
  changes: Array<AlterSpec>,
|};

export type DropTableStatement = {|
  type: 'DROP TABLE',
  tblName: string,
  ifExists: boolean,
|};

export type DropIndexStatement = {|
  type: 'DROP INDEX',
  indexName: string,
  tblName: string,
|};

// export type CompoundStatement = __TODO__;
// export type IfStatement = __TODO__;

export type Statement =
  | CreateTableStatement
  | CreateTableLikeStatement
  | CreateIndexStatement
  | CreateTriggerStatement
  | CreateFunctionStatement
  | RenameTableStatement
  | AlterDatabaseStatement
  | AlterTableStatement
  | DropTableStatement
  | DropIndexStatement;
// | CompoundStatement
// | IfStatement;
