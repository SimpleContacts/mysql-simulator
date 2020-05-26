// @flow strict

import { parseEnumValues, quote } from './utils';

export type IntDataType = {
  baseType: 'tinyint' | 'smallint' | 'mediumint' | 'int' | 'bigint',
  length: number,
  unsigned: boolean,
  zeroFill: boolean,
};

export type RealDataType = {
  baseType: 'float' | 'double' | 'decimal',
  precision: {
    length: number,
    decimals: number,
  } | null,
  unsigned: boolean,
  zeroFill: boolean,
};

export type DateTimeDataType = {
  // NOTE: "DATE" does not belong here! It's an OtherDataType, as it does not
  // have any parameters!
  baseType: 'time' | 'timestamp' | 'datetime',
  fsp: number | null,
};

export type TextDataType = {
  baseType: 'char' | 'varchar' | 'text',
  length: number | null,
  characterSet: string, // e.g. 'utf8'
  collate: string, // e.g. 'utf8_general_ci'
};

export type BinaryDataType = {
  baseType: 'blob' | 'binary' | 'varbinary',
  length: number | null,
};

export type EnumDataType = {
  baseType: 'enum',
  values: Array<string>,
  characterSet: string, // e.g. 'utf8'
  collate: string, // e.g. 'utf8_general_ci'
};

// These data types have no params
export type OtherDataType = {
  baseType: 'date' | 'year' | 'tinyblob' | 'mediumblob' | 'longblob' | 'json',
};

export type TypeInfo =
  | IntDataType
  | RealDataType
  | DateTimeDataType
  | TextDataType
  | BinaryDataType
  | EnumDataType
  | OtherDataType;

const DEFAULT_INT_LENGTHS = {
  bigint: 20,
  int: 11,
  mediumint: 9,
  smallint: 6,
  tinyint: 4,
};

function asInt(baseType: $PropertyType<IntDataType, 'baseType'>, params: string, options: string): IntDataType {
  const unsigned = /unsigned/i.test(options);
  const zeroFill = /zerofill/i.test(options);

  let length;
  if (params) {
    length = parseInt(params, 10);
  } else {
    // Try to figure out the default length for this data type
    length = DEFAULT_INT_LENGTHS[baseType] || 11;
    if (unsigned) length -= 1;
  }

  return { baseType, length, unsigned, zeroFill };
}

function asReal(baseType: $PropertyType<RealDataType, 'baseType'>, params: string, options: string): RealDataType {
  const unsigned = /unsigned/i.test(options);
  const zeroFill = /zerofill/i.test(options);

  let precision = null;
  if (params) {
    const [first, second] = params.split(',').map((s) => s.trim());
    const length = parseInt(first, 10);
    const decimals = second ? parseInt(second, 10) : 0;
    precision = { length, decimals };
  }

  return { baseType, precision, unsigned, zeroFill };
}

function asDateTime(
  baseType: $PropertyType<DateTimeDataType, 'baseType'>,
  params: string,
  // options: string,
): DateTimeDataType {
  const fsp = params ? parseInt(params, 10) : null;
  return { baseType, fsp };
}

function asText(baseType: $PropertyType<TextDataType, 'baseType'>, params: string /* options: string */): TextDataType {
  let length = null;
  if (params) {
    length = parseInt(params, 10);
  }

  // Sanitization / sanity checks
  if (baseType === 'char' && length === null) {
    // CHAR means CHAR(1)
    length = 1;
  }

  if (baseType === 'varchar' && !length) {
    // VARCHAR without a length is invalid MySQL
    throw new Error('VARCHAR must have valid length, please use VARCHAR(n)');
  }

  // TODO: Parse the CHARACTER SET and COLLATE sections from the options
  const characterSet = 'utf8';
  const collate = 'utf8_general_ci';

  return { baseType, length, characterSet, collate };
}

