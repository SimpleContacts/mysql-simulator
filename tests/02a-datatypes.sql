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

  -- ENUMs
  c17 ENUM('A''B', "B", "C"),
  c18 ENUM('Strings \'with quotes\', or comma\'s,,, are fine!', '''', """"),

  -- BOOLEANs are really just TINYINT(1)s
  enabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- DECIMALs have specific precision
  c20 DECIMAL,
  c21 DECIMAL NOT NULL,
  c22 DECIMAL NOT NULL DEFAULT "0.0",
  c23 DECIMAL NOT NULL DEFAULT "123.45678",
  c24 DECIMAL(12, 6) NOT NULL DEFAULT "123.45678",
  c25 DECIMAL(10, 0),
  c26 DECIMAL(13, 2) DEFAULT "123.45678",

  -- NUMERIC is just an alias of DECIMAL
  c30 NUMERIC NOT NULL,
  c31 NUMERIC(13, 2) DEFAULT "123.45678"
);

CREATE TABLE bbb (
  c01 INT DEFAULT 1234,
  c02 BOOLEAN DEFAULT TRUE,
  c03 BOOLEAN DEFAULT false,
  c04 VARCHAR(36) DEFAULT "Test",
  c05 VARCHAR(36) DEFAULT "",
  c06 VARCHAR(36) DEFAULT "It's a default",
  c07 VARCHAR(36) DEFAULT 'It''s a default',
  c08 VARCHAR(36) DEFAULT 'It\'s a default',
  c09 timestamp DEFAULT now(),
  c10 timestamp DEFAULT current_timestamp ON UPDATE now(),
  c11 timestamp DEFAULT current_timestamp,
  c12 timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  c13 timestamp(6) DEFAULT current_timestamp(6),
  c14 timestamp(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  c15 timestamp(6) DEFAULT localtime(6) ON UPDATE now(6),
  c16 VARCHAR(36) NULL DEFAULT 'NULL',  -- The string NULL
  c17 VARCHAR(36) NULL DEFAULT NULL,
  c18 VARCHAR(36) NULL DEFAULT null,
  c19 VARCHAR(36) NOT NULL
);
