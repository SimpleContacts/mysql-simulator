// @flow strict

import invariant from 'invariant';

export type Charset = string;
export type Collation = string;

type EncodingPair = {|
  +charset: Charset,
  +collate: Collation,
|};

export opaque type Encoding: EncodingPair = EncodingPair;

const MYSQL_57_DEFAULT_COLLATIONS: { [Charset]: Collation } = {
  latin1: 'latin1_swedish_ci',
  utf8: 'utf8_general_ci',
  utf8mb3: 'utf8mb3_general_ci',
  utf8mb4: 'utf8mb4_general_ci',
};

export const MYSQL_57_DEFAULTS: Encoding = {
  charset: 'latin1',
  collate: 'latin1_swedish_ci',
};

// const MYSQL_80_DEFAULTS: Defaults = {
//   charset: 'utf8mb4',
//   collate: 'utf8mb4_0900_ai_ci',
// };

// const MYSQL_80_DEFAULT_COLLATIONS = {
//   latin1: 'latin1_swedish_ci',
//   utf8: 'utf8_general_ci',
//   utf8mb4: 'utf8mb4_0900_ai_ci',
// };

export function makeEncoding(charset?: Charset, collate?: Collation): Encoding {
  // Only charset is provided, the other will get derived
  if (charset && !collate) {
    const newCollate = getDefaultCollationForCharset(charset);
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
    return MYSQL_57_DEFAULTS;
  }
}

export function getDefaultCollationForCharset(charset: Charset): Collation {
  const collation = MYSQL_57_DEFAULT_COLLATIONS[charset];
  invariant(collation, 'Unknown default collatino for charset: ' + charset);
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
