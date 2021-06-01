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
        type: 'CREATE TABLE',
        tblName: 'users',
        ifNotExists: false,
        definitions: [
          {
            type: 'COLUMN',
            colName: 'id',
            definition: {
              dataType: { baseType: 'int', length: 11, unsigned: false },
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
            type: 'COLUMN',
            colName: 'date_created',
            definition: {
              dataType: { baseType: 'timestamp', fsp: null },
              defaultValue: 'CURRENT_TIMESTAMP',
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
            type: 'COLUMN',
            colName: 'name',
            definition: {
              dataType: { baseType: 'varchar', length: 128, encoding: null },
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
            type: 'COLUMN',
            colName: 'email',
            definition: {
              dataType: { baseType: 'varchar', length: 64, encoding: null },
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
          ENGINE: 'InnoDB',
          CHARSET: 'utf8',
          COLLATE: 'utf8_general_ci',
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
        type: 'CREATE TABLE',
        tblName: 'whatever',
        ifNotExists: false,
        definitions: [
          {
            type: 'COLUMN',
            colName: 'id',
            definition: {
              dataType: { baseType: 'int', length: 11, unsigned: false },
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
            type: 'COLUMN',
            colName: 'user_id',
            definition: {
              dataType: { baseType: 'int', length: 11, unsigned: false },
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
            type: 'COLUMN',
            colName: 'date_created',
            definition: {
              dataType: { baseType: 'timestamp', fsp: null },
              nullable: false,
              defaultValue: 'CURRENT_TIMESTAMP',
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
            type: 'COLUMN',
            colName: 'text',
            definition: {
              dataType: { baseType: 'varchar', length: 32, encoding: null },
              nullable: null,
              defaultValue: 'NULL',
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
            type: 'FOREIGN KEY',
            constraint: null,
            indexName: null,
            indexColNames: [
              {
                colName: 'user_id',
                direction: null,
                len: null,
              },
            ],
            reference: {
              tblName: 'users',
              indexColNames: [
                {
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
          ENGINE: 'InnoDB',
          CHARSET: 'utf8',
          COLLATE: 'utf8_bin',
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
        type: 'ALTER TABLE',
        tblName: 'products',
        changes: [
          { type: 'DROP COLUMN', colName: 'name' },
          { type: 'DROP COLUMN', colName: 'brand' },
          {
            type: 'ADD COLUMN',
            colName: 'foobar',
            definition: {
              dataType: { baseType: 'int', length: 11, unsigned: false },
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
            type: 'ADD FOREIGN KEY',
            constraint: null,
            indexName: null,
            indexColNames: [
              {
                colName: 'product_id',
                direction: null,
                len: null,
              },
            ],
            reference: {
              tblName: 'products',
              indexColNames: [
                {
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
            newIndexName: 'boofar_uniq',
            oldIndexName: 'foobar_uniq',
            type: 'RENAME INDEX',
          },
        ],
      },
    ]);
  });
});
