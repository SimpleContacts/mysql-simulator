// @flow strict

import invariant from 'invariant';
import t from 'rule-of-law/types';
import type { TypeInfo as ROLTypeInfo } from 'rule-of-law/types';

import ast from '../ast';
import type { DefaultValue, DataType, GeneratedDefinition } from '../ast';
import type { Encoding } from '../ast/encodings';
import { escape, quote, serializeExpression } from '../printer';
import { formatDataType } from './DataType';

export default class Column {
  +name: string;
  +dataType: DataType;
  +nullable: boolean;
  +defaultValue: null | DefaultValue;
  +onUpdate: null | string;
  +autoIncrement: boolean;
  +comment: null | string;
  +generated: null | GeneratedDefinition;

  constructor(
    name: string,
    dataType: DataType,
    nullable: boolean,
    defaultValue: null | DefaultValue,
    onUpdate: null | string,
    autoIncrement: boolean,
    comment: null | string,
    generated: null | GeneratedDefinition,
  ) {
    invariant(!ast.isTextual(dataType) || dataType.encoding, 'Encoding must be explicitly set for textual columns');
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
    +onUpdate?: null | string,
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
  getType(): string {
    return formatDataType(this.dataType);
  }

  /**
   * Get the full-blown column definition, without the name. When the table's
   * default encoding value is passed, it will conditionally format the
   * encodings of text columns, based on whether they differ from the table or
   * not.
   */
  getDefinition(tableEncoding?: Encoding): string {
    const dataType = this.dataType;
    const generated = this.generated;

    // TODO: Move to top!
    function formatDefaultValue(node: DefaultValue): string {
      if (node._kind === 'Literal') {
        let value = node.value;
        if (value === true) {
          value = 1;
        } else if (value === false) {
          value = 0;
        }

        if (typeof value === 'string') {
          return serializeExpression(node);
        } else if (typeof value === 'number') {
          // MySQL outputs number constants as strings. No idea why that would
          // make sense, but let's just replicate its behaviour... ¯\_(ツ)_/¯
          let node2 = node;
          if (dataType.baseType === 'decimal') {
            node2 = ast.Literal(value.toFixed(dataType.precision?.decimals ?? 2));
          } else {
            node2 = ast.Literal(String(value));
          }
          return serializeExpression(node2);
        } else if (value === null) {
          return 'NULL';
        }
      } else if (node._kind === 'CallExpression') {
        return serializeExpression(node);
      } else if (node._kind === 'BuiltInFunction') {
        return node.name;
      }

      throw new Error('Invalid DefaultValue node. Got: ' + JSON.stringify({ node }, null, 2));
    }

    let nullable;
    if (dataType.baseType === 'timestamp') {
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
      dataType.baseType === 'text' ||
      dataType.baseType === 'mediumtext' ||
      dataType.baseType === 'longtext' ||
      dataType.baseType === 'blob'
    ) {
      if (defaultValueClause === 'DEFAULT NULL') {
        defaultValueClause = undefined;
      }
    }

    return [
      formatDataType(dataType, tableEncoding),
      generated === null ? nullable : undefined,
      // Generated columns won't have a default value
      !generated ? defaultValueClause : undefined,
      // JSON.stringify({ a: this.defaultValue, b: defaultValue, c: defaultValueClause }),
      this.onUpdate !== null ? `ON UPDATE ${this.onUpdate}` : undefined,
      this.autoIncrement ? 'AUTO_INCREMENT' : undefined,
      this.comment !== null ? `COMMENT ${quote(this.comment)}` : undefined,
      generated !== null
        ? `GENERATED ALWAYS AS (${serializeExpression(
            generated.expr,
            // NOTE: For some reason, here in these generated clause
            // expressions, functions are getting lowercased and strings with
            // quote characters will get serialized differently. Beats me as to
            // why.
            { context: 'EXPRESSION' },
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

  toString(tableEncoding: Encoding): string {
    return `${escape(this.name)} ${this.getDefinition(tableEncoding)}`;
  }
}
