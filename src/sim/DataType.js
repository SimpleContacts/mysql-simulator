// @flow strict

import invariant from 'invariant';

import ast from '../ast';
import type { DataType, Textual, TextualOrEnum } from '../ast';
import type { Charset, Collation, Encoding } from '../ast/encodings';
import { getDefaultCollationForCharset } from '../ast/encodings';
import { isWider } from '../ast/encodings';
import { quote } from '../printer';
import type { MySQLVersion } from '../printer/utils';

export function setEncoding<T: TextualOrEnum>(dataType: T, encoding: Encoding): T {
  switch (dataType._kind) {
    case 'Char':
      return { ...dataType, encoding };
    case 'VarChar':
      return { ...dataType, encoding };
    case 'Text':
      return { ...dataType, encoding };
    case 'MediumText':
      return { ...dataType, encoding };
    case 'LongText':
      return { ...dataType, encoding };
    case 'Enum':
      return { ...dataType, encoding };
  }

  throw new Error('Unknown string column: ' + dataType._kind);
}

/**
 * Like setEncoding(), but potentially changes the datatype along the way, if
 * this is necessary to switch to a wider charset.
 */
export function convertToEncoding(dataType: Textual, newEncoding: Encoding): Textual {
  const currentEncoding = dataType.encoding;
  invariant(
    currentEncoding !== null,
    'Expected current encoding to be set, but found: ' + JSON.stringify({ dataType }, null, 2),
  );

  // Converting to another encoding can cause MySQL to grow the datatype's
  // size to the next tier, and this explicit conversion helps to avoid
  // truncation. See https://bugs.mysql.com/bug.php?id=31291
  if (!isWider(newEncoding.charset, currentEncoding.charset)) {
    // If the charset didn't grow wider, just updating the encoding is
    // fine. The base type of the column won't change.
    return setEncoding(dataType, newEncoding);
  }

  // Pick the next tier
  switch (dataType._kind) {
    case 'Text':
      // TEXT -> MEDIUMTEXT
      return ast.MediumText(newEncoding);

    case 'MediumText':
      // MEDIUMTEXT -> LONGTEXT
      return ast.LongText(newEncoding);

    default:
      return setEncoding(dataType, newEncoding);
  }
}

export function dealiasCharset(target: MySQLVersion, charset: Charset, context: 'TABLE' | 'COLUMN'): Charset {
  // NOTE: Historically, utf8 and utf8mb3 are aliases. Starting from MySQL
  // 8.0.28, utf8mb3 is used exclusively in in the output of SHOW statements.
  if (target >= '8.0') {
    if (context === 'TABLE') {
      return charset === 'utf8' ? 'utf8mb3' : charset;
    } else {
      return charset === 'utf8mb3' ? 'utf8' : charset;
    }
  } else {
    return charset === 'utf8mb3' ? 'utf8' : charset;
  }
}

export function dealiasCollate(target: MySQLVersion, collate: Collation, context: 'TABLE' | 'COLUMN'): Collation {
  // NOTE: Historically, utf8 and utf8mb3 are aliases. Starting from MySQL
  // 8.0.28, utf8mb3 is used exclusively in in the output of SHOW statements.
  if (target >= '8.0') {
    if (context === 'TABLE') {
      const prefix = 'utf8mb3_';
      return collate.startsWith(prefix) ? `utf8_${collate.substring(prefix.length)}` : collate;
    } else {
      const prefix = 'utf8mb3_';
      return collate.startsWith(prefix) ? `utf8_${collate.substring(prefix.length)}` : collate;
    }
  } else {
    const prefix = 'utf8mb3_';
    return collate.startsWith(prefix) ? `utf8_${collate.substring(prefix.length)}` : collate;
  }
}

export function isEqualCollate(target: MySQLVersion, collate1: Collation, collate2: Collation): boolean {
  return dealiasCollate(target, collate1, 'COLUMN') === dealiasCollate(target, collate2, 'COLUMN');
}

function formatCharset(encoding: Encoding): string {
  return `CHARACTER SET ${encoding.charset}`;
}

