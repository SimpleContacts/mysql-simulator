start = s:statement* { return s.filter(Boolean); }
statement = _ s:statementTypes ';'? _ { return s; }
statementTypes = renameTable / createTableLike / alterTable / createTable / createIndex / dropTable / dropIndex / select / insert / delete / update / set

comment = _ comment:(singleComment / singleDashComment / multiComment) _ {return comment }
singleComment = '//' p:([^\n]*) { return { type: 'comment', commentType: 'single', raw: p.join('').trim() }; }
singleDashComment = '--' p:([^\n]*) { return { type: 'comment', commentType: 'single', raw: p.join('').trim() }; }
multiComment = "/*" inner:(!"*/" i:. {return i})* "*/" { return { type: 'comment', commentType: 'multi', raw: inner.join('') }; }

// We ignore select/insert/delete statements for now
select = 'SELECT'i [^;]* { return null; }
update = 'UPDATE'i [^;]* { return null; }
insert = 'INSERT'i [^;]* { return null; }
delete = 'DELETE'i [^;]* { return null; }
set = 'SET 'i [^;]* { return null; }


// ====================================================
// Rename table
// ====================================================

renameTable = 'RENAME TABLE'i _ existingName:identifier _ 'TO'i _ newName:identifier {
  return {
    type: 'RENAME TABLE',
    existingName,
    newName
  }
}

// ====================================================
// Create table like
// ====================================================
createTableLike = 'CREATE TABLE'i _ newTable:identifier _ 'LIKE'i _ exisitingTable:identifier {
  return {
    type: 'CREATE TABLE',
    newTable,
    exisitingTable
  }
}

// ====================================================
// Drop Index
// ====================================================
dropIndex = 'DROP INDEX'i _ name:identifier _ 'ON' _ tableName:identifier {
  return {
    type: 'DROP INDEX',
    name,
    tableName
  }
}

// ====================================================
// Drop Table
// ====================================================
dropTable = 'DROP TABLE'i ifExists:' IF EXISTS'i? _ tableName:identifier {
  return {
    type: 'DROP TABLE',
    tableName,
    ifExists: !!ifExists,
  }
}

// ====================================================
// Create Index
// ====================================================
createIndex =
  'CREATE'i unique:' UNIQUE'i? ' INDEX'i _
  name:identifier _
  'ON'i _ tableName:identifier _
  '(' columns:identifierList ')' {
    return {
      type: 'CREATEINDEX',
      name,
      tableName,
      columns,
      unique
    }
  }

// ====================================================
// ALTER TABLE
// ====================================================
alterTable = 'ALTER TABLE'i _ tableName:identifier _ changes:changeList {
  return {
    type: 'ALTER',
    changes
  }
}

changeList = list:changeWithComma* _ last:change { return list.concat(last).filter(Boolean); }
changeWithComma = c:change _ ',' _ { return c; }
change =
  dropIndexAlterTable /
  renameTableAlterTable /
  drop /
  dropPrimaryKey /
  addPrimaryKey /
  add /
  addIndex /
  dropKey /
  addForeignKey /
  changeColumn /
  modifyColumn /
  dropDefault /
  uniqueConstraint /
  dropForeignKey /
  addFullText

dropKey = 'DROP KEY'i _ name:identifier { return { type: 'DROP KEY', name }}

drop = 'DROP'  ' COLUMN'i? _ column:identifier _ { return { type: 'DROP', column } }
add = 'ADD'i ' COLUMN'i? _ column:identifier _ columnType:columnType _ attrs:columnAttrs* {
  return {
    type: 'ADD',
    column,
    columnType,
    attrs
  }
}

dropDefault = 'ALTER' ' COLUMN'i? _ tableName:identifier _ 'DROP DEFAULT' {
  return {
    type: 'DROP DEFAULT',
    tableName
  }
}

addIndex = 'ADD INDEX'i? _ name:identifier? _ '(' column:identifier ')' {
  return {
    type: 'INDEX',
    name,
    column
  }
}

