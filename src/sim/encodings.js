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

export function makeEncoding(charset: Charset, collation?: Collation): Encoding {
  const collate = collation ?? getDefaultCollationForCharset(charset);
  return { charset, collate };
}

export function getDefaultCollationForCharset(charset: Charset): Collation {
  const collation = MYSQL_57_DEFAULT_COLLATIONS[charset];
  invariant(collation, 'Unknown default collatino for charset: ' + charset);
  return collation;
}
