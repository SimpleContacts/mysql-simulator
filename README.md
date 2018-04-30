[![Build Status](https://travis-ci.com/SimpleContacts/mysql-tools.svg?token=aq9GGFeH6P9dKDFz65um&branch=master)](https://travis-ci.com/SimpleContacts/mysql-tools)

# Usage

Usage:

    $ bin/mysql-simulate <path>

To run it on all the migrations in the Simple Contacts main repo:

    $ bin/mysql-simulate ../simplecontacts/migrations

This will sort all SQL files in that directory and simulate running them
sequentially.  At the end, the DB's state is outputted as a single big DB dump.


# For developers

### Regenerating the parser

After changing the grammar file (`src/parser/mysql.pegjs`), you need to
recompile the parser:

    $ yarn build:parser


### Running the test suite

The test suite for this project is a little bit different from "normal"
JavaScript project tests.  It's invoked by

    $ yarn test

And will basically do the following for all test files found in `tests/*.sql`:

1. Run test files against a real, running, MySQL database. Output to
   `tests/real/*.sql`.
1. Run test files against the simulator. Output to `tests/simulated/*.sql`.
1. Diff the results.  No diff means test suite passes.

This setup offers the level of confidence that the simulator is actually
working as expected, and at the same time makes it really easy to add specific
test cases later on: simply add a new `*.sql` file!