function formatCollate(encoding: Encoding): string {
  return `COLLATE ${encoding.collate}`;
}

function formatEncoding_pair(encoding: Encoding): [string, string] {
  return [formatCharset(encoding), formatCollate(encoding)];
}

function formatEncoding(
  target: MySQLVersion,
  tableEncoding: Encoding,
  columnEncoding: Encoding | null,
  xxxxxxxxx_PRINTSHITALWAYS: boolean,
): [string | null, string | null] {
  if (target === '5.7') {
    invariant(columnEncoding, 'Expected encoding to be set, but found: ' + JSON.stringify(columnEncoding));
    return formatEncoding_v57(target, tableEncoding, columnEncoding, xxxxxxxxx_PRINTSHITALWAYS);
  } else {
    return formatEncoding_v80(target, tableEncoding, columnEncoding, xxxxxxxxx_PRINTSHITALWAYS);
  }
}

function formatEncoding_v57(
  target: MySQLVersion,
  tableEncoding: Encoding,
  columnEncoding: Encoding,
  xxxxxxxxx_PRINTSHITALWAYS: boolean,
): [string | null, string | null] {
  // NOTE: This is some weird MySQL quirk... if an encoding is set
  // explicitly, then the *collate* defines what gets displayed, otherwise
  // the *charset* difference will determine it
  let outputCharset = !tableEncoding || !isEqualCollate(target, columnEncoding.collate, tableEncoding.collate);
  let outputCollation =
    !tableEncoding ||
    !isEqualCollate(target, columnEncoding.collate, getDefaultCollationForCharset(target, columnEncoding.charset));

  return [
    xxxxxxxxx_PRINTSHITALWAYS || outputCharset
      ? `CHARACTER SET ${dealiasCharset(target, columnEncoding.charset, 'COLUMN')}`
      : null,
    xxxxxxxxx_PRINTSHITALWAYS || outputCollation
      ? `COLLATE ${dealiasCollate(target, columnEncoding.collate, 'COLUMN')}`
      : null,
  ];
}

function formatEncoding_v80(
  target: MySQLVersion,
  tableEncoding: Encoding,
  columnEncoding: Encoding | null,
  xxxxxxxxx_PRINTSHITALWAYS: boolean,
): [string | null, string | null] {
  if (!columnEncoding) {
    if (xxxxxxxxx_PRINTSHITALWAYS) {
      return [...formatEncoding_pair(tableEncoding)];
    }

    if (tableEncoding && tableEncoding.collate !== getDefaultCollationForCharset(target, tableEncoding.charset)) {
      return [null, `COLLATE ${dealiasCollate(target, tableEncoding.collate, 'COLUMN')}`];
    }

    return [null, null];
  }

  // TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
  //
  //    CLEAN UP
  //
  // NOTE: This is some weird MySQL quirk... if an encoding is set
  // explicitly, then the *collate* defines what gets displayed, otherwise
  // the *charset* difference will determine it
  let outputCharset = true;
  // !tableEncoding || !isEqualCollate(target, columnEncoding.collate, tableEncoding.collate);
  let outputCollation = true;
  // !tableEncoding ||
  // !isEqualCollate(target, columnEncoding.collate, getDefaultCollationForCharset(target, columnEncoding.charset));
  //
  //    CLEAN UP
  //
  // TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO

  return [
    xxxxxxxxx_PRINTSHITALWAYS || outputCharset
      ? `CHARACTER SET ${dealiasCharset(target, columnEncoding.charset, 'COLUMN')}`
      : null,
    xxxxxxxxx_PRINTSHITALWAYS || outputCollation
      ? `COLLATE ${dealiasCollate(target, columnEncoding.collate, 'COLUMN')}`
      : null,
  ];
}

/**
 * Returns a helper structure to help format the data type for display.
 */
