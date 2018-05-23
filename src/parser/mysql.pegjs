{
  function escape(s) {
    return "'" + s.replace("'", "''") + "'"
  }
}

start = StatementList

StatementList
  = first:Statement SEMICOLON* rest:StatementList { return [first, ...rest] }
  / only:Statement SEMICOLON? { return [only] }

Statement
  = CreateTable
  / CreateIndex
  / CreateTrigger
  / CreateFunction
  / RenameTable
  / AlterTable
  / DropTable
  / DropIndex
  / select
  / insert
  / delete
  / update
  / set
  / lock
  / unlock
  / CompoundStatement
  / IfStatement

CompoundStatement
  = BEGIN statements:StatementList END {
    return {
      type: 'BEGIN ... END',
      statements,
    }
  }

comment = _ comment:(singleComment / singleDashComment / multiComment) _ { return comment }
singleComment = '//' p:([^\n]*) { return { type: 'comment', commentType: 'single', raw: p.join('').trim() }; }
singleDashComment = '--' p:([^\n]*) { return { type: 'comment', commentType: 'single', raw: p.join('').trim() }; }
multiComment = "/*" inner:(!"*/" i:. {return i})* "*/" { return { type: 'comment', commentType: 'multi', raw: inner.join('') }; }

// We ignore select/insert/delete statements for now
select = SELECT [^;]* { return null; }
update = UPDATE [^;]* { return null; }
insert = INSERT [^;]* { return null; }
delete = DELETE [^;]* { return null; }
set = SET [^;]* { return null; }
lock = LOCK [^;]* { return null; }
unlock = UNLOCK [^;]* { return null; }

Condition
  = boolean
  / NOT Condition
  / LPAREN Condition RPAREN
  / left:Expression ( EQ / NE / LTE / GTE / LT / GT ) right:Expression

ExpressionList
  = first:Expression COMMA rest:ExpressionList { return [first, ...rest] }
  / only:Expression { return [only] }

Expression
  = Expression$ ( ( PLUS / MINUS ) Expression )?

Expression$
  = CallExpression
  / identifier { return null }
  / constant
  / Thing { return null }

CallExpression
  = FunctionName LPAREN ExpressionList RPAREN

FunctionName
  = HEX
  / SUBSTRING
  / UNHEX

Thing
  = ( NEW / OLD ) '.' identifier { return null }


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

String "string literal"
  = SingleQuotedStringLiteral
  / DoubleQuotedStringLiteral

