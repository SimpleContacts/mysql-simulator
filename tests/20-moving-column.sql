CREATE TABLE aaa (
  c1 INT NOT NULL AUTO_INCREMENT,
  c3 varchar(254) DEFAULT NULL,
  a VARCHAR(16) NOT NULL,
  PRIMARY KEY (c1),
  UNIQUE KEY key1 (a)
);

ALTER TABLE aaa
  CHANGE a c2 VARCHAR(32) NOT NULL
  -- The "AFTER" bit is crucial: it moves "a" in between "c1" and "c3"
  -- It should not affect the existing index
  AFTER c1;
