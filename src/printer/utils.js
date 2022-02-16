// @flow strict

export type MySQLVersion = '5.7' | '8.0';

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
 * Quotes a string literal.
 */
export function quote(s: string): string {
  return `'${s.replace("'", "''")}'`;
}

/**
 * ...and of course MySQL has another quoting strategy when in an expression
 * context.  Le sigh.
 */
export function quoteInExpressionContext(s: string, target: MySQLVersion): string {
  if (target >= '8.0') {
    return `_utf8mb3'${s.replace("'", "\\'")}'`;
  } else {
    return `'${s.replace("'", "\\'")}'`;
  }
}
