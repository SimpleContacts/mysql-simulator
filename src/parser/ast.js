// @flow strict

export type __TODO__ = mixed;

export type Identifier = string;
export type ConstantExpr = string;
export type NamedConstraint = string;

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
|};

export type IndexColName = {|
  colName: Identifier,
  len: number,
  direction: 'ASC' | 'DESC' | null,
|};

export type ReferenceOption = 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'NO ACTION' | 'SET DEFAULT';

export type ReferenceDefinition = {|
  tblName: Identifier,
  indexColNames: Array<IndexColName>,
  matchMode: 'MATCH' | 'FULL' | 'PARTIAL' | 'SIMPLE' | null,
  onDelete: ReferenceOption | null,
  onUpdate: ReferenceOption | null,
|};

export type CreateTableDefinition =
  | {| type: 'COLUMN', colName: Identifier, definition: ColumnDefinition |}
  | {| type: 'PRIMARY KEY', indexColNames: Array<IndexColName> |}
  | {| type: 'INDEX', indexName: Identifier | null, indexColNames: Array<IndexColName> |}
  | {|
      type: 'UNIQUE INDEX',
      constraint: NamedConstraint | null,
      indexName: Identifier | null,
      indexColNames: Array<IndexColName>,
    |}
  | {| type: 'FULLTEXT INDEX', indexName: Identifier | null, indexColNames: Array<IndexColName> |}
  | {|
      type: 'FOREIGN KEY',
      constraint: NamedConstraint | null,
      indexName: Identifier | null,
      indexColNames: Array<IndexColName>,
      reference: ReferenceDefinition,
    |};

export type CreateTableStatement = {|
  type: 'CREATE TABLE',
  tblName: Identifier,
  definitions: Array<CreateTableDefinition>,
  options: TableOptions | null,
  ifNotExists: boolean,
|};

export type TableOptions = {|
  AUTO_INCREMENT?: string | null,
  ENGINE?: 'InnoDB',
  CHARSET?: 'utf8',
  COLLATE?: 'utf8_general_ci' | 'utf8_bin',
|};

export type CreateTableLikeStatement = {|
  type: 'CREATE TABLE LIKE', // Copy table
  tblName: Identifier,
  oldTblName: Identifier,
  ifNotExists: boolean | null,
|};

export type Statement = CreateTableStatement | CreateTableLikeStatement;
// | CreateIndexStatement
// | CreateTriggerStatement
// | CreateFunctionStatement
// | RenameTableStatement
// | AlterTableStatement
// | DropTableStatement
// | DropIndexStatement
// | SelectStatement
// | InsertStatement
// | DeleteStatement
// | UpdateStatement
// | SetStatement
// | LockStatement
// | UnlockStatement
// | CompoundStatement
// | IfStatement;
