-- Just to create _some_ output. The point is that the above query is parsed
-- and accepted.
CREATE TABLE t1 (
  id INT,
  a VARCHAR(12),
  b VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_general_ci,
  c VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  d TEXT,
  e TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci
);

ALTER DATABASE __dbname__
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- Just to create _some_ output. The point is that the above query is parsed
-- and accepted.
CREATE TABLE t2 (
  id INT,
  a VARCHAR(12),
  b VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_general_ci,
  c VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  d TEXT,
  e TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci
);
