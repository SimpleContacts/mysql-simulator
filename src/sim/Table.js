// @flow strict

import { maxBy, sortBy } from 'lodash';
import t from 'rule-of-law/types';
import type { RecordTypeInfo as ROLRecordTypeInfo } from 'rule-of-law/types';

import Column from './Column';
import Database from './Database';
import { formatDataType } from './DataType';
import type { Encoding } from './encodings';
import { getDefaultCollationForCharset, isWider } from './encodings';
import ForeignKey from './ForeignKey';
import type { IndexType } from './Index';
import Index from './Index';
import { escape, insert } from './utils';

export default class Table {
  +name: string;
  +defaultEncoding: Encoding;
  +columns: $ReadOnlyArray<Column>;
  +primaryKey: $ReadOnlyArray<string> | null;
  +indexes: $ReadOnlyArray<Index>;
  +foreignKeys: $ReadOnlyArray<ForeignKey>;

  constructor(
    name: string,
    defaultEncoding: Encoding,
    columns: $ReadOnlyArray<Column> = [],
    primaryKey: $ReadOnlyArray<string> | null = null,
    indexes: $ReadOnlyArray<Index> = [],
    foreignKeys: $ReadOnlyArray<ForeignKey> = [],
  ) {
    this.name = name;
    this.defaultEncoding = defaultEncoding;
    this.columns = columns;
    this.primaryKey = primaryKey;
    this.indexes = indexes;
    this.foreignKeys = foreignKeys;
  }

  setDefaultEncoding(newEncoding: Encoding): Table {
    // Changing the default encoding should only have effect on _future_
    // columns that will get created. There should not be any conversion
    // happening by changing the encoding. However, any columns that don't have
    // an explicit encoding set should be updated to the old/current encoding
    // explicitly
    const columns = this.columns.map((column) => {
      // TODO: Make explicit
      const typeInfo = column.getTypeInfo();
      if (
        !(
          typeInfo.baseType === 'char' ||
          typeInfo.baseType === 'varchar' ||
          typeInfo.baseType === 'text' ||
          typeInfo.baseType === 'mediumtext' ||
          typeInfo.baseType === 'longtext' ||
          typeInfo.baseType === 'enum'
        )
      ) {
        return column.patch({}, newEncoding);
      }

      // NOTE: This implementation is correct, and 100% matches MySQL's
      // behavior. Still...
      // TODO: SIMPLIFY THIS!
      if (
        typeInfo.encoding === undefined ||
        (typeInfo.encoding.charset === column.tableDefaultEncoding.charset &&
          typeInfo.encoding.collate === column.tableDefaultEncoding.collate)
      ) {
        if (typeInfo.baseType !== 'enum') {
          return column.patch(
            {
              type: formatDataType({ ...typeInfo, encoding: this.defaultEncoding }, newEncoding),
            },
            newEncoding,
          );
        } else {
          return column.patch(
            {
              type: formatDataType({ ...typeInfo, encoding: this.defaultEncoding }, newEncoding),
            },
            newEncoding,
          );
        }
      } else if (
        typeInfo.encoding !== undefined &&
        typeInfo.encoding.charset === newEncoding.charset &&
        typeInfo.encoding.collate === newEncoding.collate
      ) {
        if (typeInfo.baseType !== 'enum') {
          return column.patch(
            {
              type: formatDataType({ ...typeInfo, encoding: undefined }, newEncoding),
            },
            newEncoding,
          );
        } else {
          return column.patch(
            {
              type: formatDataType({ ...typeInfo, encoding: undefined }, newEncoding),
            },
            newEncoding,
          );
        }
      } else {
        return column;
      }
    });
    return new Table(this.name, newEncoding, columns, this.primaryKey, this.indexes, this.foreignKeys);
  }