export function getDataTypeInfo(
  dataType: DataType,
  target: MySQLVersion,
  tableEncoding: Encoding,
  xxxxxxxxx_PRINTSHITALWAYS: boolean,
): {|
  baseType: string,
  params: string | number | null,
  options: string | null,
|} {
  const baseType = dataType._kind.toLowerCase();
  let params = null;
  let options = null;

  // Dispatch based on the type
  switch (dataType._kind) {
    case 'TinyInt':
    case 'SmallInt':
    case 'MediumInt':
    case 'Int':
    case 'BigInt':
      params = dataType.length;
      options = [dataType.unsigned ? 'unsigned' : ''].filter(Boolean).join(' ');
      break;

    case 'Float':
    case 'Double':
    case 'Decimal':
      if (dataType.precision) {
        params = [dataType.precision.length, dataType.precision.decimals].join(',');
      }
      options = [dataType.unsigned ? 'unsigned' : ''].filter(Boolean).join(' ');
      break;

    // case 'date': // NOTE: "date" does not belong here! It's a "paramless" type.
    case 'Time':
    case 'Timestamp':
    case 'DateTime':
      params = dataType.fsp || null;
      break;

    case 'Char':
    case 'VarChar': {
      params = dataType.length || null;
      options =
        formatEncoding(target, tableEncoding, dataType.encoding, xxxxxxxxx_PRINTSHITALWAYS).filter(Boolean).join(' ') ||
        null;
      break;
    }

    case 'Text':
    case 'MediumText':
    case 'LongText': {
      params = null;
      options =
        formatEncoding(target, tableEncoding, dataType.encoding, xxxxxxxxx_PRINTSHITALWAYS).filter(Boolean).join(' ') ||
        null;
      break;
    }

    case 'Binary':
    case 'VarBinary':
    case 'Blob':
      params = dataType.length || null;
      break;

    case 'Enum': {
      params = dataType.values.map(quote).join(',');
      options =
        formatEncoding(target, tableEncoding, dataType.encoding, xxxxxxxxx_PRINTSHITALWAYS).filter(Boolean).join(' ') ||
        null;
      break;
    }

    default:
      // Nothing
      break;
  }

  if (target >= '8.0') {
    // Under MySQL 8.0, default lengths for specific column types are no longer
    // emitted as part of the output
    const DEFAULT_INT_LENGTHS = {
      bigint: 20,
      int: 11,
      mediumint: 9,
      smallint: 6,
      tinyint: 4,
    };
    const stdLength = DEFAULT_INT_LENGTHS[baseType];
    const length = typeof dataType.length === 'number' ? dataType.length : null;
    if (stdLength !== undefined && length !== null && stdLength === length + (dataType.unsigned ? 1 : 0)) {
      params = null;
    }
  }

  return { baseType, params, options };
}

/**
 * Print the fully resolved data type for this column. This may include
 * encoding options that will not get printed by default if they match the
 * table's default encoding.
 *
 * Use this if you want to compare data types between columns (for example to
 * check if they are compatible for setting up an FK relationship).
 */
export function resolveDataType(dataType: DataType, target: MySQLVersion, tableEncoding: Encoding): string {
  const xxxxxxxxx_PRINTSHITALWAYS = true;
  let { baseType, params, options } = getDataTypeInfo(dataType, target, tableEncoding, xxxxxxxxx_PRINTSHITALWAYS);
  params = params ? `(${params})` : '';
  options = options ? ` ${options}` : '';
  return `${baseType}${params}${options}`;
}

/**
 * Format type information back to a printable string for use in table
 * definitions. When tableEncoding is provided, it will conditionally output
 * the encoding information, like MySQL does, depending on whether it's equal
 * to the table default encoding or not.
 */
export function formatDataType(dataType: DataType, target: MySQLVersion, tableEncoding: Encoding): string {
  const xxxxxxxxx_PRINTSHITALWAYS = false;
  let { baseType, params, options } = getDataTypeInfo(dataType, target, tableEncoding, xxxxxxxxx_PRINTSHITALWAYS);
  params = params ? `(${params})` : '';
  options = options ? ` ${options}` : '';
  return `${baseType}${params}${options}`;
}
