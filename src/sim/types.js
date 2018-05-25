// @flow

export type IndexType = 'NORMAL' | 'UNIQUE' | 'FULLTEXT';

export type Index = {|
  +name: string,
  +columns: Array<string>,
  +type: IndexType,

  // NOTE: There's some subtlety to MySQL's behavior on index naming.
  // Depending on how an index was created in the system, MySQL may implicitly
  // decide to rename it later on, as a side-effect of another statement.  This
  // behaviour can only be reliably replicated by tracking the "lockedness" of
  // its name explicitly.  (The $$ signifies this is an internal implementation
  // detail.)
  +$$locked: boolean,
|};

export type ForeignKey = {|
  +name: string,
  +columns: Array<string>,
  +reference: {|
    +table: string,
    +columns: Array<string>,
  |},
|};
