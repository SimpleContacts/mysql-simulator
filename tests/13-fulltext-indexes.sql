-- (1) As part of a CREATE TABLE
CREATE TABLE aaa (
  name1 VARCHAR(16),
  name2 VARCHAR(64),
  FULLTEXT xyz (name1, name2)
);

-- (2) As an "ADD FULLTEXT INDEX" alteration
CREATE TABLE bbb (
  name1 VARCHAR(16),
  name2 VARCHAR(64)
);

ALTER TABLE bbb ADD FULLTEXT xyz (name1, name2);

-- (3) As an "CREATE FULLTEXT INDEX" statement
CREATE TABLE ccc (
  name1 VARCHAR(16),
  name2 VARCHAR(64)
);

CREATE FULLTEXT INDEX xyz ON ccc (name1, name2);
