{
  /**
   * Helper functions to more succinctly produce nodes
   */
  const invariant = require('invariant')
  const ast = require('../ast').default
  const { serializeExpression } = require('../printer')
  const { makeEncoding } = require('../ast/encodings.js')

  function unquote(quoted) {
    return quoted.replace("''", "'")
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
  / AlterDatabase
  / DropTable
  / DropIndex
  / SelectStatement
  / InsertStatement
  / DeleteStatement
  / UpdateStatement
  / SetStatement
  / LockStatement
  / UnlockStatement
  / CompoundStatement
  / IfStatement

CompoundStatement
  = BEGIN statements:StatementList END {
      return {
        type: 'BEGIN ... END',
        statements,
      }
    }

Comment
  = SingleLineComment
  / MultiLineComment

SingleLineComment
  = ("//" / "--") p:[^\n]* {
      return { type: 'comment', raw: p.join('').trim() }
    }

MultiLineComment
  = "/*" inner:(!"*/" i:. { return i })* "*/" {
      return { type: 'comment', raw: inner.join('') }
    }

// We ignore select/insert/delete statements for now
SelectStatement = SELECT [^;]* { return null }

UpdateStatement = UPDATE [^;]* { return null }

InsertStatement = INSERT [^;]* { return null }

DeleteStatement = DELETE [^;]* { return null }

SetStatement = SET [^;]* { return null }

LockStatement = LOCK [^;]* { return null }

UnlockStatement = UNLOCK [^;]* { return null }

Condition
  = BooleanLiteral
  / NOT Condition
  / LPAREN Condition RPAREN
  / left:Expression (EQ / STRICT_EQ / LTE / GTE / LT / GT) right:Expression

ExpressionList
  = first:Expression COMMA rest:ExpressionList { return [first, ...rest] }
  / only:Expression { return [only] }

Expression
  = expr1:BooleanPrimary op:BooleanOp expr2:BooleanPrimary {
      return ast.BinaryExpression(op, expr1, expr2)
    }
  / BooleanPrimary

BooleanOp
  = AND
  / OR
  / XOR

BooleanPrimary
  = pred:Predicate IS check:(NULL / NOT_NULL) {
      if (check === 'NULL') {
        return ast.UnaryExpression('is null', pred)
      } else {
        return ast.UnaryExpression('is not null', pred)
      }
    }
  / pred1:Predicate op:CmpOp pred2:Predicate {
      return ast.BinaryExpression(op, pred1, pred2)
    }
  / Predicate

CmpOp
  = EQ
  / STRICT_EQ
  / NE1
  / NE2
  / GTE
  / GT
  / LTE
  / LT
  / LIKE
  / REGEXP
  / RLIKE { return 'REGEXP' } // RLIKE is a synonym for REGEXP

Predicate = BitExpr1

BitExpr1
  // Mostly expressed like this to fight left-recursion in the grammer
  = expr1:BitExpr2
    rest:(op:BitExprOp1 expr2:BitExpr2 { return { op, expr2 } })* {
      return rest.reduce(
        (acc, cur) => ast.BinaryExpression(cur.op, acc, cur.expr2),
        expr1,
      )
    }

BitExpr2
  // Mostly expressed like this to fight left-recursion in the grammer
  = expr1:SimpleExpr
    rest:(op:BitExprOp2 expr2:SimpleExpr { return { op, expr2 } })* {
      return rest.reduce(
        (acc, cur) => ast.BinaryExpression(cur.op, acc, cur.expr2),
        expr1,
      )
    }

// Binary operators with weak binding
BitExprOp1
  = PLUS
  / MINUS

// Binary operators with strong binding
BitExprOp2
  = MULT
  / DIVIDE
  / DIV
  / PERCENTAGE
  / MOD { return '%' }

/* ArithmeticOperator */
/*   = PLUS */
/*   / MINUS */
// |
// &
// <<
// >>
// +
// -
// *
// /
// DIV
// MOD
// %
// ^
// +
// -

/* BitExpr */
/*   = BitExpr ArithmeticOperator BitExpr */
/*   / SimpleExpr */

SimpleExpr
  = Literal
  / FunctionCall
  / Identifier
  // / simple_expr COLLATE collation_name
  // / param_marker
  // / variable
  // / simple_expr || simple_expr
  / PLUS expr:SimpleExpr { return ast.UnaryExpression('+', expr) }
  / MINUS expr:SimpleExpr { return ast.UnaryExpression('-', expr) }
  // / ~ simple_expr
  / BANG expr:SimpleExpr { return ast.UnaryExpression('!', expr) }
  // / BINARY simple_expr
  / LPAREN expr:Expression RPAREN { return expr }

// / ROW (expr, expr [, expr] ...)
// / (subquery)
// / EXISTS (subquery)
// / {identifier expr}
// / match_expr
// / case_expr
// / interval_expr

FunctionCall
  = name:FunctionName LPAREN exprs:ExpressionList RPAREN {
      return ast.CallExpression(ast.BuiltInFunction(name), exprs)
    }
  / ident:Identifier LPAREN exprs:ExpressionList RPAREN {
      return ast.CallExpression(ast.BuiltInFunction(ident), exprs)
    }

  // JSON_EXTRACT shorthand syntax (e.g. foo->'$.bar', or foo->>'$.bar')
  / ident:Identifier arrow:(ARROWW / ARROW) lit:StringLiteral {
      let rv = ast.CallExpression(
        ast.BuiltInFunction(ast.Identifier('JSON_EXTRACT')),
        [ident, lit],
      )
      if (arrow === '->>') {
        rv = ast.CallExpression(
          ast.BuiltInFunction(ast.Identifier('JSON_UNQUOTE')),
          [rv],
        )
      }
      return rv
    }

FunctionName
  = CHAR_LENGTH
  / CONCAT
  / CONV
  / HEX
  / SUBSTRING
  / UNHEX

// ====================================================
// Constant literals
// ====================================================

// TODO: Replace this by letting `NULL` itself return a Literal
NullLiteral = NULL { return ast.Literal(null) }

BooleanLiteral
  = TRUE { return ast.Literal(true) }
  / FALSE { return ast.Literal(false) }

NumberLiteral
  = HexNumberLiteral
  / DecimalNumberLiteral

DecimalNumberLiteral
  = digits:[0-9]+ { return ast.Literal(parseInt(digits.join(''), 10)) }

HexNumberLiteral
  = "0x" digits:[0-9a-fA-F]+ {
      return ast.Literal(parseInt(digits.join(''), 16))
    }

StringLiteral
  = SingleQuotedStringLiteral
  / DoubleQuotedStringLiteral

SingleQuotedStringLiteral
  = "'" seq:("''" / "\\'" { return "''" } / [^'])* "'" {
      return ast.Literal(unquote(seq.join('')))
    }

DoubleQuotedStringLiteral
  = "\""
    seq:(
      "\"\"" { return '"' }
      / "\\\"" { return '"' }
      / "'" { return "''" }
      / [^"]
    )*
    "\"" { return ast.Literal(unquote(seq.join(''))) }

StringLiteralList
  = first:StringLiteral COMMA rest:StringLiteralList { return [first, ...rest] }
  / only:StringLiteral { return [only] }

Literal
  = NullLiteral
  / BooleanLiteral
  / NumberLiteral
  / StringLiteral

// ====================================================
// Rename table
// ====================================================

RenameTable
  = RENAME TABLE tblName:Identifier TO newName:Identifier {
      return {
        type: 'RENAME TABLE',
        tblName: tblName.name,
        newName: newName.name,
      }
    }

// ====================================================
// Drop Index
// ====================================================
DropIndex
  = DROP INDEX indexName:Identifier ON tblName:Identifier {
      return {
        type: 'DROP INDEX',
        indexName: indexName.name,
        tblName: tblName.name,
      }
    }

// ====================================================
// Drop Table
// ====================================================

DropTable
  = DROP TABLE ifExists:(IF EXISTS)? tblName:Identifier {
      return {
        type: 'DROP TABLE',
        tblName: tblName.name,
        ifExists: !!ifExists,
      }
    }

// ====================================================
// Create Index
// ====================================================

CreateIndex
  = CREATE
    indexKind:(UNIQUE / FULLTEXT)?
    INDEX
    indexName:Identifier
    ON
    tblName:Identifier
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      indexKind = indexKind || 'NORMAL'
      return {
        type: 'CREATE INDEX',
        indexName: indexName.name,
        indexKind,
        tblName: tblName.name,
        indexColNames,
      }
    }

// ====================================================
// Create Trigger
// ====================================================

CreateTrigger
  = CREATE
    TRIGGER
    triggerName:Identifier
    (BEFORE / AFTER)
    (INSERT / UPDATE / DELETE)
    ON
    tblName:Identifier
    FOR
    EACH
    ROW
    ((FOLLOWS / PRECEDES) Identifier)?
    triggerBody:Statement {
      return {
        type: 'CREATE TRIGGER',
        triggerName: triggerName.name,
        tblName: tblName.name,
      }
    }

// ====================================================
// Create Function
// ====================================================

FunctionParamList
  = first:FunctionParam COMMA rest:FunctionParamList { return [first, ...rest] }
  / only:FunctionParam { return [only] }

FunctionParam
  = paramName:Identifier type:DataType {
      return {
        paramName: paramName.name,
        type,
      }
    }

CreateFunction
  = CREATE
    FUNCTION
    spName:Identifier
    params:(LPAREN params:FunctionParamList RPAREN { return params })
    RETURNS
    DataType
    characteristic:CreateFunctionCharacteristic
    body:FunctionBody {
      return {
        type: 'CREATE FUNCTION',
        spName: spName.name,
        params,
        characteristic,
        // body,
      }
    }

CreateFunctionCharacteristic = NOT? DETERMINISTIC

FunctionBody = BEGIN statements:FunctionStatementList END

FunctionStatementList
  = first:FunctionStatement SEMICOLON? rest:FunctionStatementList {
      return [first, ...rest]
    }
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
  = ident:Identifier second:EQ third:Expression {
      return [ident.name, second, third]
    }

IfStatement
  = IF
    Condition
    THEN
    FunctionStatementList
    (ELSEIF Condition THEN FunctionStatementList)*
    (ELSE FunctionStatementList)?
    END
    IF

WhileStatement = WHILE Condition DO FunctionStatementList END WHILE

// ====================================================
// ALTER DATABASE
// ====================================================

AlterDatabase
  = ALTER DATABASE dbName:Identifier? options:AlterDbOption+ {
      return {
        type: 'ALTER DATABASE',
        dbName: dbName.name,
        options,
      }
    }

AlterDbOption
  = DEFAULT? CHARACTER SET EQ? CHARSET:CharsetName { return { CHARSET } }
  / DEFAULT? COLLATE EQ? COLLATE:CollationName { return { COLLATE } }

// ====================================================
// ALTER TABLE
// ====================================================

AlterTable
  = ALTER TABLE tblName:Identifier changes:AlterSpecs {
      return {
        type: 'ALTER TABLE',
        tblName: tblName.name,
        changes,
      }
    }

AlterSpecs
  = first:AlterSpec COMMA rest:AlterSpecs {
      return [first, ...rest].filter(Boolean)
    }
  / only:AlterSpec { return [only].filter(Boolean) }

/**
 * See https://dev.mysql.com/doc/refman/5.7/en/alter-table.html
 */
AlterSpec
  = options:TableOptions {
      return {
        type: 'CHANGE TABLE OPTIONS',
        options: Object.assign({}, ...options),
      }
    }
  / ADD
    COLUMN?
    colName:Identifier
    columnDefinition:ColumnDefinition
    position:(
      AFTER ident:Identifier { return `AFTER ${ident.name}` }
      / FIRST { return 'FIRST' }
    )? {
      return {
        type: 'ADD COLUMN',
        colName: colName.name,
        definition: columnDefinition,
        position,
      }
    }
  / ADD
    (INDEX / KEY)
    indexName:Identifier?
    indexType:IndexType?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return {
        type: 'ADD INDEX',
        indexName: indexName?.name ?? null,
        indexType,
        indexColNames,
      }
    }
  / ADD
    constraint:NamedConstraint?
    PRIMARY
    KEY
    indexType:IndexType?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return {
        type: 'ADD PRIMARY KEY',
        constraint,
        indexType,
        indexColNames,
      }
    }
  / ADD
    constraint:NamedConstraint?
    UNIQUE
    (INDEX / KEY)?
    indexName:Identifier?
    indexType:IndexType?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return {
        type: 'ADD UNIQUE INDEX',
        constraint,
        indexName: indexName?.name ?? null,
        indexType,
        indexColNames,
      }
    }
  / ADD
    FULLTEXT
    (INDEX / KEY)?
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return {
        type: 'ADD FULLTEXT INDEX',
        indexName: indexName?.name ?? null,
        indexColNames,
      }
    }
  / ADD
    constraint:NamedConstraint?
    FOREIGN
    KEY
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN
    reference:ReferenceDefinition {
      return {
        type: 'ADD FOREIGN KEY',
        constraint,
        indexName: indexName?.name ?? null,
        indexColNames,
        reference,
      }
    }
  // / ALGORITHM
  / ALTER COLUMN? colName:Identifier DROP DEFAULT {
      return {
        type: 'DROP DEFAULT',
        colName: colName.name,
      }
    }
  / CHANGE
    COLUMN?
    oldColName:Identifier
    newColName:Identifier
    definition:ColumnDefinition
    position:(
      AFTER ident:Identifier { return `AFTER ${ident.name}` }
      / FIRST { return 'FIRST' }
    )? {
      return {
        type: 'CHANGE COLUMN',
        oldColName: oldColName.name,
        newColName: newColName.name,
        definition,
        position,
      }
    }
  / DROP (INDEX / KEY) indexName:Identifier {
      return {
        type: 'DROP INDEX',
        indexName: indexName.name,
      }
    }
  / DROP PRIMARY KEY { return { type: 'DROP PRIMARY KEY' } }
  / DROP FOREIGN KEY symbol:Identifier {
      return {
        type: 'DROP FOREIGN KEY',
        symbol: symbol.name,
      }
    }
  / DROP COLUMN? colName:Identifier {
      return {
        type: 'DROP COLUMN',
        colName: colName.name,
      }
    }
  / MODIFY
    COLUMN?
    colName:Identifier
    definition:ColumnDefinition
    position:(
      AFTER ident:Identifier { return `AFTER ${ident.name}` }
      / FIRST { return 'FIRST' }
    )? {
      // MODIFY COLUMN is like CHANGE COLUMN in every way, except that it
      // cannot be used to rename a column.  We'll therefore parse any MODIFY
      // COLUMN statement as a CHANGE COLUMN statement where old + new columns
      // are identical (i.e. no rename).
      return {
        type: 'CHANGE COLUMN',
        oldColName: colName.name,
        newColName: colName.name,
        definition,
        position,
      }
    }
  / RENAME (INDEX / KEY) oldIndexName:Identifier TO newIndexName:Identifier {
      return {
        type: 'RENAME INDEX',
        oldIndexName: oldIndexName.name,
        newIndexName: newIndexName.name,
      }
    }
  / RENAME (TO / AS)? newTblName:Identifier {
      return {
        type: 'RENAME TABLE',
        newTblName: newTblName.name,
      }
    }
  / LOCK EQ? (DEFAULT / NONE / SHARED / EXCLUSIVE) { return null }
  / CONVERT
    TO
    CHARACTER
    SET
    charset:CharsetName
    collate:(COLLATE collate:CollationName { return collate })? {
      return {
        type: 'CONVERT TO',
        charset,
        collate,
      }
    }

