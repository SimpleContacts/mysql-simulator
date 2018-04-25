// @flow

import { createTable, emptyDb } from '../core';

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
