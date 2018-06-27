CREATE TABLE aaa (id INT PRIMARY KEY);

-- Doing an explicit, yet unnamed, UNIQUE *and* an FK on the same column
CREATE TABLE bbb1 (
  a INT NOT NULL,
  UNIQUE KEY (a),
  CONSTRAINT bbb1_fk FOREIGN KEY (a) REFERENCES aaa (id)
);

-- Doing an explicit, yet unnamed, INDEX *and* an FK on the same column
CREATE TABLE ccc1 (
  a INT NOT NULL,
  KEY (a),
  CONSTRAINT ccc1_fk FOREIGN KEY (a) REFERENCES aaa (id)
);

-- Doing an explicit, yet unnamed, PRIMARY *and* an FK on the same column
CREATE TABLE ddd1 (
  a INT NOT NULL,
  PRIMARY KEY (a),
  CONSTRAINT ddd1_fk FOREIGN KEY (a) REFERENCES aaa (id)
);

CREATE TABLE bbb2 (a INT NOT NULL, UNIQUE KEY (a));
ALTER TABLE bbb2 ADD CONSTRAINT bbb2_fk FOREIGN KEY (a) REFERENCES aaa (id);

CREATE TABLE ccc2 (a INT NOT NULL, KEY (a));
ALTER TABLE ccc2 ADD CONSTRAINT ccc2_fk FOREIGN KEY (a) REFERENCES aaa (id);

CREATE TABLE ddd2 (a INT NOT NULL, PRIMARY KEY (a));
ALTER TABLE ddd2 ADD CONSTRAINT ddd2_fk FOREIGN KEY (a) REFERENCES aaa (id);

-- Using shorthand with UNIQUE
CREATE TABLE bbb3 (
  a INT NOT NULL UNIQUE,
  CONSTRAINT bbb3_fk FOREIGN KEY (a) REFERENCES aaa (id)
);

-- Using shorthand with PRIMARY
CREATE TABLE ddd3 (
  a INT NOT NULL PRIMARY KEY,
  CONSTRAINT ddd3_fk FOREIGN KEY (a) REFERENCES aaa (id)
);
