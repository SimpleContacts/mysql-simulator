#!/bin/sh
set -e

mysql_version="$1"
if [ -z "$mysql_version" ]; then
  echo "Please specify MySQL version" >&2
  exit 2
fi
shift 1

testdb=foobarqux
input_dir=tests
output_dir=tests/simulated

dump() {
  bin/mysql-simulate -v --mysql-version "$mysql_version" "$@"
}

to_outfile() {
  echo "$output_dir/$(basename "$1")"
}

run_simulation() {
  infile="$1"
  outfile=$(to_outfile "$infile")
  dump $infile > $outfile &
}

for f in $(ls tests/*.sql | sort -n); do
  run_simulation "$f"
done
wait
