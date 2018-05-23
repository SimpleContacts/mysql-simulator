CREATE TABLE aaa (id INT PRIMARY KEY);

CREATE TABLE bbb (
  a INT NOT NULL,
  b VARCHAR(50) NOT NULL,
  KEY `b` (b),
  FOREIGN KEY (a) REFERENCES aaa (id)
);

-- Basically the same as `bbb`, but the indexes are declared in a different
-- order.  This should have no effect on the outcome.
CREATE TABLE ccc (
  a INT NOT NULL,
  b VARCHAR(50) NOT NULL,
  FOREIGN KEY (a) REFERENCES aaa (id),
  KEY `b` (b)
);
