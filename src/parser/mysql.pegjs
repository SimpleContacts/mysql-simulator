{
  /**
   * Helper functions to more succinctly produce nodes
   */
  const invariant = require('invariant')
  const ast = require('../ast').default
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
  = pred:Predicate IS nullTest:Nullability {
      if (nullTest) {
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

SimpleExpr
  = Literal
  / FunctionCall
  / Identifier
  / PLUS expr:SimpleExpr { return ast.UnaryExpression('+', expr) }
  / MINUS expr:SimpleExpr { return ast.UnaryExpression('-', expr) }
  / BANG expr:SimpleExpr { return ast.UnaryExpression('!', expr) }
  / LPAREN expr:Expression RPAREN { return expr }

FunctionCall
  = func:FunctionName LPAREN exprs:ExpressionList RPAREN {
      return ast.CallExpression(func, exprs)
    }

  // JSON_EXTRACT shorthand syntax (e.g. foo->'$.bar', or foo->>'$.bar')
  / ident:Identifier arrow:(ARROWW / ARROW) lit:StringLiteral {
      let rv = ast.CallExpression(ast.BuiltInFunction('JSON_EXTRACT'), [
        ident,
        lit,
      ])
      if (arrow === '->>') {
        rv = ast.CallExpression(ast.BuiltInFunction('JSON_UNQUOTE'), [rv])
      }
      return rv
    }

FunctionName
  = id:Identifier { return ast.BuiltInFunction(id.name.toUpperCase()) }

// ====================================================
// Constant literals
// ====================================================

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
      return ast.RenameTableStatement(tblName.name, newName.name)
    }

// ====================================================
// Drop Index
// ====================================================
DropIndex
  = DROP INDEX indexName:Identifier ON tblName:Identifier {
      return ast.DropIndexStatement(indexName.name, tblName.name)
    }

// ====================================================
// Drop Table
// ====================================================

DropTable
  = DROP TABLE ifExists:(IF EXISTS)? tblName:Identifier {
      return ast.DropTableStatement(tblName.name, !!ifExists)
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
      return ast.CreateIndexStatement(
        indexName.name,
        indexKind,
        tblName.name,
        indexColNames,
      )
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
      return ast.CreateTriggerStatement(triggerName.name, tblName.name)
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
      return ast.CreateFunctionStatement(/* spName.name, params, characteristic */)
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
  = ALTER DATABASE dbName:Identifier? options:DatabaseOptions {
      return ast.AlterDatabaseStatement(dbName.name, options)
    }

// ====================================================
// ALTER TABLE
// ====================================================

AlterTable
  = ALTER TABLE tblName:Identifier changes:AlterSpecs {
      return ast.AlterTableStatement(tblName.name, changes)
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
  = options:TableOptions { return ast.AlterTableOptions(options) }
  / ADD
    COLUMN?
    colName:Identifier
    columnDefinition:ColumnDefinition
    position:(
      AFTER ident:Identifier { return `AFTER ${ident.name}` }
      / FIRST { return 'FIRST' }
    )? { return ast.AlterAddColumn(colName.name, columnDefinition, position) }
  / ADD
    (INDEX / KEY)
    indexName:Identifier?
    indexType:IndexType?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return ast.AlterAddIndex(
        indexName?.name ?? null,
        indexType,
        indexColNames,
      )
    }
  / ADD
    constraintName:NamedConstraint?
    PRIMARY
    KEY
    indexType:IndexType?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return ast.AlterAddPrimaryKey(constraintName, indexType, indexColNames)
    }
  / ADD
    constraintName:NamedConstraint?
    UNIQUE
    (INDEX / KEY)?
    indexName:Identifier?
    indexType:IndexType?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return ast.AlterAddUniqueIndex(
        constraintName,
        indexName?.name ?? null,
        indexType,
        indexColNames,
      )
    }
  / ADD
    FULLTEXT
    (INDEX / KEY)?
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return ast.AlterAddFullTextIndex(indexName?.name ?? null, indexColNames)
    }
  / ADD
    constraintName:NamedConstraint?
    FOREIGN
    KEY
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN
    reference:ReferenceDefinition {
      return ast.AlterAddForeignKey(
        constraintName,
        indexName?.name ?? null,
        indexColNames,
        reference,
      )
    }
  // / ALGORITHM
  / ALTER COLUMN? colName:Identifier DROP DEFAULT {
      return ast.AlterDropDefault(colName.name)
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
      return ast.AlterChangeColumn(
        oldColName.name,
        newColName.name,
        definition,
        position,
      )
    }
  / DROP (INDEX / KEY) indexName:Identifier {
      return ast.AlterDropIndex(indexName.name)
    }
  / DROP PRIMARY KEY { return ast.AlterDropPrimaryKey() }
  / DROP FOREIGN KEY symbol:Identifier {
      return ast.AlterDropForeignKey(symbol.name)
    }
  / DROP COLUMN? colName:Identifier { return ast.AlterDropColumn(colName.name) }
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
      return ast.AlterChangeColumn(
        colName.name,
        colName.name,
        definition,
        position,
      )
    }
  / RENAME (INDEX / KEY) oldIndexName:Identifier TO newIndexName:Identifier {
      return ast.AlterRenameIndex(oldIndexName.name, newIndexName.name)
    }
  / RENAME (TO / AS)? newTblName:Identifier {
      return ast.AlterRenameTable(newTblName.name)
    }
  / LOCK EQ? (DEFAULT / NONE / SHARED / EXCLUSIVE) { return null }
  / CONVERT
    TO
    CHARACTER
    SET
    charset:CharsetName
    collate:(COLLATE collate:CollationName { return collate })? {
      return ast.AlterConvertTo(charset, collate)
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
      return ast.CreateTableStatement(
        tblName.name,
        definitions,
        tableOptions,
        !!ifNotExists,
      )
    }

