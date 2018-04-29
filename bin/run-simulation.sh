#!/bin/sh
set -e

testdb=foobarqux
input_dir=tests
output_dir=tests/simulated

dump() {
  bin/mysql-simulate -v $limit_args $@
}

to_outfile() {
  echo "$output_dir/$(basename "$1")"
}

run_simulation() {
  infile="$1"
  outfile=$(to_outfile "$infile")
  dump $infile > $outfile
}

for f in $(ls tests/*.sql | sort -n); do
  run_simulation "$f"
done
