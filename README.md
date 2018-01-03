# Mysql JS
Create parsers for SQL.

```javascript
import { parse } from '@simple-contacts/mysql-js/parser';

console.log(parse(`
  SELECT
    foo.bar
  FROM
    bar2
  WHERE
    foo.bar = 'STRING' AND
    NOT foo.bar2 is NULL
  GROUP BY foo.bar, foo.bar3
  ORDER BY foo.bar, foo.bar2 DESC
  LIMIT 10 OFFSET 100
`));

```

This is the output

```json
{
  "select": true,
  "selectExprList": [
    {
      "tableName": "foo",
      "columnName": "bar",
      "as": null
    }
  ],
  "from": true,
  "tableReferencesList": [
    {
      "tableReferences": "bar2"
    }
  ],
  "where": true,
  "whereCondition": [
    {
      "not": false,
      "condition": "EQUAL",
      "expr1": {
        "tableName": "foo",
        "columnName": "bar"
      },
      "expr2": {
        "string": "STRING"
      }
    },
    {
      "connector": "AND",
      "not": true,
      "condition": "ISNULL",
      "expr": {
        "tableName": "foo",
        "columnName": "bar2"
      }
    }
  ],
  "groupBy": true,
  "groupByExprList": [
    {
      "tableName": "foo",
      "columnName": "bar"
    },
    {
      "tableName": "foo",
      "columnName": "bar3"
    }
  ],
  "orderBy": true,
  "orderByExprList": [
    {
      "tableName": "foo",
      "columnName": "bar"
    },
    {
      "tableName": "foo",
      "columnName": "bar2",
      "desc": true
    }
  ],
  "limit": true,
  "rowCount": "10",
  "offset": "100"
}
```

## Whats done
- Create grammers using Mysql's documentation-like syntax
- Functional "CREATE TABLE" parser
- Functional "SELECT" query parser (methods such as IF, COUNT, MIN, MAX, etc not supported)
