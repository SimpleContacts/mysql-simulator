CREATE TABLE aaa (id INT PRIMARY KEY);
CREATE TABLE bbb (
  a INT,
  FOREIGN KEY (a) REFERENCES aaa (id)
);

-- Now rename the `aaa.id` column. The FK reference in table `bbb` should now
-- also change.
ALTER TABLE aaa CHANGE COLUMN id a_id INT NOT NULL;
