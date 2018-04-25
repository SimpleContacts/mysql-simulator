// @flow

import produce from 'immer';
import { maxBy } from 'lodash';

import type { Column, Database, ForeignKey, Table } from './types';

function* iterInsert(arr, pos, item) {
  yield* arr.slice(0, pos);
  yield item;
  yield* arr.slice(pos);
}

function insert(arr, pos, item) {
  return [...iterInsert(arr, pos, item)];
}

function assertTableDoesNotExist(db: Database, tblName: string): void {
  if (db.tables[tblName]) {
    throw new Error(`Table "${tblName}" already exist`);
  }
}

function getTable(db: Database, tblName: string): Table {
  const table = db.tables[tblName];
  if (!table) {
    throw new Error(`Table "${tblName}" does not exist`);
  }
  return table;
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
 * Creates a new, empty, table.
 */
export function emptyTable(name: string): Table {
  return {
    name,
    columns: [],
    primaryKey: null,
    foreignKeys: [],
  };
}

/**
 * Adds a new, empty, table to a database.
 */
export function createTable(db: Database, name: string): Database {
  assertTableDoesNotExist(db, name);
  return produce(db, $ => {
    $.tables[name] = emptyTable(name);
  });
}

/**
 * Adds a new table to a database.
 */
// export function addTable(db: Database, table: Table): Database {
//   assertTableDoesNotExist(db, table.name);
//   return produce(db, $ => {
//     $.tables[table.name] = table;
//   });
// }

export function addTableLike(
  db: Database,
  newTblName: string,
  oldTblName: string,
): Database {
  assertTableDoesNotExist(db, newTblName);

  const oldTable = getTable(db, oldTblName);
  const newTable = produce(oldTable, $ => {
    $.name = newTblName;
    $.foreignKeys = [];
  });
  return produce(db, $ => {
    $.tables[newTblName] = newTable;
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
  if (!ifExists) {
    getTable(db, name); // Will fail if table does not exist
  }

  return produce(db, $ => {
    // TODO: Also remove foreign key names from the global FK registry
    delete $.tables[name];
  });
}

/**
 * Adds a new table to a database.
 */
export function renameTable(db: Database, from: string, to: string): Database {
  assertTableDoesNotExist(db, to);
  return produce(db, $ => {
    const table = getTable($, from);
    $.tables[to] = table;
    delete $.tables[from];

    // Consistency
    for (const fk of table.foreignKeys) {
      if (fk.name.startsWith(`${table.name}_ibfk_`)) {
        fk.name = `${to}${fk.name.substring(table.name.length)}`;
      }
    }
    table.name = to;
  });
}

/**
 * Adds a primary key to a table
 */
export function addPrimaryKey(
  db: Database,
  tblName: string,
  columnNames: Array<string>,
): Database {
  return produce(db, $ => {
    const table = getTable($, tblName);
    if (table.primaryKey) {
      throw new Error(`Table "${tblName}" already has a primary key`);
    }

    for (const colName of columnNames) {
      if (table.columns.findIndex(col => col.name === colName) < 0) {
        throw new Error(
          `Table "${tblName}" does not have column referenced in primary key: "${colName}"`,
        );
      }
    }

    table.primaryKey = columnNames;
  });
}

/**
 * Generates a name for a new foreign key, based on the table's current state.
 */
function generateForeignKeyName(table: Table) {
  const prefix = `${table.name}_ibfk_`;
  const autoFKs = table.foreignKeys
    .filter(fk => fk.name.startsWith(prefix))
    .map(fk => {
      const parts = fk.name.split('_');
      const num = parts[parts.length - 1];
      return parseInt(num, 10);
    });

  const max = autoFKs.length > 0 ? maxBy(autoFKs) : 0;
  return `${prefix}${max + 1}`;
}

/**
 * Adds a foreign key to a table
 */
export function addForeignKey(
  db: Database,
  tblName: string,
  fkName: string | null,
  localColumns: Array<string>,
  targetTblName: string,
  targetColumns: Array<string>,
): Database {
  return produce(db, $ => {
    const table = getTable($, tblName);
    const targetTable = getTable($, targetTblName);

    // TODO: Assert local columns exist
    // TODO: Assert target columns exist
    // TODO: Assert local & target columns have equal data types
    // TODO: Add implicit index if necessary
    // TODO: Register this foreign key name globally

    fkName = fkName || generateForeignKeyName(table);
    const fk: ForeignKey = {
      name: fkName,
      columns: localColumns,
      reference: {
        table: targetTable.name,
        columns: targetColumns,
      },
    };
    table.foreignKeys.push(fk);
  });
}

/**
 * Drops primary key from table
 */
export function dropPrimaryKey(db: Database, tblName: string): Database {
  return produce(db, $ => {
    const table = getTable($, tblName);
    if (!table.primaryKey) {
      throw new Error(`Table "${tblName}" has no primary key`);
    }

    table.primaryKey = null;
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
    const table = getTable($, tblName);
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
