CREATE TABLE t01 (c VARCHAR(12));
CREATE TABLE t02 (c VARCHAR(12) CHARACTER SET latin1);
CREATE TABLE t03 (c VARCHAR(12) CHARACTER SET utf8);
CREATE TABLE t04 (c VARCHAR(12) CHARACTER SET utf8mb4);
CREATE TABLE t05 (c VARCHAR(12) COLLATE latin1_spanish_ci);
CREATE TABLE t06 (c VARCHAR(12) COLLATE utf8_unicode_ci);
CREATE TABLE t07 (c VARCHAR(12) COLLATE utf8mb4_unicode_ci);
CREATE TABLE t08 (c VARCHAR(12)) CHARACTER SET latin1;
CREATE TABLE t09 (c VARCHAR(12)) CHARACTER SET utf8;
CREATE TABLE t10 (c VARCHAR(12)) CHARACTER SET utf8mb4;
CREATE TABLE t11 (c VARCHAR(12)) COLLATE latin1_spanish_ci;
CREATE TABLE t12 (c VARCHAR(12)) COLLATE utf8_unicode_ci;
CREATE TABLE t13 (c VARCHAR(12)) COLLATE utf8mb4_unicode_ci;

ALTER DATABASE __dbname__
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

CREATE TABLE t14 (c VARCHAR(12));
CREATE TABLE t15 (c VARCHAR(12) CHARACTER SET latin1);
CREATE TABLE t16 (c VARCHAR(12) CHARACTER SET utf8);
CREATE TABLE t17 (c VARCHAR(12) CHARACTER SET utf8mb4);
CREATE TABLE t18 (c VARCHAR(12) COLLATE latin1_spanish_ci);
CREATE TABLE t19 (c VARCHAR(12) COLLATE utf8_unicode_ci);
CREATE TABLE t20 (c VARCHAR(12) COLLATE utf8mb4_unicode_ci);
CREATE TABLE t21 (c VARCHAR(12)) CHARACTER SET latin1;
CREATE TABLE t22 (c VARCHAR(12)) CHARACTER SET utf8;
CREATE TABLE t23 (c VARCHAR(12)) CHARACTER SET utf8mb4;
CREATE TABLE t24 (c VARCHAR(12)) COLLATE latin1_spanish_ci;
CREATE TABLE t25 (c VARCHAR(12)) COLLATE utf8_unicode_ci;
CREATE TABLE t26 (c VARCHAR(12)) COLLATE utf8mb4_unicode_ci;

ALTER DATABASE __dbname__
  DEFAULT COLLATE latin1_spanish_ci;

CREATE TABLE t27 (c VARCHAR(12));
CREATE TABLE t28 (c VARCHAR(12) CHARACTER SET latin1);
CREATE TABLE t29 (c VARCHAR(12) CHARACTER SET utf8);
CREATE TABLE t30 (c VARCHAR(12) CHARACTER SET utf8mb4);
CREATE TABLE t31 (c VARCHAR(12) COLLATE latin1_spanish_ci);
CREATE TABLE t32 (c VARCHAR(12) COLLATE utf8_unicode_ci);
CREATE TABLE t33 (c VARCHAR(12) COLLATE utf8mb4_unicode_ci);
CREATE TABLE t34 (c VARCHAR(12)) CHARACTER SET latin1;
CREATE TABLE t35 (c VARCHAR(12)) CHARACTER SET utf8;
CREATE TABLE t36 (c VARCHAR(12)) CHARACTER SET utf8mb4;
CREATE TABLE t37 (c VARCHAR(12)) COLLATE latin1_spanish_ci;
CREATE TABLE t38 (c VARCHAR(12)) COLLATE utf8_unicode_ci;
CREATE TABLE t39 (c VARCHAR(12)) COLLATE utf8mb4_unicode_ci;

ALTER DATABASE __dbname__
  DEFAULT CHARACTER SET utf8;

CREATE TABLE t40 (c VARCHAR(12));
CREATE TABLE t41 (c VARCHAR(12) CHARACTER SET latin1);
CREATE TABLE t42 (c VARCHAR(12) CHARACTER SET utf8);
CREATE TABLE t43 (c VARCHAR(12) CHARACTER SET utf8mb4);
CREATE TABLE t44 (c VARCHAR(12) COLLATE latin1_spanish_ci);
CREATE TABLE t45 (c VARCHAR(12) COLLATE utf8_unicode_ci);
CREATE TABLE t46 (c VARCHAR(12) COLLATE utf8mb4_unicode_ci);
CREATE TABLE t47 (c VARCHAR(12)) CHARACTER SET latin1;
CREATE TABLE t48 (c VARCHAR(12)) CHARACTER SET utf8;
CREATE TABLE t49 (c VARCHAR(12)) CHARACTER SET utf8mb4;
CREATE TABLE t50 (c VARCHAR(12)) COLLATE latin1_spanish_ci;
CREATE TABLE t51 (c VARCHAR(12)) COLLATE utf8_unicode_ci;
CREATE TABLE t52 (c VARCHAR(12)) COLLATE utf8mb4_unicode_ci;
