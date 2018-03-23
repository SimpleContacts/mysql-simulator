start = s:statement* { return s.filter(Boolean); }
statement = _ s:statementTypes ';'? _ { return s; }
statementTypes
  = CreateTable
  / createIndex
  / RenameTable
  / alterTable
  / dropTable
  / dropIndex
  / select
  / insert
  / delete
  / update
  / set

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
// Constant literals
// ====================================================

null "null literal"
  = NULL

boolean "boolean literal"
  = TRUE
  / FALSE

number "number literal"
  = digits:[0-9]+ { return parseInt(digits.join(''), 10) }

string "string literal"
  = "'" value:[^']* "'" { return value.join('') }

constant
  = null
  / boolean
  / string
  / number

// ====================================================
// Rename table
// ====================================================

RenameTable
  = RenameTable1
  / RenameTable2

RenameTable1
  = RENAME TABLE tblName:identifier TO newName:identifier
    {
      return {
        type: 'RENAME TABLE',
        name: tblName,
        newName,
      }
    }

RenameTable2
  = 'ALTER TABLE'i _ existingName:identifier _ 'RENAME'i _ 'TO'i? _ newName:identifier
    {
      return {
        type: 'RENAME TABLE',
        existingName,
        newName,
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
  CREATE unique:UNIQUE? INDEX name:identifier ON tableName:identifier LPAREN columns:identifierList RPAREN {
    return {
      type: 'CREATE INDEX',
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
add = ADD COLUMN? colName:identifier columnDefinition:ColumnDefinition attrs:columnAttrs* {
  return {
    type: 'ADD COLUMN',
    name: colName,
    definition: columnDefinition,
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

// TODO: Check spec
modifyColumn =
  MODIFY COLUMN? name:identifier definition:ColumnDefinition
  after:( AFTER after:identifier { return after } )?
  {
    return {
      type: 'CHANGE',
      after,
      definition,
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

dropIndexAlterTable = 'DROP INDEX'i _ name:identifier { return { type: 'DROP INDEX', name }}

// ====================================================
// Create TABLE
// ====================================================
CreateTable
  = CreateTable1   // CREATE TABLE
  // CreateTable2  // See https://dev.mysql.com/doc/refman/5.7/en/create-table.html
  / CreateTable3   // CREATE TABLE ... LIKE

CreateTable1
  = CREATE TABLE
    ifNotExists:(IF NOT EXISTS)?
    tblName:identifier
    LPAREN definitions:CreateDefinitionsList RPAREN
    tableOptions:TableOptions? {
      // Turn the list-of-option-pairs into an object
      const options = Object.assign({}, ...(tableOptions || []));
      return {
        type: 'CREATE TABLE',
        tblName,
        definitions,
        options,
        ifNotExists: !!ifNotExists,
      }
    }

CreateTable3
  = CREATE TABLE
    ifNotExists:(IF NOT EXISTS)?
    tblName:identifier LIKE oldTblName:identifier {
    return {
      type: 'CREATE TABLE LIKE', // Copy table
      name: tblName,
      oldTblName,
      ifNotExists,
    }
  }

CreateDefinitionsList
  = first:CreateDefinition _ ',' _ rest:CreateDefinitionsList { return [first].concat(rest) }
  / only:CreateDefinition { return [only] }

CreateDefinition
  = colName:identifier _ columnDefinition:ColumnDefinition { return { name: colName, definition: columnDefinition } }
  // / [CONSTRAINT [symbol]] PRIMARY KEY [index_type] (index_col_name, ...) [index_option] ...
  / primaryKey
  // / {INDEX|KEY} [index_name] [index_type] (index_col_name, ...)
  / indexCreateTable
  // / [CONSTRAINT [symbol]] UNIQUE [INDEX|KEY] [index_name] [index_type] (index_col_name, ...) [index_option] ...
  / unique
  // / {FULLTEXT|SPATIAL} [INDEX|KEY] [index_name] (index_col_name, ...) [index_option] ...
  / constraint:(CONSTRAINT symbol:identifier?)?
    FOREIGN KEY indexName:identifier? LPAREN indexColNames:indexColNames RPAREN ReferenceDefinition
  // / CHECK (expr)

ColumnDefinition
  = dataType:DataType
    nullable:( NULL / NOT NULL )?
    isPrimary:( PRIMARY KEY )?
    defaultValue:defaultValueClause?
    autoIncrement:AUTO_INCREMENT?
    isUnique:( UNIQUE KEY? )?
    ( COMMENT string )?
    reference:ReferenceDefinition?

    // TODO: Really this is a hack! We've been using the ON UPDATE NOW() clause
    // in a way that isn't valid SQL!  We'll just eat it so we can continue
    // parsing, but we'll simply ignore it.
    hack:( ON UPDATE ( NOW LPAREN RPAREN / CURRENT_TIMESTAMP ) )?  // TODO: Fix this by fixing the SQL!

    {
      return {
        dataType,
        nullable: nullable !== 'NOT NULL',
        defaultValue,
        isUnique: !!isUnique,
        isPrimary: !!isPrimary,
        autoIncrement: !!autoIncrement,
        reference,
      }
    }

defaultValueClause = 'DEFAULT'i _ v:defaultValue { return v }

len
  = LPAREN number:number RPAREN { return number }

precisionSpec
  = LPAREN number COMMA number RPAREN

boolTypeName
  = BOOLEAN

intTypeName
  = BIGINT
  / INTEGER
  / INT
  / MEDIUMINT
  / SMALLINT
  / TINYINT

precisionTypeName
  = REAL
  / DOUBLE
  / FLOAT
  / DECIMAL
  / NUMERIC

dateTypeName
  = // Hack! This is invalid SQL, but we're using it anyway
    type:TIMESTAMP hack:len? { return type }
  / TIME
  / // Hack! This is invalid SQL, but we're using it anyway
    type:DATETIME hack:len? { return type }
  / DATE

boolDataType
  = type:boolTypeName len:len? { return 'TINYINT(1)' }

intDataType
  = type:intTypeName len:len? unsigned:UNSIGNED? {
    len = len || '';
    unsigned = unsigned || '';
    return (type + len + ' ' + unsigned).trim()
  }

precisionDataType
  = type:precisionTypeName _ prec:precisionSpec? _ unsigned:UNSIGNED? {
    prec = prec || '';
    unsigned = unsigned || '';
    return (type + prec + ' ' + unsigned).trim()
  }

dateDataType
  = type:dateTypeName { return type }

textDataType
  = // Length required
    type:( VARCHAR / VARBINARY ) len:len { return `${type}(${len})` }
  / // Length required
    type:( CHAR / BINARY / TEXT ) len:len? { return len ? `${type}(${len})` : type }

DataType
  = intDataType
  / boolDataType
  / dateDataType
  / precisionDataType
  / type:textDataType ignore:(COLLATE CollationName)? { return type }
  / JSON
  / ENUM LPAREN values:ValueList RPAREN

indexColNames
  = first:indexColName COMMA rest:indexColNames { return [first].concat(rest) }
  / only:indexColName { return [only] }

indexColName
  = colName:identifier _ len:len? direction:( ASC / DESC )?

ReferenceDefinition
  = REFERENCES tblName:identifier LPAREN indexColNames:indexColNames RPAREN
    matchMode:( MATCH ( FULL / PARTIAL / SIMPLE ) )?
    ( ON DELETE ReferenceOption )?
    ( ON UPDATE ReferenceOption )?

ReferenceOption
  = RESTRICT
  / CASCADE
  / SET NULL
  / NO ACTION
  / SET DEFAULT

TableOptions
  = first:TableOption COMMA? rest:TableOptions { return [first].concat(rest) }
  / only:TableOption { return [only] }

TableOption
  = AUTO_INCREMENT EQ? AUTO_INCREMENT:Value { return { AUTO_INCREMENT } }
  / ENGINE EQ? ENGINE:EngineName { return { ENGINE } }
  / DEFAULT? ( CHARSET / CHARACTER SET ) EQ? CHARSET:CharsetName { return { CHARSET } }
  / DEFAULT? COLLATE EQ? COLLATE:CollationName { return { COLLATE } }

EngineName
  = _ 'InnoDB'i !IdentifierStart _ { return 'InnoDB' }

CharsetName
  = _ 'utf8'i !IdentifierStart _ { return 'utf8' }

CollationName
  = _ 'utf8_general_ci'i !IdentifierStart _ { return 'utf8_general_ci' }
  / _ 'utf8_bin'i        !IdentifierStart _ { return 'utf8_bin' }

ValueList
  = first:Value COMMA rest:ValueList { return [first, ...rest] }
  / only:Value { return [only] }

Value
  = constant

unique = 'UNIQUE'i _ 'KEY'? _ name:identifier? _ '(' columns:identifierList ')' _ { type: 'UNQIUE', columns, name }

primaryKey = 'PRIMARY KEY'i _ '(' columns:identifierList ')' _ {
  return {
    type: 'PRIMARY KEY',
    columns
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

columnLengthEnum = number / string
columnLengthEnumWithComma = value:columnLengthEnum _ ',' _ { return value.rawValue }
columnLength
  = '(' list:columnLengthEnumWithComma* last:columnLengthEnum ')' {
    return list.concat(last.rawValue)
               .join('')
               .replace(' ', '')
               .split(',')
               .filter(Boolean);
  }

baseColumnType
  = BINARY
  / BOOLEAN
  / CHAR
  / DATETIME
  / DATE
  / DECIMAL
  / ENUM
  / FLOAT
  / INT
  / JSON
  / SMALLINT
  / TEXT
  / TIMESTAMP
  / TIME
  / TINYINT
  / VARBINARY
  / VARCHAR

param
  = boolean
  / number
  / string

paramList
  = c:param _ ',' _ l:paramList { return [c.value].concat(l) }
  / c:param { return [c.value] }

columnType
  = columnType1
  / columnType2

columnType1
  = type:baseColumnType _ '(' _ params:paramList _ ')' { return `${type.toUpperCase()}(${params.join(', ')})` }

columnType2
  = type:baseColumnType { return type.toUpperCase() }

columnAttrs = _ c:columnAttrsEnum _ { return c }

/* System functions */
current_timestamp = 'CURRENT_TIMESTAMP'i _ ('(' number ')')? { return { type: 'CURRENT_TIMESTAMP' } }
now = 'NOW'i _ '(' _ ')' { return { type: 'NOW()' } }

constantExpr
  = c:constant { return c.value }
  / current_timestamp
  / now
defaultValue
  = constantExpr
  / identifier
columnAttrsEnum =
  'NOT NULL'i /
  'NULL'i /
  'PRIMARY KEY'i /
  'AUTO_INCREMENT'i /
  'UNIQUE'i ' KEY'i? { return { UNIQUE: true }} /
  'DEFAULT'i _ DEFAULT:defaultValue _ { return { DEFAULT } } /
  'ON UPDATE'i _ ONUPDATE:defaultValue _ { return { ONUPDATE } } /
  'COLLATE'i _ COLLATE:identifier _ { return { COLLATE } } /
  'COMMENT'i _ COMMENT:string { return { COMMENT } } /
  'AFTER'i _ AFTER:identifier { return { AFTER } }

// ====================================================
// Util
// ====================================================
_ "whitespace" = whitespace* { return null }
whitespace = [ \t\r\n] / multiComment / singleComment / singleDashComment

/* nonbreaking whitespace */
__ = [ \t]*

identifier "identifier"
  = _ '`'? first:[a-z_] rest:[a-zA-Z0-9_]* '`'? { return [first].concat(rest).join('') }

identifierWithComma = _ i:identifier _ ',' { return i; }
identifierList = list:identifierWithComma* _ last:identifier { return list.concat(last).filter(Boolean); }


// ====================================================
// Keywords
// ====================================================

IdentifierStart = [a-z_]
ACTION            = _ 'ACTION'i            !IdentifierStart _ { return 'ACTION' }
ADD               = _ 'ADD'i               !IdentifierStart _ { return 'ADD' }
AFTER             = _ 'AFTER'i             !IdentifierStart _ { return 'AFTER' }
ASC               = _ 'ASC'i               !IdentifierStart _ { return 'ASC' }
AUTO_INCREMENT    = _ 'AUTO_INCREMENT'i    !IdentifierStart _ { return 'AUTO_INCREMENT' }
BIGINT            = _ 'BIGINT'i            !IdentifierStart _ { return 'BIGINT' }
BINARY            = _ 'BINARY'i            !IdentifierStart _ { return 'BINARY' }
BOOLEAN           = _ 'BOOLEAN'i           !IdentifierStart _ { return 'BOOLEAN' }
CASCADE           = _ 'CASCADE'i           !IdentifierStart _ { return 'CASCADE' }
CHAR              = _ 'CHAR'i              !IdentifierStart _ { return 'CHAR' }
CHARACTER         = _ 'CHARACTER'i         !IdentifierStart _ { return 'CHARACTER' }
CHARSET           = _ 'CHARSET'i           !IdentifierStart _ { return 'CHARSET' }
COLLATE           = _ 'COLLATE'i           !IdentifierStart _ { return 'COLLATE' }
COLUMN            = _ 'COLUMN'i            !IdentifierStart _ { return 'COLUMN' }
COMMENT           = _ 'COMMENT'i           !IdentifierStart _ { return 'COMMENT' }
CONSTRAINT        = _ 'CONSTRAINT'i        !IdentifierStart _ { return 'CONSTRAINT' }
CREATE            = _ 'CREATE'i            !IdentifierStart _ { return 'CREATE' }
CURRENT_TIMESTAMP = _ 'CURRENT_TIMESTAMP'i !IdentifierStart _ { return 'CURRENT_TIMESTAMP' }
DATE              = _ 'DATE'i              !IdentifierStart _ { return 'DATE' }
DATETIME          = _ 'DATETIME'i          !IdentifierStart _ { return 'DATETIME' }
DECIMAL           = _ 'DECIMAL'i           !IdentifierStart _ { return 'DECIMAL' }
DEFAULT           = _ 'DEFAULT'i           !IdentifierStart _ { return 'DEFAULT' }
DELETE            = _ 'DELETE'i            !IdentifierStart _ { return 'DELETE' }
DESC              = _ 'DESC'i              !IdentifierStart _ { return 'DESC' }
DOUBLE            = _ 'DOUBLE'i            !IdentifierStart _ { return 'DOUBLE' }
ENGINE            = _ 'ENGINE'i            !IdentifierStart _ { return 'ENGINE' }
ENUM              = _ 'ENUM'i              !IdentifierStart _ { return 'ENUM' }
EXISTS            = _ 'EXISTS'i            !IdentifierStart _ { return 'EXISTS' }
FALSE             = _ 'FALSE'i             !IdentifierStart _ { return 'FALSE' }
FLOAT             = _ 'FLOAT'i             !IdentifierStart _ { return 'FLOAT' }
FOREIGN           = _ 'FOREIGN'i           !IdentifierStart _ { return 'FOREIGN' }
FULL              = _ 'FULL'i              !IdentifierStart _ { return 'FULL' }
IF                = _ 'IF'i                !IdentifierStart _ { return 'IF' }
INDEX             = _ 'INDEX'i             !IdentifierStart _ { return 'INDEX' }
INT               = _ 'INT'i               !IdentifierStart _ { return 'INT' }
INTEGER           = _ 'INTEGER'i           !IdentifierStart _ { return 'INTEGER' }
JSON              = _ 'JSON'i              !IdentifierStart _ { return 'JSON' }
KEY               = _ 'KEY'i               !IdentifierStart _ { return 'KEY' }
LIKE              = _ 'LIKE'i              !IdentifierStart _ { return 'LIKE' }
MATCH             = _ 'MATCH'i             !IdentifierStart _ { return 'MATCH' }
MEDIUMINT         = _ 'MEDIUMINT'i         !IdentifierStart _ { return 'MEDIUMINT' }
MODIFY            = _ 'MODIFY'i            !IdentifierStart _ { return 'MODIFY' }
NO                = _ 'NO'i                !IdentifierStart _ { return 'NO' }
NOT               = _ 'NOT'i               !IdentifierStart _ { return 'NOT' }
NOW               = _ 'NOW'i               !IdentifierStart _ { return 'NOW' }
NULL              = _ 'NULL'i              !IdentifierStart _ { return 'NULL' }
NUMERIC           = _ 'NUMERIC'i           !IdentifierStart _ { return 'NUMERIC' }
ON                = _ 'ON'i                !IdentifierStart _ { return 'ON' }
PARTIAL           = _ 'PARTIAL'i           !IdentifierStart _ { return 'PARTIAL' }
PRIMARY           = _ 'PRIMARY'i           !IdentifierStart _ { return 'PRIMARY' }
REAL              = _ 'REAL'i              !IdentifierStart _ { return 'REAL' }
REFERENCES        = _ 'REFERENCES'i        !IdentifierStart _ { return 'REFERENCES' }
RENAME            = _ 'RENAME'i            !IdentifierStart _ { return 'RENAME' }
RESTRICT          = _ 'RESTRICT'i          !IdentifierStart _ { return 'RESTRICT' }
SET               = _ 'SET'i               !IdentifierStart _ { return 'SET' }
SIMPLE            = _ 'SIMPLE'i            !IdentifierStart _ { return 'SIMPLE' }
SMALLINT          = _ 'SMALLINT'i          !IdentifierStart _ { return 'SMALLINT' }
TABLE             = _ 'TABLE'i             !IdentifierStart _ { return 'TABLE' }
TEXT              = _ 'TEXT'i              !IdentifierStart _ { return 'TEXT' }
TIME              = _ 'TIME'i              !IdentifierStart _ { return 'TIME' }
TIMESTAMP         = _ 'TIMESTAMP'i         !IdentifierStart _ { return 'TIMESTAMP' }
TINYINT           = _ 'TINYINT'i           !IdentifierStart _ { return 'TINYINT' }
TO                = _ 'TO'i                !IdentifierStart _ { return 'TO' }
TRUE              = _ 'TRUE'i              !IdentifierStart _ { return 'TRUE' }
UNIQUE            = _ 'UNIQUE'i            !IdentifierStart _ { return 'UNIQUE' }
UNSIGNED          = _ 'UNSIGNED'i          !IdentifierStart _ { return 'UNSIGNED' }
UPDATE            = _ 'UPDATE'i            !IdentifierStart _ { return 'UPDATE' }
VARBINARY         = _ 'VARBINARY'i         !IdentifierStart _ { return 'VARBINARY' }
VARCHAR           = _ 'VARCHAR'i           !IdentifierStart _ { return 'VARCHAR' }


// ====================================================
// Tokens
// ====================================================

COMMA  = _ ',' _
EQ     = _ '=' _
LPAREN = _ '(' _
RPAREN = _ ')' _
