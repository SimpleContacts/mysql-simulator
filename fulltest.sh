#!/bin/sh
set -e

run_with () {
  charset="$1"
  collation="$2"
  echo "==============================================================" >&2
  echo "Running full test suite with defaults:" >&2
  echo "   Charset:   ${charset}" >&2
  echo "   Collation: ${collation}" >&2
  ./test.sh -v 5.7 -s "$charset" -c "$collation"
  echo "==============================================================" >&2
  echo "" >&2
  echo "" >&2
  echo "" >&2
}

run_with latin1 latin1_swedish_ci
run_with latin1 latin1_spanish_ci
run_with utf8 utf8_general_ci
run_with utf8 utf8_icelandic_ci
run_with utf8mb4 utf8mb4_general_ci
run_with utf8mb4 utf8mb4_unicode_ci

# This one only works in MySQL 8.0 (and will be the default). MySQL 5.7 doesn't understand this encoding.
# ./test.sh -v 8.0 -s utf8mb4 -c utf8mb4_0900_ai_ci
