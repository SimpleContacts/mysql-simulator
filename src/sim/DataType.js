// @flow strict

import type { Encoding } from '../ast/encodings';
import { getDefaultCollationForCharset } from '../ast/encodings';
import { quote } from './utils';
import type { DataType, TextualOrEnum } from '../ast';

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

      const encoding = dataType.encoding ?? tableEncoding;

      // NOTE: This is some weird MySQL quirk... if an encoding is set
      // explicitly, then the *collate* defines what gets displayed, otherwise
      // the *charset* difference will determine it
      let outputCharset = dataType.encoding !== null && dataType.encoding.collate !== tableEncoding.collate;
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
      let outputCharset = dataType.encoding !== null && dataType.encoding.collate !== tableEncoding.collate;
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
      let outputCharset = dataType.encoding !== null && dataType.encoding.collate !== tableEncoding.collate;
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