addFullText = 'ADD FULLTEXT'i? _ name:identifier? _ '(' columns:identifierList ')' {
  return {
    type: 'FULLTEXT',
    name,
    columns
  }
}

changeColumn =
  'CHANGE' ' COLUMN'i? _
  before:identifier _
  after:identifier _
  columnType:columnType _
  attrs:columnAttrs* {
    return {
      type: 'CHANGE',
      before,
      after,
      columnType,
      attrs
    }
  }

modifyColumn =
  'MODIFY'i ' COLUMN'i? _
  column:identifier _
  columnType:columnType _
  attrs:columnAttrs* {
    return {
      type: 'CHANGE',
      before: column,
      after: column,
      columnType,
      attrs
    }
  }

addForeignKey =
  'ADD'i name:namedConstraint? _
  'FOREIGN KEY'i _ '(' localColumn:identifier ')' _
  'REFERENCES'i _ foreignTable:identifier _
  '(' _ foreignColumn:identifier _ ')' _ {
    return {
      type: 'FOREIGN KEY',
      name,
      localColumn,
      foreignTable,
      foreignColumn
    }
  }

uniqueConstraint = uniqueConstraint1 / uniqueConstraint2 / uniqueConstraint3

uniqueConstraint1 =
  'ADD'i name:namedConstraint? _
  'UNIQUE' _ '(' columns:identifierList ')' {
    return {
      type: 'UNIQUE',
      columns,
      name
    }
  }
uniqueConstraint2 = 'ADD UNIQUE INDEX'i _  name:identifier _ '(' columns:identifierList ')' {
  return {
    type: 'UNIQUE',
    columns,
    name
  }
}
uniqueConstraint3 = 'ADD UNIQUE'i _ name:identifier _ '(' columns:identifierList ')' {
  return {
    type: 'UNIQUE',
    columns,
    name
  }
}

namedConstraint = ' CONSTRAINT'i _ name:identifier? _ { return name }

dropForeignKey = 'DROP FOREIGN KEY'i _ name:identifier {
  return {
    type: 'DROP FOREIGN KEY',
    name
  }
}

dropPrimaryKey = 'DROP PRIMARY KEY'i { return { type: 'DROP PRIMARY KEY' } }
addPrimaryKey = 'ADD PRIMARY KEY'i '(' columns:identifierList ')' { return { type: 'PRIMARY KEY', columns }}

renameTableAlterTable = 'RENAME'i _ 'TO'i? _ name:identifier { return { type: 'RENAME', name }}

dropIndexAlterTable = 'DROP INDEX'i _ name:identifier { return { type: 'DROP INDEX', name }}

// ====================================================
// Create TABLE
// ====================================================
createTable =
  'CREATE TABLE' _
  'IF NOT EXISTS'i? _
  name:identifier _
  '(' _
  definitions:createDefinitionsList
  ')' __
  tableOptions:tableOptions
{
  return {
    type: 'CREATE',
    name,
    definitions,
    tableOptions
  }
}

createDefinitionsList = list:defWithComma* last:createDefinition { return list.concat(last).filter(Boolean); }
defWithComma = c:createDefinition _ ',' _ { return c; }

createDefinition = indexCreateTable / primaryKey / unique / foreignKey / column

unique = 'UNIQUE'i _ 'KEY'? _ name:identifier? _ '(' columns:identifierList ')' _ { type: 'UNQIUE', columns, name }

primaryKey = 'PRIMARY KEY'i _ '(' columns:identifierList ')' _ {
  return {
    type: 'PRIMARY KEY',
    columns
  }
}

