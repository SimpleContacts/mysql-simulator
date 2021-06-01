// @flow strict

import type { Encoding } from './encodings';
import { getDefaultCollationForCharset, makeEncoding } from './encodings';
import { parseEnumValues, quote } from './utils';

export type IntegerDataType = {
  category: 'NUMERIC',
  subCategory: 'INTEGER',
  baseType: 'tinyint' | 'smallint' | 'mediumint' | 'int' | 'bigint',
  length: number,
  unsigned: boolean,
  zeroFill: boolean,
};

export type FixedPointDataType = {
  category: 'NUMERIC',
  subCategory: 'FIXED_POINT',
  baseType: 'decimal',
  precision: {
    length: number,
    decimals: number,
  } | null,
  unsigned: boolean,
  zeroFill: boolean,
};

export type FloatingPointDataType = {
  category: 'NUMERIC',
  subCategory: 'FLOATING_POINT',
  baseType: 'float' | 'double',
  precision: {
    length: number,
    decimals: number,
  } | null,
  unsigned: boolean,
  zeroFill: boolean,
};

export type NumericDataType = IntegerDataType | FixedPointDataType | FloatingPointDataType;

export type DateTimeDataType = {
  category: 'TEMPORAL',
  baseType: 'timestamp' | 'datetime',
  fsp: number | null,
};

export type DateOnlyDataType = {
  category: 'TEMPORAL',
  baseType: 'date' | 'year',
};

export type TimeOnlyDataType = {
  category: 'TEMPORAL',
  baseType: 'time',
  fsp: number | null,
};

export type TemporalDataType = DateTimeDataType | DateOnlyDataType | TimeOnlyDataType;

export type StringWithLengthDataType = {
  category: 'STRING',
  baseType: 'char' | 'varchar',
  length: number,
  encoding?: Encoding,
};

export type StringWithoutLengthDataType = {
  category: 'STRING',
  baseType: 'text' | 'mediumtext' | 'longtext',
  encoding?: Encoding,
};

export type EnumDataType = {
  category: 'STRING',
  baseType: 'enum',
  values: Array<string>,
  encoding?: Encoding,
};

export type StringDataType = StringWithLengthDataType | StringWithoutLengthDataType;

export type StringOrEnumDataType = StringDataType | EnumDataType;

export type BinaryWithLengthDataType = {
  category: 'BINARY',
  baseType: 'blob' | 'binary' | 'varbinary',
  length: number | null,
};

export type BinaryWithoutLengthDataType = {
  category: 'BINARY',
  baseType: 'tinyblob' | 'mediumblob' | 'longblob',
};

export type BinaryDataType = BinaryWithLengthDataType | BinaryWithoutLengthDataType;

export type JSONDataType = {
  category: 'JSON',
  baseType: 'json',
};

export type DataType =
  | NumericDataType
  | TemporalDataType
  | StringDataType
  | EnumDataType
  | BinaryDataType
  | JSONDataType;

const DEFAULT_INT_LENGTHS = {
  bigint: 20,
  int: 11,
  mediumint: 9,
  smallint: 6,
  tinyint: 4,
};

function asInt(baseType: $PropertyType<IntegerDataType, 'baseType'>, params: string, options: string): IntegerDataType {
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

  return { category: 'NUMERIC', subCategory: 'INTEGER', baseType, length, unsigned, zeroFill };
}

function asFixedPoint(
  baseType: $PropertyType<FixedPointDataType, 'baseType'>,
  params: string,
  options: string,
): FixedPointDataType {
  const unsigned = /unsigned/i.test(options);
  const zeroFill = /zerofill/i.test(options);

  let precision = null;
  if (params) {
    const [first, second] = params.split(',').map((s) => s.trim());
    const length = parseInt(first, 10);
    const decimals = second ? parseInt(second, 10) : 0;
    precision = { length, decimals };
  }

  return { category: 'NUMERIC', subCategory: 'FIXED_POINT', baseType, precision, unsigned, zeroFill };
}

function asFloatingPoint(
  baseType: $PropertyType<FloatingPointDataType, 'baseType'>,
  params: string,
  options: string,
): FloatingPointDataType {
  const unsigned = /unsigned/i.test(options);
  const zeroFill = /zerofill/i.test(options);

  let precision = null;
  if (params) {
    const [first, second] = params.split(',').map((s) => s.trim());
    const length = parseInt(first, 10);
    const decimals = second ? parseInt(second, 10) : 0;
    precision = { length, decimals };
  }

  return { category: 'NUMERIC', subCategory: 'FLOATING_POINT', baseType, precision, unsigned, zeroFill };
}

