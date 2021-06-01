// @flow strict

import t from 'rule-of-law/types';
import type { TypeInfo as ROLTypeInfo } from 'rule-of-law/types';

import { formatDataType, parseDataType } from './DataType';
import type { TypeInfo } from './DataType';
import type { Encoding } from './encodings';
// $FlowFixMe[untyped-import] - serialize module isn't typed at all yet!
import { serialize } from './serialize';
import { escape } from './utils';

type Generated = {|
  expr: string,
  mode: 'STORED' | 'VIRTUAL',
|};

export default class Column {
  +name: string;
  +typeInfo: TypeInfo;
  +nullable: boolean;
  +defaultValue: null | string;
  +onUpdate: null | string;
  +autoIncrement: boolean;
  +comment: null | string;
  +generated: null | Generated;

  // This contains the parent table's default encoding, which influences how
  // this column will get serialized.
  // TODO: See if we can factor this out. Storing this on the column itself
  // feels wrong.
  +tableDefaultEncoding: Encoding;

  constructor(
    name: string,
    typeInfo: string | TypeInfo,
    nullable: boolean,
    defaultValue: null | string,
    onUpdate: null | string,
    autoIncrement: boolean,
    comment: null | string,
    generated: null | Generated,
    tableDefaultEncoding: Encoding,
  ) {
    this.name = name;
    this.typeInfo = typeof typeInfo === 'string' ? parseDataType(typeInfo) : typeInfo;
    this.nullable = nullable;
    this.defaultValue = defaultValue;
    this.onUpdate = onUpdate;
    this.autoIncrement = autoIncrement;
    this.comment = comment;
    this.generated = generated;
    this.tableDefaultEncoding = tableDefaultEncoding;
  }

  /**
   * Helper method that returns a new Column instance with the given fields
   * replaced.
   */
  patch(
    record: {|
      +name?: string,
      +typeInfo?: string | TypeInfo,
      +nullable?: boolean,
      +defaultValue?: null | string,
      +onUpdate?: null | string,
      +autoIncrement?: boolean,
      +comment?: null | string,
      +generated?: null | Generated,
    |},
    tableDefaultEncoding: Encoding,
  ): Column {
    return new Column(
      record.name !== undefined ? record.name : this.name,
      record.typeInfo !== undefined ? record.typeInfo : this.typeInfo,
      record.nullable !== undefined ? record.nullable : this.nullable,
      record.defaultValue !== undefined ? record.defaultValue : this.defaultValue,
      record.onUpdate !== undefined ? record.onUpdate : this.onUpdate,
      record.autoIncrement !== undefined ? record.autoIncrement : this.autoIncrement,
      record.comment !== undefined ? record.comment : this.comment,
      record.generated !== undefined ? record.generated : this.generated,
      tableDefaultEncoding,
    );
  }

  /**
   * Get the normalized type, not the raw type for this column.
   * e.g. returns "int(11)" or "varchar(16) CHARACTER SET utf8"
   */
  getType(fullyResolved: boolean = false): string {
    // TODO: Note that it might be better to "unify" this type in the
    // constructor.  That way, there simply won't be a way of distinguishing
    // between them, i.e. column.type === column.getType(), always.
    return formatDataType(this.typeInfo, this.tableDefaultEncoding, fullyResolved);
  }

  /**
   * Get the full-blown column definition, without the name.
   */
  getDefinition(): string {
    const typeInfo = this.typeInfo;
    const generated = this.generated;
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

    let nullable;
    if (typeInfo.baseType === 'timestamp') {
      nullable = !this.nullable ? 'NOT NULL' : 'NULL';
    } else {
      nullable = !this.nullable
        ? 'NOT NULL'
        : // Other data types are "NULL" by default, so we omit the explicit
          // NULL, like MySQL does
          '';
    }

    defaultValue =
      // Generated columns won't have a default value
      !generated && defaultValue ? `DEFAULT ${defaultValue}` : '';

    // Special case: MySQL does not omit an explicit DEFAULT NULL for
    // TEXT/BLOB/JSON columns
    if (
      typeInfo.baseType === 'text' ||
      typeInfo.baseType === 'mediumtext' ||
      typeInfo.baseType === 'longtext' ||
      typeInfo.baseType === 'blob'
    ) {
      if (defaultValue === 'DEFAULT NULL') {
        defaultValue = '';
      }
    }

    return [
      formatDataType(typeInfo, this.tableDefaultEncoding, false),
      generated === null ? nullable : '',
      defaultValue,
      this.onUpdate !== null ? `ON UPDATE ${this.onUpdate}` : '',
      this.autoIncrement ? 'AUTO_INCREMENT' : '',
      this.comment !== null ? `COMMENT ${this.comment}` : '',
      generated !== null ? `GENERATED ALWAYS AS (${serialize(generated.expr)}) ${generated.mode}` : '',
      generated !== null ? nullable : '',
    ]
      .filter((x) => x)
      .join(' ');
  }

  toSchemaBaseType(): ROLTypeInfo {
    const info = this.typeInfo;

    // NOTE: MySQL represents boolean columns with TINYINT(1) specifically
    if (info.baseType === 'tinyint' && info.length === 1) {
      return t.Bool();
    }

    switch (info.baseType) {
      case 'tinyint':
      case 'smallint':
      case 'mediumint':
      case 'int':
      case 'bigint':
      case 'float':
      case 'double':
      case 'decimal':
        return t.Int();

      case 'char':
      case 'varchar':
      case 'text':
      case 'mediumtext':
      case 'longtext':
      case 'enum':
        return t.String();

      case 'time':
      case 'timestamp':
      case 'datetime':
      case 'date':
      case 'year':
        return t.Date();

      case 'blob':
      case 'binary':
      case 'varbinary':
      case 'tinyblob':
      case 'mediumblob':
      case 'longblob':
      case 'json':
        throw new Error('Not yet supported');

      default:
        throw new Error(
          `Don't know how to translate base type ${info.baseType} to rule-of-law compatible type info yet`,
        );
    }
  }

  toSchema(): ROLTypeInfo {
    const baseType = this.toSchemaBaseType();
    return this.nullable ? t.Nullable(baseType) : baseType;
  }

  toString(): string {
    return `${escape(this.name)} ${this.getDefinition()}`;
  }
}
