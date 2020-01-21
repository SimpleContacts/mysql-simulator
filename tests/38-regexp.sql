CREATE TABLE t1 (
    id INT PRIMARY KEY,
    name VARCHAR(20),
    c2 TINYINT(1) AS (
        id LIKE '%1'
        AND (
            name REGEXP '^Harry'
            OR name RLIKE 'Potter$'
        )
    )
);