NamedConstraint = CONSTRAINT symbol:Identifier? { return symbol?.name ?? null }

IndexType = USING (BTREE / HASH)

// ====================================================
// Create TABLE
// ====================================================
CreateTable
  = CreateTable1 // CREATE TABLE
  // CreateTable2  // See https://dev.mysql.com/doc/refman/5.7/en/create-table.html
  / CreateTable3 // CREATE TABLE ... LIKE

CreateTable1
  = CREATE
    TABLE
    ifNotExists:(IF NOT EXISTS)?
    tblName:Identifier
    LPAREN
    definitions:CreateDefinitionsList
    RPAREN
    tableOptions:TableOptions? {
      // Turn the list-of-option-pairs into an object
      const options = Object.assign({}, ...(tableOptions || []))
      return {
        type: 'CREATE TABLE',
        tblName: tblName.name,
        definitions,
        options,
        ifNotExists: !!ifNotExists,
      }
    }

CreateTable3
  = CREATE
    TABLE
    ifNotExists:(IF NOT EXISTS)?
    tblName:Identifier
    LIKE
    oldTblName:Identifier {
      return {
        type: 'CREATE TABLE LIKE', // Copy table
        tblName: tblName.name,
        oldTblName: oldTblName.name,
        ifNotExists,
      }
    }

