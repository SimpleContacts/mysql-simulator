// @flow

import produce from 'immer';
import { flatten, maxBy, some } from 'lodash';

import type {
  Column,
  Database,
  ForeignKey,
  Index,
  IndexType,
  Table,
} from './types';

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
    indexes: [],
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
      const col = table.columns.find(col => col.name === colName);
      if (!col) {
        throw new Error(
          `Table "${tblName}" does not have column referenced in primary key: "${colName}"`,
        );
      }

      // Implicitly convert this column to NOT NULL
      col.nullable = false;
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
 * Adds an index to a table
 */
export function addIndex(
  db: Database,
  tblName: string,
  indexName: string | null,
  type: IndexType,
  columns: Array<string>,
  $$locked: boolean,
): Database {
  return produce(db, $ => {
    const table = getTable($, tblName);

    // If indexName is null, auto-generate it
    if (!indexName) {
      // Try to name it after the first column in the columns list...
      const idealName = columns[0];
      indexName = idealName;

      // ...but attempt to add a counter value to avoid name clashes
      const existingIndexNames = new Set(table.indexes.map(i => i.name));
      let counter = 1;
      while (existingIndexNames.has(indexName)) {
        // eslint-disable-next-line no-plusplus
        indexName = `${idealName}_${++counter}`;
      }
    }

    // If an index already exists for this column combination, reuse it (don't
    // create a new one).  An index will also be reused if the new index
    // definition is more specific (user_id, foo) will replace an existing
    // index on (user_id).
    const needle = columns.join('+');
    const pos = table.indexes.findIndex(
      i =>
        needle.startsWith(i.columns.join('+')) &&
        !i.$$locked &&
        (needle !== i.columns.join('+') || i.type === type),
    );
    if (pos >= 0) {
      // Change the name and move it to the end of the indexes array
      const [index] = table.indexes.splice(pos, 1);
      index.name = indexName;
      index.columns = columns;
      index.type = type;
      index.$$locked = $$locked;
      table.indexes.push(index);
    } else {
      const index: Index = {
        name: indexName,
        type,
        columns,
        $$locked,
      };

      table.indexes.push(index);
    }
  });
}

/**
 * Adds a foreign key to a table
 */
export function addForeignKey(
  db: Database,
  tblName: string,
  constraintName: string | null,
  indexName: string | null,
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
    // TODO: Register this foreign key name globally

    indexName = indexName || constraintName;

    // Add implicit local index for given columns if no such index exists yet
    const needle = localColumns.join('+');
    if (!some(table.indexes, index => index.columns.join('+') === needle)) {
      // Don't add if a primary key already exists
      if (
        !(table.primaryKey && table.primaryKey.join('+').startsWith(needle))
      ) {
        $ = addIndex($, tblName, indexName, 'NORMAL', localColumns, false);
      }
    } else if (indexName) {
      const pos = table.indexes.findIndex(
        i => i.columns.join('+') === needle && !i.$$locked,
      );
      if (pos >= 0) {
        // Change the name and move it to the end of the indexes array
        const [index] = table.indexes.splice(pos, 1);
        index.name = indexName;
        table.indexes.push(index);
      }
    }

    constraintName = constraintName || generateForeignKeyName(table);
    const fk: ForeignKey = {
      name: constraintName,
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
 * Drops an index from a table
 */
export function dropIndex(
  db: Database,
  tblName: string,
  indexName: string,
): Database {
  return produce(db, $ => {
    const table = getTable($, tblName);

    // TODO
    // Dropping an index that's still implicitly required by a FK should fail.
    // MySQL fails with "Cannot drop index \'user_id\': needed in a foreign key
    // constraint" here.

    if (!some(table.indexes, index => index.name === indexName)) {
      throw new Error(
        `Index "${indexName}" does not exist on table "${tblName}". These do: ${table.indexes
          .map(index => index.name)
          .join(', ')}`,
      );
    }

    table.indexes = table.indexes.filter(index => index.name !== indexName);
  });
}

/**
 * Drops primary key from table
 */
export function dropForeignKey(
  db: Database,
  tblName: string,
  symbol: string,
): Database {
  return produce(db, $ => {
    const table = getTable($, tblName);

    if (!some(table.foreignKeys, fk => fk.name === symbol)) {
      throw new Error(
        `Foreign key "${symbol}" does not exist on table "${tblName}". These do: ${table.foreignKeys
          .map(fk => fk.name)
          .join(', ')}`,
      );
    }

    table.foreignKeys = table.foreignKeys.filter(fk => fk.name !== symbol);
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
    const table = getTable($, tblName);

    if (
      some(flatten(table.foreignKeys.map(fk => fk.columns)), c => c === colName)
    ) {
      throw new Error("Cannot drop column because it's used by a FK");
    }

    table.columns = table.columns.filter(c => c.name !== colName);
    table.indexes = table.indexes
      // Implicitly remove this column from any multi-column indexes that contain it
      .map(index =>
        produce(index, $ => {
          $.columns = $.columns.filter(name => name !== colName);
        }),
      )
      // If this leads to "empty" indexes, drop them
      .filter(index => index.columns.length > 0);

    if (table.primaryKey) {
      const newPK = table.primaryKey.filter(name => name !== colName);
      table.primaryKey = newPK.length > 0 ? newPK : null;
    }
  });
}

/**
 * Drops the default value for a given column
 */
export function dropDefault(
  db: Database,
  tblName: string,
  colName: string,
): Database {
  return produce(db, $ => {
    const table = getTable($, tblName);

    for (const col of table.columns) {
      if (col.name === colName) {
        col.defaultValue = null;
      }
    }
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
  const oldName = colName;
  const newName = column.name;

  if (position) {
    db = addColumn(
      removeColumn(db, tblName, colName),
      tblName,
      column,
      position,
    );
  } else {
    db = produce(db, $ => {
      const table = $.tables[tblName];
      table.columns = table.columns.map(c => (c.name === colName ? column : c));
    });
  }

  // If the name of the column has changed, this is a rename. We'll also need
  // to rename the column in all the indexes where it's used.
  if (oldName !== newName) {
    db = produce(db, $ => {
      const table = $.tables[tblName];
      if (table.primaryKey) {
        table.primaryKey = table.primaryKey.map(
          name => (name === oldName ? newName : name),
        );
      }
      for (const fk of table.foreignKeys) {
        fk.columns = fk.columns.map(
          name => (name === oldName ? newName : name),
        );
      }
      for (const index of table.indexes) {
        index.columns = index.columns.map(
          name => (name === oldName ? newName : name),
        );
      }
    });
  }

  return db;
}
