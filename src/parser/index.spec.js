const sqlParser = require('./index').sqlParser;
const resolve = require('path').resolve;

const doc = resolve(__dirname, '../mysql.doc');

describe('Read documentation', () => {
  it('can create "create table" parser', () => {
    const result = sqlParser(
      doc,
      `
      CREATE TABLE users (
        id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(128),
        email VARCHAR(64)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci
    `,
    );
    expect(result[0].create).toBe(true);
    expect(result[0].tbl_name).toBe('users');
  });
});
