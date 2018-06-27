#!/bin/sh
set -e

rm -rf tests/real/* tests/simulated/*
rm -rf tests/real/.DS_Store tests/simulated/.DS_Store

# Run in parallel...
./bin/run-simulation.sh &
./bin/run-real.sh &

# ...wait for both procs to finish
wait

# Show the diff
if diff -q tests/real tests/simulated > /dev/null; then
echo "All good!" >&2
else
  echo "Uh-oh! There were differences!" >&2
  if [ -n "$TRAVIS" ]; then
    diff -U8 tests/simulated tests/real
  else
    colordiff -U8 tests/simulated tests/real
  fi
  exit 2
fi
