// @flow

import { emptyDb, addTable } from '../db';

describe('mutates db state', () => {
  const db = emptyDb();

  it('create empty db', () => {
    expect(emptyDb()).toEqual({ tables: {} });
  });

  it('create table', () => {
    const table = { name: 'foo' };
    expect(addTable(db, table)).toEqual({
      tables: { foo: { name: 'foo' } },
    });
  });
});
