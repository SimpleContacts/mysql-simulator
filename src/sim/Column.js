// @flow

import { formatDataType, parseDataType } from './DataType';
import type { TypeInfo } from './DataType';
import { escape } from './utils';

export default class Column {
  +name: string;
  +type: string;
  +nullable: boolean;
  +defaultValue: null | string;
  +onUpdate: null | string;
  +autoIncrement: boolean;
  +comment: null | string;

  constructor(
    name: string,
    type: string,
    nullable: boolean,
    defaultValue: null | string,
    onUpdate: null | string,
    autoIncrement: boolean,
    comment: null | string,
  ) {
    this.name = name;
    this.type = type;
    this.nullable = nullable;
    this.defaultValue = defaultValue;
    this.onUpdate = onUpdate;
    this.autoIncrement = autoIncrement;
    this.comment = comment;
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
  |}): Column {
    return new Column(
      record.name !== undefined ? record.name : this.name,
      record.type !== undefined ? record.type : this.type,
      record.nullable !== undefined ? record.nullable : this.nullable,
      record.defaultValue !== undefined ? record.defaultValue : this.defaultValue,
      record.onUpdate !== undefined ? record.onUpdate : this.onUpdate,
      record.autoIncrement !== undefined ? record.autoIncrement : this.autoIncrement,
      record.comment !== undefined ? record.comment : this.comment,
    );
  }

  getTypeInfo(): TypeInfo {
    return parseDataType(this.type);
  }

  toString(): string {
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
    } else if (typeInfo.baseType === 'tinyint' && typeInfo.length === '1') {
      if (defaultValue === 'FALSE') defaultValue = "'0'";
      else if (defaultValue === 'TRUE') defaultValue = "'1'";
    }

    const nullable = !this.nullable
      ? 'NOT NULL'
      : // MySQL's TIMESTAMP columns require an explicit "NULL" spec.  Other
        // data types are "NULL" by default, so we omit the explicit NULL, like
        // MySQL does
        typeInfo.baseType === 'timestamp' && !typeInfo.fsp ? 'NULL' : '';

    defaultValue = defaultValue ? `DEFAULT ${defaultValue}` : '';

    // Special case: MySQL does not omit an explicit DEFAULT NULL for
    // TEXT/BLOB/JSON columns
    if (typeInfo.baseType === 'text' || typeInfo.baseType === 'blob') {
      if (defaultValue === 'DEFAULT NULL') {
        defaultValue = '';
      }
    }

    return [
      escape(this.name),
      formatDataType(typeInfo),
      nullable,
      defaultValue,
      this.onUpdate !== null ? `ON UPDATE ${this.onUpdate}` : '',
      this.autoIncrement ? 'AUTO_INCREMENT' : '',
      this.comment !== null ? `COMMENT ${this.comment}` : '',
    ]
      .filter(x => x)
      .join(' ');
  }
}
