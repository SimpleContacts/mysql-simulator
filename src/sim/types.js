// @flow

type LUT<T> = { [string]: T };

export type Column = {
  name: string,
  type: string,
  nullable: boolean,
  defaultValue: null | string,
  onUpdate: null | string,
  autoIncrement: boolean,
};

export type Index = {
  name: string,
  columns: Array<string>,
  unique: boolean,
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
  indexes: Array<Index>,
  foreignKeys: Array<ForeignKey>,
};

export type Database = {
  tables: LUT<Table>,

  // TODO: Track foreign key names assigned within any table, since they're
  // essentially a "global" registry.
  // foreignKeyNames: Set<string>,
};
