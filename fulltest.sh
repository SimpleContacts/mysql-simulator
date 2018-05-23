#!/bin/sh
set -e

start=${1:-1}
end=${2:-305}
for i in $(seq $start $end); do
  ./test-with-real-migrations.sh -l $i
done
