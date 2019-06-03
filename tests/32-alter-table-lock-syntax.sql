CREATE TABLE aaa (id INT NOT NULL);

ALTER TABLE aaa ADD PRIMARY KEY (id), LOCK=SHARED;
--                                    ^^^^^^^^^^^ This
