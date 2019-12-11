// @flow strict

import { formatDataType, parseDataType } from './DataType';
import type { TypeInfo } from './DataType';
import { escape } from './utils';

type Generated = {|
  expr: string,
  mode: 'STORED' | 'VIRTUAL',
|};

export default class Column {
  +name: string;
  +type: string;
  +nullable: boolean;
  +defaultValue: null | string;
  +onUpdate: null | string;
  +autoIncrement: boolean;
  +comment: null | string;
  +generated: null | Generated;

  constructor(
    name: string,
    type: string,
    nullable: boolean,
    defaultValue: null | string,
    onUpdate: null | string,
    autoIncrement: boolean,
    comment: null | string,
    generated: null | Generated,
  ) {
    this.name = name;
    this.type = type;
    this.nullable = nullable;
    this.defaultValue = defaultValue;
    this.onUpdate = onUpdate;
    this.autoIncrement = autoIncrement;
    this.comment = comment;
    this.generated = generated;
  }

  /**
   * Helper method that returns a new Column instance with the given fields
   * replaced.
   */
  patch(record: {|
    +name?: string,
    +type?: string,
    +nullable?: boolean,
    +defaultValue?: null | string,
    +onUpdate?: null | string,
    +autoIncrement?: boolean,
    +comment?: null | string,
    +generated?: null | Generated,
  |}): Column {
    return new Column(
      record.name !== undefined ? record.name : this.name,
      record.type !== undefined ? record.type : this.type,
      record.nullable !== undefined ? record.nullable : this.nullable,
      record.defaultValue !== undefined ? record.defaultValue : this.defaultValue,
      record.onUpdate !== undefined ? record.onUpdate : this.onUpdate,
      record.autoIncrement !== undefined ? record.autoIncrement : this.autoIncrement,
      record.comment !== undefined ? record.comment : this.comment,
      record.generated !== undefined ? record.generated : this.generated,
    );
  }

  /**
   * Get the normalized type, not the raw type for this column.
   */
  getType(): string {
    // TODO: Note that it might be better to "unify" this type in the
    // constructor.  That way, there simply won't be a way of distinguishing
    // between them, i.e. column.type === column.getType(), always.
    return formatDataType(parseDataType(this.type));
  }

  getTypeInfo(): TypeInfo {
    return parseDataType(this.type);
  }

  /**
   * Get the full-blown column definition, without the name.
   */
  getDefinition(): string {
    const typeInfo = this.getTypeInfo();
    let defaultValue = this.defaultValue !== null ? this.defaultValue : this.nullable ? 'NULL' : null;

    // MySQL outputs number constants as strings. No idea why that would make
    // sense, but let's just replicate its behaviour... ¯\_(ツ)_/¯
    if (typeof defaultValue === 'number') {
      if (typeInfo.baseType === 'decimal') {
        defaultValue = `'${defaultValue.toFixed(2)}'`;
      } else {
        defaultValue = `'${defaultValue}'`;
      }
    } else if (typeInfo.baseType === 'tinyint' && typeInfo.length === 1) {
      if (defaultValue === 'FALSE') defaultValue = "'0'";
      else if (defaultValue === 'TRUE') defaultValue = "'1'";
    }

    const nullable = !this.nullable
      ? 'NOT NULL'
      : // MySQL's TIMESTAMP columns require an explicit "NULL" spec.  Other
      // data types are "NULL" by default, so we omit the explicit NULL, like
      // MySQL does
      typeInfo.baseType === 'timestamp' && !typeInfo.fsp
      ? 'NULL'
      : '';

    defaultValue =
      // Generated columns won't have a default value
      !this.generated && defaultValue ? `DEFAULT ${defaultValue}` : '';

    // Special case: MySQL does not omit an explicit DEFAULT NULL for
    // TEXT/BLOB/JSON columns
    if (typeInfo.baseType === 'text' || typeInfo.baseType === 'blob') {
      if (defaultValue === 'DEFAULT NULL') {
        defaultValue = '';
      }
    }

    return [
      formatDataType(typeInfo),
      this.generated === null ? nullable : '',
      defaultValue,
      this.onUpdate !== null ? `ON UPDATE ${this.onUpdate}` : '',
      this.autoIncrement ? 'AUTO_INCREMENT' : '',
      this.comment !== null ? `COMMENT ${this.comment}` : '',
      this.generated !== null
        ? `GENERATED ALWAYS AS (${JSON.stringify(this.generated.expr)}) ${this.generated.mode}`
        : '',
      this.generated !== null ? nullable : '',
    ]
      .filter(x => x)
      .join(' ');
  }

  toString(): string {
    return `${escape(this.name)} ${this.getDefinition()}`;
  }
}