  convertToEncoding(newEncoding: Encoding): Table {
    const columns = this.columns.map((column) => {
      const typeInfo = column.getTypeInfo();
      if (
        !(
          typeInfo.baseType === 'char' ||
          typeInfo.baseType === 'varchar' ||
          typeInfo.baseType === 'text' ||
          typeInfo.baseType === 'mediumtext' ||
          typeInfo.baseType === 'longtext' ||
          typeInfo.baseType === 'enum'
        )
      ) {
        return column.patch({}, newEncoding);
      }

      // If no explicit encoding is set for this column, just keep it that way
      if (typeInfo.encoding === undefined) {
        return column.patch({}, newEncoding);
      } else {
        if (typeInfo.baseType === 'enum') {
          const newType = { ...typeInfo, encoding: newEncoding };
          return column.patch({ type: formatDataType(newType, column.tableDefaultEncoding) }, newEncoding);
        } else {
          const newType = {
            ...typeInfo,
            baseType:
              typeInfo.baseType === 'text' && isWider(newEncoding.charset, typeInfo.encoding.charset)
                ? // This is by design in MySQL, since converting to another encoding
                  // can grow the text size, and this explicit conversion helps to
                  // avoid truncation. See https://bugs.mysql.com/bug.php?id=31291
                  'mediumtext'
                : typeInfo.baseType,
            encoding: newEncoding,
          };
          return column.patch({ type: formatDataType(newType, column.tableDefaultEncoding) }, newEncoding);
        }
      }
    });
    return new Table(this.name, newEncoding, columns, this.primaryKey, this.indexes, this.foreignKeys);
  }

  /**
   * Returns whether the given Column name exists in the Table.
   */
  has(colName: string): boolean {
    return this.columns.findIndex((c) => c.name === colName) >= 0;
  }

  getForeignKeysUsing(colName: string): Array<ForeignKey> {
    return this.foreignKeys.filter((fk) => fk.columns.includes(colName));
  }

  /**
   * Returns whether the given Column is used in any of the foreign keys.
   */
  isUsedInForeignKey(colName: string): boolean {
    return this.getForeignKeysUsing(colName).length > 0;
  }

  assertColumnDoesNotExist(colName: string) {
    if (this.has(colName)) {
      throw new Error(`Column "${colName}" already exist in table "${this.name}"`);
    }
  }

  getColumn(colName: string): Column {
    const column = this.columns.find((c) => c.name === colName);
    if (!column) {
      throw new Error(`Column "${colName}" does not exist in table "${this.name}"`);
    }
    return column;
  }

  getColumnIndex(colName: string): number {
    const index = this.columns.findIndex((c) => c.name === colName);
    if (index < 0) {
      throw new Error(`Column "${colName}" does not exist in table "${this.name}"`);
    }
    return index;
  }

  /**
   * Get a list of all FKs in the given Database that are pointing to this
   * table.
   */
  getIncomingForeignKeys(db: Database): Array<{ table: string, foreignKey: ForeignKey }> {
    const results: Array<{ table: string, foreignKey: ForeignKey }> = [];
    for (const table of db.getTables()) {
      for (const fk of table.foreignKeys) {
        if (fk.reference.table === this.name) {
          results.push({
            table: table.name,
            foreignKey: fk,
          });
        }
      }
    }
    return results;
  }

  /**
   * Returns a deep clone of this table, with its name replaced and its foreign
   * keys emptied.
   */
  cloneTo(name: string): Table {
    return new Table(name, this.defaultEncoding, this.columns, this.primaryKey, this.indexes, []);
  }

  /**
   * Returns a new Table with the new name. Any FKs that were auto-named after
   * this table are also updated.
   */
  rename(newName: string): Table {
    const oldName = this.name;

    // Consistency
    const foreignKeys = this.foreignKeys.map((fk) => {
      if (!fk.name.startsWith(`${oldName}_ibfk_`)) {
        // Don't change
        return fk;
      }
      return fk.patch({
        name: `${newName}${fk.name.substring(oldName.length)}`,
      });
    });

    return new Table(newName, this.defaultEncoding, this.columns, this.primaryKey, this.indexes, foreignKeys);
  }

  /**
   * Returns a new Table with the reference to another table updated. This is
   * a helper method that is coordinated by the Database instance.
   */
  renameReference(oldRefName: string, newRefName: string): Table {
    const foreignKeys = this.foreignKeys.map((fk: ForeignKey) => {
      if (fk.reference.table !== oldRefName) {
        return fk;
      }

      const reference = {
        columns: fk.reference.columns,
        table: newRefName,
      };
      return fk.patch({ reference });
    });

    return new Table(this.name, this.defaultEncoding, this.columns, this.primaryKey, this.indexes, foreignKeys);
  }

