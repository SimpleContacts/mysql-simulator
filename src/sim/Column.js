// @flow strict

import t from 'rule-of-law/types';
import type { TypeInfo as ROLTypeInfo } from 'rule-of-law/types';

import ast from '../ast';
import type { CurrentTimestamp, DataType, DefaultValue, GeneratedDefinition } from '../ast';
import type { Encoding } from '../ast/encodings';
import { escape, quote, serializeCurrentTimestamp, serializeExpression } from '../printer';
import type { MySQLVersion } from '../printer/utils';
import { formatDataType } from './DataType';

export default class Column {
  +name: string;
  +dataType: DataType;
  +nullable: boolean;
  +defaultValue: null | DefaultValue;
  +onUpdate: null | CurrentTimestamp;
  +autoIncrement: boolean;
  +comment: null | string;
  +generated: null | GeneratedDefinition;

  constructor(
    name: string,
    dataType: DataType,
    nullable: boolean,
    defaultValue: null | DefaultValue,
    onUpdate: null | CurrentTimestamp,
    autoIncrement: boolean,
    comment: null | string,
    generated: null | GeneratedDefinition,
  ) {
    //
    // NOTE: The following requirement is only true for MySQL 5.7 - this will
    // no longer be a requirement for MySQL 8.0, where text columns can have no
    // explicit encoding assigned upon creation (and they will fall back to the
    // default encoding of the table automatically)
    //
    // NOTE: This invariant check _may_ be restored, but only when we also
    // check if target === '5.7' explicitly!
    //
    // invariant(!ast.isTextual(dataType) || dataType.encoding, 'Encoding must be explicitly set for textual columns');
    //
    this.name = name;
    this.dataType = dataType;
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
    +dataType?: DataType,
    +nullable?: boolean,
    +defaultValue?: null | DefaultValue,
    +onUpdate?: null | CurrentTimestamp,
    +autoIncrement?: boolean,
    +comment?: null | string,
    +generated?: null | GeneratedDefinition,
  |}): Column {
    return new Column(
      record.name !== undefined ? record.name : this.name,
      record.dataType !== undefined ? record.dataType : this.dataType,
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
   * e.g. returns "int(11)" or "varchar(16) CHARACTER SET utf8"
   */
  getType(target: MySQLVersion): string {
    return formatDataType(this.dataType, target);
  }

  /**
   * Get the full-blown column definition, without the name. When the table's
   * default encoding value is passed, it will conditionally format the
   * encodings of text columns, based on whether they differ from the table or
   * not.
   */
  getDefinition(tableEncoding: Encoding, target: MySQLVersion): string {
    const dataType = this.dataType;
    const generated = this.generated;
    const { charset } = tableEncoding;
    const options = { charset, target };

    // TODO: Move to top!
    function formatDefaultValue(node: DefaultValue): string {
      if (node._kind === 'Literal') {
        let value = node.value;
        if (value === null) {
          return 'NULL';
        }

        if (value === true) {
          value = 1;
        } else if (value === false) {
          value = 0;
        }

        // DECIMAL fields explicitly output a fixed-digit number according to
        // their precision
        if (dataType._kind === 'Decimal') {
          return serializeExpression(ast.Literal(Number(value).toFixed(dataType.precision.decimals)), options);
        }

        if (typeof value === 'string') {
          return serializeExpression(node, options);
        } else if (typeof value === 'number') {
          // MySQL outputs number constants as strings. No idea why that would
          // make sense, but let's just replicate its behaviour... ¯\_(ツ)_/¯
          return serializeExpression(ast.Literal(String(value)), options);
        }
      } else if (node._kind === 'CurrentTimestamp') {
        return serializeCurrentTimestamp(node);
      }

      throw new Error('Invalid DefaultValue node. Got: ' + JSON.stringify({ node }, null, 2));
    }

    let nullable;
    if (dataType._kind === 'Timestamp') {
      nullable = !this.nullable ? 'NOT NULL' : 'NULL';
    } else {
      nullable = !this.nullable
        ? 'NOT NULL'
        : // Other data types are "NULL" by default, so we omit the explicit
          // NULL, like MySQL does
          '';
    }

    const defaultValue = this.defaultValue ?? (this.nullable ? ast.Literal(null) : null);
    let defaultValueClause = defaultValue ? `DEFAULT ${formatDefaultValue(defaultValue)}` : undefined;

    // Special case: MySQL does not omit an explicit DEFAULT NULL for
    // TEXT/BLOB/JSON columns
    if (
      dataType._kind === 'Text' ||
      dataType._kind === 'MediumText' ||
      dataType._kind === 'LongText' ||
      dataType._kind === 'Blob'
    ) {
      if (defaultValueClause === 'DEFAULT NULL') {
        defaultValueClause = undefined;
      }
    }

    return [
      formatDataType(dataType, target, tableEncoding),
      generated === null ? nullable : undefined,
      // Generated columns won't have a default value
      !generated ? defaultValueClause : undefined,
      this.onUpdate !== null ? `ON UPDATE ${serializeCurrentTimestamp(this.onUpdate)}` : undefined,
      this.autoIncrement ? 'AUTO_INCREMENT' : undefined,
      this.comment !== null ? `COMMENT ${quote(this.comment)}` : undefined,
      generated !== null
        ? `GENERATED ALWAYS AS (${serializeExpression(
            generated.expr,
            // NOTE: For some reason, here in these generated clause
            // expressions, functions are getting lowercased and strings with
            // quote characters will get serialized differently. Beats me as to
            // why.
            { ...options, context: 'EXPRESSION' },
          )}) ${generated.mode}`
        : undefined,
      generated !== null ? nullable : undefined,
    ]
      .filter(Boolean)
      .join(' ');
  }

  toSchemaBaseType(): ROLTypeInfo {
    const info = this.dataType;

    // NOTE: MySQL represents boolean columns with TINYINT(1) specifically
    if (info._kind === 'TinyInt' && info.length === 1) {
      return t.Bool();
    }

    switch (info._kind) {
      case 'TinyInt':
      case 'SmallInt':
      case 'MediumInt':
      case 'Int':
      case 'BigInt':
      case 'Float':
      case 'Double':
      case 'Decimal':
        return t.Int();

      case 'Char':
      case 'VarChar':
      case 'Text':
      case 'MediumText':
      case 'LongText':
      case 'Enum':
        return t.String();

      case 'Time':
      case 'Timestamp':
      case 'DateTime':
      case 'Date':
      case 'Year':
        return t.Date();

      case 'Blob':
      case 'Binary':
      case 'VarBinary':
      case 'TinyBlob':
      case 'MediumBlob':
      case 'LongBlob':
      case 'Json':
        throw new Error('Not yet supported');

      default:
        throw new Error(`Don't know how to translate base type ${info._kind} to rule-of-law compatible type info yet`);
    }
  }

  toSchema(): ROLTypeInfo {
    const baseType = this.toSchemaBaseType();
    return this.nullable ? t.Nullable(baseType) : baseType;
  }

  toString(tableEncoding: Encoding, target: MySQLVersion): string {
    return `${escape(this.name)} ${this.getDefinition(tableEncoding, target)}`;
  }
}
