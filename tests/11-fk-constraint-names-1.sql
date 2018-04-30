CREATE TABLE aaa (id INT, PRIMARY KEY (id));

-- (1) Name via CONSTRAINT clause
CREATE TABLE bbb (
  id INT PRIMARY KEY,
  a INT NOT NULL,
  CONSTRAINT xyz FOREIGN KEY (a) REFERENCES aaa (id)
);

-- (2) Name via index name clause
CREATE TABLE ccc (
  id INT PRIMARY KEY,
  a INT NOT NULL,
  FOREIGN KEY xyz (a) REFERENCES aaa (id)
);
