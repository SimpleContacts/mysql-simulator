#!/bin/sh
set -e

# Command line arg parsing {{{

usage () {
    echo "usage: ./test.sh [-lth]" >&2
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
  bin/resetDb.js --quiet $limit_args
  mysqldump simplecontacts $table --no-data --compact \
    | sed -Ee 's/^[/][*].*$//' | tr -s '\n' | sed -Ee 's/;/;@/' | tr '@' '\n' \
    | sed -Ee 's/[[:space:]]+(CHARACTER SET|COLLATE)[[:space:]=]+[A-Za-z0-9_]+//' \
    > /tmp/real.sql
)

# Generate simulated DB dump
bin/mysql-simulate ../simplecontacts/migrations $limit_args $table_args > /tmp/simulated.sql

# Show the diff
colordiff -U8 /tmp/real.sql /tmp/simulated.sql | less -R