CreateDefinitionsList
  = first:CreateDefinition _ "," _ rest:CreateDefinitionsList {
      return [first, ...rest]
    }
  / only:CreateDefinition { return [only] }

CreateDefinition
  = colName:Identifier _ columnDefinition:ColumnDefinition {
      return {
        type: 'COLUMN',
        colName: colName.name,
        definition: columnDefinition,
      }
    }
  // / [CONSTRAINT [symbol]] PRIMARY KEY [index_type] (index_col_name, ...) [index_option] ...
  / PRIMARY KEY LPAREN indexColNames:IndexColNames RPAREN {
      return {
        type: 'PRIMARY KEY',
        indexColNames,
      }
    }
  // / {INDEX|KEY} [index_name] [index_type] (index_col_name, ...)
  / (INDEX / KEY)
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return {
        type: 'INDEX',
        indexName: indexName?.name ?? null,
        indexColNames,
      }
    }
  // / [CONSTRAINT [symbol]] UNIQUE [INDEX|KEY] [index_name] [index_type] (index_col_name, ...) [index_option] ...
  / constraint:NamedConstraint?
    UNIQUE
    (INDEX / KEY)?
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return {
        type: 'UNIQUE INDEX',
        constraint,
        indexName: indexName?.name ?? null,
        indexColNames,
      }
    }
  / FULLTEXT
    (INDEX / KEY)?
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return {
        type: 'FULLTEXT INDEX',
        indexName: indexName?.name ?? null,
        indexColNames,
      }
    }
  / constraint:NamedConstraint?
    FOREIGN
    KEY
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN
    reference:ReferenceDefinition {
      return {
        type: 'FOREIGN KEY',
        constraint,
        indexName: indexName?.name ?? null,
        indexColNames,
        reference,
      }
    }

