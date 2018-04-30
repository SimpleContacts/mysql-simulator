#!/bin/sh
set -e

testdb=foobarqux
input_dir=tests
output_dir=tests/real

dump() {
  mysqldump $testdb --no-data --skip-triggers --compact \
    | sed -Ee 's/^[/][*].*$//' | tr -s '\n' | sed -Ee 's/;/;@/' | tr '@' '\n' \
    | sed -Ee 's/([[:space:]]+(CHARACTER SET|COLLATE)[[:space:]=]+[A-Za-z0-9_]+)+//' \
    | sed -Ee 's/[[:space:]]+AUTO_INCREMENT=[0-9]+//'
}

resetdb() {
  # Recreate test DB
  echo "DROP DATABASE IF EXISTS $testdb;" | mysql
  echo "CREATE DATABASE $testdb DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;" | mysql
}

to_outfile() {
  echo "$output_dir/$(basename "$1")"
}

run_on_mysql() {
  infile="$1"
  outfile=$(to_outfile "$infile")

  echo "Real: $(basename "$infile")"
  resetdb

  mysql $testdb < $infile
  dump > $outfile
}

for f in $(ls tests/*.sql | sort -n); do
  run_on_mysql "$f"
done
