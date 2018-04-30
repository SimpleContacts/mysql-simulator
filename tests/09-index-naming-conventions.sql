CREATE TABLE aaa (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  a VARCHAR(16) NOT NULL,
  b VARCHAR(64) NOT NULL,
  c VARCHAR(16) NOT NULL
);

-- Even though a name is given here ("xyz") the name that MySQL uses is "c"
ALTER TABLE aaa ADD UNIQUE xyz (c, a, b);
