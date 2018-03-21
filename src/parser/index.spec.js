import { readFileSync as read, writeFileSync as write } from 'fs';

import parse from '.';

// Triggers are problemsome .replace(/CREATE\s+(TRIGGER|FUNCTION)(.|\s)+END;/, '')
const sql = read(`${__dirname}/test.sql`).toString();

describe('Read documentation', () => {
  it('Parse ALTER TABLE and CREATE statements', () => {
    try {
      expect(
        parse(`CREATE TABLE users (
            id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
            date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            name VARCHAR(128),
            email VARCHAR(64)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;`),
      ).toEqual([
        {
          type: 'CREATE',
          name: 'users',
          definitions: [
            {
              type: 'COLUMN',
              name: 'id',
              columnType: { type: 'INT', size: null },
              attrs: ['NOT NULL', 'PRIMARY KEY', 'AUTO_INCREMENT'],
            },
            {
              type: 'COLUMN',
              name: 'date_created',
              columnType: { type: 'TIMESTAMP', size: null },
              attrs: [
                'NOT NULL',
                { DEFAULT: { type: 'CURRENT_TIMESTAMP', length: null } },
              ],
            },
            {
              type: 'COLUMN',
              name: 'name',
              columnType: { type: 'VARCHAR', size: ['128'] },
              attrs: [],
            },
            {
              type: 'COLUMN',
              name: 'email',
              columnType: { type: 'VARCHAR', size: ['64'] },
              attrs: [],
            },
          ],
          tableOptions: [
            { key: 'ENGINE', value: 'InnoDB' },
            'DEFAULT',
            { key: 'CHARSET', value: 'utf8' },
            { key: 'COLLATE', value: 'utf8_general_ci' },
          ],
        },
      ]);

      expect(
        parse(`CREATE TABLE scripts (
              id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
              user_id INT NOT NULL,
              product_id INT NOT NULL,
              date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              left_power VARCHAR(32) DEFAULT NULL,
              left_bc VARCHAR(32) DEFAULT NULL,
              left_diameter VARCHAR(32) DEFAULT NULL,
              left_cyl VARCHAR(32) DEFAULT NULL,
              left_axis VARCHAR(32) DEFAULT NULL,
              left_ot VARCHAR(32) DEFAULT NULL,
              right_power VARCHAR(32) DEFAULT NULL,
              right_bc VARCHAR(32) DEFAULT NULL,
              right_diameter VARCHAR(32) DEFAULT NULL,
              right_cyl VARCHAR(32) DEFAULT NULL,
              right_axis VARCHAR(32) DEFAULT NULL,
              right_ot VARCHAR(32) DEFAULT NULL,
              FOREIGN KEY (user_id) REFERENCES users(id),
              FOREIGN KEY (product_id) REFERENCES products(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;`),
      ).toEqual([
        {
          definitions: [
            {
              attrs: ['NOT NULL', 'PRIMARY KEY', 'AUTO_INCREMENT'],
              columnType: { size: null, type: 'INT' },
              name: 'id',
              type: 'COLUMN',
            },
            {
              attrs: ['NOT NULL'],
              columnType: { size: null, type: 'INT' },
              name: 'user_id',
              type: 'COLUMN',
            },
            {
              attrs: ['NOT NULL'],
              columnType: { size: null, type: 'INT' },
              name: 'product_id',
              type: 'COLUMN',
            },
            {
              attrs: [
                'NOT NULL',
                { DEFAULT: { type: 'CURRENT_TIMESTAMP', length: null } },
              ],
              columnType: { size: null, type: 'TIMESTAMP' },
              name: 'date_created',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'left_power',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'left_bc',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'left_diameter',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'left_cyl',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'left_axis',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'left_ot',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'right_power',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'right_bc',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'right_diameter',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'right_cyl',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'right_axis',
              type: 'COLUMN',
            },
            {
              attrs: [{ DEFAULT: 'NULL' }],
              columnType: { size: ['32'], type: 'VARCHAR' },
              name: 'right_ot',
              type: 'COLUMN',
            },
            {
              foreignColumn: 'id',
              foreignTable: 'users',
              localColumn: 'user_id',
              type: 'FOREIGN KEY',
              name: null,
            },
            {
              foreignColumn: 'id',
              foreignTable: 'products',
              localColumn: 'product_id',
              type: 'FOREIGN KEY',
              name: null,
            },
          ],
          name: 'scripts',
          tableOptions: [
            { key: 'ENGINE', value: 'InnoDB' },
            'DEFAULT',
            { key: 'CHARSET', value: 'utf8' },
            { key: 'COLLATE', value: 'utf8_bin' },
          ],
          type: 'CREATE',
        },
      ]);

      expect(
        parse(`ALTER TABLE products
        DROP COLUMN name,
        DROP COLUMN brand,
        DROP COLUMN img_url,
        DROP COLUMN options_power,
        DROP COLUMN options_bc,
        DROP COLUMN options_diameter,
        DROP COLUMN options_cyl,
        DROP COLUMN options_axis,
        DROP COLUMN options_ot,
        DROP COLUMN description,
        DROP COLUMN num_days_per_lens,
        ADD COLUMN parent_product_id INT,
        ADD CONSTRAINT fk_parent_product_id
          FOREIGN KEY (parent_product_id)
          REFERENCES products(id);`),
      ).toEqual([
        {
          changes: [
            { column: 'name', type: 'DROP' },
            { column: 'brand', type: 'DROP' },
            { column: 'img_url', type: 'DROP' },
            { column: 'options_power', type: 'DROP' },
            { column: 'options_bc', type: 'DROP' },
            { column: 'options_diameter', type: 'DROP' },
            { column: 'options_cyl', type: 'DROP' },
            { column: 'options_axis', type: 'DROP' },
            { column: 'options_ot', type: 'DROP' },
            { column: 'description', type: 'DROP' },
            { column: 'num_days_per_lens', type: 'DROP' },
            {
              column: 'parent_product_id',
              columnType: { type: 'INT', size: null },
              attrs: [],
              type: 'ADD',
            },
            {
              foreignColumn: 'id',
              foreignTable: 'products',
              localColumn: 'parent_product_id',
              name: 'fk_parent_product_id',
              type: 'FOREIGN KEY',
            },
          ],
          type: 'ALTER',
        },
      ]);
      const result = parse(sql);
      write('./example.ast.json', JSON.stringify(result, null, 2));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e.location);
      throw e;
    }
  });
});
