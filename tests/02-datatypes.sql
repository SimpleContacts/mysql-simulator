-- Test all different data types

CREATE TABLE aaa (
  c01 INT,
  c02 INT UNSIGNED,
  c03 TINYINT,
  c04 TINYINT UNSIGNED,
  c05 SMALLINT,
  c06 SMALLINT UNSIGNED,
  c07 VARCHAR(12) NULL,
  c08 VARCHAR(12) NOT NULL,
  c09 VARCHAR(12),
  c10 TEXT,
  -- c11 BLOB,
  c12 JSON,

  -- Timestamps in MySQL are weeeeird
  c13 TIMESTAMP,
  c14 TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  c15 TIMESTAMP NULL,
  c16 TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

  -- ENUMs
  c17 ENUM('A''B', "B", "C"),
  c18 ENUM('Strings \'with quotes\', or comma\'s,,, are fine!', '''', """"),

  -- BOOLEANs are really just TINYINT(1)s
  enabled BOOLEAN NOT NULL DEFAULT FALSE
);
