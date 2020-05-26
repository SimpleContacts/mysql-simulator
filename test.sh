#!/bin/sh
set -e

mysql_version="$1"
if [ "$mysql_version" != '5.7' -a "$mysql_version" != '8.0' ]; then
  echo "Please specify mysql version as the argument, e.g." >&2
  echo "    ./test.sh 5.7"                                  >&2
  exit 2
fi
shift 1

rm -rf tests/real/* tests/simulated/*
rm -rf tests/real/.DS_Store tests/simulated/.DS_Store

# Run in parallel...
./bin/run-simulation.sh "$mysql_version" "$@" &
./bin/run-real.sh "$mysql_version" "$@" &

# ...wait for both procs to finish
wait

# Show the diff
if diff -q tests/real tests/simulated > /dev/null; then
echo "All good!" >&2
else
  echo "Uh-oh! There were differences!" >&2
  if [ -n "$CI" ]; then
    diff -U8 tests/simulated tests/real
  else
    colordiff -U8 tests/simulated tests/real
  fi
  exit 2
fi