function asDateTime(
  baseType: $PropertyType<DateTimeDataType, 'baseType'>,
  params: string,
  // options: string,
): DateTimeDataType {
  const fsp = params ? parseInt(params, 10) : null;
  return { category: 'TEMPORAL', baseType, fsp };
}

function asTimeOnly(baseType: $PropertyType<TimeOnlyDataType, 'baseType'>, params: string): TimeOnlyDataType {
  const fsp = params ? parseInt(params, 10) : null;
  return { category: 'TEMPORAL', baseType, fsp };
}

function asDateOnly(baseType: $PropertyType<DateOnlyDataType, 'baseType'>): DateOnlyDataType {
  return { category: 'TEMPORAL', baseType };
}

function asStringWithLength(
  baseType: $PropertyType<StringWithLengthDataType, 'baseType'>,
  params: string,
  options: string,
): StringWithLengthDataType {
  let length;
  if (params) {
    length = parseInt(params, 10);
  }

  // Sanitization / sanity checks
  if (baseType === 'char' && length === null) {
    // CHAR means CHAR(1)
    length = 1;
  }

  if (!length) {
    // VARCHAR without a length is invalid MySQL
    throw new Error('VARCHAR must have valid length, please use VARCHAR(n)');
  }

  const encoding = parseEncodingOptions(options);
  return { category: 'STRING', baseType, length, encoding };
}

function asStringWithoutLength(
  baseType: $PropertyType<StringWithoutLengthDataType, 'baseType'>,
  options: string,
): StringWithoutLengthDataType {
  const encoding = parseEncodingOptions(options);
  return { category: 'STRING', baseType, encoding };
}

function asBinary(
  baseType: $PropertyType<BinaryWithLengthDataType, 'baseType'>,
  params: string,
): BinaryWithLengthDataType {
  let length = null;
  if (params) {
    length = parseInt(params, 10);
  }

  // Sanitization / sanity checks
  if (baseType === 'varbinary' && !length) {
    // VARBINARY without a length is invalid MySQL
    throw new Error('VARBINARY must have valid length, please use VARBINARY(n)');
  }

  return { category: 'BINARY', baseType, length };
}

function asBinaryWithoutLength(
  baseType: $PropertyType<BinaryWithoutLengthDataType, 'baseType'>,
): BinaryWithoutLengthDataType {
  return { category: 'BINARY', baseType };
}

// TODO: Honestly, why are we not just doing this at the parser level?
function parseEncodingOptions(options: string): Encoding | void {
  let charset;
  let collate;

  const matchCharset = options.match(/CHARACTER SET\s+([\w_]+)/i);
  if (matchCharset) {
    charset = matchCharset[1];
  }

  const matchCollate = options.match(/COLLATE\s+([\w_]+)/i);
  if (matchCollate) {
    collate = matchCollate[1];
  }

  if (charset || collate) {
    return makeEncoding(charset, collate);
  } else {
    return undefined;
  }
}

function asEnum(baseType: $PropertyType<EnumDataType, 'baseType'>, params: string, options: string): EnumDataType {
  if (!params) {
    throw new Error('ENUMs must have at least one value');
  }

  const values = parseEnumValues(params);
  const encoding = parseEncodingOptions(options);
  return { category: 'STRING', baseType, values, encoding };
}

function asJSON(baseType: $PropertyType<JSONDataType, 'baseType'>): JSONDataType {
  return { category: 'JSON', baseType: 'json' };
}

export function setEncoding<T: StringOrEnumDataType>(dataType: T, encoding: Encoding | void): T {
  if (dataType.baseType === 'char' || dataType.baseType === 'varchar') {
    return { ...dataType, encoding };
  } else if (dataType.baseType === 'text' || dataType.baseType === 'mediumtext' || dataType.baseType === 'longtext') {
    return { ...dataType, encoding };
  } else if (dataType.baseType === 'enum') {
    return { ...dataType, encoding };
  }

  throw new Error('Unknown string column: ' + dataType.baseType);
}

/**
 * Parse and return type information for the given type string.
 * e.g. "TEXT" or "int", or "VARCHAR(11) CHARACTER SET latin1"
 *
 * TODO: Let the PEG parser do... well... the parsing instead?
 */
