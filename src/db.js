// @flow

import produce from 'immer';

import type { Column, Database, Table } from './types';

function* iterInsert(arr, pos, item) {
  yield* arr.slice(0, pos);
  yield item;
  yield* arr.slice(pos);
}

function insert(arr, pos, item) {
  return [...iterInsert(arr, pos, item)];
}

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
  position: string | null,
): Database {
  return produce(db, $ => {
    const table = $.tables[tblName];
    if (!table) {
      throw new Error(`Table "${tblName}" does not exists`);
    }

    const col = table.columns.find(c => c.name === column.name);
    if (col) {
      throw new Error(`Column "${tblName}.${column.name}" already exists`);
    }

    if (position) {
      if (position.startsWith('AFTER ')) {
        const afterColName = position.substring('AFTER '.length);
        const pos = table.columns.findIndex(c => c.name === afterColName);
        if (pos < 0) {
          throw new Error(
            `Column "${tblName}.${afterColName}" does not exists`,
          );
        }

        table.columns = insert(table.columns, pos + 1, column);
      } else if (position === 'FIRST') {
        table.columns = insert(table.columns, 0, column);
      } else {
        throw new Error(`Unknown position qualifier: ${position}`);
      }
    } else {
      // Insert at the end
      table.columns.push(column);
    }
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

    // TODO: Should error if not exists!
    table.columns = table.columns.filter(c => c.name !== colName);
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
  position: string | null,
): Database {
  if (position) {
    return addColumn(
      removeColumn(db, tblName, colName),
      tblName,
      column,
      position,
    );
  }

  return produce(db, $ => {
    const table = $.tables[tblName];
    table.columns = table.columns.map(c => (c.name === colName ? column : c));
  });
}
