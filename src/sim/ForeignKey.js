// @flow strict

import invariant from 'invariant';

import { escape } from '../printer';
import type { MySQLVersion } from '../printer/utils';

export type ReferenceOption =
  | 'RESTRICT' // The default
  | 'CASCADE'
  | 'SET NULL'
  | 'SET DEFAULT' // Not supported by InnoDB tables
  | 'NO ACTION';

type Reference = {|
  +table: string,
  +columns: $ReadOnlyArray<string>,
  +onDelete: ReferenceOption | null,
|};

export default class ForeignKey {
  +name: string;
  +columns: $ReadOnlyArray<string>;
  +reference: Reference;

  constructor(name: string, columns: $ReadOnlyArray<string>, reference: Reference) {
    this.name = name;
    this.columns = columns;
    this.reference = reference;

    invariant(reference.onDelete !== 'SET DEFAULT', 'SET DEFAULT is not supported on InnoDB tables');
    invariant(reference.onDelete !== 'NO ACTION', 'NO ACTION is not a valid reference option for ON DELETE rules');
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

  toString(target: MySQLVersion): string {
    let onDeleteClause;

    if (target === '5.7') {
      // MySQL 5.7 will never show RESTRICT, even if it's set explicitly
      onDeleteClause =
        this.reference.onDelete !== null && this.reference.onDelete !== 'RESTRICT'
          ? `ON DELETE ${this.reference.onDelete}`
          : null;
    } else {
      // MySQL 8.0 will output it when it's set explicitly
      onDeleteClause = this.reference.onDelete !== null ? `ON DELETE ${this.reference.onDelete}` : null;
    }

    return [
      `CONSTRAINT ${escape(this.name)}`,
      `FOREIGN KEY (${this.columns.map(escape).join(', ')})`,
      `REFERENCES ${escape(this.reference.table)} (${this.reference.columns.map(escape).join(', ')})`,
      onDeleteClause,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
