// @flow strict

// TODO
// TODO
// TODO: This file should be entirely replaced by the new AST!
// TODO
// TODO

import type { Column, ColumnDefinition, IndexColName, ReferenceDefinition } from '../ast';

export type NamedConstraint = string;

export type CreateTableDefinition =
  | Column
  | {| type: 'PRIMARY KEY', indexColNames: Array<IndexColName> |}
  | {|
      type: 'INDEX',
      indexName: string | null,
      indexColNames: Array<IndexColName>,
    |}
  | {|
      type: 'UNIQUE INDEX',
      constraint: NamedConstraint | null,
      indexName: string | null,
      indexColNames: Array<IndexColName>,
    |}
  | {|
      type: 'FULLTEXT INDEX',
      indexName: string | null,
      indexColNames: Array<IndexColName>,
    |}
  | {|
      type: 'FOREIGN KEY',
      constraint: NamedConstraint | null,
      indexName: string | null,
      indexColNames: Array<IndexColName>,
      reference: ReferenceDefinition,
    |};

export type TableOptions = {|
  AUTO_INCREMENT?: string | null,
  ENGINE?: 'InnoDB',
  CHARSET?: string,
  COLLATE?: string,
|};

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

export type AlterTableOptions = {|
  type: 'CHANGE TABLE OPTIONS',
  options: TableOptions,
|};

export type AlterConvertTo = {|
  type: 'CONVERT TO',
  charset: string,
  collate?: string,
|};

export type AlterAddColumn = {|
  type: 'ADD COLUMN',
  colName: string,
  definition: ColumnDefinition,
  position: string | null,
|};

export type IndexType = 'BTREE' | 'HASH';

export type AlterAddIndex = {|
  type: 'ADD INDEX',
  indexName: string | null,
  indexType: IndexType | null,
  indexColNames: Array<IndexColName>,
|};

export type AlterAddPrimaryKey = {|
  type: 'ADD PRIMARY KEY',
  constraint: NamedConstraint | null,
  indexType: IndexType | null,
  indexColNames: Array<IndexColName>,
|};

export type AlterAddUniqueIndex = {|
  type: 'ADD UNIQUE INDEX',
  constraint: NamedConstraint | null,
  indexName: string | null,
  indexType: IndexType | null,
  indexColNames: Array<IndexColName>,
|};

export type AlterAddFullTextIndex = {|
  type: 'ADD FULLTEXT INDEX',
  indexName: string | null,
  indexColNames: Array<IndexColName>,
|};

export type AlterAddForeignKey = {|
  type: 'ADD FOREIGN KEY',
  constraint: NamedConstraint | null,
  indexName: string | null,
  indexColNames: Array<IndexColName>,
  reference: ReferenceDefinition,
|};

export type AlterDropDefault = {|
  type: 'DROP DEFAULT',
  colName: string,
|};

export type AlterChangeColumn = {|
  type: 'CHANGE COLUMN',
  oldColName: string,
  newColName: string,
  definition: ColumnDefinition,
  position: string | null,
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
  | AlterTableOptions
  | AlterConvertTo
  | AlterAddColumn
  | AlterAddIndex
  | AlterAddPrimaryKey
  | AlterAddUniqueIndex
  | AlterAddFullTextIndex
  | AlterAddForeignKey
  | AlterDropDefault
  | AlterDropIndex
  | AlterDropPrimaryKey
  | AlterDropForeignKey
  | AlterDropColumn
  | AlterChangeColumn
  | AlterRenameIndex
  | AlterRenameTable;

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
