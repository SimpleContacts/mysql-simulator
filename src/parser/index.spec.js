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
        tblName: 'users',
        ifNotExists: false,
        definitions: [
          {
            _kind: 'Column',
            colName: 'id',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Int', length: 11, unsigned: false },
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
            colName: 'date_created',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Timestamp', fsp: null },
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
            colName: 'name',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'VarChar', length: 128, encoding: null },
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
            colName: 'email',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'VarChar', length: 64, encoding: null },
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
        tblName: 'whatever',
        ifNotExists: false,
        definitions: [
          {
            _kind: 'Column',
            colName: 'id',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Int', length: 11, unsigned: false },
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
            colName: 'user_id',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Int', length: 11, unsigned: false },
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
            colName: 'date_created',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Timestamp', fsp: null },
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
            colName: 'text',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'VarChar', length: 32, encoding: null },
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
        tblName: 'products',
        changes: [
          { _kind: 'AlterDropColumn', colName: 'name' },
          { _kind: 'AlterDropColumn', colName: 'brand' },
          {
            _kind: 'AlterAddColumn',
            colName: 'foobar',
            definition: {
              _kind: 'ColumnDefinition',
              dataType: { _kind: 'Int', length: 11, unsigned: false },
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
            newIndexName: 'boofar_uniq',
            oldIndexName: 'foobar_uniq',
          },
        ],
      },
    ]);
  });
});
