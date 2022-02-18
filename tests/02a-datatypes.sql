-- Test all different data types

CREATE TABLE aaa (
  i01 INT,
  i02 INT UNSIGNED,
  i03 INT(10),
  i04 INT(11) UNSIGNED,
  i05 INT(11),
  i06 INT(10) UNSIGNED,

  i07 TINYINT,
  i08 TINYINT UNSIGNED,
  i09 TINYINT(1),
  i10 TINYINT(1) UNSIGNED,
  i11 TINYINT(3),
  i12 TINYINT(4) UNSIGNED,
  i13 TINYINT(4),
  i14 TINYINT(3) UNSIGNED,

  i15 SMALLINT,
  i16 SMALLINT UNSIGNED,
  i17 SMALLINT(5),
  i18 SMALLINT(6) UNSIGNED,
  i19 SMALLINT(6),
  i20 SMALLINT(5) UNSIGNED,

  i21 MEDIUMINT,
  i22 MEDIUMINT UNSIGNED,
  i23 MEDIUMINT(8),
  i24 MEDIUMINT(9) UNSIGNED,
  i25 MEDIUMINT(9),
  i26 MEDIUMINT(8) UNSIGNED,

  i27 BIGINT,
  i28 BIGINT UNSIGNED,
  i29 BIGINT(19),
  i30 BIGINT(20) UNSIGNED,
  i31 BIGINT(20),
  i32 BIGINT(19) UNSIGNED,

  t1 VARCHAR(12) NULL,
  t2 VARCHAR(12) NOT NULL,
  t3 VARCHAR(12),
  t4 TEXT,

  -- c11 BLOB,
  j1 JSON,

  -- ENUMs
  e1 ENUM('A''B', "B", "C"),
  e2 ENUM('Strings \'with quotes\', or comma\'s,,, are fine!', '''', """"),

  -- BOOLEANs are really just TINYINT(1)s
  enabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- DECIMALs have specific precision
  d1 DECIMAL,
  d2 DECIMAL NOT NULL,
  d3 DECIMAL NOT NULL DEFAULT "0.0",
  d4 DECIMAL NOT NULL DEFAULT "123.45678",
  d5 DECIMAL(12, 6) NOT NULL DEFAULT "123.45678",
  d6 DECIMAL(10, 0),
  d7 DECIMAL(13, 2) DEFAULT "123.45678",

  -- NUMERIC is just an alias of DECIMAL
  d8 NUMERIC NOT NULL,
  d9 NUMERIC(13, 2) DEFAULT "123.45678"
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
