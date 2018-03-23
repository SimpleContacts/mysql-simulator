import { readFileSync as read } from 'fs';

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
            colName: 'id',
            definition: {
              dataType: 'INT',
              defaultValue: null,
              nullable: false,
              isPrimary: true,
              isUnique: false,
              autoIncrement: true,
              reference: null,
            },
          },
          {
            colName: 'date_created',
            definition: {
              dataType: 'TIMESTAMP',
              defaultValue: 'CURRENT_TIMESTAMP',
              nullable: false,
              isPrimary: false,
              autoIncrement: false,
              isUnique: false,
              reference: null,
            },
          },
          {
            colName: 'name',
            definition: {
              dataType: 'VARCHAR(128)',
              defaultValue: null,
              nullable: true,
              isPrimary: false,
              isUnique: false,
              autoIncrement: false,
              reference: null,
            },
          },
          {
            colName: 'email',
            definition: {
              dataType: 'VARCHAR(64)',
              defaultValue: null,
              nullable: true,
              isPrimary: false,
              autoIncrement: false,
              isUnique: false,
              reference: null,
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
            colName: 'id',
            definition: {
              dataType: 'INT(11)',
              nullable: false,
              defaultValue: null,
              isPrimary: true,
              autoIncrement: true,
              isUnique: false,
              reference: null,
            },
          },
          {
            colName: 'user_id',
            definition: {
              dataType: 'INT',
              nullable: false,
              defaultValue: null,
              isPrimary: false,
              autoIncrement: false,
              isUnique: false,
              reference: null,
            },
          },
          {
            colName: 'date_created',
            definition: {
              dataType: 'TIMESTAMP',
              nullable: false,
              defaultValue: 'CURRENT_TIMESTAMP',
              isPrimary: false,
              autoIncrement: false,
              isUnique: false,
              reference: null,
            },
          },
          {
            colName: 'text',
            definition: {
              dataType: 'VARCHAR(32)',
              nullable: true,
              defaultValue: 'NULL',
              isPrimary: false,
              autoIncrement: false,
              isUnique: false,
              reference: null,
            },
          },
          {
            type: 'FOREIGN KEY',
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
              onDelete: null,
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
        DROP COLUMN \`brand\`,
        ADD COLUMN \`foobar\` INT,
        ADD FOREIGN KEY (product_id) REFERENCES products(id);`),
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
              dataType: 'INT',
              autoIncrement: false,
              defaultValue: null,
              nullable: true,
              isPrimary: false,
              isUnique: false,
              reference: null,
            },
            after: null,
          },
          {
            type: 'FOREIGN KEY',
            constraint: null,
            indexName: null,
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
              onDelete: null,
              onUpdate: null,
            },
          },
        ],
      },
    ]);
  });

  it('Can parse our full example file', () => {
    const sql = read(`${__dirname}/test.sql`).toString();
    const result = parse(sql);
    expect(result.length).toBe(506); // 506 statements in there!
  });
});
