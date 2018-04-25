// @flow

import { createTable, emptyDb } from '../db';

describe('mutates db state', () => {
  const db = emptyDb();

  it('create empty db', () => {
    expect(emptyDb()).toEqual({ tables: {} });
  });

  it('create table', () => {
    expect(createTable(db, 'foo')).toEqual({
      tables: {
        foo: { name: 'foo', columns: [], foreignKeys: [], primaryKey: null },
      },
    });
  });
});
