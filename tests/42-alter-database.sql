ALTER DATABASE __dbname__
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- Just to create _some_ output. The point is that the above query is parsed
-- and accepted.
CREATE TABLE t1 (id INT);
