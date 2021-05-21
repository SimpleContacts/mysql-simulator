// @flow strict

import { sortBy, zip } from 'lodash';
import type { Schema as ROLSchema } from 'rule-of-law/types';

import Column from './Column';
import { makeEncoding } from './encodings';
import type { Encoding } from './encodings';
import type { ReferenceOption } from './ForeignKey';
import type { IndexType } from './Index';
import Table from './Table';

type LUT<+T> = { +[string]: T };

const indexBy = <T>(items: Iterable<T>, keyFn: (T) => string): LUT<T> => {
  const lut = {};
  for (const item of items) {
    lut[keyFn(item)] = item;
  }
  return lut;
};

/**
 * Converts a LUT to a list-of-values, all typed.
 * Think of this as a drop-in replacement for Object.values(), but where the
 * type information isn't lost (i.e. no `mixed` types).
 */
function values<T>(things: LUT<T>): Array<T> {
  const keys: Array<string> = Object.keys(things);
  return keys.map((key) => things[key]);
}

export default class Database {
  +defaultEncoding: Encoding;
  +_tables: LUT<Table>; // TODO: Just make this an Array, it's way easier to work with

  constructor(defaultEncoding: Encoding, _tables: LUT<Table> = {}) {
    this.defaultEncoding = defaultEncoding;
    this._tables = _tables;
  }

  setEncoding(encoding: Encoding): Database {
    return new Database(encoding, this._tables);
  }

  getTables(): Array<Table> {
    return sortBy(values(this._tables), (t) => t.name.toLowerCase());
  }

  has(name: string): boolean {
    return this._tables[name] !== undefined;
  }

  getTable(name: string): Table {
    const table = this._tables[name];
    if (!table) {
      throw new Error(`Table "${name}" does not exist`);
    }
    return table;
  }

  assertTableDoesNotExist(name: string) {
    if (this.has(name)) {
      throw new Error(`Table "${name}" already exist`);
    }
  }

  createTable(name: string, defaultEncoding: Encoding): Database {
    return this.addTable(new Table(name, defaultEncoding));
  }

  cloneTable(tblName: string, newTblName: string): Database {
    const oldTable = this.getTable(tblName);
    const newTable = oldTable.cloneTo(newTblName);
    return this.addTable(newTable);
  }

  addTable(table: Table): Database {
    const name = table.name;
    this.assertTableDoesNotExist(name);
    return new Database(this.defaultEncoding, { ...this._tables, [name]: table });
  }

  /**
   * Returns a new DB with the table renamed.
   */
  renameTable(from: string, to: string): Database {
    this.assertTableDoesNotExist(to);

    return this.mapTables((table_) => {
      // Rename the table itself
      let table = table_;
      if (table.name === from) {
        table = table.rename(to);
      }

      // Update FKs pointing to this table in the rest of the database
      return table.renameReference(from, to);
    });
  }

  /**
   * Returns a new DB with the Table removed.
   */
  removeTable(name: string, ifExists: boolean = false): Database {
    let maybeTable;
    try {
      maybeTable = this.getTable(name);
    } catch (e) {
      if (ifExists) {
        maybeTable = null;
      } else {
        throw e;
      }
    }

    if (maybeTable) {
      // Double-check that this table isn't pointed to by any FK in another
      // table
      const table = maybeTable;
      const otherTables = this.getTables().filter((t) => t.name !== table.name);
      for (const other of otherTables) {
        for (const fk of other.getForeignKeys()) {
          if (fk.reference.table === table.name) {
            throw new Error(`Cannot drop table. Still used by FK ${fk.name}`);
          }
        }
      }
    }

    const newTables = { ...this._tables };
    delete newTables[name];
    return new Database(this.defaultEncoding, newTables);
  }

  /**
   * Helper method that returns a new DB instance that has the given Table
   * replaced with the output of the mapper function.
   */
  swapTable(tblName: string, mapper: (Table) => Table): Database {
    const newTable = mapper(this.getTable(tblName));
    if (newTable.name !== tblName) {
      throw new Error('Database.swapTable() cannot be used to change the name of the table.');
    }
    return new Database(this.defaultEncoding, {
      ...this._tables,
      [tblName]: newTable,
    });
  }

  /**
   * Helper function that returns a new Database by applying a mapper function
   * over every table in the database.
   */
  mapTables(mapper: (Table) => Table): Database {
    const newTables = this.getTables().map(mapper);
    return new Database(
      this.defaultEncoding,
      indexBy(newTables, (table) => table.name),
    );
  }

  /**
   * Returns a new DB with the given column added to the given table.
   */
  addColumn(tblName: string, column: Column, position: string | null): Database {
    return this.swapTable(tblName, (table) => table.addColumn(column, position));
  }

  dropDefault(tblName: string, colName: string): Database {
    return this.swapTable(tblName, (table) => table.dropDefault(colName));
  }