  /**
   * Adds a new column to a table
   */
  addColumn(column: Column, position: string | null): Table {
    this.assertColumnDoesNotExist(column.name);

    const columns = [...this.columns, column];
    let table = new Table(this.name, this.defaultEncoding, columns, this.primaryKey, this.indexes, this.foreignKeys);
    if (position) {
      table = table.moveColumn(column.name, position);
    }
    return table;
  }

  /**
   * Returns a new Table with the given column re-ordered to a new position.
   */
  moveColumn(colName: string, position: string): Table {
    const column = this.getColumn(colName);
    let columns = this.columns.filter((c) => c.name !== column.name);
    if (position.startsWith('AFTER ')) {
      const afterColName = position.substring('AFTER '.length);
      const pos = this.getColumnIndex(afterColName);
      columns = insert(columns, pos + 1, column);
    } else if (position === 'FIRST') {
      columns = insert(columns, 0, column);
    } else {
      throw new Error(`Unknown position qualifier: ${position}`);
    }

    return new Table(this.name, this.defaultEncoding, columns, this.primaryKey, this.indexes, this.foreignKeys);
  }

  /**
   * Returns a new Table with the column renamed.  If the column is used in any
   * local indexes, they are also updated.  Any external foreign keys
   * referencing this table won't be updated by this function.
   */
  renameColumn(oldName: string, newName: string): Table {
    const columns = this.columns.map((column) => {
      if (column.name !== oldName) {
        return column;
      }

      return column.patch({ name: newName }, column.tableDefaultEncoding);
    });

    // Replace all references to this column if they're used in any of the
    // indexes
    const renamer = (name: string) => (name === oldName ? newName : name);
    const primaryKey = this.primaryKey ? this.primaryKey.map(renamer) : null;
    const foreignKeys = this.foreignKeys.map((fk) =>
      fk.patch({
        columns: fk.columns.map(renamer),
      }),
    );

    // TODO: Make this a method on the Index: .renameReference()
    const indexes = this.indexes.map((index: Index) =>
      index.patch({
        columns: index.columns.map(renamer),
      }),
    );

    return new Table(this.name, this.defaultEncoding, columns, primaryKey, indexes, foreignKeys);
  }

  /**
   * Helper method that returns a new Table instance that has the given column
   * replaced with the output of the mapper function.
   */
  swapColumn(colName: string, mapper: (Column) => Column): Table {
    const newColumn = mapper(this.getColumn(colName));
    if (newColumn.name !== colName) {
      throw new Error('Table.swapColumn() cannot be used to change the name of the column.');
    }
    const columns = this.columns.map((column) => (column.name === colName ? newColumn : column));
    return new Table(this.name, this.defaultEncoding, columns, this.primaryKey, this.indexes, this.foreignKeys);
  }

  replaceColumn(oldColName: string, newColumn: Column, position: string | null): Table {
    // If this is a rename, make sure to do that now first
    let table = this;
    const oldColumn = table.getColumn(oldColName);
    if (oldColName !== newColumn.name) {
      table = table.renameColumn(oldColName, newColumn.name);
    }

    const fks = this.getForeignKeysUsing(oldColName);
    if (fks.length > 0) {
      // If the type changes, some MySQL servers might throw
      // a ER_FK_COLUMN_CANNOT_CHANGE error.  Therefore, throw a warning.
      const oldType = oldColumn.getDefinition();
      const newType = newColumn.getDefinition();
      if (oldType !== newType) {
        console.warn('');
        console.warn(`WARNING: Column type change detected on column "${table.name}.${oldColName}" used in FK:`);
        for (const fk of fks) {
          console.warn(`    ${fk.name}`);
        }
        console.warn('');
        console.warn(`The attempted type change:`);
        console.warn(`    -${oldType}`);
        console.warn(`    +${newType}`);
        console.warn('');
        console.warn(`This might cause a ER_FK_COLUMN_CANNOT_CHANGE error, depending on how MySQL is configured.`);
        console.warn('');
        console.warn(`Consider wrapping the column type change in:`);
        console.warn('');
        console.warn(`    LOCK TABLES ${escape(table.name)} WRITE;`);
        for (const fk of fks) {
          console.warn(`    ALTER TABLE ${escape(table.name)} DROP FOREIGN KEY ${escape(fk.name)};`);
        }
        console.warn('    ...');
        for (const fk of fks) {
          console.warn(
            `    ALTER TABLE ${escape(table.name)} ADD CONSTRAINT ${escape(fk.name)} FOREIGN KEY (${fk.columns
              .map((name) => escape(name))
              .join(', ')}) REFERENCES ${escape(fk.reference.table)} (${fk.reference.columns
              .map((name) => escape(name))
              .join(', ')});`,
          );
        }
        console.warn(`    UNLOCK TABLES;`);
        console.warn('');
      }
    }

    // Replace the column
    table = table.swapColumn(newColumn.name, () => newColumn);

    // If there was a position spec change, pull the column out of the list,
    // figure out the new position, and insert it there.
    if (position) {
      table = table.moveColumn(newColumn.name, position);
    }

    return table;
  }

