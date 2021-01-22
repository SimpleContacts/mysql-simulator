CREATE TABLE bbb (
  id INT PRIMARY KEY
);

CREATE TABLE aaa (
  id INT,
  bbb_id INT,
  type VARCHAR(16) NOT NULL,
  FOREIGN KEY (bbb_id) REFERENCES bbb (id)
);

CREATE INDEX foo_idx ON aaa (`type`);

ALTER TABLE aaa
  ADD CONSTRAINT bbb_id_type_uniq
  UNIQUE (`bbb_id`, `type`);


-- rename the basic index
ALTER TABLE aaa RENAME INDEX foo_idx TO foobar_idx;

-- rename the unique index
ALTER TABLE aaa RENAME INDEX bbb_id_type_uniq TO bbb_id_type_uniq2;