  /**
   * Returns a new Database with the column in the table replaced by the new
   * definition.
   */
  replaceColumn(tblName: string, colName: string, column: Column, position: string | null): Database {
    let db = this;
    db = db.swapTable(tblName, (table) => table.replaceColumn(colName, column, position));

    // If it's a rename, we may need to update any FKs pointing to it
    if (colName !== column.name) {
      db = db.mapTables((table) =>
        table.mapForeignKeys((fk) => {
          if (fk.reference.table !== tblName || !fk.reference.columns.includes(colName)) {
            // Not affected
            return fk;
          }

          const reference = {
            ...fk.reference,
            table: fk.reference.table,
            columns: fk.reference.columns.map((ref) => (ref === colName ? column.name : ref)),
          };
          return fk.patch({ reference });
        }),
      );
    }

    return db;
  }

  /**
   * Returns a new DB with the column in the given table removed.
   */
  removeColumn(tblName: string, colName: string): Database {
    return this.swapTable(tblName, (table) => table.removeColumn(colName));
  }

  /**
   * Returns a new DB with a PK added for the given column names in the given
   * table.
   */
  addPrimaryKey(tblName: string, columnNames: Array<string>): Database {
    return this.swapTable(tblName, (table) => table.addPrimaryKey(columnNames));
  }

  dropPrimaryKey(tblName: string): Database {
    return this.swapTable(tblName, (table) => table.dropPrimaryKey());
  }

  addForeignKey(
    tblName: string,
    constraintName: string | null,
    indexName: string | null,
    localColumns: Array<string>,
    targetTblName: string,
    targetColumns: Array<string>,
    onDelete: ReferenceOption,
  ): Database {
    // Makes sure the tables exist
    const localTable = this.getTable(tblName);
    const foreignTable = this.getTable(targetTblName);

    // Make sure number of source/target columns match
    if (localColumns.length !== targetColumns.length) {
      throw new Error('Foreign key must have an equal number of local/foreign columns');
    }

    // Make sure the target columns exist and are of equal types
    for (const [localColName, foreignColName] of zip(localColumns, targetColumns)) {
      const localColumn = localTable.getColumn(localColName);
      const foreignColumn = foreignTable.getColumn(foreignColName);

      const ltype = localColumn.getType(true);
      const ftype = foreignColumn.getType(true);
      if (ltype !== ftype) {
        const lname = `${localTable.name}.${localColumn.name}`;
        const fname = `${foreignTable.name}.${foreignColumn.name}`;
        throw new Error(
          `Type mismatch in foreign key: local/foreign columns have different types. Local column \`${lname}\` is \`${ltype}\`, but \`${fname}\` is \`${ftype}\`.`,
        );
      }
    }

    return this.swapTable(tblName, (table) =>
      table.addForeignKey(constraintName, indexName, localColumns, targetTblName, targetColumns, onDelete),
    );
  }

  dropForeignKey(tblName: string, symbol: string): Database {
    return this.swapTable(tblName, (table) => table.dropForeignKey(symbol));
  }

  /**
   * Returns a new DB with the requested Index added to the table.
   */
  addIndex(
    tblName: string,
    indexName: string | null,
    type: IndexType,
    columns: Array<string>,
    $$locked: boolean,
  ): Database {
    return this.swapTable(tblName, (table) => table.addIndex(indexName, type, columns, $$locked));
  }

  dropIndex(tblName: string, indexName: string): Database {
    return this.swapTable(tblName, (table) => table.dropIndex(indexName));
  }

  renameIndex(tblName: string, oldIndexName: string, newIndexName: string): Database {
    return this.swapTable(tblName, (table) => table.renameIndex(oldIndexName, newIndexName));
  }

  setDefaultTableEncoding(tblName: string, charset?: string, collate?: string): Database {
    const encoding = makeEncoding(charset, collate);
    return this.swapTable(tblName, (table) => table.setDefaultEncoding(encoding));
  }

  convertToEncoding(tblName: string, charset?: string, collate?: string): Database {
    const encoding = makeEncoding(charset, collate);
    return this.swapTable(tblName, (table) => table.convertToEncoding(encoding));
  }

  toSchema(): ROLSchema {
    const schema = {};
    for (const table of this.getTables()) {
      schema[table.name] = table.toSchema();
    }
    return schema;
  }

  // The optional subset of tables to print
  toString(tableNames_: Array<string> = []): string {
    const tableNames = tableNames_.length > 0 ? tableNames_ : this.getTables().map((t) => t.name);
    const dumps = [];

    // To keep the output byte-by-byte the same as MySQL's dump output, we'll
    // emit an empty line at the start.
    dumps.push('');

    for (const tableName of tableNames) {
      dumps.push(this.getTable(tableName).toString());
      dumps.push('');
    }

    return dumps.join('\n');
  }
}
