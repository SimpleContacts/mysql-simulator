CREATE TABLE bbb (
  id INT PRIMARY KEY
);

CREATE TABLE aaa (
  id INT,
  bbb_id INT,
  FOREIGN KEY (bbb_id) REFERENCES bbb (id)
);

-- rename the implicitly-created index from the foreign key
ALTER TABLE aaa RENAME INDEX bbb_id TO bbb_id2;
