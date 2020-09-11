// @flow strict

// export type __TODO__ = mixed;

export type Identifier = string;
export type ConstantExpr = string;
export type NamedConstraint = string;

export type Direction = 'ASC' | 'DESC';
export type ReferenceOption = 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'NO ACTION' | 'SET DEFAULT';
export type MatchMode = 'MATCH' | 'FULL' | 'PARTIAL' | 'SIMPLE';
export type GeneratedMode = 'STORED' | 'VIRTUAL';

export type IndexColName = {|
  colName: Identifier,
  len: number,
  direction: Direction | null,
|};

export type ReferenceDefinition = {|
  tblName: Identifier,
  indexColNames: Array<IndexColName>,
  matchMode: MatchMode | null,
  onDelete: ReferenceOption | null,
  onUpdate: ReferenceOption | null,
|};

export type GeneratedDefinition = {|
  expr: string,
  mode: GeneratedMode,
|};

export type ColumnDefinition = {|
  dataType: string,
  nullable: boolean | null,
  defaultValue: ConstantExpr | null,
  onUpdate: ConstantExpr | null,
  isUnique: boolean,
  isPrimary: boolean,
  autoIncrement: boolean,
  comment: string | null,
  reference: ReferenceDefinition | null,
  generated: GeneratedDefinition | null,
|};

export type CreateTableDefinition =
  | {| type: 'COLUMN', colName: Identifier, definition: ColumnDefinition |}
  | {| type: 'PRIMARY KEY', indexColNames: Array<IndexColName> |}
  | {|
      type: 'INDEX',
      indexName: Identifier | null,
      indexColNames: Array<IndexColName>,
    |}
  | {|
      type: 'UNIQUE INDEX',
      constraint: NamedConstraint | null,
      indexName: Identifier | null,
      indexColNames: Array<IndexColName>,
    |}
  | {|
      type: 'FULLTEXT INDEX',
      indexName: Identifier | null,
      indexColNames: Array<IndexColName>,
    |}
  | {|
      type: 'FOREIGN KEY',
      constraint: NamedConstraint | null,
      indexName: Identifier | null,
      indexColNames: Array<IndexColName>,
      reference: ReferenceDefinition,
    |};

export type TableOptions = {|
  AUTO_INCREMENT?: string | null,
  ENGINE?: 'InnoDB',
  CHARSET?: 'utf8',
  COLLATE?: 'utf8_general_ci' | 'utf8_bin',
|};

export type CreateTableStatement = {|
  type: 'CREATE TABLE',
  tblName: Identifier,
  definitions: Array<CreateTableDefinition>,
  options: TableOptions | null,
  ifNotExists: boolean,
|};

export type CreateTableLikeStatement = {|
  type: 'CREATE TABLE LIKE', // Copy table
  tblName: Identifier,
  oldTblName: Identifier,
  ifNotExists: boolean | null,
|};

export type CreateIndexStatement = {|
  type: 'CREATE INDEX',
  indexName: Identifier,
  indexKind: 'NORMAL' | 'UNIQUE' | 'FULLTEXT',
  tblName: Identifier,
  indexColNames: Array<IndexColName>,
|};

export type CreateTriggerStatement = {|
  type: 'CREATE TRIGGER',
  triggerName: Identifier,
  tblName: Identifier,
|};

export type CreateFunctionStatement = {|
  type: 'CREATE FUNCTION',
|};

export type RenameTableStatement = {|
  type: 'RENAME TABLE',
  tblName: Identifier,
  newName: Identifier,
|};

export type AlterTableOptions = {|
  type: 'CHANGE TABLE OPTIONS',
|};

export type AlterAddColumn = {|
  type: 'ADD COLUMN',
  colName: Identifier,
  definition: ColumnDefinition,
  position: string | null,
|};

export type IndexType = 'BTREE' | 'HASH';

export type AlterAddIndex = {|
  type: 'ADD INDEX',
  indexName: Identifier | null,
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
  indexName: Identifier | null,
  indexType: IndexType | null,
  indexColNames: Array<IndexColName>,
|};

export type AlterAddFullTextIndex = {|
  type: 'ADD FULLTEXT INDEX',
  indexName: Identifier | null,
  indexColNames: Array<IndexColName>,
|};

export type AlterAddForeignKey = {|
  type: 'ADD FOREIGN KEY',
  constraint: NamedConstraint | null,
  indexName: Identifier | null,
  indexColNames: Array<IndexColName>,
  reference: ReferenceDefinition,
|};

export type AlterDropDefault = {|
  type: 'DROP DEFAULT',
  colName: Identifier,
|};

export type AlterChangeColumn = {|
  type: 'CHANGE COLUMN',
  oldColName: Identifier,
  newColName: Identifier,
  definition: ColumnDefinition,
  position: string | null,
|};

export type AlterDropIndex = {|
  type: 'DROP INDEX',
  indexName: Identifier,
|};

export type AlterDropPrimaryKey = {|
  type: 'DROP PRIMARY KEY',
|};

export type AlterDropForeignKey = {|
  type: 'DROP FOREIGN KEY',
  symbol: Identifier,
|};

export type AlterDropColumn = {|
  type: 'DROP COLUMN',
  colName: Identifier,
|};

export type AlterRenameIndex = {|
  type: 'RENAME INDEX',
  oldIndexName: Identifier,
  newIndexName: Identifier,
|};

export type AlterRenameTable = {|
  type: 'RENAME TABLE',
  newTblName: Identifier,
|};

export type AlterSpec =
  | AlterTableOptions
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
  tblName: Identifier,
  changes: Array<AlterSpec>,
|};

export type DropTableStatement = {|
  type: 'DROP TABLE',
  tblName: Identifier,
  ifExists: boolean,
|};

export type DropIndexStatement = {|
  type: 'DROP INDEX',
  indexName: Identifier,
  tblName: Identifier,
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
  | AlterTableStatement
  | DropTableStatement
  | DropIndexStatement;
// | CompoundStatement
// | IfStatement;
