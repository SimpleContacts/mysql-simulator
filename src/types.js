// @flow

type LUT<T> = { [string]: T };

export type Column = {
  name: string,
  type: string,
  nullable: boolean,
  defaultValue: string,
  autoIncrement: boolean,
};

export type ForeignKey = {
  name: string,
  columns: Array<string>,
  reference: {
    table: string,
    columns: Array<string>,
  },
};

export type Table = {
  name: string,
  columns: Array<Column>,
  primaryKey: Array<string> | null,
  foreignKeys: Array<ForeignKey>,
};

export type Database = {
  tables: LUT<Table>,
};