foreignKeyNamedConstraint = 'CONSTRAINT'i _ name:identifier? _ { return name }
foreignKey =
  name1:foreignKeyNamedConstraint?
  'FOREIGN KEY'i _
  _ name2:identifier? _
  '(' _ localColumn:identifier _ ')' _
  'REFERENCES'i _ foreignTable:identifier _
  '(' _ foreignColumn:identifier _ ')' _ {
    return {
      type: 'FOREIGN KEY',
      name: name1 || name2,
      localColumn,
      foreignTable,
      foreignColumn
    }
  }

indexTableKeyword = 'INDEX'i / 'KEY'i
indexCreateTable =
  indexTableKeyword _ name:identifier _ '(' columns:identifierList ')' _ {
    return {
      type: 'INDEX',
      name,
      columns
    }
  }

column = _ name:identifier _ columnType:columnType _ attrs:columnAttrs* _ {
  return {
    type: 'COLUMN',
    name,
    columnType,
    attrs
  }
}
columnType = type:columnTypeEnum size:columnLength? { return {type, size}; }
columnLengthEnum = number / literal
columnLengthEnumWithComma = columnLengthEnum _ ',' _
columnLength = '(' list:columnLengthEnumWithComma* last:columnLengthEnum ')' { return list.concat(last).join('').replace(' ', '').split(',').filter(Boolean); }
columnTypeEnum =
  'INT'i /
  'TIMESTAMP'i /
  'VARCHAR'i /
  'DECIMAL'i /
  'BOOLEAN'i /
  'TEXT'i /
  'SMALLINT'i /
  'CHAR'i /
  'DATETIME'i /
  'DATE'i /
  'TINYINT'i /
  'JSON'i /
  'BINARY'i /
  'VARBINARY'i /
  'FLOAT'i /
  'ENUM'i /
  'TIME'
columnAttrs = _ c:columnAttrsEnum _ { return c }
currentTimestampLength = '(' length:number ')' { return length }
current_timstamp = 'CURRENT_TIMESTAMP'i length:currentTimestampLength? { return { type: 'CURRENT_TIMESTAMP', length }}
defaultValues = 'NOW()'i / current_timstamp / 'NULL'i / 'FALSE'i / 'TRUE'i / literal / number / identifier
columnAttrsEnum =
  'NOT NULL'i /
  'NULL'i /
  'PRIMARY KEY'i /
  'AUTO_INCREMENT'i /
  'UNIQUE'i ' KEY'i? { return { UNIQUE: true }} /
  'UNSIGNED'i /
  'DEFAULT'i _ DEFAULT:defaultValues _ { return { DEFAULT } } /
  'ON UPDATE'i _ ONUPDATE:defaultValues _ { return { ONUPDATE } } /
  'COLLATE'i _ COLLATE:identifier _ { return { COLLATE } } /
  'COMMENT'i _ COMMENT:literal { return { COMMENT } } /
  'AFTER'i _ AFTER:identifier { return { AFTER } }

tableOptions = tableOptionsEnum*
tableOptionsEnum= tableOptionAssignment / tableOptionValue
tableOptionsIdentifier = i:[A-Z]+ { return i.join('') }
tableOptionsValue = i:[a-zA-Z0-9_]+ { return i.join('') }
tableOptionAssignment = __ key:tableOptionsIdentifier __ '=' __ value:tableOptionsValue __ { return { key, value } }
tableOptionValue = __ i:tableOptionsIdentifier __ { return i }

// ====================================================
// Util
// ====================================================
_ "whitespace" = whitespace* { return null }
whitespace = [ \t\r\n] / multiComment / singleComment / singleDashComment

/* nonbreaking whitespace */
__ = [ \t]*

number "number" = n:[0-9]+ { return n.join('') }

literal "literal" = '\'' l:[^']* '\'' { return { type: 'LITERAL', string: l.join('') } }

identifier "identifier"
  = '`'? first:[a-z_] rest:[a-zA-Z0-9_]* '`'? { return [first].concat(rest).join('') }

identifierWithComma = _ i:identifier _ ',' { return i; }
identifierList = list:identifierWithComma* _ last:identifier { return list.concat(last).filter(Boolean); }
