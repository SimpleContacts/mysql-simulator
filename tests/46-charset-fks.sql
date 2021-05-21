CREATE TABLE t1 (id VARCHAR(12) PRIMARY KEY) CHARACTER SET utf8;
CREATE TABLE t2 (id VARCHAR(12) PRIMARY KEY, a VARCHAR(12)) CHARACTER SET utf8;
ALTER TABLE t2
  ADD CONSTRAINT t2_a_fk
  FOREIGN KEY (a) REFERENCES t1 (id);

CREATE TABLE t3 (id VARCHAR(12) PRIMARY KEY) CHARACTER SET utf8;
CREATE TABLE t4 (id VARCHAR(12) PRIMARY KEY, a VARCHAR(12) CHARACTER SET utf8);
ALTER TABLE t4
  ADD CONSTRAINT t4_a_fk
  FOREIGN KEY (a) REFERENCES t3 (id);

ALTER TABLE t4 CONVERT TO CHARACTER SET utf8;
-- These should/will fail, when attempted, because there the key is used in
-- a FK relationship, and so the target column this is pointing too also needs
-- to be converted:
--     ALTER TABLE t4 CONVERT TO CHARACTER SET latin1;
--     ALTER TABLE t4 CONVERT TO CHARACTER SET utf8mb4;

ALTER TABLE t4 MODIFY a VARCHAR(12) COLLATE utf8_general_ci;
-- These will fail:
--     ALTER TABLE t4 MODIFY a VARCHAR(12) COLLATE utf8_unicode_ci;
--     ALTER TABLE t4 MODIFY a VARCHAR(12) COLLATE utf8mb4_unicode_ci;
