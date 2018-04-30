// @flow

type LUT<T> = { [string]: T };
export type IndexType = 'NORMAL' | 'UNIQUE' | 'FULLTEXT';

export type Column = {
  name: string,
  type: string,
  nullable: boolean,
  defaultValue: null | string,
  onUpdate: null | string,
  autoIncrement: boolean,
  comment: null | string,
};

export type Index = {
  name: string,
  columns: Array<string>,
  type: IndexType,

  // NOTE: There's some subtlety to MySQL's behavior on index naming.
  // Depending on how an index was created in the system, MySQL may implicitly
  // decide to rename it later on, as a side-effect of another statmeent.  This
  // behaviour can only be reliably replicated by tracking the "lockedness" of
  // its name explicitly.  (The $$ signifies this is an internal implementation
  // detail.)
  $$locked: boolean,
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
