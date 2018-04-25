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

