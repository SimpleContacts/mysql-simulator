CREATE TABLE aaa (
  id INT,
  user_id INT,
  type VARCHAR(16) NOT NULL
);

CREATE INDEX foo_idx ON aaa (user_id);
-- CREATE INDEX bar_idx ON aaa (user_id, type);

ALTER TABLE aaa RENAME INDEX foo_idx TO foobar_idx;
