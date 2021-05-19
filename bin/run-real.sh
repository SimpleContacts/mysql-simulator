#!/bin/sh
set -e

testdb=foobarqux
input_dir=tests
output_dir=tests/real

# Create the test DB with the following charset/collate (these need to be
# passed to the simulator as well)

# These are the defaults for MySQL 5.7
charset=latin1
collate=latin1_swedish_ci

# These are the defaults for MySQL 8.0
# charset=utf8mb4
# collate=utf8mb4_0900_ai_ci

while getopts s:c: flag; do
  case "$flag" in
    s) charset=$OPTARG ;;
    c) collate=$OPTARG ;;
    *) exit 2 ;;
  esac
done

shift "$((OPTIND-1))"

if [ $# -gt 0 ]; then
  echo "Superfluous arguments: $@"
  exit 2
fi

dump() {
  mysqldump $testdb --no-data --no-tablespaces --skip-triggers --compact \
    | sed -Ee 's/^[/][*].*$//' | tr -s '\n' | sed -Ee 's/;/;@/' | tr '@' '\n' \
    | sed -Ee 's/[[:space:]]+AUTO_INCREMENT=[0-9]+//'
}

resetdb() {
  # Recreate test DB
  echo "DROP DATABASE IF EXISTS $testdb;" | mysql
  echo "CREATE DATABASE $testdb DEFAULT CHARACTER SET $charset DEFAULT COLLATE $collate;" | mysql
}

to_outfile() {
  echo "$output_dir/$(basename "$1")"
}

run_on_mysql() {
  infile="$1"
  outfile=$(to_outfile "$infile")

  echo "Real: $(basename "$infile")"
  resetdb

  cat $infile | sed -Ee 's/__dbname__/foobarqux/g' | mysql $testdb
  dump > $outfile
}

for f in $(ls tests/*.sql | sort -n); do
  run_on_mysql "$f"
done
