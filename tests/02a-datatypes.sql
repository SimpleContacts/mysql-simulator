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
  enabled BOOLEAN NOT NULL DEFAULT FALSE
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
  c12 timestamp(6) DEFAULT current_timestamp(6),
  c13 timestamp(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  c14 VARCHAR(36) NULL DEFAULT 'NULL',  -- The string NULL
  c15 VARCHAR(36) NULL DEFAULT NULL,
  c16 VARCHAR(36) NULL DEFAULT null,
  c17 VARCHAR(36) NOT NULL
);
