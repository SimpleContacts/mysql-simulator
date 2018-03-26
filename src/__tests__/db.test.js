// @flow

import { addTable, emptyDb } from '../db';

describe('mutates db state', () => {
  const db = emptyDb();

  it('create empty db', () => {
    expect(emptyDb()).toEqual({ tables: {} });
  });

  it('create table', () => {
    const table = { name: 'foo', columns: {}, foreignKeys: {} };
    expect(addTable(db, table)).toEqual({
      tables: { foo: { name: 'foo', columns: {}, foreignKeys: {} } },
    });
  });
});
