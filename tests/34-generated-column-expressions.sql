CREATE TABLE t1 (c1 INT);

-- Simple expression (number constants)
/* CREATE TABLE t1 ( */
/*   i2 INT AS (0), */
/*   i3 INT AS (1), */
/*   i4 INT UNSIGNED AS (0), */
/*   i5 INT UNSIGNED AS (1) */
/* ); */

/* CREATE TABLE t2 ( */
/*   b1 TINYINT(1) AS (false), */
/*   b2 TINYINT(1) AS (FALSE), */
/*   b3 TINYINT(1) AS (true), */
/*   b4 TINYINT(1) AS (TRUE) */
/* ); */

/* CREATE TABLE t2 (c1 INT NULL DEFAULT NULL GENERATED ALWAYS AS (0) VIRTUAL); */
/* CREATE TABLE t3 (c1 INT GENERATED ALWAYS AS (0) VIRTUAL NOT NULL); */
/* CREATE TABLE t3 (c1 INT GENERATED ALWAYS AS (1) VIRTUAL NOT NULL); */
/* CREATE TABLE t4 (c1 TINYINT(1) GENERATED ALWAYS AS (TRUE) VIRTUAL NOT NULL); */
/* CREATE TABLE t5 (c1 TINYINT(1) GENERATED ALWAYS AS (FALSE) VIRTUAL NOT NULL); */
/* CREATE TABLE t6 (c1 VARCHAR(64) GENERATED ALWAYS AS ('why, hello') VIRTUAL NOT NULL); */
/* CREATE TABLE t7 (c1 INT GENERATED ALWAYS AS (NULL) VIRTUAL) */

-- Simple expression (constant)
/* CREATE TABLE t1 (c1 INT, c2 INT GENERATED ALWAYS AS (c1) STORED); */

-- Basic math expression
/* CREATE TABLE t1 ( */
/*   i1 INT AS (-1), */
/*   i2 INT AS (i1 + -1), */
/* ); */

/* -- Simple expression (identifier) */
/* CREATE TABLE t2 (c1 INT, c2 INT GENERATED ALWAYS AS (c1) STORED); */

/* -- Simple expression */
/* CREATE TABLE t2 (c1 INT, c2 INT GENERATED ALWAYS AS (c1+1) STORED); */
