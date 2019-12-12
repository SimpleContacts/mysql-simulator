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

    x1 VARCHAR(20) AS (JSON_EXTRACT(c1, '$.type')),
    x2 VARCHAR(20) AS (c1 -> '$.type'),
    x3 VARCHAR(20) AS (c1 + c1 -> '$.type'),
    x4 VARCHAR(20) AS (c1 + (c1 -> '$.type')),
    x5 VARCHAR(20) AS (c1 ->> '$.type'),
    x6 BOOLEAN AS (c1 ->> '$.type' = 'CONTACTS')
);
