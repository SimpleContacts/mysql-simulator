-- Simple expression (identifiers)
CREATE TABLE t1 (
    c1 INT,
    c2 INT AS (c1),
    c3 INT AS (c1 + 1)
);

-- Comparison operators
CREATE TABLE t2 (
    c1 INT,

    c2 BOOLEAN AS (c1 = 0),
    c3 BOOLEAN AS (c1 > 0),
    c4 BOOLEAN AS (c1 >= 0),
    c5 BOOLEAN AS (c1 < 0),
    c6 BOOLEAN AS (c1 <= 0),
    c7 BOOLEAN AS (c1 <> 0),
    c8 BOOLEAN AS (c1 != 0),

    n1 BOOLEAN AS (c1 IS NULL),
    n2 BOOLEAN AS (c1 IS NOT NULL),

    b1 BOOLEAN AS (c1 IS NOT NULL AND c2 IS NOT NULL),
    b2 BOOLEAN AS (c1 IS NULL OR c2 IS NOT NULL),
    b3 BOOLEAN AS (c1 XOR c2),
    b4 BOOLEAN AS (COALESCE(c1, 'foo') XOR COALESCE(c2, 'bar')),
    b5 BOOLEAN AS (true XOR false),
    b6 BOOLEAN AS (1 XOR 0),
    b7 BOOLEAN AS ('true' XOR 'false'),
    b8 BOOLEAN AS (null XOR (1=1)),

    x1 VARCHAR(20) AS (JSON_EXTRACT(c1, '$.type')),
    x2 VARCHAR(20) AS (c1 -> '$.type'),
    x3 VARCHAR(20) AS (c1 + c1 -> '$.type'),
    x4 VARCHAR(20) AS (c1 + (c1 -> '$.type')),
    x5 VARCHAR(20) AS (c1 ->> '$.type'),
    x6 BOOLEAN AS (c1 ->> '$.type' = 'foo'),

    y1 VARCHAR(12) AS (IF(c1 IS NOT NULL, 'foo', 'bar')),
    y2 VARCHAR(12) AS (IF(c1, NULL, 'bar')),
    y3 VARCHAR(64) AS (concat_ws(' ',trim(`x1`),trim(`x2`)))
);
