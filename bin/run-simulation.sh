#!/bin/sh
set -e

testdb=foobarqux
input_dir=tests
output_dir=tests/simulated

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
  bin/mysql-simulate -v --charset "$charset" --collate "$collate" $@
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