SingleQuotedStringLiteral
  = "'" seq:( "''" / "\\'" { return "''" } / [^'] )* "'" { return `'${seq.join('')}'` }

DoubleQuotedStringLiteral
  = '"' seq:( '""' { return '"' } / '\\"' { return '"' } / "'" { return "''" } / [^"] )* '"' { return `'${seq.join('')}'` }

StringList
  = first:String COMMA rest:StringList { return [first, ...rest] }
  / only:String { return [only] }

constant
  = null
  / boolean
  / String
  / number


// ====================================================
// Rename table
// ====================================================

RenameTable
  = RENAME TABLE tblName:identifier TO newName:identifier
    {
      return {
        type: 'RENAME TABLE',
        tblName,
        newName,
      }
    }


// ====================================================
// Drop Index
// ====================================================
DropIndex = DROP INDEX indexName:identifier ON tblName:identifier {
  return {
    type: 'DROP INDEX',
    indexName,
    tblName
  }
}

// ====================================================
// Drop Table
// ====================================================

DropTable
  = DROP TABLE ifExists:(IF EXISTS)? tblName:identifier {
    return {
      type: 'DROP TABLE',
      tblName,
      ifExists: !!ifExists,
    }
  }

// ====================================================
// Create Index
// ====================================================

CreateIndex
  = CREATE indexKind:( UNIQUE / FULLTEXT )? INDEX indexName:identifier ON tblName:identifier LPAREN indexColNames:IndexColNames RPAREN {
    indexKind = indexKind || 'NORMAL'
    return {
      type: 'CREATE INDEX',
      indexName,
      indexKind,
      tblName,
      indexColNames,
    }
  }

// ====================================================
// Create Trigger
// ====================================================

CreateTrigger
  = CREATE TRIGGER triggerName:identifier
    ( BEFORE / AFTER )
    ( INSERT / UPDATE / DELETE )
    ON tblName:identifier FOR EACH ROW ( ( FOLLOWS / PRECEDES ) otherTrigger:identifier )?
    triggerBody:Statement {
    return {
      type: 'CREATE TRIGGER',
      triggerName,
      tblName,
    }
  }

// ====================================================
// Create Function
// ====================================================

FunctionParamList
  = first:FunctionParam COMMA rest:FunctionParamList { return [first, ...rest] }
  / only:FunctionParam { return [only] }

FunctionParam
  = paramName:identifier type:DataType { return { paramName, type } }

CreateFunction
  = CREATE FUNCTION spName:identifier
    params:( LPAREN params:FunctionParamList RPAREN { return params })
    RETURNS DataType
    characteristic:CreateFunctionCharacteristic
    body:FunctionBody {
    return {
      type: 'CREATE FUNCTION',
      spName,
      params,
      characteristic,
      // body,
    }
  }

CreateFunctionCharacteristic
  = NOT? DETERMINISTIC

FunctionBody
  = BEGIN statements:FunctionStatementList END

FunctionStatementList
  = first:FunctionStatement SEMICOLON? rest:FunctionStatementList { return [first, ...rest] }
  / only:FunctionStatement SEMICOLON? { return [only] }

FunctionStatement
  = DECLARE [^;]*
  / SET AssignmentList
  / IfStatement
  / WhileStatement
  / RETURN Expression
  / Statement

AssignmentList
  = first:Assignment COMMA rest:AssignmentList { return [first, ...rest] }
  / only:Assignment { return [only] }

Assignment
  = identifier EQ Expression

IfStatement
  = IF Condition THEN
      FunctionStatementList
    (ELSEIF Condition THEN FunctionStatementList )*
    (ELSE FunctionStatementList)?
    END IF

WhileStatement
  = WHILE Condition DO
      FunctionStatementList
    END WHILE

// ====================================================
// ALTER TABLE
// ====================================================

AlterTable
  = ALTER TABLE tblName:identifier changes:AlterSpecs {
    return {
      type: 'ALTER TABLE',
      tblName,
      changes
    }
  }

AlterSpecs
  = first:AlterSpec COMMA rest:AlterSpecs { return [first, ...rest] }
  / only:AlterSpec { return [only] }

/**
 * See https://dev.mysql.com/doc/refman/5.7/en/alter-table.html
 */
AlterSpec
  = ADD COLUMN? colName:identifier columnDefinition:ColumnDefinition
    position:(
      AFTER ident:identifier { return `AFTER ${ident}` }
      / FIRST { return 'FIRST' }
    )? {
      return {
        type: 'ADD COLUMN',
        colName,
        definition: columnDefinition,
        position,
      }
    }
  / ADD ( INDEX / KEY ) indexName:identifier? indexType:IndexType? LPAREN indexColNames:IndexColNames RPAREN {
      return {
        type: 'ADD INDEX',
        indexName,
        indexType,
        indexColNames,
      }
    }
  / ADD constraint:NamedConstraint? PRIMARY KEY indexType:IndexType? LPAREN indexColNames:IndexColNames RPAREN {
      return {
        type: 'ADD PRIMARY KEY',
        constraint,
        indexType,
        indexColNames,
      }
    }
  / ADD constraint:NamedConstraint?
    UNIQUE ( INDEX / KEY )? indexName:identifier? indexType:IndexType?
    LPAREN indexColNames:IndexColNames RPAREN {
      return {
        type: 'ADD UNIQUE INDEX',
        constraint,
        indexName,
        indexType,
        indexColNames,
      }
    }
  / ADD FULLTEXT ( INDEX / KEY )? indexName:identifier? LPAREN indexColNames:IndexColNames RPAREN {
      return {
        type: 'ADD FULLTEXT INDEX',
        indexName,
        indexColNames,
      }
    }
  / ADD constraint:NamedConstraint?
    FOREIGN KEY indexName:identifier? LPAREN indexColNames:IndexColNames RPAREN
    reference:ReferenceDefinition {
      return {
        type: 'ADD FOREIGN KEY',
        constraint,
        indexName,
        indexColNames,
        reference,
      }
    }
  // / ALGORITHM
  / ALTER COLUMN? colName:identifier DROP DEFAULT {
      return {
        type: 'DROP DEFAULT',
        colName,
      }
    }
  / CHANGE COLUMN? oldColName:identifier newColName:identifier definition:ColumnDefinition
    position:(
      AFTER ident:identifier { return `AFTER ${ident}` }
      / FIRST { return 'FIRST' }
    )? {
      return {
        type: 'CHANGE COLUMN',
        oldColName,
        newColName,
        definition,
        position,
      }
    }
  / DROP COLUMN? colName:identifier {
      return {
        type: 'DROP COLUMN',
        colName,
      }
    }
  / DROP (INDEX / KEY) indexName:identifier {
      return {
        type: 'DROP INDEX',
        indexName,
      }
    }
  / DROP PRIMARY KEY { return { type: 'DROP PRIMARY KEY' } }
  / DROP FOREIGN KEY symbol:identifier {
      return {
        type: 'DROP FOREIGN KEY',
        symbol,
      }
    }
  / MODIFY COLUMN? colName:identifier definition:ColumnDefinition
    position:(
      AFTER ident:identifier { return `AFTER ${ident}` }
      / FIRST { return 'FIRST' }
    )? {
      // MODIFY COLUMN is like CHANGE COLUMN in every way, except that it
      // cannot be used to rename a column.  We'll therefore parse any MODIFY
      // COLUMN statement as a CHANGE COLUMN statement where old + new columns
      // are identical (i.e. no rename).
      return {
        type: 'CHANGE COLUMN',
        oldColName: colName,
        newColName: colName,
        definition,
        position,
      }
    }
  / RENAME ( INDEX / KEY ) oldIndexName:identifier TO newIndexName:identifier {
      return {
        type: 'RENAME INDEX',
        oldIndexName,
        newIndexName,
      }
    }
  / RENAME ( TO / AS )? newTblName:identifier {
      return {
        type: 'RENAME TABLE',
        newTblName,
      }
    }

NamedConstraint = CONSTRAINT symbol:identifier? { return symbol }

IndexType = USING ( BTREE / HASH )


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
      tblName,
      oldTblName,
      ifNotExists,
    }
  }

CreateDefinitionsList
  = first:CreateDefinition _ ',' _ rest:CreateDefinitionsList { return [first, ...rest] }
  / only:CreateDefinition { return [only] }

CreateDefinition
  = colName:identifier _ columnDefinition:ColumnDefinition {
      return {
        type: 'COLUMN',
        colName,
        definition: columnDefinition,
      }
    }
  // / [CONSTRAINT [symbol]] PRIMARY KEY [index_type] (index_col_name, ...) [index_option] ...
  / PrimaryKeyDefinition
  // / {INDEX|KEY} [index_name] [index_type] (index_col_name, ...)
  / IndexDefinition
  // / [CONSTRAINT [symbol]] UNIQUE [INDEX|KEY] [index_name] [index_type] (index_col_name, ...) [index_option] ...
  / constraint:NamedConstraint?
    UNIQUE (INDEX / KEY)? indexName:identifier? LPAREN indexColNames:IndexColNames RPAREN {
      return {
        type: 'UNIQUE INDEX',
        constraint,
        indexName,
        indexColNames,
      }
    }
  / FULLTEXT (INDEX / KEY)? indexName:identifier? LPAREN indexColNames:IndexColNames RPAREN {
      return {
        type: 'FULLTEXT INDEX',
        indexName,
        indexColNames,
      }
    }
  / constraint:NamedConstraint?
    FOREIGN KEY indexName:identifier? LPAREN indexColNames:IndexColNames RPAREN reference:ReferenceDefinition {
      return {
        type: 'FOREIGN KEY',
        constraint,
        indexName,
        indexColNames,
        reference,
      }
    }
  // / CHECK (expr)

ColumnDefinition
  = dataType:DataType
    nullableClause:( NULL / NOT_NULL )?
    defaultValue:( DEFAULT value:ConstantExpr { return value } )?
    isPrimary1:( PRIMARY KEY )?
    autoIncrement:AUTO_INCREMENT?
    isUnique:( UNIQUE KEY? )?
    isPrimary2:( PRIMARY KEY )?
    comment:( COMMENT value:String { return value } )?
    reference:ReferenceDefinition?
    onUpdate:( ON UPDATE expr:ConstantExpr { return expr } )?
    {
      let nullable = null;
      if (nullableClause === 'NULL') {
        nullable = true;
      } else  if (nullableClause === 'NOT NULL') {
        nullable = false;
      };
      return {
        dataType,
        nullable,
        defaultValue,
        onUpdate,
        isUnique: !!isUnique,
        isPrimary: !!isPrimary1 || !!isPrimary2,
        autoIncrement: !!autoIncrement,
        comment,
        reference,
      }
    }


len
  = LPAREN number:number RPAREN { return number }

precisionSpec
  = LPAREN length:number COMMA decimals:number RPAREN { return [length, decimals] }

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
  = type:TIMESTAMP precision:len? { return precision ? `${type}(${precision})`:type }
  / TIME
  / type:DATETIME precision:len? { return precision ? `${type}(${precision})`:type }
  / DATE

boolDataType
  = type:boolTypeName len:len? { return 'TINYINT(1)' }

intDataType
  = type:intTypeName len:len? unsigned:UNSIGNED? {
    len = len ? `(${len})` : '';
    unsigned = unsigned || '';
    return (type + len + ' ' + unsigned).trim()
  }

precisionDataType
  = type:precisionTypeName _ prec:precisionSpec? _ unsigned:UNSIGNED? {
    prec = prec ? `(${prec.join(',')})` : '';
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
  / ENUM LPAREN values:StringList RPAREN {
      return `ENUM(${values.join(',')})`;
    }

IndexColNames
  = first:IndexColName COMMA rest:IndexColNames { return [first, ...rest] }
  / only:IndexColName { return [only] }

IndexColName
  = colName:identifier len:len? direction:( ASC / DESC )? { return { colName, len, direction } }

ReferenceDefinition
  = REFERENCES tblName:identifier LPAREN indexColNames:IndexColNames RPAREN
    matchMode:( MATCH ( FULL / PARTIAL / SIMPLE ) )?
    onDelete:( ON DELETE ReferenceOption )?
    onUpdate:( ON UPDATE ReferenceOption )? {
      return {
        tblName,
        indexColNames,
        matchMode,
        onDelete,
        onUpdate,
      }
    }

ReferenceOption
  = RESTRICT
  / CASCADE
  / SET NULL
  / NO ACTION
  / SET DEFAULT

TableOptions
  = first:TableOption COMMA? rest:TableOptions { return [first, ...rest] }
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

PrimaryKeyDefinition = PRIMARY KEY LPAREN indexColNames:IndexColNames RPAREN {
  return {
    type: 'PRIMARY KEY',
    indexColNames,
  }
}

IndexDefinition =
  ( INDEX / KEY ) indexName:identifier LPAREN indexColNames:IndexColNames RPAREN {
    return {
      type: 'INDEX',
      indexName,
      indexColNames,
    }
  }

columnLengthEnum = number / String
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
  / String

paramList
  = c:param COMMA l:paramList { return [c.value, ...l] }
  / c:param { return [c.value] }

columnType
  = columnType1
  / columnType2

columnType1
  = type:baseColumnType _ '(' _ params:paramList _ ')' { return `${type.toUpperCase()}(${params.join(', ')})` }

columnType2
  = type:baseColumnType { return type.toUpperCase() }

/* System functions */
current_timestamp = value:CURRENT_TIMESTAMP precision:( LPAREN n:number? RPAREN { return n } )? { return precision ? `${value}(${precision})` : value }
NowCall = NOW LPAREN RPAREN { return 'NOW()' }

ConstantExpr
  = constant
  / current_timestamp
  / NowCall

// ====================================================
// Util
// ====================================================
_ "whitespace" = whitespace* { return null }
whitespace = [ \t\r\n] / multiComment / singleComment / singleDashComment

/* nonbreaking whitespace */
__ = [ \t]*

identifier "identifier"
  = _ '`'? first:[a-z_] rest:[a-zA-Z0-9_]* '`'? _ { return [first].concat(rest).join('') }

identifierWithComma = _ i:identifier _ ',' { return i; }
identifierList = list:identifierWithComma* _ last:identifier { return list.concat(last).filter(Boolean); }


// ====================================================
// Keywords
// ====================================================

IdentifierStart = [a-zA-Z_]
ACTION            = _ 'ACTION'i            !IdentifierStart _ { return 'ACTION' }
ADD               = _ 'ADD'i               !IdentifierStart _ { return 'ADD' }
AFTER             = _ 'AFTER'i             !IdentifierStart _ { return 'AFTER' }
ALTER             = _ 'ALTER'i             !IdentifierStart _ { return 'ALTER' }
AS                = _ 'AS'i                !IdentifierStart _ { return 'AS' }
ASC               = _ 'ASC'i               !IdentifierStart _ { return 'ASC' }
AUTO_INCREMENT    = _ 'AUTO_INCREMENT'i    !IdentifierStart _ { return 'AUTO_INCREMENT' }
BEFORE            = _ 'BEFORE'i            !IdentifierStart _ { return 'BEFORE' }
BEGIN             = _ 'BEGIN'i             !IdentifierStart _ { return 'BEGIN' }
BIGINT            = _ 'BIGINT'i            !IdentifierStart _ { return 'BIGINT' }
BINARY            = _ 'BINARY'i            !IdentifierStart _ { return 'BINARY' }
BOOLEAN           = _ 'BOOLEAN'i           !IdentifierStart _ { return 'BOOLEAN' }
BTREE             = _ 'BTREE'i             !IdentifierStart _ { return 'BTREE' }
CASCADE           = _ 'CASCADE'i           !IdentifierStart _ { return 'CASCADE' }
CHANGE            = _ 'CHANGE'i            !IdentifierStart _ { return 'CHANGE' }
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
DECLARE           = _ 'DECLARE'i           !IdentifierStart _ { return 'DECLARE' }
DEFAULT           = _ 'DEFAULT'i           !IdentifierStart _ { return 'DEFAULT' }
DELETE            = _ 'DELETE'i            !IdentifierStart _ { return 'DELETE' }
DESC              = _ 'DESC'i              !IdentifierStart _ { return 'DESC' }
DETERMINISTIC     = _ 'DETERMINISTIC'i     !IdentifierStart _ { return 'DETERMINISTIC' }
DO                = _ 'DO'i                !IdentifierStart _ { return 'DO' }
DOUBLE            = _ 'DOUBLE'i            !IdentifierStart _ { return 'DOUBLE' }
DROP              = _ 'DROP'i              !IdentifierStart _ { return 'DROP' }
EACH              = _ 'EACH'i              !IdentifierStart _ { return 'EACH' }
ELSE              = _ 'ELSE'i              !IdentifierStart _ { return 'ELSE' }
ELSEIF            = _ 'ELSEIF'i            !IdentifierStart _ { return 'ELSEIF' }
END               = _ 'END'i               !IdentifierStart _ { return 'END' }
ENGINE            = _ 'ENGINE'i            !IdentifierStart _ { return 'ENGINE' }
ENUM              = _ 'ENUM'i              !IdentifierStart _ { return 'ENUM' }
EXISTS            = _ 'EXISTS'i            !IdentifierStart _ { return 'EXISTS' }
FALSE             = _ 'FALSE'i             !IdentifierStart _ { return 'FALSE' }
FIRST             = _ 'FIRST'i             !IdentifierStart _ { return 'FIRST' }
FLOAT             = _ 'FLOAT'i             !IdentifierStart _ { return 'FLOAT' }
FOLLOWS           = _ 'FOLLOWS'i           !IdentifierStart _ { return 'FOLLOWS' }
FOR               = _ 'FOR'i               !IdentifierStart _ { return 'FOR' }
FOREIGN           = _ 'FOREIGN'i           !IdentifierStart _ { return 'FOREIGN' }
FULL              = _ 'FULL'i              !IdentifierStart _ { return 'FULL' }
FULLTEXT          = _ 'FULLTEXT'i          !IdentifierStart _ { return 'FULLTEXT' }
FUNCTION          = _ 'FUNCTION'i          !IdentifierStart _ { return 'FUNCTION' }
HASH              = _ 'HASH'i              !IdentifierStart _ { return 'HASH' }
IF                = _ 'IF'i                !IdentifierStart _ { return 'IF' }
INDEX             = _ 'INDEX'i             !IdentifierStart _ { return 'INDEX' }
INSERT            = _ 'INSERT'i            !IdentifierStart _ { return 'INSERT' }
INT               = _ 'INT'i               !IdentifierStart _ { return 'INT' }
INTEGER           = _ 'INTEGER'i           !IdentifierStart _ { return 'INTEGER' }
JSON              = _ 'JSON'i              !IdentifierStart _ { return 'JSON' }
KEY               = _ 'KEY'i               !IdentifierStart _ { return 'KEY' }
LIKE              = _ 'LIKE'i              !IdentifierStart _ { return 'LIKE' }
LOCK              = _ 'LOCK'i              !IdentifierStart _ { return 'LOCK' }
MATCH             = _ 'MATCH'i             !IdentifierStart _ { return 'MATCH' }
MEDIUMINT         = _ 'MEDIUMINT'i         !IdentifierStart _ { return 'MEDIUMINT' }
MODIFY            = _ 'MODIFY'i            !IdentifierStart _ { return 'MODIFY' }
NEW               = _ 'NEW'i               !IdentifierStart _ { return 'NEW' }
NO                = _ 'NO'i                !IdentifierStart _ { return 'NO' }
NOT               = _ 'NOT'i               !IdentifierStart _ { return 'NOT' }
NOW               = _ 'NOW'i               !IdentifierStart _ { return 'NOW' }
NULL              = _ 'NULL'i              !IdentifierStart _ { return 'NULL' }
NUMERIC           = _ 'NUMERIC'i           !IdentifierStart _ { return 'NUMERIC' }
OLD               = _ 'OLD'i               !IdentifierStart _ { return 'OLD' }
ON                = _ 'ON'i                !IdentifierStart _ { return 'ON' }
PARTIAL           = _ 'PARTIAL'i           !IdentifierStart _ { return 'PARTIAL' }
PRECEDES          = _ 'PRECEDES'i          !IdentifierStart _ { return 'PRECEDES' }
PRIMARY           = _ 'PRIMARY'i           !IdentifierStart _ { return 'PRIMARY' }
REAL              = _ 'REAL'i              !IdentifierStart _ { return 'REAL' }
REFERENCES        = _ 'REFERENCES'i        !IdentifierStart _ { return 'REFERENCES' }
RENAME            = _ 'RENAME'i            !IdentifierStart _ { return 'RENAME' }
RESTRICT          = _ 'RESTRICT'i          !IdentifierStart _ { return 'RESTRICT' }
RETURN            = _ 'RETURN'i            !IdentifierStart _ { return 'RETURN' }
RETURNS           = _ 'RETURNS'i           !IdentifierStart _ { return 'RETURNS' }
ROW               = _ 'ROW'i               !IdentifierStart _ { return 'ROW' }
SELECT            = _ 'SELECT'i            !IdentifierStart _ { return 'SELECT' }
SET               = _ 'SET'i               !IdentifierStart _ { return 'SET' }
SIMPLE            = _ 'SIMPLE'i            !IdentifierStart _ { return 'SIMPLE' }
SMALLINT          = _ 'SMALLINT'i          !IdentifierStart _ { return 'SMALLINT' }
TABLE             = _ 'TABLE'i             !IdentifierStart _ { return 'TABLE' }
TEXT              = _ 'TEXT'i              !IdentifierStart _ { return 'TEXT' }
THEN              = _ 'THEN'i              !IdentifierStart _ { return 'THEN' }
TIME              = _ 'TIME'i              !IdentifierStart _ { return 'TIME' }
TIMESTAMP         = _ 'TIMESTAMP'i         !IdentifierStart _ { return 'TIMESTAMP' }
TINYINT           = _ 'TINYINT'i           !IdentifierStart _ { return 'TINYINT' }
TO                = _ 'TO'i                !IdentifierStart _ { return 'TO' }
TRIGGER           = _ 'TRIGGER'i           !IdentifierStart _ { return 'TRIGGER' }
TRUE              = _ 'TRUE'i              !IdentifierStart _ { return 'TRUE' }
UNIQUE            = _ 'UNIQUE'i            !IdentifierStart _ { return 'UNIQUE' }
UNLOCK            = _ 'UNLOCK'i            !IdentifierStart _ { return 'UNLOCK' }
UNSIGNED          = _ 'UNSIGNED'i          !IdentifierStart _ { return 'UNSIGNED' }
UPDATE            = _ 'UPDATE'i            !IdentifierStart _ { return 'UPDATE' }
USING             = _ 'USING'i             !IdentifierStart _ { return 'USING' }
VARBINARY         = _ 'VARBINARY'i         !IdentifierStart _ { return 'VARBINARY' }
VARCHAR           = _ 'VARCHAR'i           !IdentifierStart _ { return 'VARCHAR' }
WHILE             = _ 'WHILE'i             !IdentifierStart _ { return 'WHILE' }

// Reserved built-in functions
HEX               = _ 'HEX'i               !IdentifierStart _ { return 'HEX' }
SUBSTRING         = _ 'SUBSTRING'i         !IdentifierStart _ { return 'SUBSTRING' }
UNHEX             = _ 'UNHEX'i             !IdentifierStart _ { return 'UNHEX' }


// Composite types
NOT_NULL = NOT NULL { return 'NOT NULL' }

// ====================================================
// Tokens
// ====================================================

COMMA      = _ ',' _
EQ         = _ '=' _
GT         = _ '>' _
GTE        = _ '>=' _
LPAREN     = _ '(' _
LT         = _ '<' _
LTE        = _ '<=' _
MINUS      = _ '-' _
NE         = _ '<=>' _
PLUS       = _ '+' _
RPAREN     = _ ')' _
SEMICOLON  = _ ';' _