  /**
   * Returns a new Table with the default value dropped for the given column.
   */
  dropDefault(colName: string): Table {
    const column = this.getColumn(colName);
    const newColumn = column.patch({ defaultValue: null }, column.tableDefaultEncoding);
    const columns = this.columns.map((c) => (c.name === colName ? newColumn : c));
    return new Table(this.name, this.defaultEncoding, columns, this.primaryKey, this.indexes, this.foreignKeys);
  }

  /**
   * Returns a new Table with the given column removed.
   */
  removeColumn(colName: string): Table {
    // Make sure the column exists
    this.getColumn(colName);

    // Check if any of the columns that are being removed are used in any of
    // the FK definitions.  If so, we cannot remove it.
    if (this.isUsedInForeignKey(colName)) {
      throw new Error(`Cannot drop column "${colName}" because it's used by a FK`);
    }

    const columns = this.columns.filter((c) => c.name !== colName);

    // TODO: Make this a method on the Index: .removeReference()
    const indexes = this.indexes
      // Implicitly remove this column from any multi-column indexes that
      // contain it
      .map((index) =>
        index.patch({
          columns: index.columns.filter((name) => name !== colName),
        }),
      )
      // If this leads to "empty" indexes, drop 'em entirely
      .filter((index) => index.columns.length > 0);

    // Remove this column from any PKs that contain it
    let primaryKey = this.primaryKey;
    if (primaryKey) {
      primaryKey = primaryKey.filter((name) => name !== colName);
      primaryKey = primaryKey.length > 0 ? primaryKey : null;
    }

    return new Table(this.name, this.defaultEncoding, columns, primaryKey, indexes, this.foreignKeys);
  }

  /**
   * Returns a new Table with a PK defined on the given column names.
   */
  addPrimaryKey(columnNames: Array<string>): Table {
    if (this.primaryKey) {
      throw new Error(`Table "${this.name}" already has a primary key`);
    }

    // Make sure all the referenced columns actually exist
    columnNames.forEach((name) => this.getColumn(name));

    // MySQL implicitly converts columns used in PKs to NOT NULL
    const newColumns = this.columns.map((c: Column) => {
      if (!columnNames.includes(c.name)) {
        return c;
      }
      return c.patch({ nullable: false }, c.tableDefaultEncoding);
    });

    return new Table(
      this.name,
      this.defaultEncoding,
      newColumns,
      columnNames, // primaryKey
      this.indexes,
      this.foreignKeys,
    );
  }

  /**
   * Returns a new Table with the PK dropped.
   */
  dropPrimaryKey(): Table {
    if (!this.primaryKey) {
      throw new Error(`Table "${this.name}" has no primary key`);
    }

    const primaryKey = null;
    return new Table(this.name, this.defaultEncoding, this.columns, primaryKey, this.indexes, this.foreignKeys);
  }

