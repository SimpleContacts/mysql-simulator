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