// / CHECK (expr)

// ALTER .... ... ....  COMMENT '123';

ColumnDefinition
  = dataType:DataType
    nullableClause:(NULL / NOT_NULL)?
    defaultValue:(DEFAULT value:DefaultValue { return value })?
    isPrimary1:(PRIMARY KEY)?
    autoIncrement:AUTO_INCREMENT?
    isUnique:(UNIQUE KEY?)?
    isPrimary2:(PRIMARY KEY)?
    comment:(COMMENT value:StringLiteral { return value.value })?
    reference:ReferenceDefinition?
    onUpdate:(ON UPDATE expr:CurrentTimestampish { return expr })?
    generated:(
      (GENERATED ALWAYS)?
        AS
        LPAREN
        expr:Expression
        RPAREN
        mode:(STORED / VIRTUAL)? {
          return ast.GeneratedDefinition(expr, mode || 'VIRTUAL')
        }
    )?
    nullableClause2:(NULL / NOT_NULL)? {
      let nullable = null
      if (nullableClause === 'NULL' || nullableClause2 === 'NULL') {
        nullable = true
      } else if (
        nullableClause === 'NOT NULL' ||
        nullableClause2 === 'NOT NULL'
      ) {
        nullable = false
      }

      onUpdate = onUpdate === null ? null : serializeExpression(onUpdate)

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
        generated,
      }
    }

Len = LPAREN number:NumberLiteral RPAREN { return number.value }

