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
