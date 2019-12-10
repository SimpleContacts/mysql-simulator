// @flow strict

import { formatDataType, parseDataType } from './DataType';
import type { TypeInfo } from './DataType';
import { escape } from './utils';

type Constant = string | number;
type Identifier = {| type: 'Identifier', name: string |};
type Operator = '+' | '-' | '<';
type Expression = {| op: Operator, left: Expression, right: Expression |} | Identifier | Constant;

function printExpression(expression: Expression): string {
  if (typeof expression !== 'object') {
    return expression.toString();
  }
  if (expression.op) {
    return '(' + printExpression(expression.left) + ' ' + expression.op + ' ' + printExpression(expression.right) + ')';
  }

  if (expression.type === 'Identifier') {
    return '`' + expression.name + '`';
  }

  throw new Error('Error printing expression');
}

import type { ColumnDefinition } from '../parser/ast';

export default class Column {
  +name: string;
  +definition: ColumnDefinition;

  constructor(name: string, definition: ColumnDefinition) {
    this.name = name;
    this.definition = definition;

    //this.nullable = this.definition.nullable;

    // this.type = this.definition.dataType.toLowerCase();

    // this.defaultValue = this.definition.defaultValue;

    // this.onUpdate = this.definition.onUpdate;
  }

  /**
   * Helper method that returns a new Column instance with the given fields
   * replaced.
   */
  // patch(definition: ColumnDefinition): Column {
  //   return new Column(this.name, definition);
  // }

  dropDefault(): Column {
    if (this.definition.defaultValue) {
      return new Column(this.name, { ...this.definition, defaultValue: null });
    } else {
      // no-op for Generated columns
      return new Column(this.name, this.definition);
    }
  }

  rename(name: string): Column {
    return new Column(name, this.definition);
  }

  setNotNullable(): Column {
    return new Column(this.name, { ...this.definition, nullable: false });
  }

  isNullable(): boolean {
    // // Whether a definition is "NOT NULL" or "NULL" by default, depends on the
    // // data type.  MySQL's TIMESTAMP columns are NOT NULL unless explicitly
    // // specified.  All other types are NULL unless explicitly specified.
    return this.definition.nullable === null ? this.definition.dataType !== 'timestamp' : this.definition.nullable;
  }

  /**
   * Get the normalized type, not the raw type for this column.
   */
  getType(): string {
    // TODO: Note that it might be better to "unify" this type in the
    // constructor.  That way, there simply won't be a way of distinguishing
    // between them, i.e. column.type === column.getType(), always.
    return formatDataType(parseDataType(this.definition.dataType));
  }

  getTypeInfo(): TypeInfo {
    return parseDataType(this.definition.dataType);
  }

  /**
   * Get the full-blown column definition, without the name.
   */
  getDefinition(): string {
    const typeInfo = this.getTypeInfo();
    const comment = this.definition.comment !== null ? `COMMENT ${this.definition.comment}` : null;
    if (this.definition.generatedMode) {
      // GENERATED column definition
      const generatedExpr = this.definition.generatedExpr;
      const generatedMode = this.definition.generatedMode;

      let generated = `GENERATED ALWAYS AS (${printExpression(generatedExpr)}) ${generatedMode}`;

      return [formatDataType(typeInfo), generated, comment].filter(x => x).join(' ');
    } else {
      // NORMAL column definition
      let defaultValue =
        this.definition.defaultValue !== null ? this.definition.defaultValue : this.isNullable() ? 'NULL' : null;

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

      const nullable = !this.isNullable()
        ? 'NOT NULL'
        : // MySQL's TIMESTAMP columns require an explicit "NULL" spec.  Other
        // data types are "NULL" by default, so we omit the explicit NULL, like
        // MySQL does
        typeInfo.baseType === 'timestamp' && !typeInfo.fsp
        ? 'NULL'
        : '';

      defaultValue =
        // Generated columns won't have a default value
        defaultValue ? `DEFAULT ${defaultValue}` : '';

      // Special case: MySQL does not omit an explicit DEFAULT NULL for
      // TEXT/BLOB/JSON columns
      if (typeInfo.baseType === 'text' || typeInfo.baseType === 'blob') {
        if (defaultValue === 'DEFAULT NULL') {
          defaultValue = '';
        }
      }

      // ON UPDATE is only applicable for timestamp columns
      let onUpdate = null;
      if (this.definition.dataType === 'timestamp') {
        if (!this.isNullable() && this.definition.defaultValue === null) {
          // If explicit default value is missing, then MySQL assumes the
          // DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          defaultValue = 'CURRENT_TIMESTAMP';
          onUpdate = 'CURRENT_TIMESTAMP';
        }

        if (this.definition.defaultValue === 'NOW()') {
          defaultValue = 'CURRENT_TIMESTAMP';
        }

        if (this.definition.onUpdate === 'NOW()') {
          onUpdate = 'CURRENT_TIMESTAMP';
        }
      }

      return [
        formatDataType(typeInfo),
        nullable,
        defaultValue,
        onUpdate !== null ? `ON UPDATE ${onUpdate}` : null,
        this.definition.autoIncrement ? 'AUTO_INCREMENT' : null,
        comment,
      ]
        .filter(x => x)
        .join(' ');
    }
  }

  toString(): string {
    return `${escape(this.name)} ${this.getDefinition()}`;
  }
}
