// @flow

import produce from 'immer';

import type { Column, Database, Table } from './types';

/**
 * Creates a new, empty, database.
 */
export function emptyDb(): Database {
  return {
    tables: {},
  };
}

/**
 * Adds a new table to a database.
 */
export function addTable(db: Database, table: Table): Database {
  if (db.tables[table.name]) {
    throw new Error(`Table "${table.name}" already exists`);
  }

  return produce(db, $ => {
    const name = table.name;
    // eslint-disable-next-line
    $.tables[name] = table;
  });
}

/**
 * Adds a new table to a database.
 */
export function removeTable(
  db: Database,
  name: string,
  ifExists: boolean = false,
): Database {
  if (!ifExists && !db.tables[name]) {
    throw new Error(`Cannot DROP non-existing table "${name}"`);
  }

  return produce(db, $ => {
    // eslint-disable-next-line
    delete $.tables[name];
  });
}

/**
 * Adds a new table to a database.
 */
export function renameTable(db: Database, from: string, to: string): Database {
  if (!db.tables[from]) {
    throw new Error(`Table "${from}" does not exist`);
  }

  if (db.tables[to]) {
    throw new Error(`Table "${to}" already exists`);
  }

  return produce(db, $ => {
    // eslint-disable-next-line
    $.tables[to] = $.tables[from];
    // eslint-disable-next-line
    delete $.tables[from];
  });
}

/**
 * Adds a new column to a table
 */
export function addColumn(table: Table, column: Column): Table {
  return produce(table, $ => {
    const name = column.name;
    // eslint-disable-next-line
    $.columns[name] = column;
  });
}
