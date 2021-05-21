CREATE TABLE aaa (id INT, PRIMARY KEY (id));

CREATE TABLE bbb (
  id INT PRIMARY KEY,
  a INT NOT NULL,
  CONSTRAINT bbb_a_fk FOREIGN KEY (a) REFERENCES aaa (id) ON DELETE CASCADE 
  --                                                      ^^^^^^^^^^^^^^^^^
);

CREATE TABLE ccc (
  id INT PRIMARY KEY,
  a INT,
  CONSTRAINT ccc_a_fk FOREIGN KEY (a) REFERENCES aaa (id) ON DELETE SET NULL
  --                                                      ^^^^^^^^^^^^^^^^^^
);

CREATE TABLE ddd (
  id INT PRIMARY KEY,
  a INT NULL,
  CONSTRAINT ddd_a_fk FOREIGN KEY (a) REFERENCES aaa (id) ON DELETE RESTRICT
  --                                                      ^^^^^^^^^^^^^^^^^^
);
