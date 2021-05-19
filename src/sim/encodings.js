// @flow strict

import invariant from 'invariant';

type Charset = string;
type Collation = string;

type EncodingPair = {|
  +charset: Charset,
  +collate: Collation,
|};

export opaque type Encoding: EncodingPair = EncodingPair;

const MYSQL_57_DEFAULT_COLLATIONS: { [Charset]: Collation } = {
  latin1: 'latin1_swedish_ci',
  utf8: 'utf8_general_ci',
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

export function makeEncoding(charset?: Charset, collate?: Collation, fallback: Encoding = MYSQL_57_DEFAULTS): Encoding {
  // Only charset is provided, the other will get derived
  if (charset && !collate) {
    if (fallback.charset === charset) {
      return fallback;
    } else {
      const newCollate = getDefaultCollationForCharset(charset);
      return { charset, collate: newCollate };
    }
  }

  // Only one side if provided, the other will get derived
  else if (!charset && collate) {
    if (fallback.collate === collate) {
      return fallback;
    } else {
      const newCharset = collate.split('_')[0];
      return { charset: newCharset, collate };
    }
  }

  // Both are provided - we need to ensure they match up
  else if (charset && collate) {
    invariant(collate.startsWith(charset), 'Illegal combination: ' + charset + ' is incompatible with ' + collate);
    return { charset, collate };
  } else {
    // Neither is set: just return the fallback
    return fallback;
  }
}

export function getDefaultCollationForCharset(charset: Charset): Collation {
  const collation = MYSQL_57_DEFAULT_COLLATIONS[charset];
  invariant(collation, 'Unknown default collatino for charset: ' + charset);
  return collation;
}
