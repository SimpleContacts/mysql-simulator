#!/bin/sh
set -e

usage () {
    echo "usage: ./test.sh [-lth]" >&2
    echo >&2
    echo "Options:" >&2
    echo "-l <n>       Limit to N migrations" >&2
    echo "-h           Show this help" >&2
}

limit=0
while getopts l:h flag; do
    case "$flag" in
        l) limit=$OPTARG;;
        h) usage; exit 2;;
    esac
done
shift $(($OPTIND - 1))

limit_args=""
if [ $limit -gt 0 ]; then
    limit_args="--limit $limit"
fi

# Generate real DB dump
(
  cd ../simplecontacts
  touch migrations/*
  bin/resetDb.js $limit_args
  mysqldump simplecontacts --no-data --compact | sed -Ee 's/^[/][*].*$//' | tr -s '\n' | sed -Ee 's/;/;@/' | tr '@' '\n' > /tmp/real.sql
)

# Generate simulated DB dump
bin/mysql-simulate ../simplecontacts/migrations -v $limit_args > /tmp/simulated.sql

# Show the diff
colordiff -U8 /tmp/real.sql /tmp/simulated.sql 
