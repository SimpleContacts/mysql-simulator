// @flow strict

import { escape } from './utils';

type Reference = {|
  +table: string,
  +columns: $ReadOnlyArray<string>,
|};

export default class ForeignKey {
  +name: string;
  +columns: $ReadOnlyArray<string>;
  +reference: Reference;

  constructor(name: string, columns: $ReadOnlyArray<string>, reference: Reference) {
    this.name = name;
    this.columns = columns;
    this.reference = reference;
  }

  /**
   * Helper method that returns a new ForeignKey instance with the given fields
   * replaced.
   */
  patch(record: {| +name?: string, +columns?: $ReadOnlyArray<string>, +reference?: Reference |}): ForeignKey {
    return new ForeignKey(
      record.name !== undefined ? record.name : this.name,
      record.columns !== undefined ? record.columns : this.columns,
      record.reference !== undefined ? record.reference : this.reference,
    );
  }

  toString(): string {
    return `CONSTRAINT ${escape(this.name)} FOREIGN KEY (${this.columns.map(escape).join(', ')}) REFERENCES ${escape(
      this.reference.table,
    )} (${this.reference.columns.map(escape).join(', ')})`;
  }
}