export function parseDataType(type: string): DataType {
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
      return asFloatingPoint(baseType, params, options);

    case 'decimal':
      return asFixedPoint(baseType, params, options);

    case 'timestamp':
    case 'datetime':
      return asDateTime(baseType, params /* , options */);

    case 'time':
      return asTimeOnly(baseType, params /* , options */);

    case 'date':
      return asDateOnly(baseType /* , params, options */);

    case 'char':
    case 'varchar':
      return asStringWithLength(baseType, params, options);

    case 'text':
    case 'mediumtext':
    case 'longtext':
      return asStringWithoutLength(baseType, /* params, */ options);

    case 'binary':
    case 'varbinary':
    case 'blob':
      return asBinary(baseType, params);

    case 'enum':
      return asEnum(baseType, params, options);

    case 'json':
      return asJSON(baseType /* params, options */);

    case 'tinyblob':
    case 'mediumblob':
    case 'longblob':
      return asBinaryWithoutLength(baseType);

    default:
      throw new Error(`Unrecognized MySQL data type: ${baseType}`);
  }
}

/**
 * Format type information back to a printable string.
 */
export function formatDataType(dataType: DataType, tableEncoding: Encoding, fullyResolved: boolean = false): string {
  const baseType = dataType.baseType;
  let params = '';
  let options = '';

  // Dispatch based on the type
  switch (dataType.baseType) {
    case 'tinyint':
    case 'smallint':
    case 'mediumint':
    case 'int':
    case 'bigint':
      params = dataType.length;
      options = [dataType.unsigned ? 'unsigned' : '', dataType.zeroFill ? 'zerofill' : ''].filter(Boolean).join(' ');
      break;

    case 'float':
    case 'double':
    case 'decimal':
      if (dataType.precision) {
        params = [dataType.precision.length, dataType.precision.decimals].join(',');
      }
      options = [dataType.unsigned ? 'unsigned' : '', dataType.zeroFill ? 'zerofill' : ''].filter(Boolean).join(' ');
      break;

    // case 'date': // NOTE: "date" does not belong here! It's a "paramless" type.
    case 'time':
    case 'timestamp':
    case 'datetime':
      params = dataType.fsp || '';
      break;

    case 'char':
    case 'varchar': {
      params = dataType.length || '';

      const encoding = dataType.encoding ?? tableEncoding;

      // NOTE: This is some weird MySQL quirk... if an encoding is set
      // explicitly, then the *collate* defines what gets displayed, otherwise
      // the *charset* difference will determine it
      let outputCharset = dataType.encoding !== undefined && dataType.encoding.collate !== tableEncoding.collate;
      let outputCollation = encoding.collate !== getDefaultCollationForCharset(encoding.charset);

      options = [
        fullyResolved || outputCharset ? `CHARACTER SET ${encoding.charset}` : null,
        fullyResolved || outputCollation ? `COLLATE ${encoding.collate}` : null,
      ]
        .filter(Boolean)
        .join(' ');
      break;
    }

    case 'text':
    case 'mediumtext':
    case 'longtext': {
      params = '';

      const encoding = dataType.encoding ?? tableEncoding;

      // NOTE: This is some weird MySQL quirk... if an encoding is set
      // explicitly, then the *collate* defines what gets displayed, otherwise
      // the *charset* difference will determine it
      let outputCharset = dataType.encoding !== undefined && dataType.encoding.collate !== tableEncoding.collate;
      let outputCollation = encoding.collate !== getDefaultCollationForCharset(encoding.charset);

      options = [
        fullyResolved || outputCharset ? `CHARACTER SET ${encoding.charset}` : null,
        fullyResolved || outputCollation ? `COLLATE ${encoding.collate}` : null,
      ]
        .filter(Boolean)
        .join(' ');
      break;
    }

    case 'binary':
    case 'varbinary':
    case 'blob':
      params = dataType.length || '';
      break;

    case 'enum': {
      params = dataType.values.map(quote).join(',');

      const encoding = dataType.encoding ?? tableEncoding;

      // NOTE: This is some weird MySQL quirk... if an encoding is set
      // explicitly, then the *collate* defines what gets displayed, otherwise
      // the *charset* difference will determine it
      let outputCharset = dataType.encoding !== undefined && dataType.encoding.collate !== tableEncoding.collate;
      let outputCollation = encoding.collate !== getDefaultCollationForCharset(encoding.charset);

      options = [
        fullyResolved || outputCharset ? `CHARACTER SET ${encoding.charset}` : null,
        fullyResolved || outputCollation ? `COLLATE ${encoding.collate}` : null,
      ]
        .filter(Boolean)
        .join(' ');
      break;
    }

    default:
      // Nothing
      break;
  }

  params = params ? `(${params})` : '';
  options = options ? ` ${options}` : '';
  return `${baseType}${params}${options}`;
}
