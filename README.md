# Running it

To run all steps sequantially, simply run:

    $ yarn all

This will run both the SQL parser as well as the evaluator/simulator.


# Parsing SQL

To only run the parser, run:

    $ yarn parse

This will effectively take the SQL in `input.sql` and write the parsed AST to
`ast.json`, equivalent to running:

    $ parse-sql < input.sql > ast.json


# Simulating / replay

To only evalutate the AST, run:

    $ yarn simulate

This will simulate a new DB in-memory, and process SQL statements from
`ast.json` one-by-one, keeping track of state changes with each change, and
outputs the final DB structure.
