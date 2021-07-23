// @flow strict

import parse from '.';

describe('Read documentation', () => {
  it('Parse CREATE TABLE #1', () => {
    expect(
      parse(`CREATE TABLE users (
            id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
            date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            name VARCHAR(128),
            email VARCHAR(64)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;`),
    ).toEqual([
      {
        _kind: 'CreateTableStatement',
        type: 'CREATE TABLE',
        tblName: 'users',
        ifNotExists: false,
        definitions: [
          {
            _kind: 'Column',
            type: 'COLUMN',
            colName: 'id',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Int', baseType: 'int', length: 11, unsigned: false },
              defaultValue: null,
              nullable: false,
              isPrimary: true,
              isUnique: false,
              autoIncrement: true,
              reference: null,
              onUpdate: null,
              comment: null,
              generated: null,
            },
          },
          {
            _kind: 'Column',
            type: 'COLUMN',
            colName: 'date_created',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Timestamp', baseType: 'timestamp', fsp: null },
              defaultValue: { _kind: 'CurrentTimestamp', precision: null },
              nullable: false,
              isPrimary: false,
              autoIncrement: false,
              isUnique: false,
              reference: null,
              onUpdate: null,
              comment: null,
              generated: null,
            },
          },
          {
            _kind: 'Column',
            type: 'COLUMN',
            colName: 'name',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'VarChar', baseType: 'varchar', length: 128, encoding: null },
              defaultValue: null,
              nullable: null,
              isPrimary: false,
              isUnique: false,
              autoIncrement: false,
              reference: null,
              onUpdate: null,
              comment: null,
              generated: null,
            },
          },
          {
            _kind: 'Column',
            type: 'COLUMN',
            colName: 'email',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'VarChar', baseType: 'varchar', length: 64, encoding: null },
              defaultValue: null,
              nullable: null,
              isPrimary: false,
              autoIncrement: false,
              isUnique: false,
              reference: null,
              onUpdate: null,
              comment: null,
              generated: null,
            },
          },
        ],
        options: {
          _kind: 'TableOptions',
          AUTO_INCREMENT: null,
          CHARSET: 'utf8',
          COLLATE: 'utf8_general_ci',
          ENGINE: 'InnoDB',
        },
      },
    ]);
  });

  it('Parse CREATE TABLE #2', () => {
    expect(
      parse(`
        CREATE TABLE whatever (
          id INT( 11 ) NOT NULL PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          text VARCHAR(32) DEFAULT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;`),
    ).toEqual([
      {
        _kind: 'CreateTableStatement',
        type: 'CREATE TABLE',
        tblName: 'whatever',
        ifNotExists: false,
        definitions: [
          {
            _kind: 'Column',
            type: 'COLUMN',
            colName: 'id',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Int', baseType: 'int', length: 11, unsigned: false },
              nullable: false,
              defaultValue: null,
              isPrimary: true,
              autoIncrement: true,
              isUnique: false,
              reference: null,
              onUpdate: null,
              comment: null,
              generated: null,
            },
          },
          {
            _kind: 'Column',
            type: 'COLUMN',
            colName: 'user_id',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Int', baseType: 'int', length: 11, unsigned: false },
              nullable: false,
              defaultValue: null,
              isPrimary: false,
              autoIncrement: false,
              isUnique: false,
              reference: null,
              onUpdate: null,
              comment: null,
              generated: null,
            },
          },
          {
            _kind: 'Column',
            type: 'COLUMN',
            colName: 'date_created',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Timestamp', baseType: 'timestamp', fsp: null },
              nullable: false,
              defaultValue: { _kind: 'CurrentTimestamp', precision: null },
              isPrimary: false,
              autoIncrement: false,
              isUnique: false,
              reference: null,
              onUpdate: null,
              comment: null,
              generated: null,
            },
          },
          {
            _kind: 'Column',
            type: 'COLUMN',
            colName: 'text',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'VarChar', baseType: 'varchar', length: 32, encoding: null },
              nullable: null,
              defaultValue: {
                _kind: 'Literal',
                value: null,
              },
              isPrimary: false,
              autoIncrement: false,
              isUnique: false,
              reference: null,
              onUpdate: null,
              comment: null,
              generated: null,
            },
          },
          {
            _kind: 'ForeignKey',
            type: 'FOREIGN KEY',
            constraintName: null,
            indexName: null,
            indexColNames: [
              {
                _kind: 'IndexColName',
                colName: 'user_id',
                direction: null,
                len: null,
              },
            ],
            reference: {
              _kind: 'ReferenceDefinition',
              tblName: 'users',
              indexColNames: [
                {
                  _kind: 'IndexColName',
                  colName: 'id',
                  direction: null,
                  len: null,
                },
              ],
              matchMode: null,
              onDelete: 'RESTRICT',
              onUpdate: null,
            },
          },
        ],
        options: {
          _kind: 'TableOptions',
          AUTO_INCREMENT: null,
          CHARSET: 'utf8',
          COLLATE: 'utf8_bin',
          ENGINE: 'InnoDB',
        },
      },
    ]);
  });

  it('Parse ALTER TABLE #1', () => {
    expect(
      parse(`ALTER TABLE products
        DROP COLUMN name,
        DROP \`brand\`,
        ADD COLUMN \`foobar\` INT,
        ADD FOREIGN KEY (product_id) REFERENCES products(id),
        RENAME INDEX \`foobar_uniq\` TO \`boofar_uniq\`;`),
    ).toEqual([
      {
        _kind: 'AlterTableStatement',
        type: 'ALTER TABLE',
        tblName: 'products',
        changes: [
          { _kind: 'AlterDropColumn', type: 'DROP COLUMN', colName: 'name' },
          { _kind: 'AlterDropColumn', type: 'DROP COLUMN', colName: 'brand' },
          {
            _kind: 'AlterAddColumn',
            type: 'ADD COLUMN',
            colName: 'foobar',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Int', baseType: 'int', length: 11, unsigned: false },
              autoIncrement: false,
              defaultValue: null,
              nullable: null,
              isPrimary: false,
              isUnique: false,
              reference: null,
              onUpdate: null,
              comment: null,
              generated: null,
            },
            position: null,
          },
          {
            _kind: 'AlterAddForeignKey',
            type: 'ADD FOREIGN KEY',
            constraintName: null,
            indexName: null,
            indexColNames: [
              {
                _kind: 'IndexColName',
                colName: 'product_id',
                direction: null,
                len: null,
              },
            ],
            reference: {
              _kind: 'ReferenceDefinition',
              tblName: 'products',
              indexColNames: [
                {
                  _kind: 'IndexColName',
                  colName: 'id',
                  direction: null,
                  len: null,
                },
              ],
              matchMode: null,
              onDelete: 'RESTRICT',
              onUpdate: null,
            },
          },
          {
            _kind: 'AlterRenameIndex',
            type: 'RENAME INDEX',
            newIndexName: 'boofar_uniq',
            oldIndexName: 'foobar_uniq',
          },
        ],
      },
    ]);
  });
});