Precision
  = LPAREN length:NumberLiteral COMMA decimals:NumberLiteral RPAREN {
      return { length: length.value, decimals }
    }

Charset = CHARACTER SET name:CharsetName { return name }

Collate = COLLATE name:CollationName { return name }

Encoding
  = charset:Charset collate:Collate? {
      return makeEncoding(charset, collate ?? undefined)
    }
  / collate:Collate { return makeEncoding(undefined, collate) }

DataType
  = (INTEGER / INT) len:Len? unsigned:UNSIGNED? {
      return ast.Int((len ?? 11) - (unsigned ? 1 : 0), !!unsigned)
    }
  / BIGINT len:Len? unsigned:UNSIGNED? {
      return ast.BigInt((len ?? 20) - (unsigned ? 1 : 0), !!unsigned)
    }
  / MEDIUMINT len:Len? unsigned:UNSIGNED? {
      return ast.MediumInt((len ?? 9) - (unsigned ? 1 : 0), !!unsigned)
    }
  / SMALLINT len:Len? unsigned:UNSIGNED? {
      return ast.SmallInt((len ?? 6) - (unsigned ? 1 : 0), !!unsigned)
    }
  / TINYINT len:Len? unsigned:UNSIGNED? {
      return ast.TinyInt((len ?? 4) - (unsigned ? 1 : 0), !!unsigned)
    }
  / BOOLEAN len:Len? { return ast.TinyInt(len ?? 1, false) }
  / TIMESTAMP fsp:Len? { return ast.Timestamp(fsp) }
  / TIME { return ast.Time() }
  / DATETIME fsp:Len? { return ast.DateTime(fsp) }
  / DATE { return ast.Date() }
  / (REAL / DOUBLE) _ precision:Precision? _ unsigned:UNSIGNED? {
      return ast.Double(precision, !!unsigned)
    }
  / FLOAT _ precision:Precision? _ unsigned:UNSIGNED? {
      return ast.Double(precision, !!unsigned)
    }
  / (DECIMAL / NUMERIC) _ precision:Precision? _ unsigned:UNSIGNED? {
      return ast.Decimal(precision, !!unsigned)
    }

  // Length required
  / VARCHAR len:Len encoding:Encoding? { return ast.VarChar(len, encoding) }
  / VARBINARY len:Len { return ast.VarBinary(len) }

  // Length optional
  / CHAR len:Len? encoding:Encoding? { return ast.Char(len ?? 1, encoding) }
  / BINARY len:Len? { return ast.Binary(len) }

  // Length forbidden
  / TEXT encoding:Encoding? { return ast.Text(encoding) }
  / MEDIUMTEXT encoding:Encoding? { return ast.MediumText(encoding) }
  / LONGTEXT encoding:Encoding? { return ast.LongText(encoding) }
  / JSON { return ast.Json() }
  / ENUM LPAREN literals:StringLiteralList RPAREN encoding:Encoding? {
      return ast.Enum(
        literals.map((lit) => lit.value),
        encoding,
      )
    }

IndexColNames
  = first:IndexColName COMMA rest:IndexColNames { return [first, ...rest] }
  / only:IndexColName { return [only] }

IndexColName
  = colName:Identifier len:Len? direction:(ASC / DESC)? {
      return { colName: colName.name, len, direction }
    }

ReferenceDefinition
  = REFERENCES
    tblName:Identifier
    LPAREN
    indexColNames:IndexColNames
    RPAREN
    matchMode:(MATCH (FULL / PARTIAL / SIMPLE))?
    onDelete:(ON DELETE x:ReferenceOption { return x })?
    onUpdate:(ON UPDATE x:ReferenceOption { return x })? {
      return {
        tblName: tblName.name,
        indexColNames,
        matchMode,
        onDelete: onDelete ?? 'RESTRICT',
        onUpdate,
      }
    }

ReferenceOption
  = RESTRICT { return 'RESTRICT' }
  / CASCADE { return 'CASCADE' }
  / SET NULL { return 'SET NULL' }
  / NO ACTION { return 'NO ACTION' }

// NOTE: While the MySQL accepts "SET DEFAULT" as a valid option, it's
// rejected by InnoDB tables.
// / SET DEFAULT { return 'SET DEFAULT' }

TableOptions
  = first:TableOption COMMA? rest:TableOptions { return [first, ...rest] }
  / only:TableOption { return [only] }

TableOption
  = AUTO_INCREMENT EQ? AUTO_INCREMENT:Value { return { AUTO_INCREMENT } }
  / ENGINE EQ? ENGINE:EngineName { return { ENGINE } }
  / DEFAULT? (CHARSET / CHARACTER SET) EQ? CHARSET:CharsetName {
      return { CHARSET }
    }
  / DEFAULT? COLLATE EQ? COLLATE:CollationName { return { COLLATE } }

EngineName = _ "InnoDB"i !IdentifierStart _ { return 'InnoDB' }

CharsetName "character set name"
  = _ charset:("latin1" / "utf8mb4" / "utf8") !IdentifierStart _ {
      return charset
    }

