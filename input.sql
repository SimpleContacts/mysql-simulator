CREATE TABLE users (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(128),
  email VARCHAR(64)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE mailing_list (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  email VARCHAR(64) UNIQUE,
  UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE user_tokens (
  token VARCHAR(128) NOT NULL PRIMARY KEY,
  type VARCHAR(12) NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE exams (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  audio_url VARCHAR(128) NOT NULL,
  video_url VARCHAR(128) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE products (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  name VARCHAR(64) DEFAULT NULL,
  brand VARCHAR(64) DEFAULT NULL,
  img_url VARCHAR(128) DEFAULT NULL,
  options_power VARCHAR(2048),
  options_bc VARCHAR(2048),
  options_diameter VARCHAR(2048),
  options_cyl VARCHAR(2048),
  options_axis VARCHAR(2048),
  options_ot VARCHAR(2048),
  price_retail DECIMAL(13,2) DEFAULT 0,
  price_wholesale DECIMAL(13,2) DEFAULT 0,
  aab_code VARCHAR(12) NOT NULL DEFAULT '',
  description TEXT DEFAULT NULL,
  num_days_per_lens SMALLINT UNSIGNED DEFAULT 0,
  num_lenses SMALLINT UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE scripts (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_power VARCHAR(32) DEFAULT NULL,
  left_bc VARCHAR(32) DEFAULT NULL,
  left_diameter VARCHAR(32) DEFAULT NULL,
  left_cyl VARCHAR(32) DEFAULT NULL,
  left_axis VARCHAR(32) DEFAULT NULL,
  left_ot VARCHAR(32) DEFAULT NULL,
  right_power VARCHAR(32) DEFAULT NULL,
  right_bc VARCHAR(32) DEFAULT NULL,
  right_diameter VARCHAR(32) DEFAULT NULL,
  right_cyl VARCHAR(32) DEFAULT NULL,
  right_axis VARCHAR(32) DEFAULT NULL,
  right_ot VARCHAR(32) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE sessions (
  session_id varchar(255) COLLATE utf8_bin NOT NULL,
  expires int(11) unsigned NOT NULL,
  data text COLLATE utf8_bin,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE versions (
  to_version INT NOT NULL PRIMARY KEY,
  from_version INT NULL,
  date_migrated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `to_version` (`to_version`,`from_version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
CREATE TABLE parent_products (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  name VARCHAR(64) DEFAULT NULL,
  brand VARCHAR(64) DEFAULT NULL,
  img_url VARCHAR(128) DEFAULT NULL,
  options_power VARCHAR(2048),
  options_bc VARCHAR(2048),
  options_diameter VARCHAR(2048),
  options_cyl VARCHAR(2048),
  options_axis VARCHAR(2048),
  options_ot VARCHAR(2048),
  description TEXT DEFAULT NULL,
  num_days_per_lens SMALLINT UNSIGNED DEFAULT 0,
  additional_search_keywords TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

INSERT INTO parent_products (
  id,
  date_created,
  enabled,
  name,
  brand,
  img_url,
  options_power,
  options_bc,
  options_diameter,
  options_cyl,
  options_axis,
  options_ot,
  description,
  num_days_per_lens)
SELECT
  id,
  date_created,
  enabled,
  name,
  brand,
  img_url,
  options_power,
  options_bc,
  options_diameter,
  options_cyl,
  options_axis,
  options_ot,
  description,
  num_days_per_lens
FROM products;

ALTER TABLE products
  DROP COLUMN name,
  DROP COLUMN brand,
  DROP COLUMN img_url,
  DROP COLUMN options_power,
  DROP COLUMN options_bc,
  DROP COLUMN options_diameter,
  DROP COLUMN options_cyl,
  DROP COLUMN options_axis,
  DROP COLUMN options_ot,
  DROP COLUMN description,
  DROP COLUMN num_days_per_lens,
  ADD COLUMN parent_product_id INT,
  ADD CONSTRAINT fk_parent_product_id
    FOREIGN KEY (parent_product_id)
    REFERENCES products(id);

UPDATE products SET parent_product_id=id;
CREATE TABLE payment_tokens (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_card_id VARCHAR(128) NOT NULL,
  brand CHAR(64) NOT NULL,
  last4 CHAR(4) NOT NULL,
  exp_month INT NOT NULL,
  exp_year INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

ALTER TABLE users
  ADD COLUMN stripe_customer_id VARCHAR(128);
ALTER TABLE users ADD telephone VARCHAR(16);

CREATE TABLE addresses (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  label VARCHAR(128) NOT NULL, /* e.g.: home, work */
  user_id INT NOT NULL,
  street_line_1 VARCHAR(256) NOT NULL,
  street_line_2 VARCHAR(256) DEFAULT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(2) NOT NULL,
  postal_code VARCHAR(16) NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE orders (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  quantity SMALLINT NOT NULL,
  script_id INT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  shipping_address TEXT DEFAULT NULL, /* serialized from addresses */

  FOREIGN KEY (script_id) REFERENCES scripts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE auto_renewals (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  script_id INT NOT NULL,
  renew_every_n_days SMALLINT NOT NULL,

  FOREIGN KEY (script_id) REFERENCES scripts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE orders
DROP COLUMN quantity;

ALTER TABLE addresses
CHANGE COLUMN label label VARCHAR(128) DEFAULT NULL;

CREATE TABLE options (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  num_lenses SMALLINT UNSIGNED DEFAULT 0,
  duration VARCHAR(64) DEFAULT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE scripts
DROP FOREIGN KEY scripts_ibfk_2;

ALTER TABLE scripts
DROP COLUMN product_id;

ALTER TABLE scripts
ADD COLUMN parent_product_id INT NOT NULL;

ALTER TABLE scripts
ADD FOREIGN KEY (parent_product_id) REFERENCES parent_products(id);
CREATE TABLE mds (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(128),
  email VARCHAR(64) UNIQUE,
  UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
select 1;
CREATE TABLE labels (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  label VARCHAR(128) NOT NULL,
  color VARCHAR(16) DEFAULT NULL
);

CREATE TABLE orders_labels_xref (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  label_id INT NOT NULL,

  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (label_id) REFERENCES labels(id)
)
ALTER TABLE exams
  DROP FOREIGN KEY exams_ibfk_1,
  DROP COLUMN audio_url,
  DROP COLUMN user_id,
  ADD COLUMN visual_acuity_video_url VARCHAR(128) NOT NULL,
  ADD COLUMN letters VARCHAR(32) NOT NULL,
  ADD COLUMN notes TEXT DEFAULT NULL,
  ADD COLUMN md_id INT NOT NULL,
  ADD COLUMN script_id INT NOT NULL,
  ADD COLUMN passed BOOLEAN DEFAULT NULL,
  ADD FOREIGN KEY (md_id) REFERENCES mds(id),
  ADD FOREIGN KEY (script_id) REFERENCES scripts(id);
ALTER TABLE exams MODIFY COLUMN md_id INT null;

ALTER TABLE exams MODIFY COLUMN letters VARCHAR(256) NOT NULL;
ALTER TABLE orders
ADD is_archived BOOLEAN DEFAULT False;
ALTER TABLE orders ADD COLUMN is_order_confirm_sent BOOLEAN DEFAULT False;
ALTER TABLE orders ADD COLUMN is_shipping_confirm_sent BOOLEAN DEFAULT False;
CREATE TABLE uploaded_videos (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INT DEFAULT NULL,
  video_url VARCHAR(128) DEFAULT NULL,
  letters VARCHAR(32) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE orders ADD COLUMN abb_order_no VARCHAR(128) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN notes TEXT DEFAULT NULL;
ALTER TABLE uploaded_videos MODIFY COLUMN letters VARCHAR(256);
ALTER TABLE uploaded_videos ADD COLUMN type VARCHAR(32) NOT NULL;
ALTER TABLE mailing_list ADD COLUMN state VARCHAR(2) DEFAULT NULL;
ALTER TABLE mailing_list ADD COLUMN run_out_date DATE NULL DEFAULT NULL;

CREATE TABLE auth_tokens (
  guid VARCHAR(64) NOT NULL PRIMARY KEY,
  valid TINYINT(1) NOT NULL DEFAULT 0,
  date_created TIMESTAMP NOT NULL,
  user_id INT NOT NULL
  -- user_id is not set as a FK. This will likely be moved to redis or
  -- otherwise off-server.
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE users
  ADD has_seen_onboarding TINYINT(1) NOT NULL DEFAULT 0,
  ADD has_qualified TINYINT(1) NOT NULL DEFAULT 0;


CREATE TABLE abb_product_catalog (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  parent_product_id INT DEFAULT NULL,
  man_id VARCHAR(255) DEFAULT NULL,
  man_name VARCHAR(255) DEFAULT NULL,
  prd_addition VARCHAR(255) DEFAULT NULL,
  prd_axis VARCHAR(255) DEFAULT NULL,
  prd_checkdigit VARCHAR(255) DEFAULT NULL,
  prd_color VARCHAR(255) DEFAULT NULL,
  prd_color_id VARCHAR(255) DEFAULT NULL,
  prd_convert VARCHAR(255) DEFAULT NULL,
  prd_cylinder VARCHAR(255) DEFAULT NULL,
  prd_description VARCHAR(255) DEFAULT NULL,
  prd_id VARCHAR(255) NOT NULL UNIQUE KEY,
  prd_power VARCHAR(255) DEFAULT NULL,
  prd_upc_code VARCHAR(255) DEFAULT NULL,
  prf_basecurve VARCHAR(255) DEFAULT NULL,
  prf_convert VARCHAR(255) DEFAULT NULL,
  prf_diameter VARCHAR(255) DEFAULT NULL,
  prf_id VARCHAR(255) DEFAULT NULL,
  prf_rev_diag_ind VARCHAR(255) DEFAULT NULL,
  ser_day_per_lens INT DEFAULT NULL,
  ser_id VARCHAR(255) DEFAULT NULL,
  ser_name VARCHAR(255) DEFAULT NULL,
  ser_wear_freq VARCHAR(255) DEFAULT NULL,
  sty_id VARCHAR(255) DEFAULT NULL,
  unt_id VARCHAR(255) DEFAULT NULL,
  unt_lens_qtty INT DEFAULT NULL,
  unt_name VARCHAR(255) DEFAULT NULL,
  unt_pack_qtty INT DEFAULT NULL,
  unt_patient_visible VARCHAR(255) DEFAULT NULL,
  price_retail DECIMAL(13,2) DEFAULT 0,
  price_wholesale DECIMAL(13,2) DEFAULT 0,
  FOREIGN KEY (parent_product_id) REFERENCES parent_products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

ALTER TABLE abb_product_catalog ADD INDEX `ser_name` (`ser_name`);
ALTER TABLE mailing_list ADD user_id INT;
ALTER TABLE users
  ADD qualify_state varchar(2),
  ADD qualify_run_out_date date,
  CHANGE has_qualified has_seen_qualification TINYINT(1) NOT NULL DEFAULT 0;


ALTER TABLE abb_product_catalog
ADD COLUMN enabled TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE mailing_list
ADD COLUMN source VARCHAR(32) DEFAULT NULL;
ALTER TABLE abb_product_catalog DROP COLUMN enabled;
ALTER TABLE abb_product_catalog DROP COLUMN price_wholesale;
ALTER TABLE abb_product_catalog DROP COLUMN price_retail;
ALTER TABLE orders ADD COLUMN referral VARCHAR(2048) DEFAULT NULL;
ALTER TABLE users
  CHANGE qualify_run_out_date qualify_last_exam_date date,
  ADD qualify_birthday date;

ALTER TABLE mailing_list ADD last_exam_date date;
ALTER TABLE orders ADD column is_auto_renew TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(256) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN tracking_number_url VARCHAR(256) DEFAULT NULL;
ALTER TABLE users ADD COLUMN is_staff TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN env VARCHAR(32) DEFAULT 'prod';
CREATE TABLE user_logs (
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- user_id is not set as a FK. This will likely be moved to redis or
  -- otherwise off-server.
  user_id INT NOT NULL,
  subject VARCHAR(32) NOT NULL,
  device VARCHAR(2048),
  data VARCHAR(2048)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

ALTER TABLE user_logs ALTER COLUMN date_created DROP DEFAULT;
ALTER TABLE user_logs
ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_logs
ADD id INT NOT NULL PRIMARY KEY AUTO_INCREMENT;
CREATE TABLE virtual_supplies (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sku VARCHAR(128) DEFAULT NULL,
  parent_product_id INT DEFAULT NULL,
  name VARCHAR(128) NOT NULL,
  num_boxes INT DEFAULT 1,
  price DECIMAL(13,2) DEFAULT 0,
  FOREIGN KEY (parent_product_id) REFERENCES parent_products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE user_logs
  CHANGE data data JSON,
  CHANGE device device JSON;
ALTER TABLE user_logs DROP FOREIGN KEY fk_user_id;
ALTER TABLE user_logs DROP COLUMN id;
SELECT 1;
-- commented out by RQ (25 Jul 2016 18:36:27)
-- ALTER TABLE user_logs ADD INDEX (user_id);
-- ALTER TABLE user_logs ADD INDEX (date_created);
ALTER TABLE parent_products
ADD COLUMN use_supply_overrides TINYINT(1) DEFAULT 0;
ALTER TABLE virtual_supplies
CHANGE name opt_duration VARCHAR(128) NOT NULL;

ALTER TABLE virtual_supplies
CHANGE price price_retail DECIMAL(13,2) DEFAULT 0;
ALTER TABLE virtual_supplies
ADD COLUMN num_lenses SMALLINT UNSIGNED DEFAULT 0;
ALTER TABLE users ADD COLUMN affiliate_id VARCHAR(16) DEFAULT NULL;
ALTER TABLE users ADD CONSTRAINT constr_affiliate_id UNIQUE (affiliate_id);
ALTER TABLE products ADD INDEX (date_created);
ALTER TABLE options ADD COLUMN sku VARCHAR(128) DEFAULT NULL;
CREATE TABLE admins (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(128),
  email VARCHAR(64) UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE uploaded_videos
  CHANGE letters letters JSON;
CREATE INDEX user_logs_user_id_subject_idx ON user_logs (user_id, subject);

-- commented out by RQ (25 Jul 2016 18:36:27)
-- DROP INDEX user_id ON user_logs;
-- DROP INDEX date_created ON user_logs;
-- DROP INDEX user_id_2 ON user_logs;
-- DROP INDEX date_created_2 ON user_logs;
ALTER TABLE users ADD column sandbox TINYINT(1) NOT NULL DEFAULT 0;
CREATE TABLE order_logs (
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data JSON,
  order_id INT(11) NOT NULL,
  subject VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE INDEX order_logs_order_id_subject_idx ON order_logs (order_id, subject);

CREATE TABLE exam_logs (
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data JSON,
  exam_id INT(11) NOT NULL,
  subject VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE INDEX exam_logs_exam_id_subject_idx ON exam_logs (exam_id, subject);
ALTER TABLE exams
ADD COLUMN redness_test_video_id INT DEFAULT NULL;

ALTER TABLE exams
ADD COLUMN visual_acuity_test_video_id INT DEFAULT NULL;

ALTER TABLE exams
ADD CONSTRAINT fk_visual_acuity_test_video_id
FOREIGN KEY (visual_acuity_test_video_id)
REFERENCES uploaded_videos(id);

ALTER TABLE exams
ADD CONSTRAINT fk_redness_test_video_id
FOREIGN KEY (redness_test_video_id)
REFERENCES uploaded_videos(id);
ALTER TABLE exams
CHANGE COLUMN video_url video_url VARCHAR(128) NULL,
CHANGE COLUMN visual_acuity_video_url visual_acuity_video_url VARCHAR(128) NULL,
CHANGE COLUMN letters letters VARCHAR(256) NULL;

-- need to add this to the uploaded_videos table so to not break when faking uploads.
INSERT INTO uploaded_videos (user_id, video_url, letters, type)
VALUES
(NULL, 'https://s3.amazonaws.com/scdev-debug/debug_va.mp4', '{"mid": "T E S T", "top": "L O L 1", "bottom": "O M G Z"}', 'va'),
(NULL, 'https://s3.amazonaws.com/scdev-debug/debug_eyetest.mp4', NULL, 'eye');
ALTER TABLE exams
ADD COLUMN date_rx_expires timestamp NULL;
ALTER TABLE exams ADD COLUMN status VARCHAR(128) NULL;
ALTER TABLE exams DROP FOREIGN KEY exams_ibfk_3;
ALTER TABLE exams CHANGE COLUMN script_id script_id INT(11) NULL;
ALTER TABLE exams ADD CONSTRAINT exams_ibfk_3 FOREIGN KEY (script_id) REFERENCES scripts (id);
ALTER TABLE exams ADD COLUMN date_modified timestamp default now() on update now();

-- Clean up legacy columns.
ALTER TABLE exams DROP COLUMN video_url;
ALTER TABLE exams DROP COLUMN visual_acuity_video_url;
ALTER TABLE exams DROP COLUMN letters;

ALTER TABLE exams ADD COLUMN user_id INT DEFAULT NULL;
ALTER TABLE exams ADD CONSTRAINT exams_users_fk
      FOREIGN KEY (user_id)
      REFERENCES users (id);
ALTER TABLE uploaded_videos ADD COLUMN status VARCHAR(128) NULL;
ALTER TABLE uploaded_videos ADD COLUMN invalid_reason JSON NULL;
ALTER TABLE uploaded_videos ADD COLUMN tags JSON NULL;

ALTER TABLE user_logs ADD COLUMN features JSON NULL;
DROP TABLE IF EXISTS md_licenses;
DROP TABLE IF EXISTS pcs;
DROP TABLE IF EXISTS pc_addresses;

ALTER TABLE mds ADD COLUMN signature_url VARCHAR(255) NULL;
ALTER TABLE mds ADD COLUMN telephone VARCHAR(32) NULL;

CREATE TABLE md_licenses (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  md_id INT DEFAULT NULL,
  license VARCHAR(32) NOT NULL,
  state VARCHAR(2) NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (md_id) REFERENCES mds(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE pc_addresses (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(2) NOT NULL,
  postal_code VARCHAR(16) NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


CREATE TABLE pcs (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(128) NOT NULL,
  state VARCHAR(2) NOT NULL,
  pc_address_id  INT DEFAULT NULL,
  FOREIGN KEY (pc_address_id) REFERENCES pc_addresses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE parent_products ADD COLUMN options_distance VARCHAR(2048) DEFAULT NULL;
ALTER TABLE parent_products ADD COLUMN options_add_power VARCHAR(2048) DEFAULT NULL;
ALTER TABLE parent_products ADD COLUMN options_color VARCHAR(2048) DEFAULT NULL;
ALTER TABLE parent_products ADD COLUMN options JSON NULL;
DROP TABLE IF EXISTS cart;
CREATE TABLE cart (
  user_id INT NOT NULL PRIMARY KEY,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_modified TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),

  left_parent_product_id INT NULL,
  left_rx JSON NULL,
  left_option JSON NULL,
  right_parent_product_id INT NULL,
  right_rx JSON NULL,
  right_option JSON NULL,

  auto_renew TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (left_parent_product_id) REFERENCES parent_products(id),
  FOREIGN KEY (right_parent_product_id) REFERENCES parent_products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE exams
  ADD COLUMN has_qualified DATETIME DEFAULT NULL,
  ADD COLUMN has_answered_q1 DATETIME DEFAULT NULL,
  ADD COLUMN has_answered_q2 DATETIME DEFAULT NULL,
  ADD COLUMN has_answered_q3 DATETIME DEFAULT NULL,
  ADD COLUMN has_signed_waiver DATETIME DEFAULT NULL;

-- grandfather existing exams
UPDATE exams SET
  has_qualified = date_created,
  has_answered_q1 = date_created,
  has_answered_q2 = date_created,
  has_answered_q3 = date_created,
  has_signed_waiver = date_created;
ALTER TABLE exams
  ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE orders ADD COLUMN order_no VARCHAR(10) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN left_parent_product_id INT NULL;
ALTER TABLE orders ADD COLUMN right_parent_product_id INT NULL;
ALTER TABLE orders ADD COLUMN left_rx JSON NULL;
ALTER TABLE orders ADD COLUMN right_rx JSON NULL;

ALTER TABLE orders ADD CONSTRAINT fk_left_parent_product_id
      FOREIGN KEY (left_parent_product_id)
      REFERENCES parent_products(id);

ALTER TABLE orders ADD CONSTRAINT fk_right_parent_product_id
      FOREIGN KEY (right_parent_product_id)
      REFERENCES parent_products(id);
ALTER TABLE orders ADD COLUMN exam_id INT NULL;
ALTER TABLE orders ADD CONSTRAINT fk_exam_id
      FOREIGN KEY (exam_id)
      REFERENCES exams(id);
DELETE FROM addresses WHERE id NOT IN (
  SELECT * FROM (SELECT MAX(id) FROM addresses GROUP BY user_id) AS adr1
);
UPDATE addresses SET label = 'Default';

ALTER TABLE addresses ADD CONSTRAINT constr_addresses_user_id_label UNIQUE (user_id, label);

ALTER TABLE orders
  ADD COLUMN user_id INT DEFAULT NULL,

  ADD COLUMN subtotal DECIMAL(13,2) NOT NULL DEFAULT 0,
  ADD COLUMN sales_tax DECIMAL(13,2) NOT NULL DEFAULT 0,
  ADD COLUMN exam_cost DECIMAL(13,2) NOT NULL DEFAULT 0,
  ADD COLUMN shipping_cost DECIMAL(13,2) NOT NULL DEFAULT 0,
  ADD COLUMN discount_amt DECIMAL(13,2) NOT NULL DEFAULT 0,
  ADD COLUMN total DECIMAL(13,2) NOT NULL DEFAULT 0;

ALTER TABLE orders ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_1;

ALTER TABLE orders
  ADD COLUMN left_qty_option JSON NULL,
  ADD COLUMN right_qty_option JSON NULL;

ALTER TABLE exams DROP FOREIGN KEY exams_ibfk_3;

ALTER TABLE orders CHANGE COLUMN script_id script_id INT(11) NULL;
SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE orders DROP COLUMN script_id;
ALTER TABLE exams DROP COLUMN script_id;

DROP TABLE scripts;
SET FOREIGN_KEY_CHECKS=1;
ALTER TABLE users ADD COLUMN referral_id VARCHAR(16) DEFAULT NULL;

DROP TABLE auto_renewals;
DROP TABLE IF EXISTS exam_videos;
DROP TABLE IF EXISTS order_logs;
DROP TABLE IF EXISTS auto_renewals;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS user_icloud_tokens;
DROP TABLE options;
ALTER TABLE orders ADD COLUMN date_auto_renew DATETIME DEFAULT NULL;
CREATE TABLE user_device_ad_ids (
  id binary(16) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  type VARCHAR(7) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE auth_tokens ADD COLUMN id binary(16) NOT NULL;
UPDATE auth_tokens SET id = UNHEX(REPLACE(guid, '-', ''));
ALTER TABLE auth_tokens DROP PRIMARY KEY, ADD PRIMARY KEY(id);
ALTER TABLE auth_tokens DROP COLUMN guid;
ALTER TABLE users ADD COLUMN referral_url VARCHAR(255) DEFAULT NULL;
DROP TABLE IF EXISTS sms;
CREATE TABLE sms (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_from VARCHAR(12) DEFAULT NULL,
  sent_to VARCHAR(12) DEFAULT NULL,
  body TEXT DEFAULT NULL,
  direction VARCHAR(16) NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
DROP TABLE sms;
DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  sms_from VARCHAR(12) DEFAULT NULL,
  sms_to VARCHAR(12) DEFAULT NULL,

  email_from VARCHAR(64) DEFAULT NULL,
  email_to VARCHAR(64) DEFAULT NULL,

  message TEXT DEFAULT NULL,
  direction VARCHAR(16) NOT NULL,

  attachments JSON NULL,

  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE user_logs CHANGE COLUMN subject subject VARCHAR(64) NOT NULL;
ALTER TABLE users DROP COLUMN referral_url;
ALTER TABLE users ADD COLUMN attachments JSON NULL;
ALTER TABLE orders ADD COLUMN status VARCHAR(128) NULL;
ALTER TABLE orders ADD COLUMN cancel_reason VARCHAR(128) NULL;
ALTER TABLE orders CHANGE `status` `status` VARCHAR(128) NULL DEFAULT 'OPEN';
CREATE TABLE audit_log (
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user VARCHAR(2048),
  subject VARCHAR(32) NOT NULL,
  data VARCHAR(2048)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE exams ADD column is_shortened_rx TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN stripe_charge_id VARCHAR(64);
ALTER TABLE orders
  CHANGE shipping_address shipping_address JSON,
  CHANGE referral referral JSON;
CREATE TABLE national_lens_product_catalog (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  comp_id VARCHAR(255) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  bc VARCHAR(255) DEFAULT NULL,
  dia VARCHAR(255) DEFAULT NULL,
  color VARCHAR(255) DEFAULT NULL,
  power VARCHAR(255) DEFAULT NULL,
  axis VARCHAR(255) DEFAULT NULL,
  cyl VARCHAR(255) DEFAULT NULL,
  sample TINYINT(1) NOT NULL DEFAULT 0,
  upc VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
CREATE TABLE productsv2 (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  additional_search_keywords text,
  brand varchar(64) DEFAULT NULL,
  description text,
  is_enabled tinyint(1) NOT NULL DEFAULT '0',
  img_url varchar(128) DEFAULT NULL,
  name varchar(64) DEFAULT NULL,
  num_days_per_lens smallint(5) unsigned DEFAULT '0',
  num_lenses smallint(5) unsigned DEFAULT '0',
  price_retail decimal(13,2) DEFAULT '0.00',
  options json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE orders ADD COLUMN left_qty INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN right_qty INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN v2_left_product_id INT NULL;
ALTER TABLE orders ADD COLUMN v2_right_product_id INT NULL;
ALTER TABLE cart ADD COLUMN v2_left_product_id INT NULL;
ALTER TABLE cart ADD COLUMN v2_right_product_id INT NULL;
ALTER TABLE `md_licenses` CHANGE COLUMN `license` `license_no` VARCHAR(32) NOT NULL;
ALTER TABLE productsv2 ADD COLUMN _parent_product_id INT DEFAULT 0;
ALTER TABLE cart
  ADD COLUMN right_qty TINYINT UNSIGNED DEFAULT 0,
  ADD COLUMN left_qty TINYINT UNSIGNED DEFAULT 0;
DROP TABLE virtual_supplies;
ALTER TABLE abb_product_catalog RENAME catalog_abb;
ALTER TABLE national_lens_product_catalog RENAME catalog_national_lens;

ALTER TABLE orders ADD COLUMN labels JSON NULL;
DROP TABLE orders_labels_xref;
DROP TABLE labels;
ALTER TABLE productsv2
      DROP COLUMN _parent_product_id;

ALTER TABLE orders
      DROP FOREIGN KEY fk_right_parent_product_id,
      DROP FOREIGN KEY fk_left_parent_product_id;

ALTER TABLE orders
      DROP COLUMN right_parent_product_id,
      DROP COLUMN left_parent_product_id,
      DROP INDEX fk_right_parent_product_id,
      DROP INDEX fk_left_parent_product_id;

ALTER TABLE catalog_abb
      DROP FOREIGN KEY catalog_abb_ibfk_1;

ALTER TABLE catalog_abb
      DROP COLUMN parent_product_id,
      DROP INDEX parent_product_id;

ALTER TABLE cart
      DROP FOREIGN KEY cart_ibfk_3,
      DROP FOREIGN KEY cart_ibfk_2;

ALTER TABLE cart
      DROP COLUMN right_parent_product_id,
      DROP COLUMN left_parent_product_id,
      DROP INDEX right_parent_product_id,
      DROP INDEX left_parent_product_id;

DROP TABLE parent_products;
DROP TABLE products;
ALTER TABLE productsv2 ADD COLUMN _parent_product_id INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN customer_service_grade VARCHAR(1) NULL;
ALTER TABLE orders ADD COLUMN distributor VARCHAR(8) NULL;
ALTER TABLE orders ADD COLUMN wholesale_cost DECIMAL(13,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN distributor_shipping_cost DECIMAL(13,2) DEFAULT 0;
ALTER TABLE orders CHANGE abb_order_no distributor_order_no VARCHAR(128) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN date_status_modified DATETIME DEFAULT NULL;
ALTER TABLE exams ADD COLUMN date_status_modified DATETIME DEFAULT NULL;
CREATE
    TRIGGER upd_order_date_status_modified BEFORE UPDATE
    ON orders
    FOR EACH ROW
    BEGIN
        IF NOT (NEW.status <=> OLD.status) THEN
           SET NEW.date_status_modified = NOW();
        END IF;
    END;


CREATE
    TRIGGER upd_exam_date_status_modified BEFORE UPDATE
    ON exams
    FOR EACH ROW
    BEGIN
        IF NOT (NEW.status <=> OLD.status) THEN
           SET NEW.date_status_modified = NOW();
        END IF;
    END;
ALTER TABLE mds ADD COLUMN mobile_number VARCHAR(32) NULL;
ALTER TABLE mds ADD COLUMN slack_username VARCHAR(64) NULL;
CREATE TABLE rebates (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  num_boxes SMALLINT UNSIGNED DEFAULT 0,
  amt_discount DECIMAL(13, 2) NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES productsv2(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE mds ADD column is_admin TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN mail_in_rebate_amt DECIMAL(13, 2) NOT NULL DEFAULT 0;
ALTER TABLE catalog_national_lens RENAME catalog_ntl_lens;

CREATE TABLE product_skus (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  power VARCHAR(16) DEFAULT NULL,
  bc VARCHAR(16) DEFAULT NULL,
  dia VARCHAR(16) DEFAULT NULL,
  color VARCHAR(128) DEFAULT NULL,
  axis VARCHAR(16) DEFAULT NULL,
  cyl VARCHAR(16) DEFAULT NULL,
  dn VARCHAR(16) DEFAULT NULL,
  add_power VARCHAR(16) DEFAULT NULL,

  FOREIGN KEY (product_id) REFERENCES productsv2(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE distributors (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
CREATE TABLE distributor_skus (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  distributor_id INT DEFAULT NULL,
  ntl_lens_id INT DEFAULT NULL,
  product_sku_id INT DEFAULT NULL,
  unit_lens_qty SMALLINT UNSIGNED DEFAULT 0,

  FOREIGN KEY (distributor_id) REFERENCES distributors(id),
  FOREIGN KEY (product_sku_id) REFERENCES product_skus(id),
  FOREIGN KEY (ntl_lens_id) REFERENCES catalog_ntl_lens(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE distributor_shipping_methods (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  distributor_id INT DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  shipping_code VARCHAR(255) DEFAULT NULL,

  FOREIGN KEY (distributor_id) REFERENCES distributors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
CREATE FUNCTION levenshtein( s1 VARCHAR(255), s2 VARCHAR(255) )
RETURNS INT
DETERMINISTIC
BEGIN
DECLARE s1_len, s2_len, i, j, c, c_temp, cost INT;
DECLARE s1_char CHAR;
-- max strlen=255
DECLARE cv0, cv1 VARBINARY(256);
SET s1_len = CHAR_LENGTH(s1), s2_len = CHAR_LENGTH(s2), cv1 = 0x00, j = 1, i = 1, c = 0;
IF s1 = s2 THEN
RETURN 0;
ELSEIF s1_len = 0 THEN
RETURN s2_len;
ELSEIF s2_len = 0 THEN
RETURN s1_len;
ELSE
WHILE j <= s2_len DO
SET cv1 = CONCAT(cv1, UNHEX(HEX(j))), j = j + 1;
END WHILE;
WHILE i <= s1_len DO
SET s1_char = SUBSTRING(s1, i, 1), c = i, cv0 = UNHEX(HEX(i)), j = 1;
WHILE j <= s2_len DO
SET c = c + 1;
IF s1_char = SUBSTRING(s2, j, 1) THEN
SET cost = 0; ELSE SET cost = 1;
END IF;
SET c_temp = CONV(HEX(SUBSTRING(cv1, j, 1)), 16, 10) + cost;
IF c > c_temp THEN SET c = c_temp; END IF;
SET c_temp = CONV(HEX(SUBSTRING(cv1, j+1, 1)), 16, 10) + 1;
IF c > c_temp THEN
SET c = c_temp;
END IF;
SET cv0 = CONCAT(cv0, UNHEX(HEX(c))), j = j + 1;
END WHILE;
SET cv1 = cv0, i = i + 1;
END WHILE;
END IF;
RETURN c;
END;
ALTER TABLE orders ADD COLUMN is_rebate_sent TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN is_rebate_returned TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN is_rebate_mailed TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN is_rebate_cashed TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE messages ADD column is_acknowledged TINYINT(1) NOT NULL DEFAULT 0;
CREATE TABLE user_attribution_adjust (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  idfa binary(16),
  android_id VARCHAR(64), -- Should switch to binary
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  store VARCHAR(16),
  network_name VARCHAR(64),
  campaign_name VARCHAR(64),
  adgroup_name VARCHAR(64),
  creative_name VARCHAR(64),
  impression_based TINYINT(0),
  is_organic TINYINT(0),
  gclid VARCHAR(64),
  click_time DATETIME,
  installed_at DATETIME,
  device_type VARCHAR(16),
  fb_campaign_group_name VARCHAR(64),
  fb_campaign_group_id VARCHAR(64),
  fb_campaign_name VARCHAR(64),
  fb_campaign_id VARCHAR(64),
  fb_adgroup_name VARCHAR(64),
  fb_adgroup_id VARCHAR(64),
  twitter_line_item_id VARCHAR(64),
  ip_address VARBINARY(16),
  -- country
  -- country_subdivision
  -- city
  -- postal_code
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE messages MODIFY sms_from VARCHAR(32);
ALTER TABLE messages MODIFY sms_to VARCHAR(32);
ALTER TABLE messages ADD COLUMN raw_message TEXT NULL;
ALTER TABLE messages ADD COLUMN is_escalated TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE exams ADD COLUMN date_md_reviewed DATETIME DEFAULT NULL;
ALTER TABLE exams ADD COLUMN is_retake_permitted TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE exams ADD COLUMN retake_instructions TEXT NULL;
ALTER TABLE orders ADD COLUMN date_closed DATETIME DEFAULT NULL;
ALTER TABLE users ADD COLUMN labels JSON NULL;
ALTER TABLE users ADD COLUMN notes TEXT DEFAULT NULL;
ALTER TABLE addresses ADD date_modified TIMESTAMP DEFAULT NOW() ON UPDATE NOW();

ALTER TABLE users ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE productsv2 ADD COLUMN brand_id INT NULL;
CREATE TABLE brands (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

ALTER TABLE productsv2 ADD CONSTRAINT fk_brands_id FOREIGN KEY (brand_id) REFERENCES brands(id);
ALTER TABLE admins ADD COLUMN roles JSON NULL;
ALTER TABLE admins ADD COLUMN profile_image VARCHAR(200) NULL;
    ALTER TABLE audit_log ADD id INT NOT NULL PRIMARY KEY AUTO_INCREMENT;
ALTER TABLE audit_log ADD COLUMN admin_id INT DEFAULT NULL;
ALTER TABLE audit_log ADD CONSTRAINT admin_id_fk01 FOREIGN KEY (admin_id) REFERENCES admins(id);

ALTER TABLE exams ADD COLUMN admin_id INT DEFAULT NULL;
ALTER TABLE exams ADD CONSTRAINT admin_id_fk02 FOREIGN KEY (admin_id) REFERENCES admins(id);

ALTER TABLE admins ADD COLUMN signature_url VARCHAR(255) NULL;
ALTER TABLE admins ADD COLUMN mobile_number VARCHAR(32) NULL;
ALTER TABLE admins ADD COLUMN slack_username VARCHAR(32) NULL;
ALTER TABLE admins ADD COLUMN is_suspended TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE admins DROP COLUMN profile_image;
ALTER TABLE admins CHANGE COLUMN `is_suspended` `is_deleted` TINYINT(1) NOT NULL DEFAULT 0;
CREATE TABLE wallet_transactions (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  type VARCHAR(32),
  amt decimal(13,2) NOT NULL DEFAULT 0,
  pct TINYINT(3) NOT NULL DEFAULT 0,
  order_id INT,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  expires_at DATETIME DEFAULT NULL,
  metadata JSON DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE INDEX wallet_user_id_idx ON wallet_transactions(user_id);
CREATE INDEX wallet_order_id_idx ON wallet_transactions(order_id);

CREATE TABLE reward_rules (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  label VARCHAR(64),
  type VARCHAR(32), -- matches wallet types
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  branch_id VARCHAR(64) NOT NULL, -- unique uuid identifier for branch data param
  reward_for VARCHAR(12), -- ALL, REFERRING, REFERRED
  amt decimal(13,2) NOT NULL DEFAULT 0,
  pct TINYINT(3) NOT NULL DEFAULT 0,
  max_uses TINYINT(1) NOT NULL DEFAULT 0,
  must_trigger_event VARCHAR(64), -- user_log events
  expires_at DATETIME DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE UNIQUE INDEX reward_rules_branch_id_idx ON reward_rules(branch_id);

CREATE TABLE deeplinks (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  url VARCHAR(160) NOT NULL,
  created_by_user_id INT,
  reward_rule_id INT,
  is_single_use TINYINT(0) NOT NULL DEFAULT 0,
  expires_at DATETIME DEFAULT NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  FOREIGN KEY (reward_rule_id) REFERENCES reward_rules(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE INDEX deeplinks_url_idx ON deeplinks(url);

CREATE TABLE deeplink_hits (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deeplink_id INT,
  user_id INT,
  FOREIGN KEY (deeplink_id) REFERENCES deeplinks(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE INDEX deeplinks_hits_user_id_idx ON deeplink_hits(user_id);

ALTER TABLE users
  ADD COLUMN branch_identity_id VARCHAR(32);

CREATE TABLE refer_a_friend (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  referree_user_id INT,
  referree_wallet_transaction_id INT,
  referrer_user_id INT,
  referrer_wallet_transaction_id INT,
  url VARCHAR(160) NOT NULL,
  FOREIGN KEY (referree_user_id) REFERENCES users(id),
  FOREIGN KEY (referrer_user_id) REFERENCES users(id),
  FOREIGN KEY (referree_wallet_transaction_id) REFERENCES wallet_transactions(id),
  FOREIGN KEY (referrer_wallet_transaction_id) REFERENCES wallet_transactions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE INDEX refer_a_friend_referree_user_id_idx ON refer_a_friend(referree_user_id);
CREATE INDEX refer_a_friend_referrer_user_id_idx ON refer_a_friend(referrer_user_id);
ALTER TABLE audit_log CHANGE COLUMN data data JSON NULL DEFAULT NULL;
ALTER TABLE audit_log CHANGE COLUMN subject subject VARCHAR(600) NOT NULL;

ALTER TABLE md_licenses ADD COLUMN admin_id INT DEFAULT NULL;
ALTER TABLE md_licenses ADD CONSTRAINT admin_id_fk03 FOREIGN KEY (admin_id) REFERENCES admins(id);
ALTER TABLE exams CHANGE COLUMN admin_id md_admin_id INT DEFAULT NULL;
ALTER TABLE md_licenses CHANGE COLUMN admin_id md_admin_id INT DEFAULT NULL;
CREATE TABLE device_display_properties (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  device_name VARCHAR(128) NOT NULL,
  operating_system VARCHAR(128),
  diagonal_inches DECIMAL(3,1) NOT NULL,
  pixel_width SMALLINT NOT NULL,
  pixel_height SMALLINT NOT NULL,
  aspect_width SMALLINT NOT NULL,
  aspect_height SMALLINT NOT NULL,
  device_width SMALLINT NOT NULL,
  pixels_per_inch SMALLINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE users MODIFY email VARCHAR(254);

CREATE TABLE v2_messages (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INT,
  admin_id INT,
  thread_id VARCHAR(64), -- uuid for multiple message of the same content
  date_sent DATETIME DEFAULT NULL,
  min_send_date DATETIME DEFAULT NULL,
  sms_to VARCHAR(16),
  sms_from VARCHAR(16),
  email_to VARCHAR(254),
  email_from VARCHAR(254),
  state VARCHAR(64) NOT NULL, -- SENT, RECEIVED, PENDING_REVIEW, SCHEDULED

  -- (min_send_date +/- threshold) is the max deviation allowed for the message
  -- to be dispatched, otherwise it gets rolled over to send the following day.
  optimal_send_time_threshold VARCHAR(64) NULL,

  attachments JSON,
  content TEXT,
  raw_content TEXT,
  direction VARCHAR(32), -- incoming or outgoing
  is_acknowledged TINYINT(1) NOT NULL DEFAULT 0,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES admins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE INDEX v2_messages_user_id_date_sent_idx ON v2_messages (user_id, date_sent);
ALTER TABLE wallet_transactions
  ADD COLUMN is_promotional TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN reward_rule_id INT,
  ADD FOREIGN KEY (reward_rule_id) REFERENCES reward_rules(id)
;

DROP INDEX deeplinks_url_idx ON deeplinks;
CREATE UNIQUE INDEX deeplinks_url_idx ON deeplinks(url);
CREATE TABLE do_not_disturb (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_expiry DATETIME DEFAULT NULL,
  user_id INT NOT NULL,
  channels JSON,
  drip_type VARCHAR(64),

  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE drip_schedule (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  channels JSON NOT NULL,
  send_interval VARCHAR(16) NOT NULL,
  type VARCHAR(64) NOT NULL,
  replacement_schedule VARCHAR(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE drip_messages (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(64) NOT NULL,
  description TEXT,
  sendwithus_template_id VARCHAR(64),
  content TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE drip_schedule_messages_xref (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  drip_schedule_id INT NOT NULL,
  drip_message_id INT NOT NULL,

  FOREIGN KEY (drip_schedule_id) REFERENCES drip_schedule(id),
  FOREIGN KEY (drip_message_id) REFERENCES drip_messages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE drip_reorder_options (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  left_product_id INT NULL,
  left_qty INT NULL,
  left_rx JSON NULL,
  right_product_id INT NULL,
  right_qty INT NULL,
  right_rx JSON NULL,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (left_product_id) REFERENCES productsv2(id),
  FOREIGN KEY (right_product_id) REFERENCES productsv2(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


CREATE INDEX drip_schedule_messages_xref_idx
ON drip_schedule_messages_xref (drip_schedule_id, drip_message_id);

CREATE INDEX dnd_user_id_date_expiry_idx
ON do_not_disturb (user_id, date_expiry);

CREATE INDEX drip_reorder_options_user_id_idx ON drip_reorder_options (user_id);
CREATE TABLE notes (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	admin_id INT NULL,
  exam_id INT NULL,
	date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  text TEXT DEFAULT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (admin_id) REFERENCES admins(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE productsv2 ADD COLUMN materials TEXT NULL;
ALTER TABLE productsv2 ADD COLUMN package_details TEXT NULL;
ALTER TABLE v2_messages ADD COLUMN sendwithus_template_id VARCHAR(64);
ALTER TABLE productsv2
ADD COLUMN lens_type VARCHAR(256) DEFAULT NULL,
ADD COLUMN package_detail VARCHAR(256) DEFAULT NULL,
ADD COLUMN material VARCHAR(256) DEFAULT NULL;
CREATE TABLE product_competitors (
  product_id INT NOT NULL PRIMARY KEY,
  lens_com_url VARCHAR(128),
  lens_com_selector VARCHAR(128),
  lens_com_price decimal(13,2),
  lens_com_last_crawled TIMESTAMP NULL DEFAULT NULL,
  c1800_url VARCHAR(128),
  c1800_price decimal(13,2),
  c1800_last_crawled TIMESTAMP NULL DEFAULT NULL,
  visiondirect_url VARCHAR(128),
  visiondirect_price decimal(13,2),
  visiondirect_last_crawled TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (product_id) REFERENCES productsv2(id)
);
ALTER TABLE exams ADD COLUMN rx_images JSON NULL;ALTER TABLE productsv2
  DROP COLUMN _parent_product_id,
  DROP COLUMN brand;

ALTER TABLE cart
  DROP COLUMN right_option,
  DROP COLUMN left_option;

ALTER TABLE orders
  DROP COLUMN right_qty_option,
  DROP COLUMN left_qty_option;

ALTER TABLE exams
  DROP COLUMN has_qualified;
ALTER TABLE drip_reorder_options ADD CONSTRAINT constr_drip_reorder_options_user_id UNIQUE (user_id);
ALTER TABLE orders ADD COLUMN is_rx_email_sent TINYINT(1) NOT NULL DEFAULT 0;
/*
 * Migration 144
 * 2/2/2017
 * Joe Predham
 * Adding a table to encapsulate the results of a detection session during an
 * individual exam. Even though this data is 1:1 with an uploaded_video row,
 * I prefer to encapsulate it it it's own table for several reasons:
 * 1.) We will not always need detect session data when we need uploaded videos
 * 2.) The detect_session schema will grow at a faster rate than that of
 *     uploaded_videos
 * 3.) As columns grow in detect_session, there may be data that cannot be
 *     backfilled due to missing data.
 * Also persisting camera metadata on the uploaded exam
*/

CREATE TABLE detect_sessions (
  uploaded_video_id INT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mean_distance FLOAT(4, 2),
  min_distance FLOAT(4, 2),
  max_distance FLOAT(4, 2),
  correct_distance_percent TINYINT UNSIGNED,
  request_count TINYINT UNSIGNED,
  undetected_count TINYINT UNSIGNED,
  error_count TINYINT UNSIGNED,
  max_faces TINYINT UNSIGNED,
  PRIMARY KEY (uploaded_video_id),
  FOREIGN KEY (uploaded_video_id) REFERENCES uploaded_videos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

ALTER TABLE uploaded_videos ADD COLUMN camera_metadata JSON;
ALTER TABLE productsv2 DROP COLUMN package_detail;
ALTER TABLE productsv2 DROP COLUMN material;
ALTER TABLE productsv2 MODIFY lens_type TEXT;
ALTER TABLE v2_messages
  ADD COLUMN drip_schedule_id INT DEFAULT NULL;

ALTER TABLE v2_messages
  ADD CONSTRAINT messages_drip_schedule_fk FOREIGN KEY (drip_schedule_id)
  REFERENCES drip_schedule(id);

ALTER TABLE v2_messages
  ADD COLUMN send_error TEXT NULL;

ALTER TABLE drip_schedule
  ADD UNIQUE replacement_schedule_send_interval_type_unique (
  replacement_schedule, send_interval, type);
CREATE TABLE user_auth_passwords (
  user_id INT PRIMARY KEY NOT NULL,
  date_modified TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  password_hash BINARY(60) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE user_auth_password_reset_tokens (
  user_id INT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_expires TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  token VARCHAR(36) NOT NULL,
  is_used TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
CREATE UNIQUE INDEX user_auth_password_reset_tokens_token_idx ON user_auth_password_reset_tokens(token);
CREATE TABLE shipping_options (
  id TINYINT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  label VARCHAR(64),
  cost decimal(5,2) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE orders
  ADD COLUMN shipping_option_id TINYINT DEFAULT 1,
  ADD FOREIGN KEY (shipping_option_id) REFERENCES shipping_options(id);

ALTER TABLE cart
  ADD COLUMN shipping_option_id TINYINT DEFAULT 1,
  ADD FOREIGN KEY (shipping_option_id) REFERENCES shipping_options(id);

ALTER TABLE wallet_transactions
  ADD COLUMN shipping_option_id TINYINT DEFAULT NULL,
  ADD FOREIGN KEY (shipping_option_id) REFERENCES shipping_options(id);
ALTER TABLE detect_sessions
  MODIFY request_count SMALLINT UNSIGNED,
  MODIFY undetected_count SMALLINT UNSIGNED,
  MODIFY error_count SMALLINT UNSIGNED;
ALTER TABLE users ADD COLUMN date_of_birth DATE DEFAULT NULL;
CREATE TABLE subscriptions (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  user_id INT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(200) NULL,
  type VARCHAR(200) NULL,
  data JSON NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE user_logs ADD COLUMN platform_id TINYINT DEFAULT 0;
ALTER TABLE orders ADD COLUMN platform_id TINYINT NOT NULL DEFAULT 0;
ALTER TABLE productsv2
ADD COLUMN product_line VARCHAR(256) DEFAULT NULL,
ADD COLUMN category VARCHAR(256) DEFAULT NULL;
CREATE TABLE advertising_attribution (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source VARCHAR(128) DEFAULT NULL,
  campaign VARCHAR(128) DEFAULT NULL,
  adgroup VARCHAR(256) DEFAULT NULL,
  keyword VARCHAR(256) DEFAULT NULL,
  creative VARCHAR(256) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE INDEX advertising_attribution_user_id_idx ON advertising_attribution(user_id);
ALTER TABLE drip_reorder_options ADD COLUMN preferred_address_id INT DEFAULT NULL;
ALTER TABLE drip_reorder_options ADD CONSTRAINT preferred_address_id_fk01 FOREIGN KEY (preferred_address_id) REFERENCES addresses(id);
CREATE TABLE reorder_options (
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  exam_id INT NOT NULL,
  left_product_id INT NULL,
  left_qty INT NULL,
  left_rx JSON NULL,
  order_id INT NOT NULL,
  preferred_address_id INT NOT NULL,
  preferred_shipping_option_id TINYINT(4) NOT NULL,
  right_product_id INT NULL,
  right_qty INT NULL,
  right_rx JSON NULL,
  user_id INT NOT NULL,
  PRIMARY KEY(user_id),

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (left_product_id) REFERENCES productsv2(id),
  FOREIGN KEY (right_product_id) REFERENCES productsv2(id),
  FOREIGN KEY (preferred_address_id) REFERENCES addresses(id),
  FOREIGN KEY (preferred_shipping_option_id) REFERENCES shipping_options(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE v2_messages ADD COLUMN type VARCHAR(16) NULL;
ALTER TABLE v2_messages ADD COLUMN order_id INT DEFAULT NULL;
ALTER TABLE v2_messages ADD COLUMN exam_id INT DEFAULT NULL;

ALTER TABLE v2_messages ADD CONSTRAINT order_id_fk01 FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE v2_messages ADD CONSTRAINT exam_id_fk01 FOREIGN KEY (exam_id) REFERENCES exams(id);
ALTER TABLE exams
  ADD COLUMN is_photo_rx BOOLEAN DEFAULT 0;
ALTER TABLE addresses ADD COLUMN user_address_id VARCHAR(16) DEFAULT NULL;
ALTER TABLE users
	ADD COLUMN has_seen_rx_upload TINYINT(1) NOT NULL DEFAULT 0;
	ALTER TABLE users
  ADD COLUMN preferred_address_id INT NULL,
  ADD CONSTRAINT FOREIGN KEY(preferred_address_id) REFERENCES addresses(id);

ALTER TABLE addresses DROP FOREIGN KEY addresses_ibfk_1;
ALTER TABLE addresses DROP INDEX constr_addresses_user_id_label;
ALTER TABLE addresses ADD UNIQUE INDEX addresses_user_id_user_address_id_idx (user_id, user_address_id);
ALTER TABLE orders ADD date_fulfilled DATETIME DEFAULT NULL;
ALTER TABLE user_attribution_adjust
  MODIFY network_name VARCHAR(128),
  MODIFY campaign_name VARCHAR(128),
  MODIFY adgroup_name VARCHAR(128),
  MODIFY creative_name VARCHAR(128);
ALTER TABLE productsv2
  ADD COLUMN available_distributor_ids JSON NULL;
ALTER TABLE users DROP COLUMN has_seen_rx_upload;ALTER TABLE exams ADD COLUMN date_first_ready_for_dr DATETIME DEFAULT NULL;
ALTER TABLE exams ADD COLUMN date_first_md_reviewed DATETIME DEFAULT NULL;
ALTER TABLE exams ADD COLUMN diagnosis TEXT DEFAULT NULL;
CREATE TABLE lenses like productsv2;

ALTER TABLE distributors
  ADD COLUMN abbreviation VARCHAR(8) DEFAULT NULL;

INSERT INTO distributors
  (id, name, abbreviation)
VALUES
  (1, 'National Lens', 'NTL'),
  (2, 'ABB Optical', 'ABB'),
  (3, 'OOGP', 'OOGP'),
  (4, 'Wisconsin Vision Associates', 'WVA');

ALTER TABLE distributor_shipping_methods
  ADD COLUMN cost DECIMAL(13,2) NOT NULL DEFAULT '0.00',
  ADD COLUMN pickup_time SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN add_cost_per_gram DECIMAL(13,2) NOT NULL DEFAULT '0.00',
  ADD COLUMN max_grams INT UNSIGNED NOT NULL DEFAULT 0;

CREATE TABLE lens_variations (
  upc VARCHAR(64) NOT NULL PRIMARY KEY UNIQUE,

  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_modified TIMESTAMP DEFAULT now() ON UPDATE now(),

  power VARCHAR(8) NOT NULL,
  bc VARCHAR(8) NOT NULL,
  dia VARCHAR(8) NOT NULL,

  color VARCHAR(32) NOT NULL,

  axis VARCHAR(8) DEFAULT NULL,
  cyl VARCHAR(8) DEFAULT NULL,

  add_power VARCHAR(32) DEFAULT NULL,

  dn VARCHAR(1) DEFAULT NULL, 

  num_lenses SMALLINT UNSIGNED NOT NULL,

  shipping_weight_grams INT UNSIGNED NOT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE lens_to_variation (
  lens_variation_upc VARCHAR(64) NOT NULL,
  lens_id INT NOT NULL,
  multiplier TINYINT UNSIGNED NOT NULL,

  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (lens_variation_upc, lens_id),
  
  FOREIGN KEY (lens_variation_upc) REFERENCES lens_variations (upc),
  FOREIGN KEY (lens_id) REFERENCES lenses (id),

  INDEX idx_lens_id (lens_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE distributor_lens_stock (
  lens_variation_upc VARCHAR(64) NOT NULL,
  distributor_id INT NOT NULL,

  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_modified TIMESTAMP DEFAULT now() ON UPDATE now(),

  cost DECIMAL(13,2) NOT NULL DEFAULT '0.00',

  is_available TINYINT UNSIGNED NOT NULL DEFAULT 1,
  is_dx TINYINT UNSIGNED NOT NULL DEFAULT 0,

  brand_name VARCHAR(32) NOT NULL,
  product_name VARCHAR(64) NOT NULL,

  PRIMARY KEY (distributor_id, lens_variation_upc),

  FOREIGN KEY (distributor_id) REFERENCES distributors (id),
  FOREIGN KEY (lens_variation_upc) REFERENCES lens_variations (upc)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

ALTER TABLE orders
  ADD COLUMN left_lens_distributor_id INT DEFAULT NULL,
  ADD FOREIGN KEY (left_lens_distributor_id) REFERENCES distributors(id),

  ADD COLUMN right_lens_distributor_id INT DEFAULT NULL,
  ADD FOREIGN KEY (right_lens_distributor_id) REFERENCES distributors(id),

  ADD COLUMN left_lens_upc VARCHAR(64) DEFAULT NULL,
  ADD FOREIGN KEY (left_lens_upc) REFERENCES lens_variations(upc),

  ADD COLUMN right_lens_upc VARCHAR(64) DEFAULT NULL,
  ADD FOREIGN KEY (right_lens_upc) REFERENCES lens_variations(upc),

  ADD COLUMN left_lens_distributor_qty SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN right_lens_distributor_qty SMALLINT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE mailing_list
  CHANGE state qualify_state varchar(2),
  CHANGE last_exam_date qualify_last_exam_date date;
/*
 * Migration 170
 * 6/29/2017
 * Harmony Dashut
 * This table will replace the one in 0144 for exam video detection metrics.
 * This new table will allow a 1:M relationship with uploaded_videos which will
 * allow us to flexibly collect many data points for a single video, for
 * support of Iris visualization in admin.
*/

CREATE TABLE video_detection_segments (
  segment_id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
  video_id INT NOT NULL,
  segment_timestamp DATETIME(2) NOT NULL,
  segment_length DECIMAL(5, 2) NOT NULL,
  error_count SMALLINT UNSIGNED NOT NULL,
  mean_distance DECIMAL(4, 2) NOT NULL,
  max_faces SMALLINT UNSIGNED,
  glasses_detected TINYINT UNSIGNED,
  FOREIGN KEY (video_id) REFERENCES uploaded_videos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;CREATE TABLE exam_costs (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cost DECIMAL(13,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

INSERT INTO exam_costs 
  (date_created, cost)
VALUES
  ('2000-01-01', '10.00'),
  ('2017-07-22', '30.00');
create index subject_date_created_idx ON audit_log(subject, date_created);
ALTER TABLE users
  ADD COLUMN exam_cost DECIMAL(13,2) DEFAULT NULL;
/*
* Migration 174
* 7/26/2017
* Joe Predham
* This migration simply adds two counts to the video_detection_segments table
* for tracking the number of individual detection requests made in a segment as
* well as the number in which no faces were detected.
*/

ALTER TABLE video_detection_segments
  ADD COLUMN request_count SMALLINT UNSIGNED NOT NULL,
  ADD COLUMN undetected_count SMALLINT UNSIGNED NOT NULL;
ALTER TABLE addresses
  ADD COLUMN is_deleted TINYINT NOT NULL DEFAULT 0;
ALTER TABLE orders 
  ADD COLUMN is_auto_renew_purchase TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE users 
  ADD COLUMN is_auto_renew_on TINYINT(1) NOT NULL DEFAULT 0;DROP TABLE catalog_abb;
DROP TABLE exam_costs;
DROP TABLE messages;
DROP TABLE distributor_skus;
DROP TABLE catalog_ntl_lens;

ALTER TABLE exams DROP FOREIGN KEY exams_ibfk_2;
ALTER TABLE exams DROP KEY md_id;
ALTER TABLE exams DROP COLUMN md_id;
ALTER TABLE md_licenses DROP FOREIGN KEY md_licenses_ibfk_1;
ALTER TABLE md_licenses DROP KEY md_id;
ALTER TABLE md_licenses DROP COLUMN md_id;
DROP TABLE mds;
ALTER TABLE reward_rules 
  CHANGE branch_id promo_code VARCHAR(64);
/*
* Migration 179
* 8/11/2017
* Joe Predham
* We can record entire detect segments without picking up a face. In this case,
* we still want to know we made those requests, but also need to convey no
* distance could be detected. Hence allowing nulls in the meanDistance column.
*/

ALTER TABLE video_detection_segments
  MODIFY COLUMN mean_distance decimal(4,2);
ALTER TABLE orders
  DROP COLUMN is_auto_renew;

ALTER TABLE cart
  DROP COLUMN auto_renew;
ALTER TABLE cart
  ADD COLUMN dx_shipping_option_id TINYINT DEFAULT NULL,
  ADD FOREIGN KEY (dx_shipping_option_id) REFERENCES shipping_options(id)
;

ALTER TABLE exams
  -- Add DX to their exam
  ADD COLUMN is_dx TINYINT DEFAULT 0,

  -- Did you see clearly when you last wore the contact lenses you are seeking a renewed prescription for?
  ADD COLUMN has_answered_dx_q1 DATETIME DEFAULT NULL,

  -- Do you/did you have any pain or discomfort in the contact lenses you’d like a renewed prescription for?
  ADD COLUMN has_answered_dx_q2 DATETIME DEFAULT NULL,

  -- Do you understand that the Simple Contacts test is a vision test only and not a substitute for a dilated eye health exam?
  ADD COLUMN has_answered_dx_q3 DATETIME DEFAULT NULL,

  -- Please confirm that the brand and prescription details you’ve entered are what you were last prescribed by your doctor. The prescription parameters must exactly match your last prescription.
  ADD COLUMN has_answered_dx_q4 DATETIME DEFAULT NULL,

  -- Have you worn the prescription lenses you would like to renew within the last two months?
  ADD COLUMN has_answered_dx_q5 DATETIME DEFAULT NULL,

  -- Please be aware that the diagnostic lenses you will receive are dispensed only for use during your Simple Contacts exam, and should be discarded immediately after your exam is complete. They are for exam purposes only and do not constitute a new prescription.
  ADD COLUMN has_answered_dx_q6 DATETIME DEFAULT NULL
;

ALTER TABLE shipping_options
  ADD COLUMN is_dx TINYINT NOT NULL DEFAULT 0;



ALTER TABLE orders
  ADD COLUMN has_dx TINYINT(0) NOT NULL DEFAULT 0,
  ADD COLUMN dx_shipping_cost DECIMAL(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN dx_shipping_option_id TINYINT(0) DEFAULT NULL,
  ADD FOREIGN KEY (dx_shipping_option_id) REFERENCES shipping_options(id),
  ADD COLUMN dx_tracking_number VARCHAR(256) DEFAULT NULL,
  ADD COLUMN dx_tracking_number_url VARCHAR(256) DEFAULT NULL, 
  ADD COLUMN is_dx_shipping_confirm_sent TINYINT(0) NOT NULL DEFAULT 0;
CREATE TABLE experimental_subscriptions (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  user_id INT,
  order_id INT,

  stripe_plan_id VARCHAR(32),
  date_subscription_ends DATETIME DEFAULT NULL,

  left_product_id INT,
  left_rx JSON,
  right_product_id INT,
  right_rx JSON,
  experiment_data JSON

) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


CREATE TABLE experimental_passive_verification (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  user_id INT,
  order_id INT,

  left_product_id INT,
  left_qty INT,
  left_rx JSON,
  right_product_id INT,
  right_qty INT,
  right_rx JSON,
  verifying_md_name VARCHAR(128),
  verifying_md_city VARCHAR(128),
  verifying_md_state VARCHAR(2),
  verifying_md_telephone VARCHAR(16),

  experiment_data JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


CREATE TABLE experimental_brand_switching (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  user_id INT,
  order_id INT,

  current_left_product_id INT,
  current_right_product_id INT,
  left_rx JSON,
  right_rx JSON,
  experiment_data JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
CREATE TABLE distributor_orders (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,

  -- foreign key to our order table, there may be multiple distributor_orders to an order, if they failed the first time.
  order_id INT NOT NULL,

  -- status of the distributor_order, REQUESTED, SUCCESSFUL or FAILED
  status VARCHAR(50) NOT NULL,

  -- Error Message and Sentry id provided by "distributor operations" api if it failed (usually relayed from distributor api).
  error TEXT,
  sentry_id VARCHAR(50),

  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- *********
  -- These fields are copied from order, but it would be best to migrate data into this new table in some future commit.
  -- *********

  -- the id the third party gives us to look up the order in their system.
  distributor_order_no VARCHAR(250),

  -- distributor shipping cost, not order shipping cost.
  shipping_cost DECIMAL(13,2) DEFAULT 0,

  -- string representation, that can be sent to distributor operations api
  shipping_option VARCHAR(100),

  -- JSON of tracking numbers and tracking urls
  -- [ { tracking_no, tracking_url s} ... ]
  tracking JSON,

  -- *********
  -- Copied from order, we want to make sure we have
  -- a snapshot of what these values at the point the order was placed,
  -- in case they change in the future.
  -- *********

  order_no VARCHAR(10) NOT NULL,
  name VARCHAR(128) NOT NULL,
  left_qty TINYINT UNSIGNED NOT NULL,
  right_qty TINYINT UNSIGNED NOT NULL,
  distributor VARCHAR(8) NOT NULL,
  left_lens_upc VARCHAR(64) NOT NULL,
  right_lens_upc VARCHAR(64) NOT NULL,
  shipping_address JSON NOT NULL,

  FOREIGN KEY (order_id) REFERENCES orders(id),
  KEY `status` (status)
);


ALTER TABLE orders
  ADD COLUMN left_lens_distributor_order_id INT DEFAULT NULL,
  ADD COLUMN right_lens_distributor_order_id INT DEFAULT NULL,
  ADD CONSTRAINT fk_left_lens FOREIGN KEY (left_lens_distributor_order_id) REFERENCES distributor_orders(id),
  ADD CONSTRAINT fk_right_lens FOREIGN KEY (right_lens_distributor_order_id) REFERENCES distributor_orders(id);
ALTER TABLE user_attribution_adjust CHANGE idfa idfa VARCHAR(45) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN payment_log JSON NULL;
ALTER TABLE orders ADD COLUMN is_auto_charge_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE exams
  ADD COLUMN is_passive_verification TINYINT DEFAULT 0,
  ADD COLUMN pass_verif_optom JSON NULL;
ALTER TABLE exams CHANGE COLUMN `pass_verif_optom` `passive_verification_optom` JSON;
ALTER TABLE user_attribution_adjust
  ADD COLUMN adid VARCHAR(45) DEFAULT NULL,
  ADD COLUMN gps_adid VARCHAR(45) DEFAULT NULL;
ALTER TABLE user_device_ad_ids RENAME user_device_ad_ids_legacy;

CREATE TABLE user_device_ad_ids (
  id VARCHAR(45) NOT NULL,
  type VARCHAR(12) NOT NULL,
  user_id INT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, user_id, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE distributor_orders ADD COLUMN is_backordered BOOLEAN DEFAULT FALSE;
ALTER TABLE distributor_orders ADD COLUMN is_cancelled BOOLEAN DEFAULT FALSE;
ALTER TABLE distributor_orders ADD COLUMN cost DECIMAL(13, 2);
ALTER TABLE distributor_orders ADD COLUMN invoice_no VARCHAR(100);
ALTER TABLE exams
  ADD COLUMN has_answered_ct_q1 DATETIME DEFAULT NULL
;
DROP TABLE user_device_ad_ids_legacy;
ALTER TABLE exams ADD COLUMN is_dr_valid_override TINYINT DEFAULT 0;
ALTER TABLE users ADD UNIQUE (email);
ALTER TABLE orders ADD COLUMN dx_left_lens_distributor_order_id INT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN dx_right_lens_distributor_order_id INT DEFAULT NULL;
-- whether dx or regular now, but flexible for other types.
ALTER TABLE distributor_orders ADD COLUMN type VARCHAR(10) NOT NULL;
ALTER TABLE advertising_attribution
ADD COLUMN landing_page_url VARCHAR(255);
CREATE TABLE IF NOT EXISTS experiment_overrides (
    user_id INT NOT NULL,
    path VARCHAR(256) NOT NULL,
    override_choice INT NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
    PRIMARY KEY (user_id, path),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE exams ADD COLUMN qualify_state VARCHAR(2) DEFAULT NULL;
ALTER TABLE exams ADD COLUMN qualify_last_exam_date DATE DEFAULT NULL;
ALTER TABLE users ADD COLUMN lens_type ENUM('daily', 'weekly', 'monthly');
-- These are additions fix issues for Connie who is calculating costs and tracking margin.

-- Problem with calculating wholesale cost when there is one cost field:
-- There are two products (left eye and right eye) and each can be a different cost AND different quantity.
ALTER TABLE distributor_orders DROP COLUMN cost;
ALTER TABLE distributor_orders DROP COLUMN shipping_cost;
ALTER TABLE distributor_orders ADD COLUMN left_cost DECIMAL(13,2);
ALTER TABLE distributor_orders ADD COLUMN right_cost DECIMAL(13,2);
ALTER TABLE distributor_orders ADD COLUMN left_shipping_cost DECIMAL(13,2);
ALTER TABLE distributor_orders ADD COLUMN right_shipping_cost DECIMAL(13,2);


-- This field and the existing wholesale_cost will be calculated when the order is completed.
-- These fields are mostly for connie and those who use SQL to pull this information for tracking margin.
ALTER TABLE orders ADD COLUMN dx_wholesale_cost DECIMAL(13,2) DEFAULT NULL;
ALTER TABLE orders ADD COLUMN dx_distributor_shipping_cost DECIMAL(13,2) DEFAULT NULL;
CREATE TABLE user_attribution_surveys (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  answer VARCHAR(128),
  location VARCHAR(128),
  device JSON,
  has_skipped BOOLEAN DEFAULT 0,

  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
CREATE TABLE tasks (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(250) NOT NULL,
  priority INT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_resolved TIMESTAMP NULL,
  date_assigned TIMESTAMP NULL,
  metadata JSON NULL,
  tags JSON NULL,
  case_category VARCHAR(250) NULL,
  assigned_admin_id INT NULL,
  assigner_admin_id INT NULL,
  completed_by_admin_id INT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT fk_assigned_admin FOREIGN KEY (assigned_admin_id) REFERENCES admins(id),
  CONSTRAINT fk_assigner_admin FOREIGN KEY (assigner_admin_id) REFERENCES admins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE tasks_xref (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  -- defines why these entities are related, (e.g.: "note", "conversation")
  association_type VARCHAR(64) NULL,
  task_id INT NOT NULL,
  order_id INT NULL,
  note_id INT NULL,
  message_id INT NULL,
  exam_id INT NULL,
  CONSTRAINT fk_task FOREIGN KEY (task_id) REFERENCES tasks(id),
  CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_note FOREIGN KEY (note_id) REFERENCES notes(id),
  CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES v2_messages(id),
  CONSTRAINT fk_exam FOREIGN KEY (exam_id) REFERENCES exams(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE orders
ADD COLUMN claimed_by_admin_id INT DEFAULT NULL;

ALTER TABLE orders
ADD CONSTRAINT fk_claimed
FOREIGN KEY (claimed_by_admin_id)
REFERENCES admins(id);
ALTER TABLE notes ADD COLUMN order_id INT NULL;
ALTER TABLE notes ADD COLUMN type VARCHAR(32) DEFAULT 'MD_NOTE' NULL;
ALTER TABLE notes ADD COLUMN data json DEFAULT NULL;
ALTER TABLE notes ADD CONSTRAINT fk_sc_notes FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE tasks ADD COLUMN last_updated timestamp default now();
ALTER TABLE tasks_xref ADD COLUMN last_updated timestamp default now();
CREATE TABLE cloud_storage (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  url VARCHAR(250) NOT NULL,
  name VARCHAR(250) NOT NULL,
  data JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE users ADD COLUMN estimated_reorder_date TIMESTAMP NULL;
ALTER TABLE orders ADD COLUMN estimated_reorder_date TIMESTAMP NULL;
CREATE TABLE IF NOT EXISTS pv_optoms (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(128),
  last_name VARCHAR(128),
  clinic_name VARCHAR(256) NOT NULL,
  clinic_telephone VARCHAR(16),
  clinic_street_line_1 VARCHAR(256) DEFAULT NULL,
  clinic_street_line_2 VARCHAR(256) DEFAULT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(2) NOT NULL,
  postal_code VARCHAR(16),
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  additional_details JSON,

  KEY `date_created` (date_created),
  KEY `date_modified` (date_modified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE pv_optoms
    DROP COLUMN first_name,
    DROP COLUMN last_name,
    ADD COLUMN doctor_name VARCHAR(255);
CREATE TABLE lens_options_cache (
  lens_id INT PRIMARY KEY NOT NULL,
  power VARCHAR(2048),
  bc VARCHAR(2048),
  dia VARCHAR(2048),
  color VARCHAR(2048),
  axis VARCHAR(2048),
  cyl VARCHAR(2048),
  add_power VARCHAR(2048),
  dn VARCHAR(2048)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE tasks ADD COLUMN user_id INT;
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_user_id FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE v2_messages ADD COLUMN subject TEXT;

CREATE TABLE message_templates (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(250) NOT NULL,
    content TEXT NOT NULL,
    date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
)  ENGINE=INNODB DEFAULT CHARSET=UTF8 COLLATE = UTF8_GENERAL_CI;
CREATE INDEX user_attribution_adjust_idfa_idx ON user_attribution_adjust(idfa);
CREATE INDEX user_attribution_adjust_adid_idx ON user_attribution_adjust(adid);
CREATE INDEX user_attribution_adjust_gps_adid_idx ON user_attribution_adjust(gps_adid);

CREATE INDEX user_device_ad_ids_user_id_idx ON user_device_ad_ids(user_id);
ALTER TABLE user_logs ADD COLUMN ip_addr VARBINARY(16);
ALTER TABLE pv_optoms RENAME TO optoms;

CREATE TABLE optom_business_hours (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  optom_id INT NOT NULL,
  day_of_week TINYINT NOT NULL, -- 0-6 to represent Sunday - Saturday
  time_open TIME NOT NULL,
  time_closed TIME NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT FOREIGN KEY(optom_id) REFERENCES optoms(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE fsm_transitions (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  task_id INT NULL,
  to_state VARCHAR(64) NOT NULL,
  from_state VARCHAR(64) NULL,
  date_created TIMESTAMP(6) default CURRENT_TIMESTAMP(6) NOT NULL,
  type VARCHAR(64) NULL,
  CONSTRAINT FOREIGN KEY(task_id) REFERENCES tasks(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

ALTER TABLE exams ADD COLUMN rx_verification_optom_id INT;
ALTER TABLE exams ADD CONSTRAINT fk_exams_rx_verification_optom_id
FOREIGN KEY (rx_verification_optom_id) REFERENCES optoms(id);
ALTER TABLE refer_a_friend 
  ADD COLUMN referree_reward_rule_id INT DEFAULT NULL,
  ADD COLUMN referrer_reward_rule_id INT DEFAULT NULL,
  ADD COLUMN is_redeemed INT DEFAULT 0;

ALTER TABLE refer_a_friend 
  ADD CONSTRAINT unique_referree_user_id_referrer_reward_rule_id
    UNIQUE (referree_user_id, referrer_reward_rule_id);

ALTER TABLE refer_a_friend 
  ADD CONSTRAINT fk_referree_reward_rule_id 
    FOREIGN KEY (referree_reward_rule_id) 
    REFERENCES reward_rules (id),
  ADD CONSTRAINT fk_referrer_reward_rule_id 
    FOREIGN KEY (referrer_reward_rule_id) 
    REFERENCES reward_rules (id);

ALTER TABLE refer_a_friend
  DROP FOREIGN KEY refer_a_friend_ibfk_1,
  DROP FOREIGN KEY refer_a_friend_ibfk_2,
  MODIFY referree_user_id int(11) NOT NULL,
  MODIFY referrer_user_id int(11) NOT NULL,
  ADD CONSTRAINT fk_referree_user_id 
    FOREIGN KEY (referree_user_id) 
    REFERENCES users (id),
  ADD CONSTRAINT fk_referrer_user_id 
    FOREIGN KEY (referrer_user_id) 
    REFERENCES users (id);
ALTER TABLE audit_log DROP COLUMN user;
ALTER TABLE optom_business_hours MODIFY time_open VARCHAR(64) NULL;
ALTER TABLE optom_business_hours MODIFY time_closed VARCHAR(64) NULL;
RENAME TABLE fsm_transitions TO rx_verification_transitions;
ALTER TABLE rx_verification_transitions MODIFY date_created TIMESTAMP default CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE exams
  ADD COLUMN optom_id INT DEFAULT NULL,
  ADD COLUMN optom_receptionist_name VARCHAR(128) DEFAULT NULL,
  ADD COLUMN rx_invalid_reason TEXT DEFAULT NULL;

ALTER TABLE exams
  ADD CONSTRAINT fk_exams_optom_id
    FOREIGN KEY (optom_id)
    REFERENCES optoms(id);

ALTER TABLE optoms
  ADD COLUMN email VARCHAR(254) DEFAULT NULL,
  ADD COLUMN fax VARCHAR(16) DEFAULT NULL;
ALTER TABLE optoms ADD FULLTEXT fulltext_search (clinic_name, doctor_name);
ALTER TABLE optoms ADD COLUMN timezone VARCHAR(64) NULL;
ALTER TABLE orders ADD COLUMN date_completed DATETIME DEFAULT NULL;
CREATE TABLE iterable_batch_logs (
  batch_end TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
ALTER TABLE orders ADD CONSTRAINT fk_v2_left_product FOREIGN KEY (v2_left_product_id) REFERENCES productsv2(id);
ALTER TABLE orders ADD CONSTRAINT fk_v2_right_product FOREIGN KEY (v2_right_product_id) REFERENCES productsv2(id);
CREATE INDEX user_logs_date_created_idx ON user_logs (date_created);
CREATE INDEX iterable_batch_logs_batch_end_idx ON iterable_batch_logs (batch_end);
ALTER TABLE notes ADD COLUMN task_id INT;

ALTER TABLE notes ADD CONSTRAINT fk_notes_to_task_id FOREIGN KEY (task_id) REFERENCES tasks(id);

ALTER TABLE tasks_xref DROP FOREIGN KEY fk_note;
ALTER TABLE tasks_xref DROP COLUMN note_id;
ALTER TABLE user_attribution_adjust
  ADD COLUMN label VARCHAR(256);
ALTER TABLE optoms DROP KEY fulltext_search;
ALTER TABLE optoms ADD FULLTEXT fulltext_search (clinic_name, doctor_name, city);
CREATE TABLE `partners` (
  `uuid` varchar(36) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`uuid`)
);

--
-- Simple Contact user accounts that are allowed access to the partner portal
--
CREATE TABLE `partner_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `partner_uuid` varchar(36) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(254) NOT NULL,
  `password_hash` varchar(60) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `partner_uuid` (`partner_uuid`),
  CONSTRAINT `partner_users_ibfk_1` FOREIGN KEY (`partner_uuid`) REFERENCES `partners` (`uuid`)
);

--
-- Test/live secret keys to show/issue through the partner portal
--
CREATE TABLE `partner_secrets` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `partner_uuid` varchar(36) NOT NULL,
  `env` varchar(4) NOT NULL DEFAULT 'test' COMMENT 'test / live',
  `secret` varchar(64) NOT NULL DEFAULT '' COMMENT 'Random value',
  `is_revoked` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Set to 1 to effectively revoke the secret and all associated tokens',
  PRIMARY KEY (`id`),
  UNIQUE KEY `secret` (`secret`),
  KEY `partner_uuid` (`partner_uuid`),
  CONSTRAINT `partner_secrets_ibfk_1` FOREIGN KEY (`partner_uuid`) REFERENCES `partners` (`uuid`)
);

--
-- Auth Tokens for interacting with our API
--
CREATE TABLE `partner_tokens` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `issued_by` int(11) unsigned NOT NULL COMMENT 'The secret that generated this token',
  `issued_at` timestamp NOT NULL,
  `jwt_token` varchar(512) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `jwt_token` (`jwt_token`),
  KEY `issued_by` (`issued_by`),
  CONSTRAINT `partner_tokens_ibfk_2` FOREIGN KEY (`issued_by`) REFERENCES `partner_secrets` (`id`)
);
-- Removes default value from jwt_token column (field should not be optional)
ALTER TABLE
  `partner_tokens`
CHANGE
  `jwt_token` `jwt_token` VARCHAR(512) NOT NULL;
ALTER TABLE partners CHANGE name name VARCHAR(255) NOT NULL;
ALTER TABLE partner_secrets CHANGE secret secret VARCHAR(64) NOT NULL COMMENT 'Random value';
ALTER TABLE rx_verification_transitions ADD COLUMN transition VARCHAR(250);
ALTER TABLE partner_secrets DROP env;
-- We don't need auth tokens anymore, we'll just use the secret keys directly
DROP TABLE partner_tokens;
CREATE TABLE timezones (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  city VARCHAR(128),
  state VARCHAR(2),
  postal_code VARCHAR(9),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  area_code VARCHAR(3),
  timezone VARCHAR(30)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
CREATE TABLE price_overlays (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  label VARCHAR(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE prices (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  price DECIMAL(5,2) NOT NULL,
  min_quantity_threshold TINYINT UNSIGNED NOT NULL,
  lens_id INT NOT NULL,
  price_overlay_id INT NOT NULL,
  FOREIGN KEY fk_lens_id (lens_id) REFERENCES lenses (id),
  FOREIGN KEY fk_price_overlay_id (price_overlay_id) REFERENCES price_overlays (id),
  UNIQUE KEY unique_date_lens_price_overlay_qty 
    (date_created, lens_id, price_overlay_id, min_quantity_threshold)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE users_price_overlays (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_expiration TIMESTAMP NULL, 
  user_id INT NOT NULL,
  price_overlay_id INT NOT NULL,
  FOREIGN KEY fk_user_id (user_id) REFERENCES users (id),
  FOREIGN KEY fk_price_overlay_id (price_overlay_id) REFERENCES price_overlays (id),
  UNIQUE KEY unique_user_price_overlay (user_id, price_overlay_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
CREATE TABLE `partner_identities` (
  `uuid` varchar(36) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `partner_uuid` varchar(36) NOT NULL,
  `external_id` varchar(36) NOT NULL COMMENT 'The ID of the user in the partner''s DB',
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `telephone` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `partner_uuid` (`partner_uuid`,`external_id`),
  CONSTRAINT `partner_identities_ibfk_1` FOREIGN KEY (`partner_uuid`) REFERENCES `partners` (`uuid`)
);
ALTER TABLE lenses
  ADD COLUMN is_custom tinyint(1) NOT NULL DEFAULT '0';
ALTER TABLE exams
  ADD COLUMN has_signed_high_myope_waiver TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN qualify_last_exam_range_start_date DATE DEFAULT NULL,
  ADD COLUMN qualify_last_exam_range_end_date DATE DEFAULT NULL;
ALTER TABLE lenses DROP options;
CREATE TABLE `promo_rewards` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `promo_code` VARCHAR(64) DEFAULT NULL,
  `label` VARCHAR(64) NOT NULL,
  `value` DECIMAL(13,2) NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `max_uses` INT(1) DEFAULT 1,
  `is_stackable` TINYINT(1) NOT NULL DEFAULT 0,
  `can_combine` TINYINT(1) NOT NULL DEFAULT 0,
  `for_new_users` TINYINT(1) NOT NULL DEFAULT 0,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY `unique_promo_code` (`promo_code`)
);

CREATE TABLE `held_promo_rewards` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `promo_reward_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `applied_to_order_id` INT,
  `date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `value` DECIMAL(13,2) NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `is_stackable` TINYINT(1) NOT NULL DEFAULT 0,
  `can_combine` TINYINT(1) NOT NULL DEFAULT 0,
  `for_new_users` TINYINT(1) NOT NULL DEFAULT 0,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `promo_reward_id_ibfk` FOREIGN KEY (`promo_reward_id`) REFERENCES `promo_rewards` (`id`),
  CONSTRAINT `user_held_promo_reward_ibfk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `applied_to_order_id_ibfk_1` FOREIGN KEY (`applied_to_order_id`) REFERENCES `orders` (`id`)
);

CREATE TABLE `held_px_rewards` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `applied_to_order_id` INT,
  `given_by_admin_id` INT NOT NULL,
  `date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `value` DECIMAL(13,2) NOT NULL,
  `type` VARCHAR(32) NOT NULL,
  `reason` VARCHAR(128) NOT NULL,
  `locked_to_order` TINYINT(1) NOT NULL DEFAULT 0,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `user_held_px_reward_ibfk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `given_by_admin_id_ibfk` FOREIGN KEY (`given_by_admin_id`) REFERENCES `admins` (`id`),
  CONSTRAINT `applied_to_order_id_ibfk_2` FOREIGN KEY (`applied_to_order_id`) REFERENCES `orders` (`id`)
);
RENAME TABLE rx_verification_transitions to task_transitions
CREATE TABLE `faxes` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `optom_id` INT,
  `task_id` INT NOT NULL,
  `from` VARCHAR(12) COMMENT 'in format 123-123-1234, this "could" be missing from incoming faxes.',
  `to` VARCHAR(12) NOT NULL COMMENT 'in format 123-123-1234',
  `s3_key` VARCHAR(255) NOT NULL COMMENT 's3 bucket key to file.',
  `direction` ENUM('INBOUND', 'OUTBOUND') NOT NULL,
  `status` VARCHAR(10) COMMENT 'faxage api, only applicable for outgoing.',
  `longstatus` TEXT,
  `faxage_id` INT NOT NULL COMMENT 'In faxage ... outgoing faxes this a "jobid", but for incoming its called a "receiveid"',
  `retries` INT NOT NULL DEFAULT 0,
  `date_sent` DATETIME NOT NULL COMMENT 'from faxage api',
  `date_complete` DATETIME COMMENT 'from faxage api .. only used on outgoing faxes.',
  `date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `faxes_status` (`status`),
  CONSTRAINT `faxes_task_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`),
  CONSTRAINT `faxes_optom_fk` FOREIGN KEY (`optom_id`) REFERENCES `optoms` (`id`)
);
ALTER TABLE price_overlays
  ADD COLUMN `affiliate_id` varchar(8) DEFAULT NULL UNIQUE;
ALTER TABLE exams
  ADD COLUMN fax_verification_response_id INT,
  ADD COLUMN fax_verification_request_id INT,
  ADD CONSTRAINT `fax_verification_response_fk` FOREIGN KEY(fax_verification_response_id) REFERENCES faxes(id),
  ADD CONSTRAINT `fax_verification_request_fk` FOREIGN KEY(fax_verification_request_id) REFERENCES faxes(id);

ALTER TABLE optoms ADD COLUMN incoming_fax_numbers JSON
ALTER TABLE exams
  ADD COLUMN unsatisfied_state_requirements JSON;

CREATE TABLE `rx_requests` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `token` varchar(36) NOT NULL,
  `identity_uuid` varchar(36) NOT NULL,
  `partner_uuid` varchar(36) NOT NULL,
  `target_skus` json NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `identity_uuid` (`identity_uuid`),
  KEY `partner_uuid` (`partner_uuid`),
  CONSTRAINT `rx_requests_ibfk_1` FOREIGN KEY (`identity_uuid`) REFERENCES `partner_identities` (`uuid`),
  CONSTRAINT `rx_requests_ibfk_2` FOREIGN KEY (`partner_uuid`) REFERENCES `partners` (`uuid`)
);
ALTER TABLE tasks
  ADD COLUMN `parent_task_id` int(11) DEFAULT NULL,
  ADD FOREIGN KEY (`parent_task_id`) REFERENCES `tasks`(`id`);
-- Allow NULLs
ALTER TABLE partners
    ADD theme VARCHAR(16) NULL DEFAULT NULL
    AFTER name;

-- Populate all theme cols
UPDATE partners SET theme = LOWER(name) WHERE theme = "" OR theme IS NULL;

-- Disallow NULLs
ALTER TABLE partners
    CHANGE `theme` `theme` VARCHAR(16) NOT NULL;
CREATE TABLE `rx_patients` (
  `uuid` varchar(36) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rx_request_id` int(11) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `date_of_birth` varchar(10) DEFAULT NULL COMMENT 'YYYY-MM-DD',
  `scratchpad` json NOT NULL,
  `left_rx` json DEFAULT NULL,
  `right_rx` json DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  KEY `rx_request_id` (`rx_request_id`),
  CONSTRAINT `rx_patients_ibfk_1` FOREIGN KEY (`rx_request_id`) REFERENCES `rx_requests` (`id`)
);
ALTER TABLE rx_patients CHANGE scratchpad scratchpad JSON DEFAULT NULL;
ALTER TABLE shipping_options 
  ADD COLUMN `affiliate_id` varchar(8) DEFAULT NULL UNIQUE;

UPDATE shipping_options 
SET affiliate_id = right(md5(concat(id, label, cost, is_dx)), 8);

ALTER TABLE shipping_options 
  MODIFY COLUMN `affiliate_id` varchar(8) NOT NULL UNIQUE;


ALTER TABLE rx_patients DROP date_of_birth;
ALTER TABLE rx_patients ADD fulfillment JSON NULL DEFAULT NULL AFTER scratchpad;
ALTER TABLE distributor_orders
  ADD COLUMN pack VARCHAR(20),
  ADD COLUMN tshirt VARCHAR(5);
ALTER TABLE rx_requests CHANGE target_skus target_product_ids JSON NOT NULL;
CREATE TABLE user_reattribution_adjust LIKE user_attribution_adjust;
ALTER TABLE rx_patients
  ADD left_product_id INT(11) NULL DEFAULT NULL AFTER fulfillment,
  ADD right_product_id INT(11) NULL DEFAULT NULL AFTER left_rx,
  ADD FOREIGN KEY (left_product_id) REFERENCES lenses (id),
  ADD FOREIGN KEY (right_product_id) REFERENCES lenses (id);
RENAME TABLE rx_requests TO rx_orders;

ALTER TABLE rx_patients CHANGE rx_request_id rx_order_id INT(11) UNSIGNED NOT NULL;
RENAME TABLE rx_patients TO rx_requests;
RENAME TABLE partner_users TO partner_portal_users;
LOCK TABLES orders WRITE, exams WRITE;

ALTER TABLE exams
  DROP FOREIGN KEY `exams_users_fk`,
  MODIFY `user_id` int(11) NOT NULL;

ALTER TABLE exams
  ADD CONSTRAINT `exams_users_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE exams
  MODIFY `status` varchar(128) NOT NULL DEFAULT 'USER_INCOMPLETE';

ALTER TABLE orders
  DROP FOREIGN KEY `fk_user_id`,
  MODIFY `user_id` int(11) NOT NULL;

ALTER TABLE orders 
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

UNLOCK TABLES;
CREATE INDEX direction_is_acked_idx ON v2_messages(direction, is_acknowledged);
-- Lets remove these foreign key reference lenses.
ALTER TABLE orders DROP FOREIGN KEY `fk_v2_left_product`;
ALTER TABLE orders DROP FOREIGN KEY `fk_v2_right_product`;

-- Lets formalize that the lenses table is the replacement for the products table.
-- This will make codegens and admin graphql use lenses table by default instead of
-- products table.
ALTER TABLE orders ADD FOREIGN KEY `fk_v2_left_product` (`v2_left_product_id`) REFERENCES `lenses` (`id`);
ALTER TABLE orders ADD FOREIGN KEY `fk_v2_right_product` (`v2_right_product_id`) REFERENCES `lenses` (`id`);
ALTER TABLE lenses ADD FOREIGN KEY `fk_brand_id` (`brand_id`) REFERENCES `brands` (`id`);
LOCK TABLES deeplinks WRITE, refer_a_friend WRITE;

-- Remove the deeplinks reward rule foreign key reference
ALTER TABLE deeplinks
  DROP FOREIGN KEY `deeplinks_ibfk_2`;

-- Add columns that will reference held promos instead of wallet transactions
ALTER TABLE refer_a_friend
  ADD COLUMN `referree_held_promo_id` INT(11) DEFAULT NULL,
  ADD COLUMN `referrer_held_promo_id` INT(11) DEFAULT NULL;

ALTER TABLE refer_a_friend
  ADD CONSTRAINT `refer_a_friend_ibfk_5`
  FOREIGN KEY (`referree_held_promo_id`)
  REFERENCES `held_promo_rewards` (`id`),
  ADD CONSTRAINT `refer_a_friend_ibfk_6`
  FOREIGN KEY (`referrer_held_promo_id`)
  REFERENCES `held_promo_rewards` (`id`);

UNLOCK TABLES;
ALTER TABLE exams
  ADD COLUMN photo_rx_state VARCHAR(16) DEFAULT NULL;
UPDATE users
  -- Populate fields with a short random string
  SET affiliate_id = SUBSTR(UUID(), 1, 8)
  WHERE affiliate_id IS NULL;

ALTER TABLE users CHANGE affiliate_id affiliate_id VARCHAR(16) NOT NULL;
RENAME TABLE partners TO partners_deprecated;

CREATE TABLE partners (
    id tinyint unsigned NOT NULL AUTO_INCREMENT,
    public_uuid varchar(36) NOT NULL,
    date_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name varchar(255) NOT NULL,
    theme varchar(16) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY public_uuid (public_uuid)
);

-- Now make sure to inject the special "Simple Contacts" row, which we want to
-- be partner #1
INSERT
  INTO partners (id, public_uuid, name, theme)
  VALUES (1, 'ac85fcd8-9da9-4450-be57-d528bc7ac5e0', 'Simple Contacts', 'default');

-- Now copy over all the data from the previous partners table
INSERT
  INTO partners (public_uuid, date_created, name, theme)
  SELECT uuid, date_created, name, theme FROM partners_deprecated;
--
-- The purpose of this migration is to change the primary key of the `partners`
-- table from a UUID string value to a standard/normal auto-incrementing
-- numeric ID.  The "uuid" value will still be used as an alternative way to
-- reference rows publicly.
--
--     Replace PK  `uuid`   =>  `id` (new)
--     Rename      `uuid`   =>  `public_uuid`
--
-- All references to the `partner_uuid` in the following tables are going to be
-- replaced by an integer-based reference to the new `id` PK:
--   - partner_identities
--   - partner_portal_users
--   - partner_secrets
--   - rx_orders
--
-- The steps are:
-- 1. Add a new "partner_id" column to these referencing tables (NULL initially)
-- 2. Run an UPDATE query that inserts the correct "partner_id" values
-- 3. Add a NOT NULL constraint to the "partner_id" column
-- 4. Remove the `partner_uuid` column
--

-- Step 1 (4x)
ALTER TABLE partner_identities   ADD partner_id TINYINT UNSIGNED NULL AFTER partner_uuid;
ALTER TABLE partner_portal_users ADD partner_id TINYINT UNSIGNED NULL AFTER partner_uuid;
ALTER TABLE partner_secrets      ADD partner_id TINYINT UNSIGNED NULL AFTER partner_uuid;
ALTER TABLE rx_orders            ADD partner_id TINYINT UNSIGNED NULL AFTER partner_uuid;

ALTER TABLE partner_identities   ADD FOREIGN KEY (partner_id) REFERENCES partners (id);
ALTER TABLE partner_portal_users ADD FOREIGN KEY (partner_id) REFERENCES partners (id);
ALTER TABLE partner_secrets      ADD FOREIGN KEY (partner_id) REFERENCES partners (id);
ALTER TABLE rx_orders            ADD FOREIGN KEY (partner_id) REFERENCES partners (id);

-- Step 2 (4x)
UPDATE partner_identities t      SET partner_id = (SELECT id FROM partners WHERE public_uuid = t.partner_uuid);
UPDATE partner_portal_users t    SET partner_id = (SELECT id FROM partners WHERE public_uuid = t.partner_uuid);
UPDATE partner_secrets t         SET partner_id = (SELECT id FROM partners WHERE public_uuid = t.partner_uuid);
UPDATE rx_orders t               SET partner_id = (SELECT id FROM partners WHERE public_uuid = t.partner_uuid);

-- Step 3 (4x)
-- These failed on running a migration, moved them to a new migration to fix
-- ALTER TABLE partner_identities   CHANGE partner_id partner_id TINYINT UNSIGNED NOT NULL;
-- ALTER TABLE partner_portal_users CHANGE partner_id partner_id TINYINT UNSIGNED NOT NULL;
-- ALTER TABLE partner_secrets      CHANGE partner_id partner_id TINYINT UNSIGNED NOT NULL;
-- ALTER TABLE rx_orders            CHANGE partner_id partner_id TINYINT UNSIGNED NOT NULL;

-- Step 4 (4x)
ALTER TABLE partner_identities   DROP FOREIGN KEY partner_identities_ibfk_1;
ALTER TABLE partner_portal_users DROP FOREIGN KEY partner_portal_users_ibfk_1;
ALTER TABLE partner_secrets      DROP FOREIGN KEY partner_secrets_ibfk_1;
ALTER TABLE rx_orders            DROP FOREIGN KEY rx_orders_ibfk_2;

ALTER TABLE partner_identities   DROP partner_uuid;
ALTER TABLE partner_portal_users DROP partner_uuid;
ALTER TABLE partner_secrets      DROP partner_uuid;
ALTER TABLE rx_orders            DROP partner_uuid;
DROP TABLE partners_deprecated;
ALTER TABLE partner_identities   DROP FOREIGN KEY partner_identities_ibfk_2;
ALTER TABLE partner_portal_users DROP FOREIGN KEY partner_portal_users_ibfk_2;
ALTER TABLE partner_secrets      DROP FOREIGN KEY partner_secrets_ibfk_2;
ALTER TABLE rx_orders            DROP FOREIGN KEY rx_orders_ibfk_3;

ALTER TABLE partner_identities   CHANGE partner_id partner_id TINYINT UNSIGNED NOT NULL;
ALTER TABLE partner_portal_users CHANGE partner_id partner_id TINYINT UNSIGNED NOT NULL;
ALTER TABLE partner_secrets      CHANGE partner_id partner_id TINYINT UNSIGNED NOT NULL;
ALTER TABLE rx_orders            CHANGE partner_id partner_id TINYINT UNSIGNED NOT NULL;

ALTER TABLE partner_identities   ADD FOREIGN KEY (partner_id) REFERENCES partners (id);
ALTER TABLE partner_portal_users ADD FOREIGN KEY (partner_id) REFERENCES partners (id);
ALTER TABLE partner_secrets      ADD FOREIGN KEY (partner_id) REFERENCES partners (id);
ALTER TABLE rx_orders            ADD FOREIGN KEY (partner_id) REFERENCES partners (id);
CREATE TABLE `productsv4` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` enum('birth-control','contact-lens') NOT NULL,
  `name` varchar(64) NOT NULL,
  `description` text NOT NULL,
  `img_url` varchar(128) NOT NULL,
  `num_items_per_pack` smallint(5) unsigned NOT NULL,
  `price` decimal(13,2) DEFAULT '0.00',
  `generic_of_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `generic_of_id` (`generic_of_id`),
  CONSTRAINT `productsv4_ibfk_1` FOREIGN KEY (`generic_of_id`) REFERENCES `productsv4` (`id`)
) 
CREATE TABLE `rxs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` INT(11) NOT NULL,
  `type` enum('birth-control','contact-lens') NOT NULL,
  `issued_at` date NOT NULL,
  `expires_at` date NOT NULL,
  `patient_name` varchar(255) NOT NULL,
  `patient_date_of_birth` date NOT NULL,
  `patient_address` varchar(255) NOT NULL DEFAULT '',
  `patient_city` varchar(255) NOT NULL DEFAULT '',
  `patient_state` varchar(255) NOT NULL DEFAULT '',
  `md_name` varchar(255) NOT NULL DEFAULT '',
  `md_address1` varchar(255) NOT NULL DEFAULT '',
  `md_address2` varchar(255) NOT NULL DEFAULT '',
  `md_phone` varchar(255) NOT NULL DEFAULT '',
  `md_license_no` varchar(32) NOT NULL DEFAULT '',
  `signed_off_by_md_admin_id` int(11) NOT NULL,
  `rx_attributes` json NOT NULL,
  `signature` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `user_id_fk` (`user_id`),
  CONSTRAINT `user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) 
ALTER TABLE productsv4
    CHANGE num_items_per_pack quantity_text VARCHAR(255) NOT NULL,
    ADD pill_type ENUM("Combination Pill", "Progestin Only") NOT NULL,
    ADD risks VARCHAR(255) NOT NULL,
    ADD tags JSON NOT NULL,
    ADD ingredients JSON NOT NULL;
