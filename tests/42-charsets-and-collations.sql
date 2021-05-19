--
-- PURPOSE
-- =======
-- This tests the effects of default charsets and collations, or overriding
-- them at the table or column levels.
--

/*

  t1:
      All defaults

  t2-t16:
      Test overrides at the table level. Here the examples are constructed to
      test:
        - No explicit collations
        - Explicit overrides of what is the default anyway
        - Explicit overrides to something that isn't the default

  t17-t31:
      Test overrides at the column level. Here the examples are constructed to
      test:
        - No explicit collations
        - Explicit overrides of what is the default anyway
        - Explicit overrides to something that isn't the default

 */

CREATE TABLE t01 (a VARCHAR(12));

CREATE TABLE t02 (a VARCHAR(12)) CHARACTER SET=latin1;
CREATE TABLE t03 (a VARCHAR(12)) COLLATE=latin1_swedish_ci;
CREATE TABLE t04 (a VARCHAR(12)) COLLATE=latin1_spanish_ci;
CREATE TABLE t05 (a VARCHAR(12)) CHARACTER SET=latin1 COLLATE=latin1_swedish_ci;
CREATE TABLE t06 (a VARCHAR(12)) CHARACTER SET=latin1 COLLATE=latin1_spanish_ci;

CREATE TABLE t07 (a VARCHAR(12)) CHARACTER SET utf8;
CREATE TABLE t08 (a VARCHAR(12)) COLLATE utf8_general_ci;
CREATE TABLE t09 (a VARCHAR(12)) COLLATE utf8_unicode_ci;
CREATE TABLE t10 (a VARCHAR(12)) CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE TABLE t11 (a VARCHAR(12)) CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE t12 (a VARCHAR(12)) CHARACTER SET=utf8mb4;
CREATE TABLE t13 (a VARCHAR(12)) COLLATE=utf8mb4_general_ci;
CREATE TABLE t14 (a VARCHAR(12)) COLLATE=utf8mb4_unicode_ci;
CREATE TABLE t15 (a VARCHAR(12)) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_general_ci;
CREATE TABLE t16 (a VARCHAR(12)) CHARACTER SET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE t17 (a VARCHAR(12) CHARACTER SET latin1);
CREATE TABLE t18 (a VARCHAR(12) COLLATE latin1_swedish_ci);
CREATE TABLE t19 (a VARCHAR(12) COLLATE latin1_spanish_ci);
CREATE TABLE t20 (a VARCHAR(12) CHARACTER SET latin1 COLLATE latin1_swedish_ci);
CREATE TABLE t21 (a VARCHAR(12) CHARACTER SET latin1 COLLATE latin1_spanish_ci);

CREATE TABLE t22 (a VARCHAR(12) CHARACTER SET utf8);
CREATE TABLE t23 (a VARCHAR(12) COLLATE utf8_general_ci);
CREATE TABLE t24 (a VARCHAR(12) COLLATE utf8_unicode_ci);
CREATE TABLE t25 (a VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_general_ci);
CREATE TABLE t26 (a VARCHAR(12) CHARACTER SET utf8 COLLATE utf8_unicode_ci);

CREATE TABLE t27 (a VARCHAR(12) CHARACTER SET utf8mb4);
CREATE TABLE t28 (a VARCHAR(12) COLLATE utf8mb4_general_ci);
CREATE TABLE t29 (a VARCHAR(12) COLLATE utf8mb4_unicode_ci);
CREATE TABLE t30 (a VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci);
CREATE TABLE t31 (a VARCHAR(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci);
