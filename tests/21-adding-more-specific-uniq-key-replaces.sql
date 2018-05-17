CREATE TABLE aaa (
  a VARCHAR(16) NOT NULL,
  b TINYINT UNSIGNED NOT NULL,
  c VARCHAR(254) DEFAULT NULL,
  UNIQUE KEY key1 (a),
  UNIQUE KEY key2 (c)
);

-- Now make (a, b) unique (instead of just (a))
ALTER TABLE aaa ADD UNIQUE INDEX key3 (a, b);
