CREATE TABLE aaa (id INT PRIMARY KEY);
CREATE TABLE bbb (id INT PRIMARY KEY);

CREATE TABLE ccc (
  a INT,
  b INT,
  FOREIGN KEY (a) REFERENCES aaa (id),
  FOREIGN KEY (b) REFERENCES bbb (id)
);

CREATE INDEX idx ON ccc (a);