CollationName "collation name"
  = _
    collation:(
      "latin1_swedish_ci"
      / "latin1_spanish_ci"
      / "utf8mb4_general_ci"
      / "utf8mb4_unicode_ci"
      / "utf8_bin"
      / "utf8_general_ci"
      / "utf8_unicode_ci"
    )
    !IdentifierStart
    _ { return collation }

ValueList
  = first:Value COMMA rest:ValueList { return [first, ...rest] }
  / only:Value { return [only] }

Value = lit:Literal { return lit.value }

/* System functions */

DefaultValue
  = Literal
  / CurrentTimestampish

CurrentTimestampish
  // TODO: Any of the synonyms for CURRENT_TIMESTAMP have the same meaning as
  // CURRENT_TIMESTAMP. These are CURRENT_TIMESTAMP(), NOW(), LOCALTIME,
  // LOCALTIME(), LOCALTIMESTAMP, and LOCALTIMESTAMP().
  = func:CURRENT_TIMESTAMP
    precision:(LPAREN n:NumberLiteral? RPAREN { return n })? {
      return ast.CallExpression(func, precision ? [precision] : null)
    }
  / CURRENT_TIMESTAMP
  / NowCall

NowCall = now:NOW LPAREN RPAREN { return ast.CallExpression(now, []) }

// ====================================================
// Util
// ====================================================

_ "whitespace" = Whitespace* { return null }

Whitespace
  = [ \t\r\n]
  / Comment

// TODO: Let this return identifier() nodes
Identifier
  = QuotedIdentifier
  / NonQuotedIdentifier

