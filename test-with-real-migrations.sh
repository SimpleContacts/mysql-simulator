#!/bin/sh
set -e

# Command line arg parsing {{{

usage () {
    echo "usage: ./test-with-real-migrations.sh [-lth]" >&2
    echo >&2
    echo "Options:" >&2
    echo "-l <n>       Limit to N migrations" >&2
    echo "-t <table>   Output only diff for <table>" >&2
    echo "-h           Show this help" >&2
}

limit=0
table=""
while getopts l:t:h flag; do
    case "$flag" in
        l) limit=$OPTARG;;
        t) table=$OPTARG;;
        h) usage; exit 2;;
    esac
done
shift $(($OPTIND - 1))

limit_args=""
if [ $limit -gt 0 ]; then
    limit_args="--limit $limit"
fi

table_args=""
if [ -n "$table" ]; then
  table_args="--table $table"
fi


# }}}

# Generate real DB dump
(
  cd ../simplecontacts
  bin/resetDb.js --no-cache --quiet $limit_args
  mysqldump simplecontacts $table --no-data --skip-triggers --compact \
    | sed -Ee 's/^[/][*].*$//' | tr -s '\n' | sed -Ee 's/;/;@/' | tr '@' '\n' \
    | sed -Ee 's/([[:space:]]+(CHARACTER SET|COLLATE)[[:space:]=]+[A-Za-z0-9_]+)+//' \
    | sed -Ee 's/[[:space:]]+AUTO_INCREMENT=[0-9]+//' \
    > /tmp/real.sql
)

# Generate simulated DB dump
bin/mysql-simulate ../simplecontacts/migrations -v $limit_args $table_args > /tmp/simulated.sql

# Show the diff
if diff -q /tmp/simulated.sql /tmp/real.sql > /dev/null; then
  echo "All good!"
else
  echo "Uh-oh! There were differences!"
  colordiff -U8 /tmp/simulated.sql /tmp/real.sql | less -R
fi