CreateTable3
  = CREATE
    TABLE
    ifNotExists:(IF NOT EXISTS)?
    tblName:Identifier
    LIKE
    oldTblName:Identifier {
      return ast.CreateTableLikeStatement(
        tblName.name,
        oldTblName.name,
        ifNotExists,
      )
    }

CreateDefinitionsList
  = first:CreateDefinition _ "," _ rest:CreateDefinitionsList {
      return [first, ...rest]
    }
  / only:CreateDefinition { return [only] }

CreateDefinition
  = colName:Identifier _ columnDefinition:ColumnDefinition {
      return ast.Column(colName.name, columnDefinition)
    }
  // / [CONSTRAINT [symbol]] PRIMARY KEY [index_type] (index_col_name, ...) [index_option] ...
  / PRIMARY KEY LPAREN indexColNames:IndexColNames RPAREN {
      return ast.PrimaryKey(indexColNames)
    }
  // / {INDEX|KEY} [index_name] [index_type] (index_col_name, ...)
  / (INDEX / KEY)
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN { return ast.Index(indexName?.name ?? null, indexColNames) }
  // / [CONSTRAINT [symbol]] UNIQUE [INDEX|KEY] [index_name] [index_type] (index_col_name, ...) [index_option] ...
  / constraintName:NamedConstraint?
    UNIQUE
    (INDEX / KEY)?
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN {
      return ast.UniqueIndex(
        constraintName,
        indexName?.name ?? null,
        indexColNames,
      )
    }
  / FULLTEXT
    (INDEX / KEY)?
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN { return ast.FullTextIndex(indexName?.name ?? null, indexColNames) }
  / constraintName:NamedConstraint?
    FOREIGN
    KEY
    indexName:Identifier?
    LPAREN
    indexColNames:IndexColNames
    RPAREN
    reference:ReferenceDefinition {
      return ast.ForeignKey(
        constraintName,
        indexName?.name ?? null,
        indexColNames,
        reference,
      )
    }

// / CHECK (expr)

// ALTER .... ... ....  COMMENT '123';

ColumnDefinition
  = dataType:DataType
    nullability1:Nullability?
    defaultValue:(DEFAULT value:DefaultValue { return value })?
    isPrimary1:(PRIMARY KEY)?
    autoIncrement:AUTO_INCREMENT?
    isUnique:(UNIQUE KEY?)?
    isPrimary2:(PRIMARY KEY)?
    comment:(COMMENT value:StringLiteral { return value.value })?
    reference:ReferenceDefinition?
    onUpdate:(ON UPDATE expr:CurrentTimestamp { return expr })?
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
    nullability2:Nullability? {
      return ast.ColumnDefinition(
        dataType,
        nullability1 ?? nullability2,
        defaultValue,
        onUpdate,
        !!isUnique,
        !!isPrimary1 || !!isPrimary2,
        !!autoIncrement,
        comment,
        reference,
        generated,
      )
    }

Len = LPAREN number:NumberLiteral RPAREN { return number.value }

