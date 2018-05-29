// @flow

export function escape(s: string): string {
  return `\`${s.replace('`', '\\`')}\``;
}

function* iterInsert<T>(arr: $ReadOnlyArray<T>, pos: number, item: T): Iterable<T> {
  yield* arr.slice(0, pos);
  yield item;
  yield* arr.slice(pos);
}

export function insert<T>(arr: $ReadOnlyArray<T>, pos: number, item: T): Array<T> {
  return [...iterInsert(arr, pos, item)];
}
