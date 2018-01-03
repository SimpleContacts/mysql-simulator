// Misc utility
_ = [ \t\r\n]* { return null }
anySpace = [ \t\r\n] { return null }
Zs = [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]
whiteSpace "whitespace"
  = "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"
  / Zs { return null }
w = whiteSpace / lineTerminatorSequence { return null }
lineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"
continueToNextLine = lineTerminatorSequence whiteSpace* { return null }
defSpace = whiteSpace+ / continueToNextLine { return null }
quote = ['"]
string = s:[^'"]* { return s.join('') }
quotedString = quote s:string quote { return { string: s } }


docIdentifier = docIdentifierKeywords / docIdentifierString / quotedString
docIdentifierString = s1:[a-zA-Z0-9] s:([a-zA-Z0-9_])* { return s1 + s.join('') }
docIdentifierKeywords = "NOW()" / "CURRENT_TIMESTAMP"

orderByExpr = someExpr
groupByExpr = someExpr

/* For Select statements */
selectExpr = s1:selectStarOrSomeExpr as:selectExprAs? { return { ...s1, as } }
selectExprAs = w* "as"i w* as:[a-zA-Z0-9_]+ { return as.join('') }
selectStarOrSomeExpr = selectStar / someExpr
selectStar = s1:selectRuleTableName? s:"*" { return { tableName: s1, columnName: "*" } }
someExpr = s1:selectRuleTableName? s2:[a-zA-Z0-9_]+ { return { tableName: s1, columnName: s2.join('') } }
selectRuleTableName = s1:[a-zA-Z0-9_]+ "." { return s1.join('') }

/* For where condition */
whereCondition = s1:whereExprOne s2:whereExprRest* { return { whereCondition: [s1].concat(s2) } }
whereExprOne = not:"not"i? w* w:whereExprOptions { return { not: !!not, ...w } }

// Different types of where conditions.
whereExprOptions = whereExprParens / whereExprEqual / whereExprIsNull
whereExprParens = "(" w* s1:whereExprOne s2:whereExprRest* w* ")" { return { condition: 'PARENS', expr: [s1].concat(s2) }}
whereExprIsNull = expr:someExpr w* "is"i w* "null"i { return { condition: 'ISNULL', expr }}
whereExprEqual = expr1:someExpr w* "=" w* expr2:exprPredicate { return { condition: 'EQUAL', expr1, expr2 } }
exprPredicate = someExpr / quotedString
whereExprRest = w* c:whereAndOr w* w:whereExprOne { return { connector: c, ...w } }
whereAndOr = "AND" / "OR"
