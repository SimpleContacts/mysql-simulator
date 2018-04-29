// @flow

import { stripIndent as sql } from 'common-tags';

import parseSql from '../../parser';
import { emptyDb } from '../core';
import { applySql, dumpDb } from '../lib';

function simulate(sql: string, tables = []): string {
  return dumpDb(
    applySql(emptyDb(), parseSql(sql, 'input.sql')),
    tables,
    /* includeAttrs = */ false,
  ).trim();
}

describe('simulation', () => {
  it('simple CREATE', () => {
    const input = 'CREATE TABLE a (user_id INT)';
    expect(simulate(input)).toEqual(sql`
      CREATE TABLE \`a\` (
        \`user_id\` int(11) DEFAULT NULL
      );
      `);
  });

  it('Foreign key creates local index implicitly', () => {
    const input = sql`
       CREATE TABLE lusers (id INT PRIMARY KEY);
       CREATE TABLE a (user_id INT);
       ALTER TABLE a ADD FOREIGN KEY (user_id) REFERENCES lusers (id);
    `;
    expect(simulate(input, ['a'])).toEqual(sql`
      CREATE TABLE \`a\` (
        \`user_id\` int(11) DEFAULT NULL,
        KEY \`user_id\` (\`user_id\`),
        CONSTRAINT \`a_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`lusers\` (\`id\`)
      );
      `);
  });
  it('Adding a second FK reuses local index', () => {
    const input = sql`
       CREATE TABLE lusers (id INT PRIMARY KEY);
       CREATE TABLE a (user_id INT);
       ALTER TABLE a ADD FOREIGN KEY (user_id) REFERENCES lusers (id);
       ALTER TABLE a ADD FOREIGN KEY (user_id) REFERENCES lusers (id);
    `;
    expect(simulate(input, ['a'])).toEqual(sql`
      CREATE TABLE \`a\` (
        \`user_id\` int(11) DEFAULT NULL,
        KEY \`user_id\` (\`user_id\`),
        CONSTRAINT \`a_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`lusers\` (\`id\`),
        CONSTRAINT \`a_ibfk_2\` FOREIGN KEY (\`user_id\`) REFERENCES \`lusers\` (\`id\`)
      );
      `);
  });
  it('Adding FK using a constraint', () => {
    const input = sql`
       CREATE TABLE lusers (id INT PRIMARY KEY);
       CREATE TABLE a (user_id INT);
       ALTER TABLE a ADD CONSTRAINT foo FOREIGN KEY (user_id) REFERENCES lusers (id);
    `;
    expect(simulate(input, ['a'])).toEqual(sql`
      CREATE TABLE \`a\` (
        \`user_id\` int(11) DEFAULT NULL,
        KEY \`foo\` (\`user_id\`),
        CONSTRAINT \`foo\` FOREIGN KEY (\`user_id\`) REFERENCES \`lusers\` (\`id\`)
      );
      `);
  });
  it('Same, but with FKs battling for the constraint name', () => {
    const input = sql`
       CREATE TABLE lusers (id INT PRIMARY KEY);
       CREATE TABLE a (user_id INT);
       ALTER TABLE a ADD CONSTRAINT foo FOREIGN KEY (user_id) REFERENCES lusers (id);
       ALTER TABLE a ADD CONSTRAINT bar FOREIGN KEY (user_id) REFERENCES lusers (id);
    `;
    expect(simulate(input, ['a'])).toEqual(sql`
      CREATE TABLE \`a\` (
        \`user_id\` int(11) DEFAULT NULL,
        KEY \`bar\` (\`user_id\`),
        CONSTRAINT \`bar\` FOREIGN KEY (\`user_id\`) REFERENCES \`lusers\` (\`id\`),
        CONSTRAINT \`foo\` FOREIGN KEY (\`user_id\`) REFERENCES \`lusers\` (\`id\`)
      );
      `);
  });
  it("Same, but with FKs battling for constraint name that's equal to given name", () => {
    const input = sql`
       CREATE TABLE lusers (id INT PRIMARY KEY);
       CREATE TABLE a (user_id INT);
       ALTER TABLE a ADD KEY qux (user_id);
       ALTER TABLE a ADD CONSTRAINT foo FOREIGN KEY (user_id) REFERENCES lusers (id);
       ALTER TABLE a ADD CONSTRAINT bar FOREIGN KEY (user_id) REFERENCES lusers (id);
    `;
    expect(simulate(input, ['a'])).toEqual(sql`
      CREATE TABLE \`a\` (
        \`user_id\` int(11) DEFAULT NULL,
        KEY \`qux\` (\`user_id\`),
        CONSTRAINT \`bar\` FOREIGN KEY (\`user_id\`) REFERENCES \`lusers\` (\`id\`),
        CONSTRAINT \`foo\` FOREIGN KEY (\`user_id\`) REFERENCES \`lusers\` (\`id\`)
      );
      `);
  });
});
