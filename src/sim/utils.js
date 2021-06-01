// @flow strict

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
