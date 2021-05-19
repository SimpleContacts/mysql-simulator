// @flow strict

import invariant from 'invariant';

type Charset = string;
type Collation = string;

export type Defaults = {|
  +charset: Charset,
  +collate: Collation,
|};

const MYSQL_57_DEFAULT_COLLATIONS: { [Charset]: Collation } = {
  latin1: 'latin1_swedish_ci',
  utf8: 'utf8_general_ci',
  utf8mb4: 'utf8mb4_general_ci',
};

export const MYSQL_57_DEFAULTS: Defaults = {
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

export function getDefaultCollationForCharset(charset: Charset): Collation {
  const collation = MYSQL_57_DEFAULT_COLLATIONS[charset];
  invariant(collation, 'Unknown default collatino for charset: ' + charset);
  return collation;
}
