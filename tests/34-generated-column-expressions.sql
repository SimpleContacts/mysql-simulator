-- Simple expression (number constants)
CREATE TABLE t1 (
  i2 INT AS (0),
  i3 INT AS (1),
  i4 INT UNSIGNED AS (0),
  i5 INT UNSIGNED AS (1)
);

CREATE TABLE t2 (
  b1 TINYINT(1) AS (false),
  b2 TINYINT(1) AS (FALSE),
  b3 TINYINT(1) AS (true),
  b4 TINYINT(1) AS (TRUE)
);

CREATE TABLE t3 (
  s1 TINYINT(1) AS ('hello'),
  s2 TINYINT(1) AS ("hi"),
  s3 TINYINT(1) AS ('HEY'),
  s4 TINYINT(1) AS ("I'm quoted"),
  s5 TINYINT(1) AS ('I\'m quoted'),
  s6 TINYINT(1) AS ('I''m quoted'),
  s7 TINYINT(1) AS ("""I'm quoted"", said someone")

  -- NOTE: The following one actually still doesn't get quoted correctly, but
  -- I'm not going to bother for now.  We need to move on.  Perhaps another
  -- time when the wounds on my forehead are healed.
  -- s8 TINYINT(1) AS ('''I am quoted, too'', said someone else''s cat')
);

CREATE TABLE t4 (
  c1 TINYINT(1) AS (NULL)
);