function asBinary(baseType: $PropertyType<BinaryDataType, 'baseType'>, params: string): BinaryDataType {
  let length = null;
  if (params) {
    length = parseInt(params, 10);
  }

  // Sanitization / sanity checks
  if (baseType === 'varbinary' && !length) {
    // VARBINARY without a length is invalid MySQL
    throw new Error('VARBINARY must have valid length, please use VARBINARY(n)');
  }

  return { baseType, length };
}

function asEnum(baseType: $PropertyType<EnumDataType, 'baseType'>, params: string /* options: string */): EnumDataType {
  if (!params) {
    throw new Error('ENUMs must have at least one value');
  }

  const values = parseEnumValues(params);

  // TODO: Parse the CHARACTER SET and COLLATE sections from the options
  const characterSet = 'utf8';
  const collate = 'utf8_general_ci';

  return { baseType, values, characterSet, collate };
}

/**
 * Parse and return type information for the given type string.
 */
export function parseDataType(type: string): TypeInfo {
  const matches = type.match(/^([^ (]+)(?:\s*[(]([^)]+)[)])?(.*)?$/);
  if (!matches) {
    throw new Error(`Error parsing data type: ${type}`);
  }

  let baseType = matches[1];
  let params = matches[2];
  let options = matches[3];

  // Unify
  baseType = baseType.toLowerCase();
  params = params ? params.trim() : '';
  options = options ? options.trim().toLowerCase() : '';

  // Dispatch based on the type
  switch (baseType) {
    case 'tinyint':
    case 'smallint':
    case 'mediumint':
    case 'int':
    case 'bigint':
      return asInt(baseType, params, options);

    case 'float':
    case 'double':
    case 'decimal':
      return asReal(baseType, params, options);

    // case 'date': // NOTE: "date" does not belong here! It's a "paramless" type.
    case 'time':
    case 'timestamp':
    case 'datetime':
      return asDateTime(baseType, params /* , options */);

    case 'char':
    case 'varchar':
    case 'text':
      return asText(baseType, params /* , options */);

    case 'binary':
    case 'varbinary':
    case 'blob':
      return asBinary(baseType, params);

    case 'enum':
      return asEnum(baseType, params /* , options */);

    case 'date':
    case 'year':
    case 'tinyblob':
    case 'mediumblob':
    case 'longblob':
    case 'json':
      return { baseType };

    default:
      throw new Error(`Unrecognized MySQL data type: ${baseType}`);
  }
}

/**
 * Format type information back to a printable string.
 */
export function formatDataType(info: TypeInfo): string {
  const baseType = info.baseType;
  let params = '';
  let options = '';

  // Dispatch based on the type
  switch (info.baseType) {
    case 'tinyint':
    case 'smallint':
    case 'mediumint':
    case 'int':
    case 'bigint':
      params = info.length;
      options = [info.unsigned ? 'unsigned' : '', info.zeroFill ? 'zerofill' : ''].filter(Boolean).join(' ');
      break;

    case 'float':
    case 'double':
    case 'decimal':
      if (info.precision) {
        params = [info.precision.length, info.precision.decimals].join(',');
      }
      options = [info.unsigned ? 'unsigned' : '', info.zeroFill ? 'zerofill' : ''].filter(Boolean).join(' ');
      break;

    // case 'date': // NOTE: "date" does not belong here! It's a "paramless" type.
    case 'time':
    case 'timestamp':
    case 'datetime':
      params = info.fsp || '';
      break;

    case 'char':
    case 'varchar':
    case 'text':
      params = info.length || '';
      // TODO: Output CHARACTER SET and COLLATEs here too
      break;

    case 'binary':
    case 'varbinary':
    case 'blob':
      params = info.length || '';
      break;

    case 'enum':
      params = info.values.map(quote).join(',');
      break;

    default:
      // Nothing
      break;
  }

  params = params ? `(${params})` : '';
  options = options ? ` ${options}` : '';
  return `${baseType}${params}${options}`;
}
