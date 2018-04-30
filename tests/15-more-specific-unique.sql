CREATE TABLE aaa (id INT PRIMARY KEY);

-- (1)
CREATE TABLE ccc (
  id INT PRIMARY KEY,
  a INT,
  b INT,

  -- Addition of this FK will create implicit key1
  FOREIGN KEY key1 (a) REFERENCES aaa (id),
  FOREIGN KEY key2 (b) REFERENCES aaa (id),

  -- Addition of UNIQUE index will remove implicit key1 in favor of richer key3
  UNIQUE KEY key3 (a, b)
);

-- (2) Same as above, but now with manually added key0
CREATE TABLE ddd (
  id INT PRIMARY KEY,
  a INT,
  b INT,

  INDEX key0 (a),
  FOREIGN KEY key1 (a) REFERENCES aaa (id),
  FOREIGN KEY key2 (b) REFERENCES aaa (id),
  UNIQUE KEY key3 (a, b)
);
