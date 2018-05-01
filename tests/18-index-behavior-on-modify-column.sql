CREATE TABLE aaa (id INT PRIMARY KEY);

-- Creates implicit index on (foo)
ALTER TABLE aaa ADD COLUMN foo INT DEFAULT NULL UNIQUE;

-- Should create a second implicit index on (foo)
ALTER TABLE aaa MODIFY COLUMN foo INT NOT NULL UNIQUE;
