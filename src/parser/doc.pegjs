start = item*

// Allow for JS style comments
item = comment / expressionBlock
expressionBlock = _ d:expression _ {return d }
comment = _ comment:(single / multi) _ {return comment }

single = '//' p:([^\n]*) { return { type: 'comment', commentType: 'single', raw: p.join('').trim() }; }
multi = "/*" inner:(!"*/" i:. {return i})* "*/" { return { type: 'comment', commentType: 'multi', raw: inner.join('') }; }


// expression
expression = s:expressionStart rest:expressionRest* { return [s, ...rest]; }
expressionStart = defItem
expressionRest = defSpace? d:defItem { return d }

defItem = stringLiteral
        / stringType
        / blockItem
        / optionalDefItem
        / definition
        / identifier
        / list
        / parens
        / or
        / comma
        / equal

// expression types

stringLiteral = s:stringLiteralStart rest:stringLiteralRest* {
  return {
    type: "stringLiteral",
    string: [
      s.join(''),
      ...rest.map(s => s.join(''))
    ].join(' ')
  }
}
stringLiteralStart = [A-Z_0-9]+
stringLiteralRest = defSpace s:[A-Z_0-9]+ { return s }

blockItem = "{" w* d:expression w* "}" { return {  type: "block", expression: d } }

optionalDefItem = "[" w* d:expression w* "]" { return {  type: "optional", expression: d } }

definition = s:[a-z_]+":" { return { type: 'definition', name: s.join('') } }

identifier = s:(s1:[a-z_]s2:[a-zA-Z0-9_]* { return s1 + s2.join('') }) { return { type: 'identifier', name: s } }

list = comma:","? w* "..." w* { return { comma: !!comma, type: "list" } }

comma = w* "," w* { return { type: "stringLiteral", string: ",", name: "comma" } }
equal = w* "=" w* { return { type: "stringLiteral", string: "=", name: "equal" } }

parens = "(" w* d:expression w* ")" { return {  type: "parens", expression: d } }

or = "|" { return { type: "or" } }

stringType = "'" s:string "'" { return { type: 'string', string: s } }
