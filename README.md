[![Build Status](https://travis-ci.com/SimpleContacts/mysql-simulator.svg?token=aq9GGFeH6P9dKDFz65um&branch=master)](https://travis-ci.com/SimpleContacts/mysql-simulator)

# Usage

This MySQL simulator offers a super easy API that, at the highest level, looks
like:

```javascript
import simulate from '@simple-contacts/mysql-simulator';

const db = simulate('./path/to/migrations');
```

The resulting DB instance is an in-memory representation of the final DB state
after applying all the SQL migrations in order, exactly as it would be in
MySQL.  The DB object can now conveniently be introspected, for example:

```javascript
for (const table of db.getTables()) {
    console.log(`- ${table.name}`);
}

const users = db.getTable('users');
console.log(users.getColumn('email').getTypeInfo().baseType);  // varchar
console.log(users.getColumn('email').getTypeInfo().nullable);  // true
console.log(users.getColumn('email').toString());  // `email` varchar(254) DEFAULT NULL

// Or just print out the whole table definition, conveniently
console.log(users.toString());
// CREATE TABLE `users` (
//   `id` int(11) NOT NULL AUTO_INCREMENT,
//   `partner_id` tinyint(3) unsigned NOT NULL,
//   `external_id` varchar(32) NOT NULL,
//   `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   `name` varchar(128) DEFAULT NULL,
//   `email` varchar(254) DEFAULT NULL,
//   ...
```

These objects are fully Flow-typed.


# Usage from the command line

There's a command line interface that might help you if you simply want to
apply some migrations and output the resulting table definitions:

    $ bin/mysql-simulate <path>

To run it on all the migrations in the Simple Contacts main repo:

    $ bin/mysql-simulate ../simplecontacts/migrations

This will simulate running the migrations found in that directory sequentially.
At the end, the DB's state is outputted as a SQL table definition dump.


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
