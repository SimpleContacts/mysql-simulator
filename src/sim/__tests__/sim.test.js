// @flow

import { applySql, dumpDb, emptyDb, parseSql } from '../cli';
import type { Database } from '../types';

function simulator(mutations: Array<string>): string {
  let db: Database = emptyDb();
  let count = 1;
  for (const sql of mutations) {
    // eslint-disable-next-line no-plusplus
    db = applySql(db, parseSql(sql, `input${count++}.sql`));
  }
  return dumpDb(db);
}

describe('simulation', () => {
  it('works', () => {
    const inputs = ['CREATE TABLE t (c1 VARCHAR(12))'];
    const expected = `
CREATE TABLE t (
  c1 varchar(12)
);
    `;
    expect(simulator(inputs)).toEqual(expected);
  });
});
