-- Superfluous wrapping in parens
CREATE TABLE t1 (
    c1 INT AS ((1)),
    c2 INT AS ((((((((1))))))))
);

-- Unary operators
CREATE TABLE t2 (
    c1 INT AS (-1),
    c2 INT AS (-(1)),
    c3 INT AS ((-(1))),
    c4 INT AS (!1),
    c5 INT AS (+1),
    c6 INT AS (!+1),  -- #lolmysql
    c7 INT AS (+!1)   -- #lolmysql
);

-- Basic arithmetic expression
CREATE TABLE t3 (
    c1 INT AS (1 + 2),
    c2 INT AS (1 - 2),
    c3 INT AS (1 * 2),
    c4 INT AS (1 / 2),
    c5 INT AS (1 DIV 2),
    c6 INT AS (1 % 2),
    c7 INT AS (1 MOD 2)
);

-- Equal-level operator precedence
CREATE TABLE t4 (
    c1 INT AS (1 + 2 + 3),
    c2 INT AS (1 - 2 - 3),
    c3 INT AS (1 * 2 * 3),
    c4 INT AS (1 / 2 / 3),
    c5 INT AS (1 % 2 % 3),
    c6 INT AS (1 DIV 2 DIV 3),
    c7 INT AS (1 MOD 2 MOD 3)
);

-- Mixed-level operator precedence
CREATE TABLE t5 (
    c1 INT AS (1 * 2 + 3),
    c2 INT AS (1 - 2 * 3),
    c3 INT AS (1 * (2 + 3)),
    c4 INT AS ((1 - 2) * 3),
    c5 INT AS (1 + 2 * 3 / 4 - 5 % 6 DIV 7 MOD 8 + 9),
    c6 INT AS (1 - 2 / 3 * 4 + 5 DIV 6 MOD 7 % 8 - 9),
    c7 INT AS (1 - 2 / 3 * (4 + 5 DIV 6 MOD 7) % 8 - 9)
);
