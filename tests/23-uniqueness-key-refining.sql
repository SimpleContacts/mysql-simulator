CREATE TABLE aaa (id INT PRIMARY KEY);

CREATE TABLE xyz (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  a INT NULL DEFAULT NULL,
  b VARCHAR(254),
  KEY a (a),
  CONSTRAINT a FOREIGN KEY (a) REFERENCES aaa (id)
);

-- Create a unique index on (b) first
ALTER TABLE xyz ADD UNIQUE key1 (b);

-- Then create one on (b, a). The resulting table should have two UNIQUE indexes
ALTER TABLE xyz ADD UNIQUE INDEX key2 (b, a);
