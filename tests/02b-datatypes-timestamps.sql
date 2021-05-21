--
-- NOTE:
-- Some of the following column creations will only be valid when the
-- NO_ZERO_DATE flag is set in the global sql_mode setting. To check the flags,
-- run:
--
--     show variables like 'sql_mode';
--
-- To set the flags, run:
--
--     set global sql_mode = '...';
--


-- Timestamps in MySQL are weeeeird, so let's test all combinations
CREATE TABLE aaa (
  c01 timestamp,
  c02 timestamp DEFAULT CURRENT_TIMESTAMP,
  c03 timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Will fail when NO_ZERO_DATE is set
  -- c04 timestamp ON UPDATE CURRENT_TIMESTAMP,

  c05 timestamp NULL,
  c06 timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  c07 timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  c08 timestamp NULL ON UPDATE CURRENT_TIMESTAMP,

  -- Will fail when NO_ZERO_DATE is set
  -- c09 timestamp NOT NULL,
  c10 timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  c11 timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Will fail when NO_ZERO_DATE is set
  -- c12 timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP,

  c13 timestamp(6) DEFAULT CURRENT_TIMESTAMP(6),
  c14 timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  c15 timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);
