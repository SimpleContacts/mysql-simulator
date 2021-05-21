#!/bin/sh
set -e

testdb=foobarqux
input_dir=tests
output_dir=tests/real

# Unless explicitly set on the command line, use the server's default values
# (differ per MySQL version, so watch out!)
charset=
collate=

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

  cmd="CREATE DATABASE $testdb"
  if [ -n "$charset" ]; then
    cmd="$cmd DEFAULT CHARACTER SET $charset"
  fi
  if [ -n "$collate" ]; then
    cmd="$cmd DEFAULT COLLATE $collate"
  fi
  echo "$cmd;" | mysql
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
