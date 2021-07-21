// @flow strict

// TODO
// TODO
// TODO: This file should be entirely replaced by the new AST!
// TODO
// TODO

import type {
  AlterAddColumn,
  AlterAddForeignKey,
  AlterAddFullTextIndex,
  AlterAddIndex,
  AlterAddPrimaryKey,
  AlterAddUniqueIndex,
  AlterChangeColumn,
  AlterConvertTo,
  Column,
  ForeignKey,
  FullTextIndex,
  Index,
  IndexColName,
  PrimaryKey,
  TableOptions,
  UniqueIndex,
} from '../ast';

export type CreateTableDefinition = Column | PrimaryKey | Index | UniqueIndex | FullTextIndex | ForeignKey;

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

export type AlterDropDefault = {|
  type: 'DROP DEFAULT',
  colName: string,
|};

export type AlterDropIndex = {|
  type: 'DROP INDEX',
  indexName: string,
|};

export type AlterDropPrimaryKey = {|
  type: 'DROP PRIMARY KEY',
|};

export type AlterDropForeignKey = {|
  type: 'DROP FOREIGN KEY',
  symbol: string,
|};

export type AlterDropColumn = {|
  type: 'DROP COLUMN',
  colName: string,
|};

export type AlterRenameIndex = {|
  type: 'RENAME INDEX',
  oldIndexName: string,
  newIndexName: string,
|};

export type AlterRenameTable = {|
  type: 'RENAME TABLE',
  newTblName: string,
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

export type AlterSpec =
  | AlterAddColumn
  | AlterAddForeignKey
  | AlterAddFullTextIndex
  | AlterAddIndex
  | AlterAddPrimaryKey
  | AlterAddUniqueIndex
  | AlterChangeColumn
  | AlterConvertTo
  | AlterDropColumn
  | AlterDropDefault
  | AlterDropForeignKey
  | AlterDropIndex
  | AlterDropPrimaryKey
  | AlterRenameIndex
  | AlterRenameTable
  | AlterTableOptions;

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
