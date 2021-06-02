// @flow strict

import invariant from 'invariant';

import type { DataType, Textual, TextualOrEnum } from '../ast';
import ast from '../ast';
import type { Encoding } from '../ast/encodings';
import { getDefaultCollationForCharset } from '../ast/encodings';
import { isWider } from '../ast/encodings';
import { quote } from './utils';

export function setEncoding<T: TextualOrEnum>(dataType: T, encoding: Encoding): T {
  switch (dataType.baseType) {
    case 'char':
      return { ...dataType, encoding };
    case 'varchar':
      return { ...dataType, encoding };
    case 'text':
      return { ...dataType, encoding };
    case 'mediumtext':
      return { ...dataType, encoding };
    case 'longtext':
      return { ...dataType, encoding };
    case 'enum':
      return { ...dataType, encoding };
  }

  throw new Error('Unknown string column: ' + dataType.baseType);
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
  switch (dataType.baseType) {
    case 'text':
      // TEXT -> MEDIUMTEXT
      return ast.MediumText(newEncoding);

    case 'mediumtext':
      // MEDIUMTEXT -> LONGTEXT
      return ast.LongText(newEncoding);

    default:
      return setEncoding(dataType, newEncoding);
  }
}

/**
 * Format type information back to a printable string. When tableEncoding is
 * provided, it will conditionally output the encoding information, like MySQL
 * does, depending on whether it's equal to the table default encoding or not.
 */
export function formatDataType(dataType: DataType, tableEncoding?: Encoding): string {
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
      options = [dataType.unsigned ? 'unsigned' : ''].filter(Boolean).join(' ');
      break;

    case 'float':
    case 'double':
    case 'decimal':
      if (dataType.precision) {
        params = [dataType.precision.length, dataType.precision.decimals].join(',');
      }
      options = [dataType.unsigned ? 'unsigned' : ''].filter(Boolean).join(' ');
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

      const encoding = dataType.encoding;
      invariant(encoding, 'Expected encoding to be set, but found: ' + JSON.stringify({ dataType }, null, 2));

      // NOTE: This is some weird MySQL quirk... if an encoding is set
      // explicitly, then the *collate* defines what gets displayed, otherwise
      // the *charset* difference will determine it
      let outputCharset =
        !tableEncoding || (dataType.encoding !== null && dataType.encoding.collate !== tableEncoding.collate);
      let outputCollation = !tableEncoding || encoding.collate !== getDefaultCollationForCharset(encoding.charset);

      options = [
        outputCharset ? `CHARACTER SET ${encoding.charset}` : null,
        outputCollation ? `COLLATE ${encoding.collate}` : null,
      ]
        .filter(Boolean)
        .join(' ');
      break;
    }

    case 'text':
    case 'mediumtext':
    case 'longtext': {
      params = '';

      const encoding = dataType.encoding;
      invariant(encoding, 'Expected encoding to be set, but found: ' + JSON.stringify({ dataType }, null, 2));

      // NOTE: This is some weird MySQL quirk... if an encoding is set
      // explicitly, then the *collate* defines what gets displayed, otherwise
      // the *charset* difference will determine it
      let outputCharset =
        !tableEncoding || (dataType.encoding !== null && dataType.encoding.collate !== tableEncoding.collate);
      let outputCollation = !tableEncoding || encoding.collate !== getDefaultCollationForCharset(encoding.charset);

      options = [
        outputCharset ? `CHARACTER SET ${encoding.charset}` : null,
        outputCollation ? `COLLATE ${encoding.collate}` : null,
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

      const encoding = dataType.encoding;
      invariant(encoding, 'Expected encoding to be set, but found: ' + JSON.stringify({ dataType }, null, 2));

      // NOTE: This is some weird MySQL quirk... if an encoding is set
      // explicitly, then the *collate* defines what gets displayed, otherwise
      // the *charset* difference will determine it
      let outputCharset =
        !tableEncoding || (dataType.encoding !== null && dataType.encoding.collate !== tableEncoding.collate);
      let outputCollation = !tableEncoding || encoding.collate !== getDefaultCollationForCharset(encoding.charset);

      options = [
        outputCharset ? `CHARACTER SET ${encoding.charset}` : null,
        outputCollation ? `COLLATE ${encoding.collate}` : null,
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
