CREATE TABLE aaa (id INT, PRIMARY KEY (id));

CREATE TABLE bbb (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  a INT NOT NULL,
  b VARCHAR(50) NOT NULL,

  -- Even though key `a` is defined before `b`, in the resulting output, MySQL
  -- emits `b` before `a`.
  FOREIGN KEY (a) REFERENCES aaa (id),
  KEY `b` (b)
);