Precision
  = LPAREN length:NumberLiteral COMMA decimals:NumberLiteral RPAREN {
      return { length: length.value, decimals: decimals.value }
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
      return ast.Int(len ?? (unsigned ? 10 : 11), !!unsigned)
    }
  / BIGINT len:Len? unsigned:UNSIGNED? {
      return ast.BigInt(
        len ??
          // NOTE: Both signed and unsigned are 20 in the case of BIGINT!
          (unsigned ? 20 : 20),
        !!unsigned,
      )
    }
  / MEDIUMINT len:Len? unsigned:UNSIGNED? {
      return ast.MediumInt(len ?? (unsigned ? 8 : 9), !!unsigned)
    }
  / SMALLINT len:Len? unsigned:UNSIGNED? {
      return ast.SmallInt(len ?? (unsigned ? 5 : 6), !!unsigned)
    }
  / TINYINT len:Len? unsigned:UNSIGNED? {
      return ast.TinyInt(len ?? (unsigned ? 3 : 4), !!unsigned)
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
      const DEFAULT_PRECISION = { length: 10, decimals: 0 }
      return ast.Decimal(precision ?? DEFAULT_PRECISION, !!unsigned)
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
      return ast.IndexColName(colName.name, len, direction)
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
      return ast.ReferenceDefinition(
        tblName.name,
        indexColNames,
        matchMode,
        onDelete ?? 'RESTRICT',
        onUpdate,
      )
    }

ReferenceOption
  = RESTRICT { return 'RESTRICT' }
  / CASCADE { return 'CASCADE' }
  / SET NULL { return 'SET NULL' }
  / NO ACTION { return 'NO ACTION' }

// NOTE: While the MySQL accepts "SET DEFAULT" as a valid option, it's
// rejected by InnoDB tables.
// / SET DEFAULT { return 'SET DEFAULT' }

DatabaseOptions
  = options:DatabaseOptionsList {
      return ast.DatabaseOptions(
        options.map((opt) => opt.CHARSET).find((x) => x) ?? null,
        options.map((opt) => opt.COLLATE).find((x) => x) ?? null,
      )
    }

DatabaseOptionsList
  = first:DatabaseOption COMMA? rest:DatabaseOptionsList {
      return [first, ...rest]
    }
  / only:DatabaseOption { return [only] }

DatabaseOption
  = DEFAULT? CHARACTER SET EQ? CHARSET:CharsetName { return { CHARSET } }
  / DEFAULT? COLLATE EQ? COLLATE:CollationName { return { COLLATE } }

TableOptions
  = options:TableOptionsList {
      return ast.TableOptions(
        options.map((opt) => opt.AUTO_INCREMENT).find((x) => x) ?? null,
        options.map((opt) => opt.ENGINE).find((x) => x) ?? null,
        options.map((opt) => opt.CHARSET).find((x) => x) ?? null,
        options.map((opt) => opt.COLLATE).find((x) => x) ?? null,
      )
    }

TableOptionsList
  = first:TableOption COMMA? rest:TableOptionsList { return [first, ...rest] }
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
  = _ charset:("latin1" / "utf8mb3" / "utf8mb4" / "utf8") !IdentifierStart _ {
      return charset
    }

CollationName "collation name"
  = _
    collation:(
      "latin1_swedish_ci"
      / "latin1_spanish_ci"
      / "utf8mb3_general_ci"
      / "utf8mb3_unicode_ci"
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
  / CurrentTimestamp

CurrentTimestamp
  // All of these are synonyms for CURRENT_TIMESTAMP: NOW(), LOCALTIME,
  // LOCALTIME(), LOCALTIMESTAMP, LOCALTIMESTAMP(). Note that only `NOW` is
  // a little bit different: it's the only one that cannot occur without
  // parens!
  = NOW LPAREN precision:NumberLiteral? RPAREN {
      return ast.CurrentTimestamp(precision !== null ? precision.value : null)
    }
  / (CURRENT_TIMESTAMP / LOCALTIMESTAMP / LOCALTIME)
    precision:(LPAREN n:NumberLiteral? RPAREN { return n })? {
      return ast.CurrentTimestamp(precision !== null ? precision.value : null)
    }

Nullability
  = NULL { return true }
  / NOT NULL { return false }

// ====================================================
// Util
// ====================================================

_ "whitespace" = Whitespace* { return null }

Whitespace
  = [ \t\r\n]
  / Comment

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
  = _ "CURRENT_TIMESTAMP"i !IdentifierChar _ { return 'CURRENT_TIMESTAMP' }

LOCALTIME = _ "LOCALTIME"i !IdentifierChar _ { return 'LOCALTIME' }

LOCALTIMESTAMP
  = _ "LOCALTIMESTAMP"i !IdentifierChar _ { return 'LOCALTIMESTAMP' }

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

IF = _ "IF"i !IdentifierChar _ { return ast.BuiltInFunction('IF') }

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

NOW = _ "NOW"i !IdentifierChar _ { return ast.BuiltInFunction('NOW') }

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