  /**
   * Generates a name for a new foreign key, based on the table's current state.
   */
  generateForeignKeyName(): string {
    const prefix = `${this.name}_ibfk_`;
    const autoFKs = this.foreignKeys
      .filter((fk) => fk.name.startsWith(prefix))
      .map((fk) => {
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
  addForeignKey(
    constraintName_: string | null,
    indexName_: string | null,
    localColumns: Array<string>,
    targetTblName: string,
    targetColumns: Array<string>,
  ): Table {
    // TODO: Assert local columns exist
    // TODO: Assert target columns exist
    // TODO: Assert local & target columns have equal data types
    // TODO: Register this foreign key name globally

    let table = this;
    const indexName = indexName_ || constraintName_;

    // Add implicit local index for given columns if no such index exists yet
    const needle = localColumns.join('+');
    if (!this.indexes.some((index) => index.columns.join('+').startsWith(needle))) {
      // Don't add if a primary key already exists
      if (!(this.primaryKey && this.primaryKey.join('+').startsWith(needle))) {
        table = table.addIndex(indexName, 'NORMAL', localColumns, false);
      }
    } else if (indexName) {
      const pos = this.indexes.findIndex((i) => i.columns.join('+') === needle && !i.$$locked);
      if (pos >= 0) {
        const origIndex = table.indexes[pos];
        const indexes = [
          ...this.indexes.slice(0, pos),
          ...this.indexes.slice(pos + 1), // Cut out the index at pos
          // Update & push it at the end
          new Index(indexName, origIndex.columns, origIndex.type, origIndex.$$locked),
        ];
        table = new Table(
          table.name,
          this.defaultEncoding,
          table.columns,
          table.primaryKey,
          indexes,
          table.foreignKeys,
        );
      }
    }

    const constraintName = constraintName_ || this.generateForeignKeyName();
    const fk = new ForeignKey(constraintName, localColumns, {
      table: targetTblName,
      columns: targetColumns,
    });
    const foreignKeys = [...table.foreignKeys, fk];

    return new Table(table.name, this.defaultEncoding, table.columns, table.primaryKey, table.indexes, foreignKeys);
  }

  /**
   * Returns a new Table with the given FK dropped.
   */
  dropForeignKey(symbol: string): Table {
    if (!this.foreignKeys.some((fk) => fk.name === symbol)) {
      throw new Error(
        `Foreign key "${symbol}" does not exist on table "${this.name}". These do: ${this.foreignKeys
          .map((fk) => fk.name)
          .join(', ')}`,
      );
    }

    const foreignKeys = this.foreignKeys.filter((fk) => fk.name !== symbol);
    return new Table(this.name, this.defaultEncoding, this.columns, this.primaryKey, this.indexes, foreignKeys);
  }

  mapForeignKeys(mapper: (ForeignKey) => ForeignKey): Table {
    return new Table(
      this.name,
      this.defaultEncoding,
      this.columns,
      this.primaryKey,
      this.indexes,
      this.foreignKeys.map(mapper),
    );
  }

  /**
   * Generate an index name that will be unique.
   */
  generateIndexName(idealName: string): string {
    let indexName = idealName;

    // ...but attempt to add a counter value to avoid name clashes
    const existingIndexNames = new Set(this.indexes.map((i) => i.name));
    let counter = 1;
    while (existingIndexNames.has(indexName)) {
      indexName = `${idealName}_${++counter}`;
    }

    return indexName;
  }

  /**
   * Returns a new Table with the requested Index added.
   */
  addIndex(indexName_: string | null, type: IndexType, columns: Array<string>, $$locked: boolean): Table {
    // Make sure to check if all the columns exist
    columns.map((colName) => this.getColumn(colName));

    // If indexName is null, auto-generate it
    const indexName = !indexName_
      ? // Try to name it after the first column in the columns list...
        this.generateIndexName(columns[0])
      : indexName_;

    // If an index already exists for this column combination, reuse it (don't
    // create a new one).  An index will also be reused if the new index
    // definition is more specific (user_id, foo) will replace an existing
    // index on (user_id).
    const needle = columns.join('+');
    const pos = this.indexes.findIndex((i) => needle.startsWith(i.columns.join('+')) && !i.$$locked);
    let indexes = this.indexes;
    if (pos >= 0) {
      // Change the name and move it to the end of the indexes array
      indexes = [
        ...this.indexes.slice(0, pos),
        ...this.indexes.slice(pos + 1),
        new Index(indexName, columns, type, $$locked),
      ];
    } else {
      const index: Index = new Index(indexName, columns, type, $$locked);
      indexes = [...indexes, index];
    }

    return new Table(this.name, this.defaultEncoding, this.columns, this.primaryKey, indexes, this.foreignKeys);
  }

  dropIndex(indexName: string): Table {
    // TODO
    // Dropping an index that's still implicitly required by a FK should fail.
    // MySQL fails with "Cannot drop index \'user_id\': needed in a foreign key
    // constraint" here.

    if (!this.indexes.some((index) => index.name === indexName)) {
      throw new Error(
        `Index "${indexName}" does not exist on table "${this.name}". These do: ${this.indexes
          .map((index) => index.name)
          .join(', ')}`,
      );
    }

    const indexes = this.indexes.filter((index) => index.name !== indexName);
    return new Table(this.name, this.defaultEncoding, this.columns, this.primaryKey, indexes, this.foreignKeys);
  }

  renameIndex(oldIndexName: string, newIndexName: string): Table {
    const index = this.indexes.find((index) => index.name === oldIndexName);

    if (!index) {
      throw new Error(
        `Index "${oldIndexName}" does not exist on table "${this.name}". These do: ${this.indexes
          .map((index) => index.name)
          .join(', ')}`,
      );
    }

    const renamedIndex = index.patch({
      name: newIndexName,
    });
    const otherIndexes = this.indexes.filter((index) => index.name !== oldIndexName);

    return new Table(
      this.name,
      this.defaultEncoding,
      this.columns,
      this.primaryKey,
      [...otherIndexes, renamedIndex],
      this.foreignKeys,
    );
  }

  getNormalIndexes(): Array<Index> {
    return this.indexes.filter((i) => i.type === 'NORMAL');
  }

  getFullTextIndexes(): Array<Index> {
    return this.indexes.filter((i) => i.type === 'FULLTEXT');
  }

  getUniqueIndexes(): Array<Index> {
    return sortBy(
      this.indexes.filter((i) => i.type === 'UNIQUE'),

      // MySQL seems to output unique indexes on *NOT* NULL columns first, then
      // all NULLable unique column indexes. Let's mimick this behaviour in our
      // output
      (idx) => {
        const colName = idx.columns[0];
        const column = this.columns.find((c) => c.name === colName);
        return column && !column.nullable ? 0 : 1;
      },
    );
  }

  getForeignKeys(): Array<ForeignKey> {
    return sortBy(this.foreignKeys, (fk) => fk.name);
  }

  serializeDefinitions(): Array<string> {
    return [
      ...this.columns.map((col) => col.toString()),
      ...(this.primaryKey ? [`PRIMARY KEY (${this.primaryKey.map(escape).join(',')})`] : []),

      ...this.getUniqueIndexes().map((index) => index.toString()),
      ...this.getNormalIndexes().map((index) => index.toString()),
      ...this.getFullTextIndexes().map((index) => index.toString()),
      ...this.getForeignKeys().map((fk) => fk.toString()),
    ];
  }

  toSchema(): ROLRecordTypeInfo {
    const record = {};
    for (const col of this.columns) {
      try {
        record[col.name] = col.toSchema();
      } catch (e) {
        if (/Not yet supported/.test(e.message)) {
          // Just skip it for now
        } else {
          throw e;
        }
      }
    }
    return t.Record(record, this.name);
  }

  toString(): string {
    const indent = (line: string) => `  ${line}`;
    const options = [
      'ENGINE=InnoDB',
      `DEFAULT CHARSET=${this.defaultEncoding.charset}`,

      // MySQL only outputs it if it's explicitly different from what it would
      // use as a default collation for this charset
      this.defaultEncoding.collate !== getDefaultCollationForCharset(this.defaultEncoding.charset)
        ? `COLLATE=${this.defaultEncoding.collate}`
        : null,
    ];
    return [
      `CREATE TABLE \`${this.name}\` (`,
      this.serializeDefinitions().map(indent).join(',\n'),
      `) ${options.filter(Boolean).join(' ')};`,
    ].join('\n');
  }
}
