--
-- PURPOSE
-- =======
-- This tests the effects of globally changing the default character set and
-- collation for this database
--

CREATE TABLE t1 (
  id INT,
  a1 VARCHAR(12),
  a2 VARCHAR(12) COLLATE latin1_spanish_ci,
  b1 VARCHAR(12) CHARACTER SET utf8,                                -- Implicit default collation for utf8
  b2 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_general_ci,        -- Explicit default collation for utf8
  b3 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_unicode_ci,        -- Explicitly non-default collation
  c1 VARCHAR(12) CHARACTER SET utf8mb4,                             -- Implicit default collation for utf8mb4
  c2 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,  -- Explicit default collation for utf8mb4
  c3 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,  -- Explicitly non-default collation
  d TEXT,
  e TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci
);

CREATE TABLE t2 (
  id INT,
  a1 VARCHAR(12),
  a2 VARCHAR(12) COLLATE latin1_spanish_ci,
  b1 VARCHAR(12) CHARACTER SET utf8,                                -- Implicit default collation for utf8
  b2 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_general_ci,        -- Explicit default collation for utf8
  b3 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_unicode_ci,        -- Explicitly non-default collation
  c1 VARCHAR(12) CHARACTER SET utf8mb4,                             -- Implicit default collation for utf8mb4
  c2 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,  -- Explicit default collation for utf8mb4
  c3 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,  -- Explicitly non-default collation
  d TEXT,
  e TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci
) COLLATE=utf8mb4_unicode_ci;

CREATE TABLE t3 (
  id INT,
  a1 VARCHAR(12),
  a2 VARCHAR(12) COLLATE latin1_spanish_ci,
  b1 VARCHAR(12) CHARACTER SET utf8,                                -- Implicit default collation for utf8
  b2 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_general_ci,        -- Explicit default collation for utf8
  b3 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_unicode_ci,        -- Explicitly non-default collation
  c1 VARCHAR(12) CHARACTER SET utf8mb4,                             -- Implicit default collation for utf8mb4
  c2 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,  -- Explicit default collation for utf8mb4
  c3 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,  -- Explicitly non-default collation
  d TEXT,
  e TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci
) COLLATE=utf8mb4_general_ci;

ALTER DATABASE __dbname__
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- This is the exact same table definition as t1, but this time the global
-- encoding have changed for this database, so the outputted results won't be
-- the same.
CREATE TABLE t4 (
  id INT,
  a1 VARCHAR(12),
  a2 VARCHAR(12) COLLATE latin1_spanish_ci,
  b1 VARCHAR(12) CHARACTER SET utf8,                                -- Implicit default collation for utf8
  b2 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_general_ci,        -- Explicit default collation for utf8
  b3 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_unicode_ci,        -- Explicitly non-default collation
  c1 VARCHAR(12) CHARACTER SET utf8mb4,                             -- Implicit default collation for utf8mb4
  c2 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,  -- Explicit default collation for utf8mb4
  c3 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,  -- Explicitly non-default collation
  d TEXT,
  e TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci
);

CREATE TABLE t5 (
  id INT,
  a1 VARCHAR(12),
  a2 VARCHAR(12) COLLATE latin1_spanish_ci,
  b1 VARCHAR(12) CHARACTER SET utf8,                                -- Implicit default collation for utf8
  b2 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_general_ci,        -- Explicit default collation for utf8
  b3 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_unicode_ci,        -- Explicitly non-default collation
  c1 VARCHAR(12) CHARACTER SET utf8mb4,                             -- Implicit default collation for utf8mb4
  c2 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,  -- Explicit default collation for utf8mb4
  c3 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,  -- Explicitly non-default collation
  d TEXT,
  e TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci
) COLLATE=utf8mb4_unicode_ci;

CREATE TABLE t6 (
  id INT,
  a1 VARCHAR(12),
  a2 VARCHAR(12) COLLATE latin1_spanish_ci,
  b1 VARCHAR(12) CHARACTER SET utf8,                                -- Implicit default collation for utf8
  b2 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_general_ci,        -- Explicit default collation for utf8
  b3 VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_unicode_ci,        -- Explicitly non-default collation
  c1 VARCHAR(12) CHARACTER SET utf8mb4,                             -- Implicit default collation for utf8mb4
  c2 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,  -- Explicit default collation for utf8mb4
  c3 VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,  -- Explicitly non-default collation
  d TEXT,
  e TEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci
) COLLATE=utf8mb4_general_ci;
