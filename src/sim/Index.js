// @flow

import { escape } from './utils';

export type IndexType = 'NORMAL' | 'UNIQUE' | 'FULLTEXT';

export default class Index {
  +name: string;
  +columns: $ReadOnlyArray<string>;
  +type: IndexType;

  // NOTE: There's some subtlety to MySQL's behavior on index naming.
  // Depending on how an index was created in the system, MySQL may implicitly
  // decide to rename it later on, as a side-effect of another statement.  This
  // behaviour can only be reliably replicated by tracking the "lockedness" of
  // its name explicitly.  (The $$ signifies this is an internal implementation
  // detail.)
  +$$locked: boolean;

  constructor(name: string, columns: $ReadOnlyArray<string>, type: IndexType, $$locked: boolean) {
    this.name = name;
    this.columns = columns;
    this.type = type;
    this.$$locked = $$locked;
  }

  /**
   * Helper method that returns a new Index instance with the given fields
   * replaced.
   */
  patch(record: {|
    +name?: string,
    +columns?: $ReadOnlyArray<string>,
    +type?: IndexType,
    +$$locked?: boolean,
  |}): Index {
    return new Index(
      record.name !== undefined ? record.name : this.name,
      record.columns !== undefined ? record.columns : this.columns,
      record.type !== undefined ? record.type : this.type,
      record.$$locked !== undefined ? record.$$locked : this.$$locked,
    );
  }

  toString(): string {
    const value = `KEY ${escape(this.name)} (${this.columns.map(escape).join(',')})`;
    const type = this.type;
    return type !== 'NORMAL' ? `${type} ${value}` : value;
  }
}
