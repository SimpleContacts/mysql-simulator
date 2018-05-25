// @flow

export function escape(s: string): string {
  return `\`${s.replace('`', '\\`')}\``;
}

export function normalizeType(type: string): string {
  const matches = type.match(/^([^(]+)(?:[(]([^)]+)[)])?(.*)?$/);
  if (!matches) {
    throw new Error(`Error parsing data type: ${type}`);
  }

  let basetype = matches[1];
  let params = matches[2];
  let rest = matches[3];

  basetype = basetype.toLowerCase();
  params = params ? `(${params})` : '';
  rest = rest ? `${rest.toLowerCase()}` : '';
  return [basetype, params, rest].join('');
}

function* iterInsert<T>(arr: $ReadOnlyArray<T>, pos: number, item: T): Iterable<T> {
  yield* arr.slice(0, pos);
  yield item;
  yield* arr.slice(pos);
}

export function insert<T>(arr: $ReadOnlyArray<T>, pos: number, item: T): Array<T> {
  return [...iterInsert(arr, pos, item)];
}
