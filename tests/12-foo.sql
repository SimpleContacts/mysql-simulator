CREATE TABLE aaa (id INT, PRIMARY KEY (id));

CREATE TABLE bbb (
  id INT PRIMARY KEY AUTO_INCREMENT,
  a INT,
  FOREIGN KEY (a) REFERENCES aaa (id)
);

CREATE INDEX name1 ON bbb (a);

-- Constraint should reuse, but not rename the index named "name1"
ALTER TABLE bbb
  ADD CONSTRAINT name2 FOREIGN KEY (a) REFERENCES aaa (id);
