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
    $.tables[to] = $.tables[from];
    $.tables[to].name = to;
    delete $.tables[from];
  });
}

/**
 * Adds a new column to a table
 */
export function addColumn(
  db: Database,
  tblName: string,
  column: Column,
): Database {
  return produce(db, $ => {
    const table = $.tables[tblName];
    if (!table) {
      throw new Error(`Table "${tblName}" does not exists`);
    }
    table.columns[column.name] = column; // TODO: Should be error if already exists!
  });
}

/**
 * Replaces a column by a new definition
 */
export function replaceColumn(
  db: Database,
  tblName: string,
  colName: string,
  column: Column,
): Database {
  return produce(db, $ => {
    const table = $.tables[tblName];
    delete table.columns[colName]; // TODO: Should error if not exists!
    table.columns[column.name] = column;
  });
}

/**
 * Removes a column from a table
 */
export function removeColumn(
  db: Database,
  tblName: string,
  colName: string,
): Database {
  return produce(db, $ => {
    const table = $.tables[tblName];
    delete table.columns[colName]; // TODO: Should error if not exists!
  });
}
