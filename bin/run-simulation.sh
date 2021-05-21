#!/bin/sh
set -e

testdb=foobarqux
input_dir=tests
output_dir=tests/simulated

# Create the test DB with the following charset/collate (these need to be
# passed to the simulator as well)

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
  sim_args=
  if [ -n "$charset" ]; then
    sim_args="$sim_args --charset $charset"
  fi
  if [ -n "$collate" ]; then
    sim_args="$sim_args --collate $collate"
  fi
  bin/mysql-simulate -v $sim_args "$@"
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