QuotedIdentifier
  = _ "`" chars:[^`]+ "`" _ { return ast.Identifier(chars.join('')) }

NonQuotedIdentifier
  = _ !Keyword first:IdentifierStart rest:IdentifierChar* _ {
      return ast.Identifier([first, ...rest].join(''))
    }

// ====================================================
// Keywords
// ====================================================

IdentifierStart = [a-zA-Z_]

IdentifierChar = [a-zA-Z0-9_]

Keyword
  = FOREIGN
  / KEY
  / PRIMARY
  / UNIQUE

ACTION = _ "ACTION"i !IdentifierChar _ { return 'ACTION' }

ADD = _ "ADD"i !IdentifierChar _ { return 'ADD' }

AFTER = _ "AFTER"i !IdentifierChar _ { return 'AFTER' }

ALTER = _ "ALTER"i !IdentifierChar _ { return 'ALTER' }

ALWAYS = _ "ALWAYS"i !IdentifierChar _ { return 'ALWAYS' }

AND = _ "AND"i !IdentifierChar _ { return 'AND' }

AS = _ "AS"i !IdentifierChar _ { return 'AS' }

ASC = _ "ASC"i !IdentifierChar _ { return 'ASC' }

AUTO_INCREMENT
  = _ "AUTO_INCREMENT"i !IdentifierChar _ { return 'AUTO_INCREMENT' }

BEFORE = _ "BEFORE"i !IdentifierChar _ { return 'BEFORE' }

BEGIN = _ "BEGIN"i !IdentifierChar _ { return 'BEGIN' }

BIGINT = _ "BIGINT"i !IdentifierChar _ { return 'BIGINT' }

BINARY = _ "BINARY"i !IdentifierChar _ { return 'BINARY' }

BOOLEAN = _ "BOOLEAN"i !IdentifierChar _ { return 'BOOLEAN' }

BTREE = _ "BTREE"i !IdentifierChar _ { return 'BTREE' }

CASCADE = _ "CASCADE"i !IdentifierChar _ { return 'CASCADE' }

CHANGE = _ "CHANGE"i !IdentifierChar _ { return 'CHANGE' }

CHAR = _ "CHAR"i !IdentifierChar _ { return 'CHAR' }

CHARACTER = _ "CHARACTER"i !IdentifierChar _ { return 'CHARACTER' }

CHARSET = _ "CHARSET"i !IdentifierChar _ { return 'CHARSET' }

COLLATE = _ "COLLATE"i !IdentifierChar _ { return 'COLLATE' }

COLUMN = _ "COLUMN"i !IdentifierChar _ { return 'COLUMN' }

COMMENT = _ "COMMENT"i !IdentifierChar _ { return 'COMMENT' }

CONSTRAINT = _ "CONSTRAINT"i !IdentifierChar _ { return 'CONSTRAINT' }

CONVERT = _ "CONVERT"i !IdentifierChar _ { return 'CONVERT' }

CREATE = _ "CREATE"i !IdentifierChar _ { return 'CREATE' }

CURRENT_TIMESTAMP
  = _ "CURRENT_TIMESTAMP"i !IdentifierChar _ {
      return ast.BuiltInFunction(ast.Identifier('CURRENT_TIMESTAMP'))
    }

DATABASE = _ "DATABASE"i !IdentifierChar _ { return 'DATABASE' }

DATE = _ "DATE"i !IdentifierChar _ { return 'DATE' }

DATETIME = _ "DATETIME"i !IdentifierChar _ { return 'DATETIME' }

DECIMAL = _ "DECIMAL"i !IdentifierChar _ { return 'DECIMAL' }

DECLARE = _ "DECLARE"i !IdentifierChar _ { return 'DECLARE' }

DEFAULT = _ "DEFAULT"i !IdentifierChar _ { return 'DEFAULT' }

DELETE = _ "DELETE"i !IdentifierChar _ { return 'DELETE' }

DESC = _ "DESC"i !IdentifierChar _ { return 'DESC' }

DETERMINISTIC = _ "DETERMINISTIC"i !IdentifierChar _ { return 'DETERMINISTIC' }

DIV = _ "DIV"i !IdentifierChar _ { return 'DIV' }

DO = _ "DO"i !IdentifierChar _ { return 'DO' }

DOUBLE = _ "DOUBLE"i !IdentifierChar _ { return 'DOUBLE' }

DROP = _ "DROP"i !IdentifierChar _ { return 'DROP' }

EACH = _ "EACH"i !IdentifierChar _ { return 'EACH' }

ELSE = _ "ELSE"i !IdentifierChar _ { return 'ELSE' }

ELSEIF = _ "ELSEIF"i !IdentifierChar _ { return 'ELSEIF' }

END = _ "END"i !IdentifierChar _ { return 'END' }

ENGINE = _ "ENGINE"i !IdentifierChar _ { return 'ENGINE' }

ENUM = _ "ENUM"i !IdentifierChar _ { return 'ENUM' }

EXCLUSIVE = _ "EXCLUSIVE"i !IdentifierChar _ { return 'EXCLUSIVE' }

EXISTS = _ "EXISTS"i !IdentifierChar _ { return 'EXISTS' }

FALSE = _ "FALSE"i !IdentifierChar _ { return 'FALSE' }

FIRST = _ "FIRST"i !IdentifierChar _ { return 'FIRST' }

FLOAT = _ "FLOAT"i !IdentifierChar _ { return 'FLOAT' }

FOLLOWS = _ "FOLLOWS"i !IdentifierChar _ { return 'FOLLOWS' }

FOR = _ "FOR"i !IdentifierChar _ { return 'FOR' }

FOREIGN = _ "FOREIGN"i !IdentifierChar _ { return 'FOREIGN' }

FULL = _ "FULL"i !IdentifierChar _ { return 'FULL' }

FULLTEXT = _ "FULLTEXT"i !IdentifierChar _ { return 'FULLTEXT' }

FUNCTION = _ "FUNCTION"i !IdentifierChar _ { return 'FUNCTION' }

GENERATED = _ "GENERATED"i !IdentifierChar _ { return 'GENERATED' }

HASH = _ "HASH"i !IdentifierChar _ { return 'HASH' }

IF = _ "IF"i !IdentifierChar _ { return 'IF' }

INDEX = _ "INDEX"i !IdentifierChar _ { return 'INDEX' }

INSERT = _ "INSERT"i !IdentifierChar _ { return 'INSERT' }

INT = _ "INT"i !IdentifierChar _ { return 'INT' }

INTEGER = _ "INTEGER"i !IdentifierChar _ { return 'INTEGER' }

IS = _ "IS"i !IdentifierChar _ { return 'IS' }

JSON = _ "JSON"i !IdentifierChar _ { return 'JSON' }

KEY = _ "KEY"i !IdentifierChar _ { return 'KEY' }

LIKE = _ "LIKE"i !IdentifierChar _ { return 'LIKE' }

LOCK = _ "LOCK"i !IdentifierChar _ { return 'LOCK' }

LONGTEXT = _ "LONGTEXT"i !IdentifierChar _ { return 'LONGTEXT' }

MATCH = _ "MATCH"i !IdentifierChar _ { return 'MATCH' }

MEDIUMINT = _ "MEDIUMINT"i !IdentifierChar _ { return 'MEDIUMINT' }

MEDIUMTEXT = _ "MEDIUMTEXT"i !IdentifierChar _ { return 'MEDIUMTEXT' }

MOD = _ "MOD"i !IdentifierChar _ { return 'MOD' }

MODIFY = _ "MODIFY"i !IdentifierChar _ { return 'MODIFY' }

NEW = _ "NEW"i !IdentifierChar _ { return 'NEW' }

NO = _ "NO"i !IdentifierChar _ { return 'NO' }

NONE = _ "NONE"i !IdentifierChar _ { return 'NONE' }

NOT = _ "NOT"i !IdentifierChar _ { return 'NOT' }

NOW
  = _ "NOW"i !IdentifierChar _ {
      return ast.BuiltInFunction(ast.Identifier('NOW'))
    }

NULL = _ "NULL"i !IdentifierChar _ { return 'NULL' }

NUMERIC = _ "NUMERIC"i !IdentifierChar _ { return 'NUMERIC' }

OLD = _ "OLD"i !IdentifierChar _ { return 'OLD' }

ON = _ "ON"i !IdentifierChar _ { return 'ON' }

OR = _ "OR"i !IdentifierChar _ { return 'OR' }

PARTIAL = _ "PARTIAL"i !IdentifierChar _ { return 'PARTIAL' }

PRECEDES = _ "PRECEDES"i !IdentifierChar _ { return 'PRECEDES' }

PRIMARY = _ "PRIMARY"i !IdentifierChar _ { return 'PRIMARY' }

REAL = _ "REAL"i !IdentifierChar _ { return 'REAL' }

REFERENCES = _ "REFERENCES"i !IdentifierChar _ { return 'REFERENCES' }

REGEXP = _ "REGEXP"i !IdentifierChar _ { return 'REGEXP' }

RENAME = _ "RENAME"i !IdentifierChar _ { return 'RENAME' }

RESTRICT = _ "RESTRICT"i !IdentifierChar _ { return 'RESTRICT' }

RETURN = _ "RETURN"i !IdentifierChar _ { return 'RETURN' }

RETURNS = _ "RETURNS"i !IdentifierChar _ { return 'RETURNS' }

RLIKE = _ "RLIKE"i !IdentifierChar _ { return 'RLIKE' }

ROW = _ "ROW"i !IdentifierChar _ { return 'ROW' }

SELECT = _ "SELECT"i !IdentifierChar _ { return 'SELECT' }

SET = _ "SET"i !IdentifierChar _ { return 'SET' }

SHARED = _ "SHARED"i !IdentifierChar _ { return 'SHARED' }

SIMPLE = _ "SIMPLE"i !IdentifierChar _ { return 'SIMPLE' }

SMALLINT = _ "SMALLINT"i !IdentifierChar _ { return 'SMALLINT' }

STORED = _ "STORED"i !IdentifierChar _ { return 'STORED' }

TABLE = _ "TABLE"i !IdentifierChar _ { return 'TABLE' }

TEXT = _ "TEXT"i !IdentifierChar _ { return 'TEXT' }

THEN = _ "THEN"i !IdentifierChar _ { return 'THEN' }

TIME = _ "TIME"i !IdentifierChar _ { return 'TIME' }

TIMESTAMP = _ "TIMESTAMP"i !IdentifierChar _ { return 'TIMESTAMP' }

TINYINT = _ "TINYINT"i !IdentifierChar _ { return 'TINYINT' }

TO = _ "TO"i !IdentifierChar _ { return 'TO' }

TRIGGER = _ "TRIGGER"i !IdentifierChar _ { return 'TRIGGER' }

TRUE = _ "TRUE"i !IdentifierChar _ { return 'TRUE' }

UNIQUE = _ "UNIQUE"i !IdentifierChar _ { return 'UNIQUE' }

UNLOCK = _ "UNLOCK"i !IdentifierChar _ { return 'UNLOCK' }

UNSIGNED = _ "UNSIGNED"i !IdentifierChar _ { return 'UNSIGNED' }

UPDATE = _ "UPDATE"i !IdentifierChar _ { return 'UPDATE' }

USING = _ "USING"i !IdentifierChar _ { return 'USING' }

VARBINARY = _ "VARBINARY"i !IdentifierChar _ { return 'VARBINARY' }

VARCHAR = _ "VARCHAR"i !IdentifierChar _ { return 'VARCHAR' }

VIRTUAL = _ "VIRTUAL"i !IdentifierChar _ { return 'VIRTUAL' }

WHILE = _ "WHILE"i !IdentifierChar _ { return 'WHILE' }

XOR = _ "XOR"i !IdentifierChar _ { return 'XOR' }

// Reserved built-in functions
// TODO: Complete this list
CHAR_LENGTH
  = _ "CHAR_LENGTH"i !IdentifierChar _ { return ast.Identifier('CHAR_LENGTH') }

CONCAT = _ "CONCAT"i !IdentifierChar _ { return ast.Identifier('CONCAT') }

CONV = _ "CONV"i !IdentifierChar _ { return ast.Identifier('CONV') }

HEX = _ "HEX"i !IdentifierChar _ { return ast.Identifier('HEX') }

SUBSTRING
  = _ "SUBSTRING"i !IdentifierChar _ { return ast.Identifier('SUBSTRING') }

UNHEX = _ "UNHEX"i !IdentifierChar _ { return ast.Identifier('UNHEX') }

// Composite types
NOT_NULL = NOT NULL { return 'NOT NULL' }

// ====================================================
// Tokens
// ====================================================

ARROW = _ "->" _ { return '->' }

ARROWW = _ "->>" _ { return '->>' }

BANG = _ "!" _ { return '+' }

COMMA = _ "," _ { return ',' }

DIVIDE = _ "/" _ { return '/' }

EQ = _ "=" _ { return '=' }

GT = _ ">" _ { return '>' }

GTE = _ ">=" _ { return '>=' }

LPAREN = _ "(" _ { return '(' }

LT = _ "<" _ { return '<' }

LTE = _ "<=" _ { return '<=' }

MINUS = _ "-" _ { return '-' }

MULT = _ "*" _ { return '*' }

STRICT_EQ = _ "<=>" _ { return '<=>' }

NE1 = _ "<>" _ { return '<>' }

NE2 = _ "!=" _ { return '<>' }

PERCENTAGE = _ "%" _ { return '%' }

PLUS = _ "+" _ { return '+' }

RPAREN = _ ")" _ { return ')' }

SEMICOLON = _ ";" _ { return ';' }
