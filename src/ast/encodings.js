// @flow strict

import invariant from 'invariant';

import type { MySQLVersion } from '../printer/utils';

export type Charset = string;
export type Collation = string;

type EncodingPair = {|
  +charset: Charset,
  +collate: Collation,
|};

export opaque type Encoding: EncodingPair = EncodingPair;

const DEFAULT_COLLATIONS: { [MySQLVersion]: { [Charset]: Collation } } = {
  '5.7': {
    latin1: 'latin1_swedish_ci',
    utf8: 'utf8_general_ci',
    utf8mb3: 'utf8mb3_general_ci',
    utf8mb4: 'utf8mb4_general_ci',
  },

  '8.0': {
    latin1: 'latin1_swedish_ci',
    utf8: 'utf8_general_ci',
    utf8mb4: 'utf8mb4_0900_ai_ci',
  },
};

const DEFAULT_CHARSETS: { [MySQLVersion]: Charset } = {
  '5.7': 'latin1',
  '8.0': 'utf8mb4',
};

export function makeEncoding(target: MySQLVersion, charset?: Charset, collate?: Collation): Encoding {
  // Only charset is provided, the other will get derived
  if (charset && !collate) {
    const newCollate = getDefaultCollationForCharset(target, charset);
    return { charset, collate: newCollate };
  }

  // Only one side if provided, the other will get derived
  else if (!charset && collate) {
    const newCharset = collate.split('_')[0];
    return { charset: newCharset, collate };
  }

  // Both are provided - we need to ensure they match up
  else if (charset && collate) {
    invariant(collate.startsWith(charset), 'Illegal combination: ' + charset + ' is incompatible with ' + collate);
    return { charset, collate };
  } else {
    // Get the default encoding settings for this MySQL version
    const charset = DEFAULT_CHARSETS[target];
    const collate = DEFAULT_COLLATIONS[target][charset];
    invariant(charset && collate, `Wasn't able to look up default charset and collation for MySQL version ${target}`);
    return { charset, collate };
  }
}

export function getDefaultCollationForCharset(target: MySQLVersion, charset: Charset): Collation {
  const collation = (DEFAULT_COLLATIONS[target] ?? {})[charset];
  invariant(collation, 'Unknown default collation for charset: ' + charset);
  return collation;
}

const CHARSET_WIDTHS = [['latin1'], ['utf8', 'utf8mb3'], ['utf8mb4']];

export function isWider(charset1: Charset, charset2: Charset): boolean {
  const index1 = CHARSET_WIDTHS.findIndex((g) => g.includes(charset1));
  const index2 = CHARSET_WIDTHS.findIndex((g) => g.includes(charset2));
  invariant(index1 >= 0, 'Unknown charset: ' + charset1);
  invariant(index2 >= 0, 'Unknown charset: ' + charset2);
  return index1 > index2;
}
