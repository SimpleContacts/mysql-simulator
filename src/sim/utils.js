// @flow strict

// $FlowFixMe - the parser isn't type-annotated
import { parse as rawParseSql } from '../parser/mysql';

export function escape(s: string): string {
  return `\`${s.replace('`', '\\`')}\``;
}

function* iterInsert<T>(arr: $ReadOnlyArray<T>, pos: number, item: T): Iterable<T> {
  yield* arr.slice(0, pos);
  yield item;
  yield* arr.slice(pos);
}

export function insert<T>(arr: $ReadOnlyArray<T>, pos: number, item: T): Array<T> {
  return Array.from(iterInsert(arr, pos, item));
}

/**
 * Unquotes a string literal (from SQL parsing output).
 */
export function unquote(quoted: string): string {
  return quoted.substring(1, quoted.length - 1).replace("''", "'");
}

/**
 * Quotes a string literal.
 */
export function quote(s: string): string {
  return `'${s.replace("'", "''")}'`;
}

/**
 * ...and of course MySQL has another quoting strategy when in an expression
 * context.  Le sigh.
 */
export function quoteInExpressionContext(s: string): string {
  return `'${s.replace("'", "\\'")}'`;
}

/**
 * Parses an ENUM definition, like
 *
 *     'Fo,o', 'B''ar','Qux\''
 *
 * into:
 *
 *     ['Fo,o', "B'ar", "Qux'"]
 */
export function parseEnumValues(enumString: string): Array<string> {
  const values = rawParseSql(enumString, {
    startRule: 'StringLiteralList',
  });
  // Dequote to make them JavaScript string literals
  return values.map(lit => unquote(lit.value));
}
