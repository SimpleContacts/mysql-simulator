# v1.8.1

- Support printing foreign keys last in serialized output
- Add `--foreign-keys-last` CLI flag

# v1.8.0

- Support sequence ranges in migration filename format, e.g. `001-012_range_of_migrations.sql`
- Expose `getMigrations()` API publicly, which returns the parsed migration info from these filenames

# v1.7.1

- Fix bug where `timestamp` columns may sometimes not get serialized correctly

# v1.7.0

- Add full support for `CHARACTER SET` and `COLLATE`
- Add support for `ON DELETE` clause in foreign key definitions

# v1.6.0

- Add support for `RENAME INDEX`

# v1.5.1

- Upgraded to Flow 0.133.0

# v1.5.0

- Removed `--limit` and `--step` command line flags
- Add `--as-rol-schema` command line flag, which can output the table dump in
  [Rule of Law](https://github.com/nvie/rule-of-law) compatible schema format

# v1.4.1

- First public release
- Removed runtime dependencies on SimpleHealth internal/private packages

# v1.4.0

- Add support for `LIKE`, `REGEXP`, and `RLIKE` syntax in conditions

# v1.3.3

- Accept table options syntax in ALTER TABLE statements

# v1.3.2

- Something went wrong publishing 1.3.1 to NPM. No functional changes.

# v1.3.1

- Fix bug where NULL literals inside expressions didn't get serialized
  correctly

# v1.3.0

- Support for `GENERATED ALWAYS AS (expr)` syntax on column definitions

# v1.2.22

Started keeping a changelog here.
