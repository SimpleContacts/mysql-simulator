// @flow

export type Index<T> = { [string]: T };

export type Column = {
  name: string,
  type: string,
  nullable: boolean,
  defaultValue: string,
};

export type Table = {
  name: string,
  columns: Index<Column>,
};

export type Database = {
  tables: Index<Table>,
};
