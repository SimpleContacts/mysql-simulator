// flow-typed signature: 61f6aff2b7a4c2d2b48136a10568f722
// flow-typed version: 173a6441ff/lodash_v4.x.x/flow_>=v0.104.x

declare module 'lodash' {
  declare type Path = $ReadOnlyArray<string | number> | string | number;
  declare type __CurriedFunction1<A, R, AA: A> = (...r: [AA]) => R;
  declare type CurriedFunction1<A, R> = __CurriedFunction1<A, R, *>;

  declare type __CurriedFunction2<A, B, R, AA: A, BB: B> = ((
    ...r: [AA]
  ) => CurriedFunction1<BB, R>) &
    ((...r: [AA, BB]) => R);
  declare type CurriedFunction2<A, B, R> = __CurriedFunction2<A, B, R, *, *>;

  declare type __CurriedFunction3<A, B, C, R, AA: A, BB: B, CC: C> = ((
    ...r: [AA]
  ) => CurriedFunction2<BB, CC, R>) &
    ((...r: [AA, BB]) => CurriedFunction1<CC, R>) &
    ((...r: [AA, BB, CC]) => R);
  declare type CurriedFunction3<A, B, C, R> = __CurriedFunction3<
    A,
    B,
    C,
    R,
    *,
    *,
    *,
  >;

  declare type __CurriedFunction4<A, B, C, D, R, AA: A, BB: B, CC: C, DD: D> =
    ((...r: [AA]) => CurriedFunction3<BB, CC, DD, R>) &
      ((...r: [AA, BB]) => CurriedFunction2<CC, DD, R>) &
      ((...r: [AA, BB, CC]) => CurriedFunction1<DD, R>) &
      ((...r: [AA, BB, CC, DD]) => R);
  declare type CurriedFunction4<A, B, C, D, R> = __CurriedFunction4<
    A,
    B,
    C,
    D,
    R,
    *,
    *,
    *,
    *,
  >;

  declare type __CurriedFunction5<
    A,
    B,
    C,
    D,
    E,
    R,
    AA: A,
    BB: B,
    CC: C,
    DD: D,
    EE: E,
  > = ((...r: [AA]) => CurriedFunction4<BB, CC, DD, EE, R>) &
    ((...r: [AA, BB]) => CurriedFunction3<CC, DD, EE, R>) &
    ((...r: [AA, BB, CC]) => CurriedFunction2<DD, EE, R>) &
    ((...r: [AA, BB, CC, DD]) => CurriedFunction1<EE, R>) &
    ((...r: [AA, BB, CC, DD, EE]) => R);
  declare type CurriedFunction5<A, B, C, D, E, R> = __CurriedFunction5<
    A,
    B,
    C,
    D,
    E,
    R,
    *,
    *,
    *,
    *,
    *,
  >;

  declare type __CurriedFunction6<
    A,
    B,
    C,
    D,
    E,
    F,
    R,
    AA: A,
    BB: B,
    CC: C,
    DD: D,
    EE: E,
    FF: F,
  > = ((...r: [AA]) => CurriedFunction5<BB, CC, DD, EE, FF, R>) &
    ((...r: [AA, BB]) => CurriedFunction4<CC, DD, EE, FF, R>) &
    ((...r: [AA, BB, CC]) => CurriedFunction3<DD, EE, FF, R>) &
    ((...r: [AA, BB, CC, DD]) => CurriedFunction2<EE, FF, R>) &
    ((...r: [AA, BB, CC, DD, EE]) => CurriedFunction1<FF, R>) &
    ((...r: [AA, BB, CC, DD, EE, FF]) => R);
  declare type CurriedFunction6<A, B, C, D, E, F, R> = __CurriedFunction6<
    A,
    B,
    C,
    D,
    E,
    F,
    R,
    *,
    *,
    *,
    *,
    *,
    *,
  >;

  declare type Curry = (<A, R>((...r: [A]) => R) => CurriedFunction1<A, R>) &
    (<A, B, R>((...r: [A, B]) => R) => CurriedFunction2<A, B, R>) &
    (<A, B, C, R>((...r: [A, B, C]) => R) => CurriedFunction3<A, B, C, R>) &
    (<A, B, C, D, R>(
      (...r: [A, B, C, D]) => R,
    ) => CurriedFunction4<A, B, C, D, R>) &
    (<A, B, C, D, E, R>(
      (...r: [A, B, C, D, E]) => R,
    ) => CurriedFunction5<A, B, C, D, E, R>) &
    (<A, B, C, D, E, F, R>(
      (...r: [A, B, C, D, E, F]) => R,
    ) => CurriedFunction6<A, B, C, D, E, F, R>);

  declare type UnaryFn<A, R> = (a: A) => R;

  declare type TemplateSettings = {
    escape?: RegExp,
    evaluate?: RegExp,
    imports?: Object,
    interpolate?: RegExp,
    variable?: string,
    ...
  };

  declare type TruncateOptions = {
    length?: number,
    omission?: string,
    separator?: RegExp | string,
    ...
  };

  declare type Cancelable = {
    cancel: () => void,
    flush: () => mixed,
    ...
  };

  declare type DebounceOptions = {
    leading?: boolean,
    maxWait?: number,
    trailing?: boolean,
    ...
  };

  declare type ThrottleOptions = {
    leading?: boolean,
    trailing?: boolean,
    ...
  };

  // using opaque type for object key is not supported by Flow atm: https://github.com/facebook/flow/issues/5407
  declare type Key = string | number;
  declare type IndexerObject<V, K = Key> = { [key: K]: V, ... };
  declare type ReadOnlyIndexerObject<V, K = Key> = $ReadOnly<
    IndexerObject<V, K>,
  >;
  declare type NestedArray<V> = Array<Array<V>>;
  declare type Collection<V, K = Key> =
    | $ReadOnlyArray<V>
    | ReadOnlyIndexerObject<V, K>;

  declare type matchesIterateeShorthand = { [Key]: any, ... };
  declare type matchesPropertyIterateeShorthand = [string, any];
  declare type propertyIterateeShorthand = string;

  declare type OPredicate<A, O> =
    | ((value: A, key: string, object: O) => any)
    | matchesIterateeShorthand
    | matchesPropertyIterateeShorthand
    | propertyIterateeShorthand;

  declare type IterateeWithResult<V, K, O, R> =
    | ((value: V, key: K, object: O) => R)
    | string;

  declare type OIterateeWithResult<V, K, O, R> =
    | ReadOnlyIndexerObject<V, K>
    | IterateeWithResult<V, K, O, R>;
  declare type OIteratee<O> = OIterateeWithResult<any, any, O, any>;

  declare type AFlatMapIteratee<V, O, R> =
    | ((item: V, index: number, array: O) => $ReadOnlyArray<R> | R)
    | string;
  declare type OFlatMapIteratee<V, K, O, R> = IterateeWithResult<
    V,
    K,
    O,
    $ReadOnlyArray<R> | R,
  >;

  declare type Predicate<T> =
    | ((value: T, index: number, array: Array<T>) => any)
    | matchesIterateeShorthand
    | matchesPropertyIterateeShorthand
    | propertyIterateeShorthand;

  declare type _ValueOnlyIteratee<T> = (value: T) => mixed;
  declare type ValueOnlyIteratee<T> = _ValueOnlyIteratee<T> | string;
  declare type _Iteratee<T> = (
    item: T,
    index: number,
    array: ?Array<T>,
  ) => mixed;
  declare type Iteratee<T> = _Iteratee<T> | Object | string;
  declare type Comparator<T> = (item: T, item2: T) => boolean;

  declare type ReadOnlyMapIterator<T, U> =
    | ((item: T, index: number, array: $ReadOnlyArray<T>) => U)
    | propertyIterateeShorthand;

  declare type OMapIterator<T, O, U> =
    | ((item: T, key: string, object: O) => U)
    | propertyIterateeShorthand;

  declare class Lodash {
    // Array
    chunk<T>(array?: ?$ReadOnlyArray<T>, size?: ?number): Array<Array<T>>;
    compact<T, N = ?T | boolean>(array?: ?$ReadOnlyArray<N>): Array<T>;
    concat<T>(
      base?: ?$ReadOnlyArray<T>,
      ...elements: $ReadOnlyArray<any>
    ): Array<T | any>;
    difference<T>(
      array?: ?$ReadOnlyArray<T>,
      ...values: $ReadOnlyArray<?$ReadOnlyArray<T>>
    ): Array<T>;
    differenceBy<T, U>(
      array?: ?$ReadOnlyArray<T>,
      values?: ?$ReadOnlyArray<U>,
      iteratee?: ?ValueOnlyIteratee<T | U>,
    ): Array<T>;
    differenceWith<T, U>(
      array?: ?$ReadOnlyArray<T>,
      values?: ?$ReadOnlyArray<U>,
      comparator?: ?(item: T, item2: U) => boolean,
    ): Array<T>;
    drop<T>(array?: ?$ReadOnlyArray<T>, n?: ?number): Array<T>;
    dropRight<T>(array?: ?$ReadOnlyArray<T>, n?: ?number): Array<T>;
    dropRightWhile<T>(
      array?: ?$ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
    ): Array<T>;
    dropWhile<T>(
      array?: ?$ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
    ): Array<T>;
    fill<T, U>(
      array?: ?Array<T>,
      value?: ?U,
      start?: ?number,
      end?: ?number,
    ): Array<T | U>;
    findIndex<T>(
      array: $ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number,
    ): number;
    findIndex<T>(
      array: void | null,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number,
    ): -1;
    findLastIndex<T>(
      array: $ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number,
    ): number;
    findLastIndex<T>(
      array: void | null,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number,
    ): -1;
    // alias of _.head
    first<T>(array: ?$ReadOnlyArray<T>): T;
    flatten<T, X>(array?: ?$ReadOnlyArray<$ReadOnlyArray<T> | X>): Array<T | X>;
    flattenDeep<T>(array?: ?$ReadOnlyArray<any>): Array<T>;
    flattenDepth(array?: ?$ReadOnlyArray<any>, depth?: ?number): Array<any>;
    fromPairs<A, B>(pairs?: ?$ReadOnlyArray<[A, B]>): {| [key: A]: B |};
    head<T>(array: ?$ReadOnlyArray<T>): T;
    indexOf<T>(array: $ReadOnlyArray<T>, value: T, fromIndex?: number): number;
    indexOf<T>(array: void | null, value?: ?T, fromIndex?: ?number): -1;
    initial<T>(array: ?$ReadOnlyArray<T>): Array<T>;
    intersection<T>(...arrays?: Array<$ReadOnlyArray<T>>): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    intersectionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): Array<T>;
    intersectionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): Array<T>;
    intersectionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      a3?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): Array<T>;
    intersectionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      a3?: ?$ReadOnlyArray<T>,
      a4?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    intersectionWith<T>(
      a1?: ?$ReadOnlyArray<T>,
      comparator?: ?Comparator<T>,
    ): Array<T>;
    intersectionWith<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      comparator?: ?Comparator<T>,
    ): Array<T>;
    intersectionWith<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      a3?: ?$ReadOnlyArray<T>,
      comparator?: ?Comparator<T>,
    ): Array<T>;
    intersectionWith<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2?: ?$ReadOnlyArray<T>,
      a3?: ?$ReadOnlyArray<T>,
      a4?: ?$ReadOnlyArray<T>,
      comparator?: ?Comparator<T>,
    ): Array<T>;
    join<T>(array: $ReadOnlyArray<T>, separator?: ?string): string;
    join<T>(array: void | null, separator?: ?string): '';
    last<T>(array: ?$ReadOnlyArray<T>): T;
    lastIndexOf<T>(
      array: $ReadOnlyArray<T>,
      value?: ?T,
      fromIndex?: ?number,
    ): number;
    lastIndexOf<T>(array: void | null, value?: ?T, fromIndex?: ?number): -1;
    nth<T>(array: $ReadOnlyArray<T>, n?: ?number): T;
    nth(array: void | null, n?: ?number): void;
    pull<T>(array: Array<T>, ...values?: $ReadOnlyArray<?T>): Array<T>;
    pull<T: void | null>(array: T, ...values?: $ReadOnlyArray<?any>): T;
    pullAll<T>(array: Array<T>, values?: ?$ReadOnlyArray<T>): Array<T>;
    pullAll<T: void | null>(array: T, values?: ?$ReadOnlyArray<any>): T;
    pullAllBy<T>(
      array: Array<T>,
      values?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): Array<T>;
    pullAllBy<T: void | null>(
      array: T,
      values?: ?$ReadOnlyArray<any>,
      iteratee?: ?ValueOnlyIteratee<any>,
    ): T;
    pullAllWith<T: void | null>(
      array: T,
      values?: ?$ReadOnlyArray<any>,
      comparator?: ?Function,
    ): T;
    pullAllWith<T>(
      array: Array<T>,
      values?: ?$ReadOnlyArray<T>,
      comparator?: ?Function,
    ): Array<T>;
    pullAt<T>(
      array?: ?Array<T>,
      ...indexed?: $ReadOnlyArray<?number>
    ): Array<T>;
    pullAt<T>(array?: ?Array<T>, indexed?: ?$ReadOnlyArray<number>): Array<T>;
    remove<T>(array?: ?Array<T>, predicate?: ?Predicate<T>): Array<T>;
    reverse<T>(array: Array<T>): Array<T>;
    reverse<T: void | null>(array: T): T;
    slice<T>(
      array?: ?$ReadOnlyArray<T>,
      start?: ?number,
      end?: ?number,
    ): Array<T>;
    sortedIndex<T>(array: $ReadOnlyArray<T>, value: T): number;
    sortedIndex<T>(array: void | null, value: ?T): 0;
    sortedIndexBy<T>(
      array: $ReadOnlyArray<T>,
      value?: ?T,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): number;
    sortedIndexBy<T>(
      array: void | null,
      value?: ?T,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): 0;
    sortedIndexOf<T>(array: $ReadOnlyArray<T>, value: T): number;
    sortedIndexOf<T>(array: void | null, value?: ?T): -1;
    sortedLastIndex<T>(array: $ReadOnlyArray<T>, value: T): number;
    sortedLastIndex<T>(array: void | null, value?: ?T): 0;
    sortedLastIndexBy<T>(
      array: $ReadOnlyArray<T>,
      value: T,
      iteratee?: ValueOnlyIteratee<T>,
    ): number;
    sortedLastIndexBy<T>(
      array: void | null,
      value?: ?T,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): 0;
    sortedLastIndexOf<T>(array: $ReadOnlyArray<T>, value: T): number;
    sortedLastIndexOf<T>(array: void | null, value?: ?T): -1;
    sortedUniq<T>(array?: ?$ReadOnlyArray<T>): Array<T>;
    sortedUniqBy<T>(
      array?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): Array<T>;
    tail<T>(array?: ?$ReadOnlyArray<T>): Array<T>;
    take<T>(array?: ?$ReadOnlyArray<T>, n?: ?number): Array<T>;
    takeRight<T>(array?: ?$ReadOnlyArray<T>, n?: ?number): Array<T>;
    takeRightWhile<T>(
      array?: ?$ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
    ): Array<T>;
    takeWhile<T>(
      array?: ?$ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
    ): Array<T>;
    union<T>(...arrays?: Array<$ReadOnlyArray<T>>): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    unionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): Array<T>;
    unionBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>,
    ): Array<T>;
    unionBy<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>,
    ): Array<T>;
    unionBy<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      a4: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>,
    ): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    unionWith<T>(
      a1?: ?$ReadOnlyArray<T>,
      comparator?: ?Comparator<T>,
    ): Array<T>;
    unionWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      comparator?: Comparator<T>,
    ): Array<T>;
    unionWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      comparator?: Comparator<T>,
    ): Array<T>;
    unionWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      a4: $ReadOnlyArray<T>,
      comparator?: Comparator<T>,
    ): Array<T>;
    uniq<T>(array?: ?$ReadOnlyArray<T>): Array<T>;
    uniqBy<T>(
      array?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): Array<T>;
    uniqWith<T>(
      array?: ?$ReadOnlyArray<T>,
      comparator?: ?Comparator<T>,
    ): Array<T>;
    unzip<T>(array?: ?$ReadOnlyArray<T>): Array<T>;
    unzipWith<T>(array: ?$ReadOnlyArray<T>, iteratee?: ?Iteratee<T>): Array<T>;
    without<T>(array?: ?$ReadOnlyArray<T>, ...values?: Array<?T>): Array<T>;
    xor<T>(...array: $ReadOnlyArray<$ReadOnlyArray<T>>): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    xorBy<T>(
      a1?: ?$ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): Array<T>;
    xorBy<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>,
    ): Array<T>;
    xorBy<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>,
    ): Array<T>;
    xorBy<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      a4: $ReadOnlyArray<T>,
      iteratee?: ValueOnlyIteratee<T>,
    ): Array<T>;
    //Workaround until (...parameter: T, parameter2: U) works
    xorWith<T>(a1?: ?$ReadOnlyArray<T>, comparator?: ?Comparator<T>): Array<T>;
    xorWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      comparator?: Comparator<T>,
    ): Array<T>;
    xorWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      comparator?: Comparator<T>,
    ): Array<T>;
    xorWith<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
      a3: $ReadOnlyArray<T>,
      a4: $ReadOnlyArray<T>,
      comparator?: Comparator<T>,
    ): Array<T>;
    zip<A, B>(a1?: ?$ReadOnlyArray<A>, a2?: ?$ReadOnlyArray<B>): Array<[A, B]>;
    zip<A, B, C>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>,
    ): Array<[A, B, C]>;
    zip<A, B, C, D>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>,
      a4: $ReadOnlyArray<D>,
    ): Array<[A, B, C, D]>;
    zip<A, B, C, D, E>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>,
      a4: $ReadOnlyArray<D>,
      a5: $ReadOnlyArray<E>,
    ): Array<[A, B, C, D, E]>;

    zipObject<K, V>(
      props: $ReadOnlyArray<K>,
      values?: ?$ReadOnlyArray<V>,
    ): { [key: K]: V, ... };
    zipObject<K, V>(props: void | null, values?: ?$ReadOnlyArray<V>): { ... };
    zipObjectDeep(props: $ReadOnlyArray<any>, values?: ?any): Object;
    zipObjectDeep(props: void | null, values?: ?any): { ... };

    zipWith<A>(a1?: ?$ReadOnlyArray<A>): Array<[A]>;
    zipWith<T, A>(a1: $ReadOnlyArray<A>, iteratee: (A) => T): Array<T>;

    zipWith<A, B>(a1: $ReadOnlyArray<A>, a2: $ReadOnlyArray<B>): Array<[A, B]>;
    zipWith<T, A, B>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      iteratee: (A, B) => T,
    ): Array<T>;

    zipWith<A, B, C>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>,
    ): Array<[A, B, C]>;
    zipWith<T, A, B, C>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>,
      iteratee: (A, B, C) => T,
    ): Array<T>;

    zipWith<A, B, C, D>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>,
      a4: $ReadOnlyArray<D>,
    ): Array<[A, B, C, D]>;
    zipWith<T, A, B, C, D>(
      a1: $ReadOnlyArray<A>,
      a2: $ReadOnlyArray<B>,
      a3: $ReadOnlyArray<C>,
      a4: $ReadOnlyArray<D>,
      iteratee: (A, B, C, D) => T,
    ): Array<T>;

    // Collection
    countBy<T>(
      array: $ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): { [string]: number, ... };
    countBy<T>(array: void | null, iteratee?: ?ValueOnlyIteratee<T>): { ... };
    countBy(
      string: string,
      iteratee?: ?ValueOnlyIteratee<string>,
    ): { [string]: number, ... };
    countBy<T>(
      object: ReadOnlyIndexerObject<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): { [string]: number, ... };
    // alias of _.forEach
    each<
      A,
      K,
      T: ReadOnlyIndexerObject<A, K> | $ReadOnlyArray<A> | string | void | null,
    >(
      collection: T,
      iteratee?: ?IterateeWithResult<A, K, T, boolean | void>,
    ): T;
    // alias of _.forEachRight
    eachRight<
      A,
      K,
      T: ReadOnlyIndexerObject<A, K> | $ReadOnlyArray<A> | string | void | null,
    >(
      collection: T,
      iteratee?: ?IterateeWithResult<A, K, T, boolean | void>,
    ): T;
    every<T>(array?: ?$ReadOnlyArray<T>, iteratee?: ?Iteratee<T>): boolean;
    every(str: string, iteratee?: ?Iteratee<string>): boolean;
    every<A, T: ReadOnlyIndexerObject<A>>(
      object: T,
      iteratee?: OIterateeWithResult<A, string, T, any>,
    ): boolean;
    filter<T>(array?: ?$ReadOnlyArray<T>, predicate?: ?Predicate<T>): Array<T>;
    filter<A, T: ReadOnlyIndexerObject<A>>(
      object: T,
      predicate?: OPredicate<A, T>,
    ): Array<A>;
    find<T>(
      array: $ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number,
    ): T | void;
    find<T>(
      array: void | null,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number,
    ): void;
    find<R, A, T: ReadOnlyIndexerObject<A>>(
      object: T,
      predicate?: ?OPredicate<A, T>,
      fromIndex?: ?number,
    ): R;
    findLast<T>(
      array: $ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number,
    ): T | void;
    findLast<T>(
      array: void | null,
      predicate?: ?Predicate<T>,
      fromIndex?: ?number,
    ): void;
    findLast<R, A, T: ReadOnlyIndexerObject<A>>(
      object: T,
      predicate?: ?OPredicate<A, T>,
      fromIndex?: ?number,
    ): R;
    flatMap<A, U, T: $ReadOnlyArray<A> = Array<A>>(
      array: T,
      iteratee?: ?AFlatMapIteratee<A, T, U>,
    ): Array<U>;
    flatMap<
      A,
      K,
      U,
      T: ?ReadOnlyIndexerObject<A, K> | string = IndexerObject<A, K>,
    >(
      object: T,
      iteratee?: ?OFlatMapIteratee<A, K, T, U>,
    ): Array<U>;
    flatMapDeep<A, U, T: $ReadOnlyArray<A> = Array<A>>(
      array: T,
      iteratee?: ?AFlatMapIteratee<A, T, any>,
    ): Array<U>;
    flatMapDeep<
      A,
      K,
      U,
      T: ?ReadOnlyIndexerObject<A, K> | string = IndexerObject<A, K>,
    >(
      object: T,
      iteratee?: ?OFlatMapIteratee<A, K, T, any>,
    ): Array<U>;
    flatMapDepth<A, U, T: $ReadOnlyArray<A> = Array<A>>(
      array: T,
      iteratee?: ?AFlatMapIteratee<A, T, any>,
      depth?: ?number,
    ): Array<U>;
    flatMapDepth<
      A,
      K,
      U,
      T: ?ReadOnlyIndexerObject<A, K> | string = IndexerObject<A, K>,
    >(
      object: T,
      iteratee?: ?OFlatMapIteratee<A, K, T, any>,
      depth?: ?number,
    ): Array<U>;
    forEach<
      A,
      K,
      T: ReadOnlyIndexerObject<A, K> | $ReadOnlyArray<A> | string | void | null,
    >(
      collection: T,
      iteratee?: ?IterateeWithResult<A, K, T, boolean | void>,
    ): T;
    forEachRight<
      A,
      K,
      T: ReadOnlyIndexerObject<A, K> | $ReadOnlyArray<A> | string | void | null,
    >(
      collection: T,
      iteratee?: ?IterateeWithResult<A, K, T, boolean | void>,
    ): T;
    groupBy<V, T>(
      array: $ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): { [key: V]: Array<T>, ... };
    groupBy(array: void | null, iteratee?: ?ValueOnlyIteratee<any>): { ... };
    groupBy<V, A, T: ReadOnlyIndexerObject<A>>(
      object: T,
      iteratee?: ValueOnlyIteratee<A>,
    ): { [key: V]: Array<A>, ... };
    includes<T>(
      array: $ReadOnlyArray<T>,
      value: T,
      fromIndex?: ?number,
    ): boolean;
    includes<T>(array: void | null, value?: ?T, fromIndex?: ?number): false;
    includes<A>(
      object: ReadOnlyIndexerObject<A>,
      value: A,
      fromIndex?: number,
    ): boolean;
    includes(str: string, value: string, fromIndex?: number): boolean;
    invokeMap<T>(
      array?: ?$ReadOnlyArray<T>,
      path?: ?((value: T) => Path) | Path,
      ...args?: $ReadOnlyArray<any>
    ): Array<any>;
    invokeMap<A>(
      object: ReadOnlyIndexerObject<A>,
      path: ((value: any) => Path) | Path,
      ...args?: $ReadOnlyArray<any>
    ): Array<any>;
    keyBy<T, V>(
      array: $ReadOnlyArray<T>,
      iteratee?: ?ValueOnlyIteratee<T>,
    ): { [key: V]: T, ... };
    keyBy(array: void | null, iteratee?: ?ValueOnlyIteratee<*>): { ... };
    keyBy<V, A, K, T: ReadOnlyIndexerObject<A, K>>(
      object: T,
      iteratee?: ?ValueOnlyIteratee<A>,
    ): { [key: V]: A, ... };
    map<T, U>(
      array?: ?$ReadOnlyArray<T>,
      iteratee?: ?ReadOnlyMapIterator<T, U>,
    ): Array<U>;
    map<V, T: ReadOnlyIndexerObject<V>, U>(
      object: ?T,
      iteratee?: OMapIterator<V, T, U>,
    ): Array<U>;
    map(
      str: ?string,
      iteratee?: (char: string, index: number, str: string) => any,
    ): string;
    orderBy<T>(
      array: $ReadOnlyArray<T>,
      iteratees?: ?$ReadOnlyArray<Iteratee<T>> | ?string,
      orders?: ?$ReadOnlyArray<'asc' | 'desc'> | ?string,
    ): Array<T>;
    orderBy<T>(
      array: null | void,
      iteratees?: ?$ReadOnlyArray<Iteratee<T>> | ?string,
      orders?: ?$ReadOnlyArray<'asc' | 'desc'> | ?string,
    ): Array<T>;
    orderBy<V, T: ReadOnlyIndexerObject<V>>(
      object: T,
      iteratees?: $ReadOnlyArray<OIteratee<*>> | string,
      orders?: $ReadOnlyArray<'asc' | 'desc'> | string,
    ): Array<V>;
    partition<T>(
      array?: ?$ReadOnlyArray<T>,
      predicate?: ?Predicate<T>,
    ): [Array<T>, Array<T>];
    partition<V, A, T: ReadOnlyIndexerObject<A>>(
      object: T,
      predicate?: OPredicate<A, T>,
    ): [Array<V>, Array<V>];
    reduce<T, U>(
      array: $ReadOnlyArray<T>,
      iteratee?: (
        accumulator: U,
        value: T,
        index: number,
        array: ?Array<T>,
      ) => U,
      accumulator?: U,
    ): U;
    reduce<T, U>(
      array: void | null,
      iteratee?: ?(accumulator: U, value: T, index: any, array: ?Array<T>) => U,
      accumulator?: U,
    ): U;
    reduce<A, T: ReadOnlyIndexerObject<A>, U>(
      object: T,
      iteratee?: (accumulator: U, value: any, key: string, object: T) => U,
      accumulator?: U,
    ): U;
    reduceRight<T, U>(
      array: void | null,
      iteratee?: ?(accumulator: U, value: T, index: any, array: ?Array<T>) => U,
      accumulator?: U,
    ): U;
    reduceRight<T, U>(
      array: $ReadOnlyArray<T>,
      iteratee?: ?(
        accumulator: U,
        value: T,
        index: number,
        array: ?Array<T>,
      ) => U,
      accumulator?: ?U,
    ): U;
    reduceRight<A, T: ReadOnlyIndexerObject<A>, U>(
      object: T,
      iteratee?: ?(accumulator: U, value: any, key: string, object: T) => U,
      accumulator?: ?U,
    ): U;
    reject<T>(array?: ?$ReadOnlyArray<T>, predicate?: ?Predicate<T>): Array<T>;
    reject<A, T: ReadOnlyIndexerObject<A>>(
      object?: ?T,
      predicate?: ?OPredicate<A, T>,
    ): Array<A>;
    sample<T>(collection: ?Collection<T>): T;
    sampleSize<T>(collection?: ?Collection<T>, n?: ?number): Array<T>;
    shuffle<T>(array?: ?Collection<T>): Array<T>;
    size(collection?: ?Collection<any> | string): number;
    some<T>(array: void | null, predicate?: ?Predicate<T>): false;
    some<T>(array: ?$ReadOnlyArray<T>, predicate?: Predicate<T>): boolean;
    some<A, T: ReadOnlyIndexerObject<A>>(
      object?: ?T,
      predicate?: OPredicate<A, T>,
    ): boolean;
    sortBy<T>(
      array: ?$ReadOnlyArray<T>,
      ...iteratees?: $ReadOnlyArray<Iteratee<T>>
    ): Array<T>;
    sortBy<T>(
      array: ?$ReadOnlyArray<T>,
      iteratees?: $ReadOnlyArray<Iteratee<T>>,
    ): Array<T>;
    sortBy<V, T: ReadOnlyIndexerObject<V>>(
      object: T,
      ...iteratees?: $ReadOnlyArray<OIteratee<T>>
    ): Array<V>;
    sortBy<V, T: ReadOnlyIndexerObject<V>>(
      object: T,
      iteratees?: $ReadOnlyArray<OIteratee<T>>,
    ): Array<V>;

    // Date
    now(): number;

    // Function
    after(n: number, fn: Function): Function;
    ary(func: Function, n?: number): Function;
    before(n: number, fn: Function): Function;
    bind<F: (...$ReadOnlyArray<any>) => any>(
      func: F,
      thisArg: any,
      ...partials: $ReadOnlyArray<any>
    ): F;
    bindKey(
      obj?: ?Object,
      key?: ?string,
      ...partials?: $ReadOnlyArray<?any>
    ): Function;
    curry: Curry;
    curry(func: Function, arity?: number): Function;
    curryRight(func: Function, arity?: number): Function;
    debounce<F: (...$ReadOnlyArray<any>) => any>(
      func: F,
      wait?: number,
      options?: DebounceOptions,
    ): F & Cancelable;
    defer(
      func: (...$ReadOnlyArray<any>) => any,
      ...args?: $ReadOnlyArray<any>
    ): TimeoutID;
    delay(
      func: Function,
      wait: number,
      ...args?: $ReadOnlyArray<any>
    ): TimeoutID;
    flip<R>(func: (...$ReadOnlyArray<any>) => R): (...Array<any>) => R;
    memoize<A, R>(func: (...A) => R, resolver?: (...A) => any): (...A) => R;
    negate<A, R>(predicate: (...A) => R): (...A) => boolean;
    once<F: (...$ReadOnlyArray<any>) => any>(func: F): F;
    overArgs(
      func?: ?Function,
      ...transforms?: $ReadOnlyArray<Function>
    ): Function;
    overArgs(
      func?: ?Function,
      transforms?: ?$ReadOnlyArray<Function>,
    ): Function;
    partial<R>(
      func: (...$ReadOnlyArray<any>) => R,
      ...partials: $ReadOnlyArray<any>
    ): (...Array<any>) => R;
    partialRight<R>(
      func: (...$ReadOnlyArray<any>) => R,
      ...partials: $ReadOnlyArray<any>
    ): (...Array<any>) => R;
    partialRight<R>(
      func: (...$ReadOnlyArray<any>) => R,
      partials: $ReadOnlyArray<any>,
    ): (...Array<any>) => R;
    rearg(func: Function, ...indexes: $ReadOnlyArray<number>): Function;
    rearg(func: Function, indexes: $ReadOnlyArray<number>): Function;
    rest(func: Function, start?: number): Function;
    spread(func: Function): Function;
    throttle<F: (...$ReadOnlyArray<any>) => any>(
      func: F,
      wait?: number,
      options?: ThrottleOptions,
    ): F & Cancelable;
    unary<F: (...$ReadOnlyArray<any>) => any>(func: F): F;
    wrap(value?: any, wrapper?: ?Function): Function;

    // Lang
    castArray(): Array<any>;
    castArray<T: void | null | number | string | { ... }>(value: T): Array<T>;
    castArray<T: Array<any>>(value: T): T;
    clone<T>(value: T): T;
    cloneDeep<T>(value: T): T;
    cloneDeepWith<T, U>(
      value: T,
      customizer?: ?(
        value: T,
        key: number | string,
        object: T,
        stack: any,
      ) => U,
    ): U;
    cloneWith<T, U>(
      value: T,
      customizer?: ?(
        value: T,
        key: number | string,
        object: T,
        stack: any,
      ) => U,
    ): U;
    conformsTo<T: ReadOnlyIndexerObject<mixed>>(
      source: T,
      predicates: T & $ReadOnly<{ [key: string]: (x: any) => boolean, ... }>,
    ): boolean;
    eq(value: any, other: any): boolean;
    gt(value: any, other: any): boolean;
    gte(value: any, other: any): boolean;
    isArguments(value: void | null): false;
    isArguments(value: any): boolean;
    isArray(value: $ReadOnlyArray<any>): true;
    isArray(value: any): false;
    isArrayBuffer(value: ArrayBuffer): true;
    isArrayBuffer(value: any): false;
    isArrayLike(
      value: $ReadOnlyArray<any> | string | { length: number, ... },
    ): true;
    isArrayLike(value: any): false;
    isArrayLikeObject(
      value: { length: number, ... } | $ReadOnlyArray<any>,
    ): true;
    isArrayLikeObject(value: any): false;
    isBoolean(value: boolean): true;
    isBoolean(value: any): false;
    isBuffer(value: void | null): false;
    isBuffer(value: any): boolean;
    isDate(value: Date): true;
    isDate(value: any): false;
    isElement(value: Element): true;
    isElement(value: any): false;
    isEmpty(value: void | null | '' | { ... } | [] | number | boolean): true;
    isEmpty(value: any): boolean;
    isEqual(value: any, other: any): boolean;
    isEqualWith<T, U>(
      value?: ?T,
      other?: ?U,
      customizer?: ?(
        objValue: any,
        otherValue: any,
        key: number | string,
        object: T,
        other: U,
        stack: any,
      ) => boolean | void,
    ): boolean;
    isError(value: Error): true;
    isError(value: any): false;
    isFinite(value: number): boolean;
    isFinite(value: any): false;
    isFunction(value: Function): true;
    isFunction(value: any): false;
    isInteger(value: number): boolean;
    isInteger(value: any): false;
    isLength(value: void | null): false;
    isLength(value: any): boolean;
    isMap(value: Map<any, any>): true;
    isMap(value: any): false;
    isMatch(object?: ?Object, source?: ?Object): boolean;
    isMatchWith<T: Object, U: Object>(
      object?: ?T,
      source?: ?U,
      customizer?: ?(
        objValue: any,
        srcValue: any,
        key: number | string,
        object: T,
        source: U,
      ) => boolean | void,
    ): boolean;
    isNaN(value: number): boolean;
    isNaN(value: any): false;
    isNative(value: number | string | void | null | Object): false;
    isNative(value: any): boolean;
    isNil(value: void | null): true;
    isNil(value: any): false;
    isNull(value: null): true;
    isNull(value: any): false;
    isNumber(value: number): true;
    isNumber(value: any): false;
    isObject(value: any): boolean;
    isObjectLike(value: void | null): false;
    isObjectLike(value: any): boolean;
    isPlainObject(value: any): boolean;
    isRegExp(value: RegExp): true;
    isRegExp(value: any): false;
    isSafeInteger(value: number): boolean;
    isSafeInteger(value: any): false;
    isSet(value: Set<any>): true;
    isSet(value: any): false;
    isString(value: string): true;
    isString(value: any): false;
    isSymbol(value: Symbol): true;
    isSymbol(value: any): false;
    isTypedArray(value: $TypedArray): true;
    isTypedArray(value: any): false;
    isUndefined(value: void): true;
    isUndefined(value: any): false;
    isWeakMap(value: WeakMap<any, any>): true;
    isWeakMap(value: any): false;
    isWeakSet(value: WeakSet<any>): true;
    isWeakSet(value: any): false;
    lt(value: any, other: any): boolean;
    lte(value: any, other: any): boolean;
    toArray(value: any): Array<any>;
    toFinite(value: void | null): 0;
    toFinite(value: any): number;
    toInteger(value: void | null): 0;
    toInteger(value: any): number;
    toLength(value: void | null): 0;
    toLength(value: any): number;
    toNumber(value: void | null): 0;
    toNumber(value: any): number;
    toPlainObject(value: any): Object;
    toSafeInteger(value: void | null): 0;
    toSafeInteger(value: any): number;
    toString(value: void | null): '';
    toString(value: any): string;

    // Math
    add(augend: number, addend: number): number;
    ceil(number: number, precision?: number): number;
    divide(dividend: number, divisor: number): number;
    floor(number: number, precision?: number): number;
    max<T>(array: ?$ReadOnlyArray<T>): T;
    maxBy<T>(array: ?$ReadOnlyArray<T>, iteratee?: Iteratee<T>): T;
    mean(array: $ReadOnlyArray<*>): number;
    meanBy<T>(array: $ReadOnlyArray<T>, iteratee?: Iteratee<T>): number;
    min<T>(array: ?$ReadOnlyArray<T>): T;
    minBy<T>(array: ?$ReadOnlyArray<T>, iteratee?: Iteratee<T>): T;
    multiply(multiplier: number, multiplicand: number): number;
    round(number: number, precision?: number): number;
    subtract(minuend: number, subtrahend: number): number;
    sum(array: $ReadOnlyArray<*>): number;
    sumBy<T>(array: $ReadOnlyArray<T>, iteratee?: Iteratee<T>): number;

    // number
    clamp(number?: number, lower?: ?number, upper?: ?number): number;
    clamp(number: ?number, lower?: ?number, upper?: ?number): 0;
    inRange(number: number, start?: number, end: number): boolean;
    random(lower?: number, upper?: number, floating?: boolean): number;

    // Object
    assign(object?: ?Object, ...sources?: $ReadOnlyArray<?Object>): Object;
    assignIn(): { ... };
    assignIn<A, B>(a: A, b: B): A & B;
    assignIn<A, B, C>(a: A, b: B, c: C): A & B & C;
    assignIn<A, B, C, D>(a: A, b: B, c: C, d: D): A & B & C & D;
    assignIn<A, B, C, D, E>(a: A, b: B, c: C, d: D, e: E): A & B & C & D & E;
    assignInWith(): { ... };
    assignInWith<T: Object, A: Object>(
      object: T,
      s1: A,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
    ): Object;
    assignInWith<T: Object, A: Object, B: Object>(
      object: T,
      s1: A,
      s2: B,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B,
      ) => any | void,
    ): Object;
    assignInWith<T: Object, A: Object, B: Object, C: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C,
      ) => any | void,
    ): Object;
    assignInWith<T: Object, A: Object, B: Object, C: Object, D: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      s4: D,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C | D,
      ) => any | void,
    ): Object;
    assignWith(): { ... };
    assignWith<T: Object, A: Object>(
      object: T,
      s1: A,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
    ): Object;
    assignWith<T: Object, A: Object, B: Object>(
      object: T,
      s1: A,
      s2: B,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B,
      ) => any | void,
    ): Object;
    assignWith<T: Object, A: Object, B: Object, C: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C,
      ) => any | void,
    ): Object;
    assignWith<T: Object, A: Object, B: Object, C: Object, D: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      s4: D,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C | D,
      ) => any | void,
    ): Object;
    at(object?: ?Object, ...paths: $ReadOnlyArray<string>): Array<any>;
    at(object?: ?Object, paths: $ReadOnlyArray<string>): Array<any>;
    create(prototype: void | null, properties: void | null): { ... };
    create<T>(prototype: T, properties: Object): T;
    create(prototype: any, properties: void | null): { ... };
    defaults(object?: ?Object, ...sources?: $ReadOnlyArray<?Object>): Object;
    defaultsDeep(
      object?: ?Object,
      ...sources?: $ReadOnlyArray<?Object>
    ): Object;
    // alias for _.toPairs
    entries(object?: ?Object): Array<[string, any]>;
    // alias for _.toPairsIn
    entriesIn(object?: ?Object): Array<[string, any]>;
    // alias for _.assignIn
    extend<A, B>(a?: ?A, b?: ?B): A & B;
    extend<A, B, C>(a: A, b: B, c: C): A & B & C;
    extend<A, B, C, D>(a: A, b: B, c: C, d: D): A & B & C & D;
    extend<A, B, C, D, E>(a: A, b: B, c: C, d: D, e: E): A & B & C & D & E;
    // alias for _.assignInWith
    extendWith<T: Object, A: Object>(
      object?: ?T,
      s1?: ?A,
      customizer?: ?(
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
    ): Object;
    extendWith<T: Object, A: Object, B: Object>(
      object: T,
      s1: A,
      s2: B,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B,
      ) => any | void,
    ): Object;
    extendWith<T: Object, A: Object, B: Object, C: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C,
      ) => any | void,
    ): Object;
    extendWith<T: Object, A: Object, B: Object, C: Object, D: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      s4: D,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C | D,
      ) => any | void,
    ): Object;
    findKey<A, T: ReadOnlyIndexerObject<A>>(
      object: T,
      predicate?: ?OPredicate<A, T>,
    ): string | void;
    findKey<A, T: ReadOnlyIndexerObject<A>>(
      object: void | null,
      predicate?: ?OPredicate<A, T>,
    ): void;
    findLastKey<A, T: ReadOnlyIndexerObject<A>>(
      object: T,
      predicate?: ?OPredicate<A, T>,
    ): string | void;
    findLastKey<A, T: ReadOnlyIndexerObject<A>>(
      object: void | null,
      predicate?: ?OPredicate<A, T>,
    ): void;
    forIn(object: Object, iteratee?: ?OIteratee<*>): Object;
    forIn(object: void | null, iteratee?: ?OIteratee<*>): null;
    forInRight(object: Object, iteratee?: ?OIteratee<*>): Object;
    forInRight(object: void | null, iteratee?: ?OIteratee<*>): null;
    forOwn(object: Object, iteratee?: ?OIteratee<*>): Object;
    forOwn(object: void | null, iteratee?: ?OIteratee<*>): null;
    forOwnRight(object: Object, iteratee?: ?OIteratee<*>): Object;
    forOwnRight(object: void | null, iteratee?: ?OIteratee<*>): null;
    functions(object?: ?Object): Array<string>;
    functionsIn(object?: ?Object): Array<string>;
    get(
      object?: ?Object | ?$ReadOnlyArray<any> | void | null,
      path?: ?Path,
      defaultValue?: any,
    ): any;
    has(object: Object, path: Path): boolean;
    has(object: Object, path: void | null): false;
    has(object: void | null, path?: ?Path): false;
    hasIn(object: Object, path: Path): boolean;
    hasIn(object: Object, path: void | null): false;
    hasIn(object: void | null, path?: ?Path): false;
    invert(object: Object, multiVal?: ?boolean): Object;
    invert(object: void | null, multiVal?: ?boolean): { ... };
    invertBy(object: Object, iteratee?: ?Function): Object;
    invertBy(object: void | null, iteratee?: ?Function): { ... };
    invoke(object?: ?Object, path?: ?Path, ...args?: $ReadOnlyArray<any>): any;
    keys<K>(object?: ?ReadOnlyIndexerObject<any, K>): Array<K>;
    keys(object?: ?Object): Array<string>;
    keysIn(object?: ?Object): Array<string>;
    mapKeys(object: Object, iteratee?: ?OIteratee<*>): Object;
    mapKeys(object: void | null, iteratee?: ?OIteratee<*>): { ... };
    mapValues(object: Object, iteratee?: ?OIteratee<*>): Object;
    mapValues(object: void | null, iteratee?: ?OIteratee<*>): { ... };
    merge(object?: ?Object, ...sources?: $ReadOnlyArray<?Object>): Object;
    mergeWith(): { ... };
    mergeWith<T: Object, A: Object>(
      object: T,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
    ): Object;
    mergeWith<T: Object, A: Object, B: Object>(
      object: T,
      s1: A,
      s2: B,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B,
      ) => any | void,
    ): Object;
    mergeWith<T: Object, A: Object, B: Object, C: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C,
      ) => any | void,
    ): Object;
    mergeWith<T: Object, A: Object, B: Object, C: Object, D: Object>(
      object: T,
      s1: A,
      s2: B,
      s3: C,
      s4: D,
      customizer?: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B | C | D,
      ) => any | void,
    ): Object;
    omit(object?: ?Object, ...props: $ReadOnlyArray<string>): Object;
    omit(object?: ?Object, props: $ReadOnlyArray<string>): Object;
    omitBy<A, T: ReadOnlyIndexerObject<A>>(
      object: $ReadOnly<T>,
      predicate?: ?OPredicate<A, T>,
    ): Object;
    omitBy<A, T>(object: void | null, predicate?: ?OPredicate<A, T>): { ... };
    pick(object?: ?Object, ...props: $ReadOnlyArray<string>): Object;
    pick(object?: ?Object, props: $ReadOnlyArray<string>): Object;
    pickBy<A, T: ReadOnlyIndexerObject<A>>(
      object: $ReadOnly<T>,
      predicate?: ?OPredicate<A, T>,
    ): Object;
    pickBy<A, T>(object: void | null, predicate?: ?OPredicate<A, T>): { ... };
    result(object?: ?Object, path?: ?Path, defaultValue?: any): any;
    set(object: Object, path?: ?Path, value: any): Object;
    set<T: void | null>(object: T, path?: ?Path, value?: ?any): T;
    setWith<T>(
      object: T,
      path?: ?Path,
      value: any,
      customizer?: (nsValue: any, key: string, nsObject: T) => any,
    ): Object;
    setWith<T: void | null>(
      object: T,
      path?: ?Path,
      value?: ?any,
      customizer?: ?(nsValue: any, key: string, nsObject: T) => any,
    ): T;
    toPairs(object?: ?Object | $ReadOnlyArray<*>): Array<[string, any]>;
    toPairsIn(object?: ?Object): Array<[string, any]>;
    transform(
      collection: Object | $ReadOnlyArray<any>,
      iteratee?: ?OIteratee<*>,
      accumulator?: any,
    ): any;
    transform(
      collection: void | null,
      iteratee?: ?OIteratee<*>,
      accumulator?: ?any,
    ): { ... };
    unset(object: void | null, path?: ?Path): true;
    unset(object: Object, path?: ?Path): boolean;
    update(object: Object, path: Path, updater: Function): Object;
    update<T: void | null>(object: T, path?: ?Path, updater?: ?Function): T;
    updateWith(
      object: Object,
      path?: ?Path,
      updater?: ?Function,
      customizer?: ?Function,
    ): Object;
    updateWith<T: void | null>(
      object: T,
      path?: ?Path,
      updater?: ?Function,
      customizer?: ?Function,
    ): T;
    values(object?: ?Object): Array<any>;
    valuesIn(object?: ?Object): Array<any>;

    // Seq
    // harder to read, but this is _()
    (value: any): any;
    chain<T>(value: T): any;
    tap<T>(value: T, interceptor: (value: T) => any): T;
    thru<T1, T2>(value: T1, interceptor: (value: T1) => T2): T2;
    // TODO: _.prototype.*

    // String
    camelCase(string: string): string;
    camelCase(string: void | null): '';
    capitalize(string: string): string;
    capitalize(string: void | null): '';
    deburr(string: string): string;
    deburr(string: void | null): '';
    endsWith(string: string, target?: string, position?: ?number): boolean;
    endsWith(string: void | null, target?: ?string, position?: ?number): false;
    escape(string: string): string;
    escape(string: void | null): '';
    escapeRegExp(string: string): string;
    escapeRegExp(string: void | null): '';
    kebabCase(string: string): string;
    kebabCase(string: void | null): '';
    lowerCase(string: string): string;
    lowerCase(string: void | null): '';
    lowerFirst(string: string): string;
    lowerFirst(string: void | null): '';
    pad(string?: ?string, length?: ?number, chars?: ?string): string;
    padEnd(string?: ?string, length?: ?number, chars?: ?string): string;
    padStart(string?: ?string, length?: ?number, chars?: ?string): string;
    parseInt(string: string, radix?: ?number): number;
    repeat(string: string, n?: ?number): string;
    repeat(string: void | null, n?: ?number): '';
    replace(
      string: string,
      pattern: RegExp | string,
      replacement: ((string: string) => string) | string,
    ): string;
    replace(
      string: void | null,
      pattern?: ?RegExp | ?string,
      replacement: ?((string: string) => string) | ?string,
    ): '';
    snakeCase(string: string): string;
    snakeCase(string: void | null): '';
    split(
      string?: ?string,
      separator?: ?RegExp | ?string,
      limit?: ?number,
    ): Array<string>;
    startCase(string: string): string;
    startCase(string: void | null): '';
    startsWith(string: string, target?: string, position?: number): boolean;
    startsWith(
      string: void | null,
      target?: ?string,
      position?: ?number,
    ): false;
    template(string?: ?string, options?: ?TemplateSettings): Function;
    toLower(string: string): string;
    toLower(string: void | null): '';
    toUpper(string: string): string;
    toUpper(string: void | null): '';
    trim(string: string, chars?: string): string;
    trim(string: void | null, chars?: ?string): '';
    trimEnd(string: string, chars?: ?string): string;
    trimEnd(string: void | null, chars?: ?string): '';
    trimStart(string: string, chars?: ?string): string;
    trimStart(string: void | null, chars?: ?string): '';
    truncate(string: string, options?: TruncateOptions): string;
    truncate(string: void | null, options?: ?TruncateOptions): '';
    unescape(string: string): string;
    unescape(string: void | null): '';
    upperCase(string: string): string;
    upperCase(string: void | null): '';
    upperFirst(string: string): string;
    upperFirst(string: void | null): '';
    words(string?: ?string, pattern?: ?RegExp | ?string): Array<string>;

    // Util
    attempt(func: Function, ...args: $ReadOnlyArray<any>): any;
    bindAll(object: Object, methodNames?: ?$ReadOnlyArray<string>): Object;
    bindAll<T: void | null>(
      object: T,
      methodNames?: ?$ReadOnlyArray<string>,
    ): T;
    bindAll(object: Object, ...methodNames: $ReadOnlyArray<string>): Object;
    cond(pairs?: ?NestedArray<Function>): Function;
    conforms(source?: ?Object): Function;
    constant<T>(value: T): () => T;
    defaultTo<T1: void | null, T2>(value: T1, defaultValue: T2): T2;
    defaultTo<T1: string | boolean, T2>(value: T1, defaultValue: T2): T1;
    // NaN is a number instead of its own type, otherwise it would behave like null/void
    defaultTo<T1: number, T2>(value: T1, defaultValue: T2): T1 | T2;
    flow: $ComposeReverse & ((funcs: $ReadOnlyArray<Function>) => Function);
    flowRight: $Compose & ((funcs: $ReadOnlyArray<Function>) => Function);
    identity<T>(value: T): T;
    iteratee(func?: any): Function;
    matches(source?: ?Object): Function;
    matchesProperty(path?: ?Path, srcValue: any): Function;
    method(path?: ?Path, ...args?: $ReadOnlyArray<any>): Function;
    methodOf(object?: ?Object, ...args?: $ReadOnlyArray<any>): Function;
    mixin<T: Function | Object>(
      object?: T,
      source: Object,
      options?: { chain: boolean, ... },
    ): T;
    noConflict(): Lodash;
    noop(...args: $ReadOnlyArray<mixed>): void;
    nthArg(n?: ?number): Function;
    over(...iteratees: $ReadOnlyArray<Function>): Function;
    over(iteratees: $ReadOnlyArray<Function>): Function;
    overEvery(...predicates: $ReadOnlyArray<Function>): Function;
    overEvery(predicates: $ReadOnlyArray<Function>): Function;
    overSome(...predicates: $ReadOnlyArray<Function>): Function;
    overSome(predicates: $ReadOnlyArray<Function>): Function;
    property(path?: ?Path): Function;
    propertyOf(object?: ?Object): Function;
    range(start: number, end: number, step?: number): Array<number>;
    range(end: number, step?: number): Array<number>;
    rangeRight(start?: ?number, end?: ?number, step?: ?number): Array<number>;
    rangeRight(end?: ?number, step?: ?number): Array<number>;
    runInContext(context?: ?Object): Function;

    stubArray(): Array<*>;
    stubFalse(): false;
    stubObject(): { ... };
    stubString(): '';
    stubTrue(): true;
    times(n?: ?number, ...rest?: $ReadOnlyArray<void | null>): Array<number>;
    times<T>(n: number, iteratee: (i: number) => T): Array<T>;
    toPath(value: any): Array<string>;
    uniqueId(prefix?: ?string): string;

    // Properties
    VERSION: string;
    templateSettings: TemplateSettings;
  }

  declare module.exports: Lodash;
}

declare module 'lodash/fp' {
  declare type Path = $ReadOnlyArray<string | number> | string | number;
  declare type __CurriedFunction1<A, R, AA: A> = (...r: [AA]) => R;
  declare type CurriedFunction1<A, R> = __CurriedFunction1<A, R, *>;

  declare type __CurriedFunction2<A, B, R, AA: A, BB: B> = ((
    ...r: [AA]
  ) => CurriedFunction1<BB, R>) &
    ((...r: [AA, BB]) => R);
  declare type CurriedFunction2<A, B, R> = __CurriedFunction2<A, B, R, *, *>;

  declare type __CurriedFunction3<A, B, C, R, AA: A, BB: B, CC: C> = ((
    ...r: [AA]
  ) => CurriedFunction2<BB, CC, R>) &
    ((...r: [AA, BB]) => CurriedFunction1<CC, R>) &
    ((...r: [AA, BB, CC]) => R);
  declare type CurriedFunction3<A, B, C, R> = __CurriedFunction3<
    A,
    B,
    C,
    R,
    *,
    *,
    *,
  >;

  declare type __CurriedFunction4<A, B, C, D, R, AA: A, BB: B, CC: C, DD: D> =
    ((...r: [AA]) => CurriedFunction3<BB, CC, DD, R>) &
      ((...r: [AA, BB]) => CurriedFunction2<CC, DD, R>) &
      ((...r: [AA, BB, CC]) => CurriedFunction1<DD, R>) &
      ((...r: [AA, BB, CC, DD]) => R);
  declare type CurriedFunction4<A, B, C, D, R> = __CurriedFunction4<
    A,
    B,
    C,
    D,
    R,
    *,
    *,
    *,
    *,
  >;

  declare type __CurriedFunction5<
    A,
    B,
    C,
    D,
    E,
    R,
    AA: A,
    BB: B,
    CC: C,
    DD: D,
    EE: E,
  > = ((...r: [AA]) => CurriedFunction4<BB, CC, DD, EE, R>) &
    ((...r: [AA, BB]) => CurriedFunction3<CC, DD, EE, R>) &
    ((...r: [AA, BB, CC]) => CurriedFunction2<DD, EE, R>) &
    ((...r: [AA, BB, CC, DD]) => CurriedFunction1<EE, R>) &
    ((...r: [AA, BB, CC, DD, EE]) => R);
  declare type CurriedFunction5<A, B, C, D, E, R> = __CurriedFunction5<
    A,
    B,
    C,
    D,
    E,
    R,
    *,
    *,
    *,
    *,
    *,
  >;

  declare type __CurriedFunction6<
    A,
    B,
    C,
    D,
    E,
    F,
    R,
    AA: A,
    BB: B,
    CC: C,
    DD: D,
    EE: E,
    FF: F,
  > = ((...r: [AA]) => CurriedFunction5<BB, CC, DD, EE, FF, R>) &
    ((...r: [AA, BB]) => CurriedFunction4<CC, DD, EE, FF, R>) &
    ((...r: [AA, BB, CC]) => CurriedFunction3<DD, EE, FF, R>) &
    ((...r: [AA, BB, CC, DD]) => CurriedFunction2<EE, FF, R>) &
    ((...r: [AA, BB, CC, DD, EE]) => CurriedFunction1<FF, R>) &
    ((...r: [AA, BB, CC, DD, EE, FF]) => R);
  declare type CurriedFunction6<A, B, C, D, E, F, R> = __CurriedFunction6<
    A,
    B,
    C,
    D,
    E,
    F,
    R,
    *,
    *,
    *,
    *,
    *,
    *,
  >;

  declare type Curry = (<A, R>((...r: [A]) => R) => CurriedFunction1<A, R>) &
    (<A, B, R>((...r: [A, B]) => R) => CurriedFunction2<A, B, R>) &
    (<A, B, C, R>((...r: [A, B, C]) => R) => CurriedFunction3<A, B, C, R>) &
    (<A, B, C, D, R>(
      (...r: [A, B, C, D]) => R,
    ) => CurriedFunction4<A, B, C, D, R>) &
    (<A, B, C, D, E, R>(
      (...r: [A, B, C, D, E]) => R,
    ) => CurriedFunction5<A, B, C, D, E, R>) &
    (<A, B, C, D, E, F, R>(
      (...r: [A, B, C, D, E, F]) => R,
    ) => CurriedFunction6<A, B, C, D, E, F, R>);

  declare type UnaryFn<A, R> = (a: A) => R;

  declare type TemplateSettings = {
    escape?: RegExp,
    evaluate?: RegExp,
    imports?: Object,
    interpolate?: RegExp,
    variable?: string,
    ...
  };

  declare type TruncateOptions = {
    length?: number,
    omission?: string,
    separator?: RegExp | string,
    ...
  };

  declare type DebounceOptions = {
    leading?: boolean,
    maxWait?: number,
    trailing?: boolean,
    ...
  };

  declare type ThrottleOptions = {
    leading?: boolean,
    trailing?: boolean,
    ...
  };

  declare type Key = string | number;
  declare type ReadOnlyIndexerObject<V, K = Key> = $ReadOnly<{
    [id: K]: V,
    ...
  }>;
  declare type NestedArray<V> = Array<Array<V>>;
  declare type Collection<V, K = Key> =
    | $ReadOnlyArray<V>
    | ReadOnlyIndexerObject<V, K>;

  declare type matchesIterateeShorthand = { [Key]: any, ... };
  declare type matchesPropertyIterateeShorthand = [string, any];
  declare type propertyIterateeShorthand = string;

  declare type OPredicate<A> =
    | ((value: A) => any)
    | matchesIterateeShorthand
    | matchesPropertyIterateeShorthand
    | propertyIterateeShorthand;

  declare type IterateeWithResult<V, R> = ((value: V) => R) | string;

  declare type OIterateeWithResult<V, R> =
    | ReadOnlyIndexerObject<V>
    | IterateeWithResult<V, R>;
  declare type OIteratee<O> = OIterateeWithResult<any, any>;

  declare type Predicate<T> =
    | ((value: T) => any)
    | matchesIterateeShorthand
    | matchesPropertyIterateeShorthand
    | propertyIterateeShorthand;

  declare type _ValueOnlyIteratee<T> = (value: T) => mixed;
  declare type ValueOnlyIteratee<T> = _ValueOnlyIteratee<T> | string;
  declare type _Iteratee<T> = (item: T) => mixed;
  declare type Iteratee<T> = _Iteratee<T> | Object | string;
  declare type AFlatMapIteratee<T, U> = ((item: T) => Array<U>) | string;
  declare type OFlatMapIteratee<T, U> = IterateeWithResult<T, Array<U>>;
  declare type Comparator<T> = (item: T, item2: T) => boolean;

  declare type MapIterator<T, U> = ((item: T) => U) | propertyIterateeShorthand;

  declare type OMapIterator<T, U> =
    | ((item: T) => U)
    | propertyIterateeShorthand;

  declare class Lodash {
    // Array
    chunk<T>(size: number): (array: $ReadOnlyArray<T>) => Array<Array<T>>;
    chunk<T>(size: number, array: $ReadOnlyArray<T>): Array<Array<T>>;
    compact<T, N: ?T>(array?: ?$ReadOnlyArray<N>): Array<T>;
    concat<T, U, A: Array<T> | T, B: Array<U> | U>(
      base: A,
    ): (elements: B) => Array<T | U>;
    concat<T, U, A: Array<T> | T, B: Array<U> | U>(
      base: A,
      elements: B,
    ): Array<T | U>;
    difference<T>(
      values: $ReadOnlyArray<T>,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    difference<T>(
      values: $ReadOnlyArray<T>,
      array: $ReadOnlyArray<T>,
    ): Array<T>;
    differenceBy<T>(
      iteratee: ValueOnlyIteratee<T>,
    ): ((values: $ReadOnlyArray<T>) => (array: $ReadOnlyArray<T>) => Array<T>) &
      ((values: $ReadOnlyArray<T>, array: $ReadOnlyArray<T>) => Array<T>);
    differenceBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      values: $ReadOnlyArray<T>,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    differenceBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      values: $ReadOnlyArray<T>,
      array: $ReadOnlyArray<T>,
    ): Array<T>;
    differenceWith<T>(
      comparator: Comparator<T>,
    ): ((first: $ReadOnlyArray<T>) => (second: $ReadOnlyArray<T>) => Array<T>) &
      ((first: $ReadOnlyArray<T>, second: $ReadOnlyArray<T>) => Array<T>);
    differenceWith<T>(
      comparator: Comparator<T>,
      first: $ReadOnlyArray<T>,
    ): (second: $ReadOnlyArray<T>) => Array<T>;
    differenceWith<T>(
      comparator: Comparator<T>,
      first: $ReadOnlyArray<T>,
      second: $ReadOnlyArray<T>,
    ): Array<T>;
    drop<T>(n: number): (array: $ReadOnlyArray<T>) => Array<T>;
    drop<T>(n: number, array: $ReadOnlyArray<T>): Array<T>;
    dropLast<T>(n: number): (array: $ReadOnlyArray<T>) => Array<T>;
    dropLast<T>(n: number, array: $ReadOnlyArray<T>): Array<T>;
    dropRight<T>(n: number): (array: $ReadOnlyArray<T>) => Array<T>;
    dropRight<T>(n: number, array: $ReadOnlyArray<T>): Array<T>;
    dropRightWhile<T>(
      predicate: Predicate<T>,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    dropRightWhile<T>(
      predicate: Predicate<T>,
      array: $ReadOnlyArray<T>,
    ): Array<T>;
    dropWhile<T>(
      predicate: Predicate<T>,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    dropWhile<T>(predicate: Predicate<T>, array: $ReadOnlyArray<T>): Array<T>;
    dropLastWhile<T>(
      predicate: Predicate<T>,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    dropLastWhile<T>(
      predicate: Predicate<T>,
      array: $ReadOnlyArray<T>,
    ): Array<T>;
    fill<T, U>(
      start: number,
    ): ((
      end: number,
    ) => ((value: U) => (array: Array<T>) => Array<T | U>) &
      ((value: U, array: Array<T>) => Array<T | U>)) &
      ((end: number, value: U) => (array: Array<T>) => Array<T | U>) &
      ((end: number, value: U, array: Array<T>) => Array<T | U>);
    fill<T, U>(
      start: number,
      end: number,
    ): ((value: U) => (array: Array<T>) => Array<T | U>) &
      ((value: U, array: Array<T>) => Array<T | U>);
    fill<T, U>(
      start: number,
      end: number,
      value: U,
    ): (array: Array<T>) => Array<T | U>;
    fill<T, U>(
      start: number,
      end: number,
      value: U,
      array: Array<T>,
    ): Array<T | U>;
    findIndex<T>(predicate: Predicate<T>): (array: $ReadOnlyArray<T>) => number;
    findIndex<T>(predicate: Predicate<T>, array: $ReadOnlyArray<T>): number;
    findIndexFrom<T>(
      predicate: Predicate<T>,
    ): ((fromIndex: number) => (array: $ReadOnlyArray<T>) => number) &
      ((fromIndex: number, array: $ReadOnlyArray<T>) => number);
    findIndexFrom<T>(
      predicate: Predicate<T>,
      fromIndex: number,
    ): (array: $ReadOnlyArray<T>) => number;
    findIndexFrom<T>(
      predicate: Predicate<T>,
      fromIndex: number,
      array: $ReadOnlyArray<T>,
    ): number;
    findLastIndex<T>(
      predicate: Predicate<T>,
    ): (array: $ReadOnlyArray<T>) => number;
    findLastIndex<T>(predicate: Predicate<T>, array: $ReadOnlyArray<T>): number;
    findLastIndexFrom<T>(
      predicate: Predicate<T>,
    ): ((fromIndex: number) => (array: $ReadOnlyArray<T>) => number) &
      ((fromIndex: number, array: $ReadOnlyArray<T>) => number);
    findLastIndexFrom<T>(
      predicate: Predicate<T>,
      fromIndex: number,
    ): (array: $ReadOnlyArray<T>) => number;
    findLastIndexFrom<T>(
      predicate: Predicate<T>,
      fromIndex: number,
      array: $ReadOnlyArray<T>,
    ): number;
    // alias of _.head
    first<T>(array: $ReadOnlyArray<T>): T;
    flatten<T, X>(array: $ReadOnlyArray<$ReadOnlyArray<T> | X>): Array<T | X>;
    unnest<T, X>(array: $ReadOnlyArray<$ReadOnlyArray<T> | X>): Array<T | X>;
    flattenDeep<T>(array: $ReadOnlyArray<any>): Array<T>;
    flattenDepth(depth: number): (array: $ReadOnlyArray<any>) => Array<any>;
    flattenDepth(depth: number, array: $ReadOnlyArray<any>): Array<any>;
    fromPairs<A, B>(pairs: $ReadOnlyArray<[A, B]>): {| [key: A]: B |};
    head<T>(array: $ReadOnlyArray<T>): T;
    indexOf<T>(value: T): (array: $ReadOnlyArray<T>) => number;
    indexOf<T>(value: T, array: $ReadOnlyArray<T>): number;
    indexOfFrom<T>(
      value: T,
    ): ((fromIndex: number) => (array: $ReadOnlyArray<T>) => number) &
      ((fromIndex: number, array: $ReadOnlyArray<T>) => number);
    indexOfFrom<T>(
      value: T,
      fromIndex: number,
    ): (array: $ReadOnlyArray<T>) => number;
    indexOfFrom<T>(
      value: T,
      fromIndex: number,
      array: $ReadOnlyArray<T>,
    ): number;
    initial<T>(array: $ReadOnlyArray<T>): Array<T>;
    init<T>(array: $ReadOnlyArray<T>): Array<T>;
    intersection<T>(a1: $ReadOnlyArray<T>): (a2: $ReadOnlyArray<T>) => Array<T>;
    intersection<T>(a1: $ReadOnlyArray<T>, a2: $ReadOnlyArray<T>): Array<T>;
    intersectionBy<T>(
      iteratee: ValueOnlyIteratee<T>,
    ): ((a1: $ReadOnlyArray<T>) => (a2: $ReadOnlyArray<T>) => Array<T>) &
      ((a1: $ReadOnlyArray<T>, a2: $ReadOnlyArray<T>) => Array<T>);
    intersectionBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: $ReadOnlyArray<T>,
    ): (a2: $ReadOnlyArray<T>) => Array<T>;
    intersectionBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
    ): Array<T>;
    intersectionWith<T>(
      comparator: Comparator<T>,
    ): ((a1: $ReadOnlyArray<T>) => (a2: $ReadOnlyArray<T>) => Array<T>) &
      ((a1: $ReadOnlyArray<T>, a2: $ReadOnlyArray<T>) => Array<T>);
    intersectionWith<T>(
      comparator: Comparator<T>,
      a1: $ReadOnlyArray<T>,
    ): (a2: $ReadOnlyArray<T>) => Array<T>;
    intersectionWith<T>(
      comparator: Comparator<T>,
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
    ): Array<T>;
    join<T>(separator: string): (array: $ReadOnlyArray<T>) => string;
    join<T>(separator: string, array: $ReadOnlyArray<T>): string;
    last<T>(array: $ReadOnlyArray<T>): T;
    lastIndexOf<T>(value: T): (array: $ReadOnlyArray<T>) => number;
    lastIndexOf<T>(value: T, array: $ReadOnlyArray<T>): number;
    lastIndexOfFrom<T>(
      value: T,
    ): ((fromIndex: number) => (array: $ReadOnlyArray<T>) => number) &
      ((fromIndex: number, array: $ReadOnlyArray<T>) => number);
    lastIndexOfFrom<T>(
      value: T,
      fromIndex: number,
    ): (array: $ReadOnlyArray<T>) => number;
    lastIndexOfFrom<T>(
      value: T,
      fromIndex: number,
      array: $ReadOnlyArray<T>,
    ): number;
    nth<T>(n: number): (array: $ReadOnlyArray<T>) => T;
    nth<T>(n: number, array: $ReadOnlyArray<T>): T;
    pull<T>(value: T): (array: Array<T>) => Array<T>;
    pull<T>(value: T, array: Array<T>): Array<T>;
    pullAll<T>(values: $ReadOnlyArray<T>): (array: Array<T>) => Array<T>;
    pullAll<T>(values: $ReadOnlyArray<T>, array: Array<T>): Array<T>;
    pullAllBy<T>(
      iteratee: ValueOnlyIteratee<T>,
    ): ((values: $ReadOnlyArray<T>) => (array: Array<T>) => Array<T>) &
      ((values: $ReadOnlyArray<T>, array: Array<T>) => Array<T>);
    pullAllBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      values: $ReadOnlyArray<T>,
    ): (array: Array<T>) => Array<T>;
    pullAllBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      values: $ReadOnlyArray<T>,
      array: Array<T>,
    ): Array<T>;
    pullAllWith<T>(
      comparator: Function,
    ): ((values: Array<T>) => (array: Array<T>) => Array<T>) &
      ((values: Array<T>, array: Array<T>) => Array<T>);
    pullAllWith<T>(
      comparator: Function,
      values: Array<T>,
    ): (array: Array<T>) => Array<T>;
    pullAllWith<T>(
      comparator: Function,
      values: Array<T>,
      array: Array<T>,
    ): Array<T>;
    pullAt<T>(indexed: Array<number>): (array: Array<T>) => Array<T>;
    pullAt<T>(indexed: Array<number>, array: Array<T>): Array<T>;
    remove<T>(predicate: Predicate<T>): (array: Array<T>) => Array<T>;
    remove<T>(predicate: Predicate<T>, array: Array<T>): Array<T>;
    reverse<T>(array: Array<T>): Array<T>;
    slice<T>(
      start: number,
    ): ((end: number) => (array: $ReadOnlyArray<T>) => Array<T>) &
      ((end: number, array: $ReadOnlyArray<T>) => Array<T>);
    slice<T>(
      start: number,
      end: number,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    slice<T>(start: number, end: number, array: $ReadOnlyArray<T>): Array<T>;
    sortedIndex<T>(value: T): (array: $ReadOnlyArray<T>) => number;
    sortedIndex<T>(value: T, array: $ReadOnlyArray<T>): number;
    sortedIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>,
    ): ((value: T) => (array: $ReadOnlyArray<T>) => number) &
      ((value: T, array: $ReadOnlyArray<T>) => number);
    sortedIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      value: T,
    ): (array: $ReadOnlyArray<T>) => number;
    sortedIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      value: T,
      array: $ReadOnlyArray<T>,
    ): number;
    sortedIndexOf<T>(value: T): (array: $ReadOnlyArray<T>) => number;
    sortedIndexOf<T>(value: T, array: $ReadOnlyArray<T>): number;
    sortedLastIndex<T>(value: T): (array: $ReadOnlyArray<T>) => number;
    sortedLastIndex<T>(value: T, array: $ReadOnlyArray<T>): number;
    sortedLastIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>,
    ): ((value: T) => (array: $ReadOnlyArray<T>) => number) &
      ((value: T, array: $ReadOnlyArray<T>) => number);
    sortedLastIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      value: T,
    ): (array: $ReadOnlyArray<T>) => number;
    sortedLastIndexBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      value: T,
      array: $ReadOnlyArray<T>,
    ): number;
    sortedLastIndexOf<T>(value: T): (array: $ReadOnlyArray<T>) => number;
    sortedLastIndexOf<T>(value: T, array: $ReadOnlyArray<T>): number;
    sortedUniq<T>(array: $ReadOnlyArray<T>): Array<T>;
    sortedUniqBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      array: $ReadOnlyArray<T>,
    ): Array<T>;
    tail<T>(array: $ReadOnlyArray<T>): Array<T>;
    take<T>(n: number): (array: $ReadOnlyArray<T>) => Array<T>;
    take<T>(n: number, array: $ReadOnlyArray<T>): Array<T>;
    takeRight<T>(n: number): (array: $ReadOnlyArray<T>) => Array<T>;
    takeRight<T>(n: number, array: $ReadOnlyArray<T>): Array<T>;
    takeLast<T>(n: number): (array: $ReadOnlyArray<T>) => Array<T>;
    takeLast<T>(n: number, array: $ReadOnlyArray<T>): Array<T>;
    takeRightWhile<T>(
      predicate: Predicate<T>,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    takeRightWhile<T>(
      predicate: Predicate<T>,
      array: $ReadOnlyArray<T>,
    ): Array<T>;
    takeLastWhile<T>(
      predicate: Predicate<T>,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    takeLastWhile<T>(
      predicate: Predicate<T>,
      array: $ReadOnlyArray<T>,
    ): Array<T>;
    takeWhile<T>(
      predicate: Predicate<T>,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    takeWhile<T>(predicate: Predicate<T>, array: $ReadOnlyArray<T>): Array<T>;
    union<T>(a1: $ReadOnlyArray<T>): (a2: $ReadOnlyArray<T>) => Array<T>;
    union<T>(a1: $ReadOnlyArray<T>, a2: $ReadOnlyArray<T>): Array<T>;
    unionBy<T>(
      iteratee: ValueOnlyIteratee<T>,
    ): ((a1: $ReadOnlyArray<T>) => (a2: $ReadOnlyArray<T>) => Array<T>) &
      ((a1: $ReadOnlyArray<T>, a2: $ReadOnlyArray<T>) => Array<T>);
    unionBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: $ReadOnlyArray<T>,
    ): (a2: $ReadOnlyArray<T>) => Array<T>;
    unionBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
    ): Array<T>;
    unionWith<T>(
      comparator: Comparator<T>,
    ): ((a1: $ReadOnlyArray<T>) => (a2: $ReadOnlyArray<T>) => Array<T>) &
      ((a1: $ReadOnlyArray<T>, a2: $ReadOnlyArray<T>) => Array<T>);
    unionWith<T>(
      comparator: Comparator<T>,
      a1: $ReadOnlyArray<T>,
    ): (a2: $ReadOnlyArray<T>) => Array<T>;
    unionWith<T>(
      comparator: Comparator<T>,
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
    ): Array<T>;
    uniq<T>(array: $ReadOnlyArray<T>): Array<T>;
    uniqBy<T>(
      iteratee: ValueOnlyIteratee<T>,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    uniqBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      array: $ReadOnlyArray<T>,
    ): Array<T>;
    uniqWith<T>(
      comparator: Comparator<T>,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    uniqWith<T>(comparator: Comparator<T>, array: $ReadOnlyArray<T>): Array<T>;
    unzip<T>(array: $ReadOnlyArray<T>): Array<T>;
    unzipWith<T>(iteratee: Iteratee<T>): (array: $ReadOnlyArray<T>) => Array<T>;
    unzipWith<T>(iteratee: Iteratee<T>, array: $ReadOnlyArray<T>): Array<T>;
    without<T>(
      values: $ReadOnlyArray<T>,
    ): (array: $ReadOnlyArray<T>) => Array<T>;
    without<T>(values: $ReadOnlyArray<T>, array: $ReadOnlyArray<T>): Array<T>;
    xor<T>(a1: $ReadOnlyArray<T>): (a2: $ReadOnlyArray<T>) => Array<T>;
    xor<T>(a1: $ReadOnlyArray<T>, a2: $ReadOnlyArray<T>): Array<T>;
    symmetricDifference<T>(
      a1: $ReadOnlyArray<T>,
    ): (a2: $ReadOnlyArray<T>) => Array<T>;
    symmetricDifference<T>(
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
    ): Array<T>;
    xorBy<T>(
      iteratee: ValueOnlyIteratee<T>,
    ): ((a1: $ReadOnlyArray<T>) => (a2: $ReadOnlyArray<T>) => Array<T>) &
      ((a1: $ReadOnlyArray<T>, a2: $ReadOnlyArray<T>) => Array<T>);
    xorBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: $ReadOnlyArray<T>,
    ): (a2: $ReadOnlyArray<T>) => Array<T>;
    xorBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
    ): Array<T>;
    symmetricDifferenceBy<T>(
      iteratee: ValueOnlyIteratee<T>,
    ): ((a1: $ReadOnlyArray<T>) => (a2: $ReadOnlyArray<T>) => Array<T>) &
      ((a1: $ReadOnlyArray<T>, a2: $ReadOnlyArray<T>) => Array<T>);
    symmetricDifferenceBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: $ReadOnlyArray<T>,
    ): (a2: $ReadOnlyArray<T>) => Array<T>;
    symmetricDifferenceBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
    ): Array<T>;
    xorWith<T>(
      comparator: Comparator<T>,
    ): ((a1: $ReadOnlyArray<T>) => (a2: $ReadOnlyArray<T>) => Array<T>) &
      ((a1: $ReadOnlyArray<T>, a2: $ReadOnlyArray<T>) => Array<T>);
    xorWith<T>(
      comparator: Comparator<T>,
      a1: $ReadOnlyArray<T>,
    ): (a2: $ReadOnlyArray<T>) => Array<T>;
    xorWith<T>(
      comparator: Comparator<T>,
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
    ): Array<T>;
    symmetricDifferenceWith<T>(
      comparator: Comparator<T>,
    ): ((a1: $ReadOnlyArray<T>) => (a2: $ReadOnlyArray<T>) => Array<T>) &
      ((a1: $ReadOnlyArray<T>, a2: $ReadOnlyArray<T>) => Array<T>);
    symmetricDifferenceWith<T>(
      comparator: Comparator<T>,
      a1: $ReadOnlyArray<T>,
    ): (a2: $ReadOnlyArray<T>) => Array<T>;
    symmetricDifferenceWith<T>(
      comparator: Comparator<T>,
      a1: $ReadOnlyArray<T>,
      a2: $ReadOnlyArray<T>,
    ): Array<T>;
    zip<A, B>(a1: $ReadOnlyArray<A>): (a2: $ReadOnlyArray<B>) => Array<[A, B]>;
    zip<A, B>(a1: $ReadOnlyArray<A>, a2: $ReadOnlyArray<B>): Array<[A, B]>;
    zipAll(arrays: $ReadOnlyArray<$ReadOnlyArray<any>>): Array<any>;
    zipObject<K, V>(
      props?: $ReadOnlyArray<K>,
    ): (values?: $ReadOnlyArray<V>) => { [key: K]: V, ... };
    zipObject<K, V>(
      props?: $ReadOnlyArray<K>,
      values?: $ReadOnlyArray<V>,
    ): { [key: K]: V, ... };
    zipObj(props: $ReadOnlyArray<any>): (values: $ReadOnlyArray<any>) => Object;
    zipObj(props: $ReadOnlyArray<any>, values: $ReadOnlyArray<any>): Object;
    zipObjectDeep(props: $ReadOnlyArray<any>): (values: any) => Object;
    zipObjectDeep(props: $ReadOnlyArray<any>, values: any): Object;
    zipWith<T>(
      iteratee: Iteratee<T>,
    ): ((a1: NestedArray<T>) => (a2: NestedArray<T>) => Array<T>) &
      ((a1: NestedArray<T>, a2: NestedArray<T>) => Array<T>);
    zipWith<T>(
      iteratee: Iteratee<T>,
      a1: NestedArray<T>,
    ): (a2: NestedArray<T>) => Array<T>;
    zipWith<T>(
      iteratee: Iteratee<T>,
      a1: NestedArray<T>,
      a2: NestedArray<T>,
    ): Array<T>;

    // Collection
    countBy<T>(
      iteratee: ValueOnlyIteratee<T>,
    ): (collection: Collection<T>) => { [string]: number, ... };
    countBy<T>(
      iteratee: ValueOnlyIteratee<T>,
      collection: Collection<T>,
    ): { [string]: number, ... };
    // alias of _.forEach
    each<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
    ): (collection: Collection<T>) => Array<T>;
    each<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: Collection<T>,
    ): Array<T>;
    // alias of _.forEachRight
    eachRight<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
    ): (collection: Collection<T>) => Array<T>;
    eachRight<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: Collection<T>,
    ): Array<T>;
    every<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
    ): (collection: Collection<T>) => boolean;
    every<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: Collection<T>,
    ): boolean;
    all<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
    ): (collection: Collection<T>) => boolean;
    all<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: Collection<T>,
    ): boolean;
    filter<T>(
      predicate: Predicate<T> | OPredicate<T>,
    ): (collection: Collection<T>) => Array<T>;
    filter<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: Collection<T>,
    ): Array<T>;
    find<T>(
      predicate: Predicate<T> | OPredicate<T>,
    ): (collection: Collection<T>) => T | void;
    find<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: Collection<T>,
    ): T | void;
    findFrom<T>(
      predicate: Predicate<T> | OPredicate<T>,
    ): ((fromIndex: number) => (collection: Collection<T>) => T | void) &
      ((fromIndex: number, collection: Collection<T>) => T | void);
    findFrom<T>(
      predicate: Predicate<T> | OPredicate<T>,
      fromIndex: number,
    ): (collection: Collection<T>) => T | void;
    findFrom<T>(
      predicate: Predicate<T> | OPredicate<T>,
      fromIndex: number,
      collection: Collection<T>,
    ): T | void;
    findLast<T>(
      predicate: Predicate<T> | OPredicate<T>,
    ): (collection: Collection<T>) => T | void;
    findLast<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: Collection<T>,
    ): T | void;
    findLastFrom<T>(
      predicate: Predicate<T> | OPredicate<T>,
    ): ((fromIndex: number) => (collection: Collection<T>) => T | void) &
      ((fromIndex: number, collection: Collection<T>) => T | void);
    findLastFrom<T>(
      predicate: Predicate<T> | OPredicate<T>,
      fromIndex: number,
    ): (collection: Collection<T>) => T | void;
    findLastFrom<T>(
      predicate: Predicate<T> | OPredicate<T>,
      fromIndex: number,
      collection: Collection<T>,
    ): T | void;
    flatMap<T, U>(
      iteratee: AFlatMapIteratee<T, U> | OFlatMapIteratee<T, U>,
    ): (collection: Collection<T>) => Array<U>;
    flatMap<T, U>(
      iteratee: AFlatMapIteratee<T, U> | OFlatMapIteratee<T, U>,
      collection: Collection<T>,
    ): Array<U>;
    flatMapDeep<T, U>(
      iteratee: AFlatMapIteratee<T, U> | OFlatMapIteratee<T, U>,
    ): (collection: Collection<T>) => Array<U>;
    flatMapDeep<T, U>(
      iteratee: AFlatMapIteratee<T, U> | OFlatMapIteratee<T, U>,
      collection: Collection<T>,
    ): Array<U>;
    flatMapDepth<T, U>(
      iteratee: AFlatMapIteratee<T, U> | OFlatMapIteratee<T, U>,
    ): ((depth: number) => (collection: Collection<T>) => Array<U>) &
      ((depth: number, collection: Collection<T>) => Array<U>);
    flatMapDepth<T, U>(
      iteratee: AFlatMapIteratee<T, U> | OFlatMapIteratee<T, U>,
      depth: number,
    ): (collection: Collection<T>) => Array<U>;
    flatMapDepth<T, U>(
      iteratee: AFlatMapIteratee<T, U> | OFlatMapIteratee<T, U>,
      depth: number,
      collection: Collection<T>,
    ): Array<U>;
    forEach<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
    ): (collection: Collection<T>) => Array<T>;
    forEach<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: Collection<T>,
    ): Array<T>;
    forEachRight<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
    ): (collection: Collection<T>) => Array<T>;
    forEachRight<T>(
      iteratee: Iteratee<T> | OIteratee<T>,
      collection: Collection<T>,
    ): Array<T>;
    groupBy<V, T>(
      iteratee: ValueOnlyIteratee<T>,
    ): (collection: Collection<T>) => { [key: V]: Array<T>, ... };
    groupBy<V, T>(
      iteratee: ValueOnlyIteratee<T>,
      collection: Collection<T>,
    ): { [key: V]: Array<T>, ... };
    includes<T>(value: T): (collection: Collection<T>) => boolean;
    includes<T>(value: T, collection: Collection<T>): boolean;
    includes(value: string): (str: string) => boolean;
    includes(value: string, str: string): boolean;
    contains(value: string): (str: string) => boolean;
    contains(value: string, str: string): boolean;
    contains<T>(value: T): (collection: Collection<T>) => boolean;
    contains<T>(value: T, collection: Collection<T>): boolean;
    includesFrom(
      value: string,
    ): ((fromIndex: number) => (str: string) => boolean) &
      ((fromIndex: number, str: string) => boolean);
    includesFrom(value: string, fromIndex: number): (str: string) => boolean;
    includesFrom(value: string, fromIndex: number, str: string): boolean;
    includesFrom<T>(
      value: T,
    ): ((fromIndex: number) => (collection: $ReadOnlyArray<T>) => boolean) &
      ((fromIndex: number, collection: $ReadOnlyArray<T>) => boolean);
    includesFrom<T>(
      value: T,
      fromIndex: number,
    ): (collection: $ReadOnlyArray<T>) => boolean;
    includesFrom<T>(
      value: T,
      fromIndex: number,
      collection: $ReadOnlyArray<T>,
    ): boolean;
    invokeMap<T>(
      path: ((value: T) => Path) | Path,
    ): (collection: Collection<T>) => Array<any>;
    invokeMap<T>(
      path: ((value: T) => Path) | Path,
      collection: Collection<T>,
    ): Array<any>;
    invokeArgsMap<T>(
      path: ((value: T) => Path) | Path,
    ): ((
      collection: Collection<T>,
    ) => (args: $ReadOnlyArray<any>) => Array<any>) &
      ((collection: Collection<T>, args: $ReadOnlyArray<any>) => Array<any>);
    invokeArgsMap<T>(
      path: ((value: T) => Path) | Path,
      collection: Collection<T>,
    ): (args: $ReadOnlyArray<any>) => Array<any>;
    invokeArgsMap<T>(
      path: ((value: T) => Path) | Path,
      collection: Collection<T>,
      args: $ReadOnlyArray<any>,
    ): Array<any>;
    keyBy<T, V>(
      iteratee: ValueOnlyIteratee<T>,
    ): (collection: Collection<T>) => { [key: V]: T, ... };
    keyBy<T, V>(
      iteratee: ValueOnlyIteratee<T>,
      collection: Collection<T>,
    ): { [key: V]: T, ... };
    indexBy<T, V>(
      iteratee: ValueOnlyIteratee<T>,
    ): (collection: Collection<T>) => { [key: V]: T, ... };
    indexBy<T, V>(
      iteratee: ValueOnlyIteratee<T>,
      collection: Collection<T>,
    ): { [key: V]: T, ... };
    map<T, U>(
      iteratee: MapIterator<T, U> | OMapIterator<T, U>,
    ): (collection: Collection<T>) => Array<U>;
    map<T, U>(
      iteratee: MapIterator<T, U> | OMapIterator<T, U>,
      collection: Collection<T>,
    ): Array<U>;
    map(iteratee: (char: string) => any): (str: string) => string;
    map(iteratee: (char: string) => any, str: string): string;
    pluck<T, U>(
      iteratee: MapIterator<T, U> | OMapIterator<T, U>,
    ): (collection: Collection<T>) => Array<U>;
    pluck<T, U>(
      iteratee: MapIterator<T, U> | OMapIterator<T, U>,
      collection: Collection<T>,
    ): Array<U>;
    pluck(iteratee: (char: string) => any): (str: string) => string;
    pluck(iteratee: (char: string) => any, str: string): string;
    orderBy<T>(
      iteratees: $ReadOnlyArray<Iteratee<T> | OIteratee<*>> | string,
    ): ((
      orders: $ReadOnlyArray<'asc' | 'desc'> | string,
    ) => (collection: Collection<T>) => Array<T>) &
      ((
        orders: $ReadOnlyArray<'asc' | 'desc'> | string,
        collection: Collection<T>,
      ) => Array<T>);
    orderBy<T>(
      iteratees: $ReadOnlyArray<Iteratee<T> | OIteratee<*>> | string,
      orders: $ReadOnlyArray<'asc' | 'desc'> | string,
    ): (collection: Collection<T>) => Array<T>;
    orderBy<T>(
      iteratees: $ReadOnlyArray<Iteratee<T> | OIteratee<*>> | string,
      orders: $ReadOnlyArray<'asc' | 'desc'> | string,
      collection: Collection<T>,
    ): Array<T>;
    partition<T>(
      predicate: Predicate<T> | OPredicate<T>,
    ): (collection: Collection<T>) => [Array<T>, Array<T>];
    partition<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: Collection<T>,
    ): [Array<T>, Array<T>];
    reduce<T, U>(
      iteratee: (accumulator: U, value: T) => U,
    ): ((accumulator: U) => (collection: Collection<T>) => U) &
      ((accumulator: U, collection: Collection<T>) => U);
    reduce<T, U>(
      iteratee: (accumulator: U, value: T) => U,
      accumulator: U,
    ): (collection: Collection<T>) => U;
    reduce<T, U>(
      iteratee: (accumulator: U, value: T) => U,
      accumulator: U,
      collection: Collection<T>,
    ): U;
    reduceRight<T, U>(
      iteratee: (value: T, accumulator: U) => U,
    ): ((accumulator: U) => (collection: Collection<T>) => U) &
      ((accumulator: U, collection: Collection<T>) => U);
    reduceRight<T, U>(
      iteratee: (value: T, accumulator: U) => U,
      accumulator: U,
    ): (collection: Collection<T>) => U;
    reduceRight<T, U>(
      iteratee: (value: T, accumulator: U) => U,
      accumulator: U,
      collection: Collection<T>,
    ): U;
    reject<T>(
      predicate: Predicate<T> | OPredicate<T>,
    ): (collection: Collection<T>) => Array<T>;
    reject<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: Collection<T>,
    ): Array<T>;
    sample<T>(collection: Collection<T>): T;
    sampleSize<T>(n: number): (collection: Collection<T>) => Array<T>;
    sampleSize<T>(n: number, collection: Collection<T>): Array<T>;
    shuffle<T>(collection: Collection<T>): Array<T>;
    size(collection: $ReadOnlyArray<any> | Object | string): number;
    some<T>(
      predicate: Predicate<T> | OPredicate<T>,
    ): (collection: Collection<T>) => boolean;
    some<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: Collection<T>,
    ): boolean;
    any<T>(
      predicate: Predicate<T> | OPredicate<T>,
    ): (collection: Collection<T>) => boolean;
    any<T>(
      predicate: Predicate<T> | OPredicate<T>,
      collection: Collection<T>,
    ): boolean;
    sortBy<T>(
      iteratees:
        | $ReadOnlyArray<Iteratee<T> | OIteratee<T>>
        | Iteratee<T>
        | OIteratee<T>,
    ): (collection: Collection<T>) => Array<T>;
    sortBy<T>(
      iteratees:
        | $ReadOnlyArray<Iteratee<T> | OIteratee<T>>
        | Iteratee<T>
        | OIteratee<T>,
      collection: Collection<T>,
    ): Array<T>;

    // Date
    now(): number;

    // Function
    after(fn: Function): (n: number) => Function;
    after(fn: Function, n: number): Function;
    ary(func: Function): Function;
    nAry(n: number): (func: Function) => Function;
    nAry(n: number, func: Function): Function;
    before(fn: Function): (n: number) => Function;
    before(fn: Function, n: number): Function;
    bind(func: Function): (thisArg: any) => Function;
    bind(func: Function, thisArg: any): Function;
    bindKey(obj: Object): (key: string) => Function;
    bindKey(obj: Object, key: string): Function;
    curry: Curry;
    curryN(arity: number): (func: Function) => Function;
    curryN(arity: number, func: Function): Function;
    curryRight(func: Function): Function;
    curryRightN(arity: number): (func: Function) => Function;
    curryRightN(arity: number, func: Function): Function;
    debounce(wait: number): <A, R>(func: (...A) => R) => (...A) => R;
    debounce<A, R>(wait: number, func: (...A) => R): (...A) => R;
    defer(func: (...$ReadOnlyArray<any>) => any): TimeoutID;
    delay(wait: number): (func: Function) => TimeoutID;
    delay(wait: number, func: Function): TimeoutID;
    flip(func: Function): Function;
    memoize<F: Function>(func: F): F;
    negate<A, R>(predicate: (...A) => R): (...A) => boolean;
    complement(predicate: Function): Function;
    once(func: Function): Function;
    overArgs(
      func: Function,
    ): (transforms: $ReadOnlyArray<Function>) => Function;
    overArgs(func: Function, transforms: $ReadOnlyArray<Function>): Function;
    useWith(func: Function): (transforms: $ReadOnlyArray<Function>) => Function;
    useWith(func: Function, transforms: $ReadOnlyArray<Function>): Function;
    partial(func: Function): (partials: $ReadOnlyArray<any>) => Function;
    partial(func: Function, partials: $ReadOnlyArray<any>): Function;
    partialRight(func: Function): (partials: $ReadOnlyArray<any>) => Function;
    partialRight(func: Function, partials: $ReadOnlyArray<any>): Function;
    rearg(indexes: $ReadOnlyArray<number>): (func: Function) => Function;
    rearg(indexes: $ReadOnlyArray<number>, func: Function): Function;
    rest(func: Function): Function;
    unapply(func: Function): Function;
    restFrom(start: number): (func: Function) => Function;
    restFrom(start: number, func: Function): Function;
    spread(func: Function): Function;
    apply(func: Function): Function;
    spreadFrom(start: number): (func: Function) => Function;
    spreadFrom(start: number, func: Function): Function;
    throttle<A, R>(wait: number): (func: (...A) => R) => (...A) => R;
    throttle<A, R>(wait: number, func: (...A) => R): (...A) => R;
    unary<T, R>(func: (T, ...$ReadOnlyArray<any>) => R): (T) => R;
    wrap(wrapper: Function): (value: any) => Function;
    wrap(wrapper: Function, value: any): Function;

    // Lang
    castArray(): Array<any>;
    castArray<T: void | null | number | string | { ... }>(value: T): Array<T>;
    castArray<T: Array<any>>(value: T): T;
    clone<T>(value: T): T;
    cloneDeep<T>(value: T): T;
    cloneDeepWith<T, U>(
      customizer: (value: T, key: number | string, object: T, stack: any) => U,
    ): (value: T) => U;
    cloneDeepWith<T, U>(
      customizer: (value: T, key: number | string, object: T, stack: any) => U,
      value: T,
    ): U;
    cloneWith<T, U>(
      customizer: (value: T, key: number | string, object: T, stack: any) => U,
    ): (value: T) => U;
    cloneWith<T, U>(
      customizer: (value: T, key: number | string, object: T, stack: any) => U,
      value: T,
    ): U;
    conformsTo<T: ReadOnlyIndexerObject<mixed>>(
      predicates: T & $ReadOnly<{ [key: string]: (x: any) => boolean, ... }>,
    ): (source: T) => boolean;
    conformsTo<T: ReadOnlyIndexerObject<mixed>>(
      predicates: T & $ReadOnly<{ [key: string]: (x: any) => boolean, ... }>,
      source: T,
    ): boolean;
    where<T: ReadOnlyIndexerObject<mixed>>(
      predicates: T & $ReadOnly<{ [key: string]: (x: any) => boolean, ... }>,
    ): (source: T) => boolean;
    where<T: ReadOnlyIndexerObject<mixed>>(
      predicates: T & $ReadOnly<{ [key: string]: (x: any) => boolean, ... }>,
      source: T,
    ): boolean;
    conforms<T: ReadOnlyIndexerObject<mixed>>(
      predicates: T & $ReadOnly<{ [key: string]: (x: any) => boolean, ... }>,
    ): (source: T) => boolean;
    conforms<T: ReadOnlyIndexerObject<mixed>>(
      predicates: T & $ReadOnly<{ [key: string]: (x: any) => boolean, ... }>,
      source: T,
    ): boolean;
    eq(value: any): (other: any) => boolean;
    eq(value: any, other: any): boolean;
    identical(value: any): (other: any) => boolean;
    identical(value: any, other: any): boolean;
    gt(value: any): (other: any) => boolean;
    gt(value: any, other: any): boolean;
    gte(value: any): (other: any) => boolean;
    gte(value: any, other: any): boolean;
    isArguments(value: any): boolean;
    isArray(value: any): boolean;
    isArrayBuffer(value: any): boolean;
    isArrayLike(value: any): boolean;
    isArrayLikeObject(value: any): boolean;
    isBoolean(value: any): boolean;
    isBuffer(value: any): boolean;
    isDate(value: any): boolean;
    isElement(value: any): boolean;
    isEmpty(value: any): boolean;
    isEqual(value: any): (other: any) => boolean;
    isEqual(value: any, other: any): boolean;
    equals(value: any): (other: any) => boolean;
    equals(value: any, other: any): boolean;
    isEqualWith<T, U>(
      customizer: (
        objValue: any,
        otherValue: any,
        key: number | string,
        object: T,
        other: U,
        stack: any,
      ) => boolean | void,
    ): ((value: T) => (other: U) => boolean) &
      ((value: T, other: U) => boolean);
    isEqualWith<T, U>(
      customizer: (
        objValue: any,
        otherValue: any,
        key: number | string,
        object: T,
        other: U,
        stack: any,
      ) => boolean | void,
      value: T,
    ): (other: U) => boolean;
    isEqualWith<T, U>(
      customizer: (
        objValue: any,
        otherValue: any,
        key: number | string,
        object: T,
        other: U,
        stack: any,
      ) => boolean | void,
      value: T,
      other: U,
    ): boolean;
    isError(value: any): boolean;
    isFinite(value: any): boolean;
    isFunction(value: any): boolean;
    isInteger(value: any): boolean;
    isLength(value: any): boolean;
    isMap(value: any): boolean;
    isMatch(source: Object): (object: Object) => boolean;
    isMatch(source: Object, object: Object): boolean;
    whereEq(source: Object): (object: Object) => boolean;
    whereEq(source: Object, object: Object): boolean;
    isMatchWith<T: Object, U: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: number | string,
        object: T,
        source: U,
      ) => boolean | void,
    ): ((source: U) => (object: T) => boolean) &
      ((source: U, object: T) => boolean);
    isMatchWith<T: Object, U: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: number | string,
        object: T,
        source: U,
      ) => boolean | void,
      source: U,
    ): (object: T) => boolean;
    isMatchWith<T: Object, U: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: number | string,
        object: T,
        source: U,
      ) => boolean | void,
      source: U,
      object: T,
    ): boolean;
    isNaN(value: any): boolean;
    isNative(value: any): boolean;
    isNil(value: any): boolean;
    isNull(value: any): boolean;
    isNumber(value: any): boolean;
    isObject(value: any): boolean;
    isObjectLike(value: any): boolean;
    isPlainObject(value: any): boolean;
    isRegExp(value: any): boolean;
    isSafeInteger(value: any): boolean;
    isSet(value: any): boolean;
    isString(value: string): true;
    isString(value: any): false;
    isSymbol(value: any): boolean;
    isTypedArray(value: any): boolean;
    isUndefined(value: any): boolean;
    isWeakMap(value: any): boolean;
    isWeakSet(value: any): boolean;
    lt(value: any): (other: any) => boolean;
    lt(value: any, other: any): boolean;
    lte(value: any): (other: any) => boolean;
    lte(value: any, other: any): boolean;
    toArray(value: any): Array<any>;
    toFinite(value: any): number;
    toInteger(value: any): number;
    toLength(value: any): number;
    toNumber(value: any): number;
    toPlainObject(value: any): Object;
    toSafeInteger(value: any): number;
    toString(value: any): string;

    // Math
    add(augend: number): (addend: number) => number;
    add(augend: number, addend: number): number;
    ceil(number: number): number;
    divide(dividend: number): (divisor: number) => number;
    divide(dividend: number, divisor: number): number;
    floor(number: number): number;
    max<T>(array: $ReadOnlyArray<T>): T;
    maxBy<T>(iteratee: Iteratee<T>): (array: $ReadOnlyArray<T>) => T;
    maxBy<T>(iteratee: Iteratee<T>, array: $ReadOnlyArray<T>): T;
    mean(array: $ReadOnlyArray<*>): number;
    meanBy<T>(iteratee: Iteratee<T>): (array: $ReadOnlyArray<T>) => number;
    meanBy<T>(iteratee: Iteratee<T>, array: $ReadOnlyArray<T>): number;
    min<T>(array: $ReadOnlyArray<T>): T;
    minBy<T>(iteratee: Iteratee<T>): (array: $ReadOnlyArray<T>) => T;
    minBy<T>(iteratee: Iteratee<T>, array: $ReadOnlyArray<T>): T;
    multiply(multiplier: number): (multiplicand: number) => number;
    multiply(multiplier: number, multiplicand: number): number;
    round(number: number): number;
    subtract(minuend: number): (subtrahend: number) => number;
    subtract(minuend: number, subtrahend: number): number;
    sum(array: $ReadOnlyArray<*>): number;
    sumBy<T>(iteratee: Iteratee<T>): (array: $ReadOnlyArray<T>) => number;
    sumBy<T>(iteratee: Iteratee<T>, array: $ReadOnlyArray<T>): number;

    // number
    clamp(
      lower: number,
    ): ((upper: number) => (number: number) => number) &
      ((upper: number, number: number) => number);
    clamp(lower: number, upper: number): (number: number) => number;
    clamp(lower: number, upper: number, number: number): number;
    inRange(
      start: number,
    ): ((end: number) => (number: number) => boolean) &
      ((end: number, number: number) => boolean);
    inRange(start: number, end: number): (number: number) => boolean;
    inRange(start: number, end: number, number: number): boolean;
    random(lower: number): (upper: number) => number;
    random(lower: number, upper: number): number;

    // Object
    assign(object: Object): (source: Object) => Object;
    assign(object: Object, source: Object): Object;
    assignAll(objects: Array<Object>): Object;
    assignInAll(objects: Array<Object>): Object;
    extendAll(objects: Array<Object>): Object;
    assignIn<A, B>(a: A): (b: B) => A & B;
    assignIn<A, B>(a: A, b: B): A & B;
    assignInWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
    ): ((object: T) => (s1: A) => Object) & ((object: T, s1: A) => Object);
    assignInWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
      object: T,
    ): (s1: A) => Object;
    assignInWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
      object: T,
      s1: A,
    ): Object;
    assignWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
    ): ((object: T) => (s1: A) => Object) & ((object: T, s1: A) => Object);
    assignWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
      object: T,
    ): (s1: A) => Object;
    assignWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
      object: T,
      s1: A,
    ): Object;
    assignInAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object,
      ) => any | void,
    ): (objects: Array<Object>) => Object;
    assignInAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object,
      ) => any | void,
      objects: Array<Object>,
    ): Object;
    extendAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object,
      ) => any | void,
    ): (objects: Array<Object>) => Object;
    extendAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object,
      ) => any | void,
      objects: Array<Object>,
    ): Object;
    assignAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object,
      ) => any | void,
    ): (objects: Array<Object>) => Object;
    assignAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object,
      ) => any | void,
      objects: Array<Object>,
    ): Object;
    at(paths: $ReadOnlyArray<string>): (object: Object) => Array<any>;
    at(paths: $ReadOnlyArray<string>, object: Object): Array<any>;
    props(paths: $ReadOnlyArray<string>): (object: Object) => Array<any>;
    props(paths: $ReadOnlyArray<string>, object: Object): Array<any>;
    paths(paths: $ReadOnlyArray<string>): (object: Object) => Array<any>;
    paths(paths: $ReadOnlyArray<string>, object: Object): Array<any>;
    create<T>(prototype: T): T;
    defaults(source: Object): (object: Object) => Object;
    defaults(source: Object, object: Object): Object;
    defaultsAll(objects: Array<Object>): Object;
    defaultsDeep(source: Object): (object: Object) => Object;
    defaultsDeep(source: Object, object: Object): Object;
    defaultsDeepAll(objects: Array<Object>): Object;
    // alias for _.toPairs
    entries(object: Object): Array<[string, any]>;
    // alias for _.toPairsIn
    entriesIn(object: Object): Array<[string, any]>;
    // alias for _.assignIn
    extend<A, B>(a: A): (b: B) => A & B;
    extend<A, B>(a: A, b: B): A & B;
    // alias for _.assignInWith
    extendWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
    ): ((object: T) => (s1: A) => Object) & ((object: T, s1: A) => Object);
    extendWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
      object: T,
    ): (s1: A) => Object;
    extendWith<T: Object, A: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A,
      ) => any | void,
      object: T,
      s1: A,
    ): Object;
    findKey<A, T: ReadOnlyIndexerObject<A>>(
      predicate: OPredicate<A>,
    ): (object: T) => string | void;
    findKey<A, T: ReadOnlyIndexerObject<A>>(
      predicate: OPredicate<A>,
      object: T,
    ): string | void;
    findLastKey<A, T: ReadOnlyIndexerObject<A>>(
      predicate: OPredicate<A>,
    ): (object: T) => string | void;
    findLastKey<A, T: ReadOnlyIndexerObject<A>>(
      predicate: OPredicate<A>,
      object: T,
    ): string | void;
    forIn(iteratee: OIteratee<*>): (object: Object) => Object;
    forIn(iteratee: OIteratee<*>, object: Object): Object;
    forInRight(iteratee: OIteratee<*>): (object: Object) => Object;
    forInRight(iteratee: OIteratee<*>, object: Object): Object;
    forOwn(iteratee: OIteratee<*>): (object: Object) => Object;
    forOwn(iteratee: OIteratee<*>, object: Object): Object;
    forOwnRight(iteratee: OIteratee<*>): (object: Object) => Object;
    forOwnRight(iteratee: OIteratee<*>, object: Object): Object;
    functions(object: Object): Array<string>;
    functionsIn(object: Object): Array<string>;
    get(
      path: Path,
    ): (object: Object | $ReadOnlyArray<any> | void | null) => any;
    get(path: Path, object: Object | $ReadOnlyArray<any> | void | null): any;
    prop(path: Path): (object: Object | $ReadOnlyArray<any>) => any;
    prop(path: Path, object: Object | $ReadOnlyArray<any>): any;
    path(path: Path): (object: Object | $ReadOnlyArray<any>) => any;
    path(path: Path, object: Object | $ReadOnlyArray<any>): any;
    getOr(
      defaultValue: any,
    ): ((path: Path) => (object: Object | $ReadOnlyArray<any>) => any) &
      ((path: Path, object: Object | $ReadOnlyArray<any> | void | null) => any);
    getOr(
      defaultValue: any,
      path: Path,
    ): (object: Object | $ReadOnlyArray<any> | void | null) => any;
    getOr(
      defaultValue: any,
      path: Path,
      object: Object | $ReadOnlyArray<any> | void | null,
    ): any;
    propOr(
      defaultValue: any,
    ): ((path: Path) => (object: Object | $ReadOnlyArray<any>) => any) &
      ((path: Path, object: Object | $ReadOnlyArray<any>) => any);
    propOr(
      defaultValue: any,
      path: Path,
    ): (object: Object | $ReadOnlyArray<any>) => any;
    propOr(
      defaultValue: any,
      path: Path,
      object: Object | $ReadOnlyArray<any>,
    ): any;
    pathOr(
      defaultValue: any,
    ): ((path: Path) => (object: Object | $ReadOnlyArray<any>) => any) &
      ((path: Path, object: Object | $ReadOnlyArray<any>) => any);
    pathOr(
      defaultValue: any,
      path: Path,
    ): (object: Object | $ReadOnlyArray<any>) => any;
    pathOr(
      defaultValue: any,
      path: Path,
      object: Object | $ReadOnlyArray<any>,
    ): any;
    has(path: Path): (object: Object) => boolean;
    has(path: Path, object: Object): boolean;
    hasIn(path: Path): (object: Object) => boolean;
    hasIn(path: Path, object: Object): boolean;
    invert(object: Object): Object;
    invertObj(object: Object): Object;
    invertBy(iteratee: Function): (object: Object) => Object;
    invertBy(iteratee: Function, object: Object): Object;
    invoke(path: Path): (object: Object) => any;
    invoke(path: Path, object: Object): any;
    invokeArgs(
      path: Path,
    ): ((object: Object) => (args: Array<any>) => any) &
      ((object: Object, args: Array<any>) => any);
    invokeArgs(path: Path, object: Object): (args: Array<any>) => any;
    invokeArgs(path: Path, object: Object, args: Array<any>): any;
    keys<K>(object: ReadOnlyIndexerObject<any, K>): Array<K>;
    keys(object: Object): Array<string>;
    keysIn(object: Object): Array<string>;
    mapKeys(iteratee: OIteratee<*>): (object: Object) => Object;
    mapKeys(iteratee: OIteratee<*>, object: Object): Object;
    mapValues(iteratee: OIteratee<*>): (object: Object) => Object;
    mapValues(iteratee: OIteratee<*>, object: Object): Object;
    merge(object: Object): (source: Object) => Object;
    merge(object: Object, source: Object): Object;
    mergeAll(objects: $ReadOnlyArray<Object>): Object;
    mergeWith<T: Object, A: Object, B: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B,
      ) => any | void,
    ): ((object: T) => (s1: A) => Object) & ((object: T, s1: A) => Object);
    mergeWith<T: Object, A: Object, B: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B,
      ) => any | void,
      object: T,
    ): (s1: A) => Object;
    mergeWith<T: Object, A: Object, B: Object>(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: T,
        source: A | B,
      ) => any | void,
      object: T,
      s1: A,
    ): Object;
    mergeAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object,
      ) => any | void,
    ): (objects: $ReadOnlyArray<Object>) => Object;
    mergeAllWith(
      customizer: (
        objValue: any,
        srcValue: any,
        key: string,
        object: Object,
        source: Object,
      ) => any | void,
      objects: $ReadOnlyArray<Object>,
    ): Object;
    omit(props: $ReadOnlyArray<string>): (object: Object) => Object;
    omit(props: $ReadOnlyArray<string>, object: Object): Object;
    omitAll(props: $ReadOnlyArray<string>): (object: Object) => Object;
    omitAll(props: $ReadOnlyArray<string>, object: Object): Object;
    omitBy<A, T: ReadOnlyIndexerObject<A>>(
      predicate: OPredicate<A>,
    ): (object: T) => Object;
    omitBy<A, T: ReadOnlyIndexerObject<A>>(
      predicate: OPredicate<A>,
      object: T,
    ): Object;
    pick(...props: $ReadOnlyArray<string | { ... }>): Object;
    pick(props: $ReadOnlyArray<string>, object: Object): Object;
    pick(...props: $ReadOnlyArray<string>): (object: Object) => Object;
    pick(props: $ReadOnlyArray<string>): (object: Object) => Object;
    pickAll(props: $ReadOnlyArray<string>): (object: Object) => Object;
    pickAll(props: $ReadOnlyArray<string>, object: Object): Object;
    pickBy<A, T: ReadOnlyIndexerObject<A>>(
      predicate: OPredicate<A>,
    ): (object: T) => Object;
    pickBy<A, T: ReadOnlyIndexerObject<A>>(
      predicate: OPredicate<A>,
      object: T,
    ): Object;
    result(path: Path): (object: Object) => any;
    result(path: Path, object: Object): any;
    set(
      path: Path,
    ): ((value: any) => (object: Object) => Object) &
      ((value: any, object: Object) => Object);
    set(path: Path, value: any): (object: Object) => Object;
    set(path: Path, value: any, object: Object): Object;
    assoc(
      path: Path,
    ): ((value: any) => (object: Object) => Object) &
      ((value: any, object: Object) => Object);
    assoc(path: Path, value: any): (object: Object) => Object;
    assoc(path: Path, value: any, object: Object): Object;
    assocPath(
      path: Path,
    ): ((value: any) => (object: Object) => Object) &
      ((value: any, object: Object) => Object);
    assocPath(path: Path, value: any): (object: Object) => Object;
    assocPath(path: Path, value: any, object: Object): Object;
    setWith<T>(
      customizer: (nsValue: any, key: string, nsObject: T) => any,
    ): ((
      path: Path,
    ) => ((value: any) => (object: T) => Object) &
      ((value: any, object: T) => Object)) &
      ((path: Path, value: any) => (object: T) => Object) &
      ((path: Path, value: any, object: T) => Object);
    setWith<T>(
      customizer: (nsValue: any, key: string, nsObject: T) => any,
      path: Path,
    ): ((value: any) => (object: T) => Object) &
      ((value: any, object: T) => Object);
    setWith<T>(
      customizer: (nsValue: any, key: string, nsObject: T) => any,
      path: Path,
      value: any,
    ): (object: T) => Object;
    setWith<T>(
      customizer: (nsValue: any, key: string, nsObject: T) => any,
      path: Path,
      value: any,
      object: T,
    ): Object;
    toPairs(object: Object | $ReadOnlyArray<*>): Array<[string, any]>;
    toPairsIn(object: Object): Array<[string, any]>;
    transform(
      iteratee: OIteratee<*>,
    ): ((
      accumulator: any,
    ) => (collection: Object | $ReadOnlyArray<any>) => any) &
      ((accumulator: any, collection: Object | $ReadOnlyArray<any>) => any);
    transform(
      iteratee: OIteratee<*>,
      accumulator: any,
    ): (collection: Object | $ReadOnlyArray<any>) => any;
    transform(
      iteratee: OIteratee<*>,
      accumulator: any,
      collection: Object | $ReadOnlyArray<any>,
    ): any;
    unset(path: Path): (object: Object) => Object;
    unset(path: Path, object: Object): Object;
    dissoc(path: Path): (object: Object) => Object;
    dissoc(path: Path, object: Object): Object;
    dissocPath(path: Path): (object: Object) => Object;
    dissocPath(path: Path, object: Object): Object;
    update(
      path: Path,
    ): ((updater: Function) => (object: Object) => Object) &
      ((updater: Function, object: Object) => Object);
    update(path: Path, updater: Function): (object: Object) => Object;
    update(path: Path, updater: Function, object: Object): Object;
    updateWith(
      customizer: Function,
    ): ((
      path: Path,
    ) => ((updater: Function) => (object: Object) => Object) &
      ((updater: Function, object: Object) => Object)) &
      ((path: Path, updater: Function) => (object: Object) => Object) &
      ((path: Path, updater: Function, object: Object) => Object);
    updateWith(
      customizer: Function,
      path: Path,
    ): ((updater: Function) => (object: Object) => Object) &
      ((updater: Function, object: Object) => Object);
    updateWith(
      customizer: Function,
      path: Path,
      updater: Function,
    ): (object: Object) => Object;
    updateWith(
      customizer: Function,
      path: Path,
      updater: Function,
      object: Object,
    ): Object;
    values(object: Object): Array<any>;
    valuesIn(object: Object): Array<any>;

    tap<T>(interceptor: (value: T) => any): (value: T) => T;
    tap<T>(interceptor: (value: T) => any, value: T): T;
    thru<T1, T2>(interceptor: (value: T1) => T2): (value: T1) => T2;
    thru<T1, T2>(interceptor: (value: T1) => T2, value: T1): T2;

    // String
    camelCase(string: string): string;
    capitalize(string: string): string;
    deburr(string: string): string;
    endsWith(target: string): (string: string) => boolean;
    endsWith(target: string, string: string): boolean;
    escape(string: string): string;
    escapeRegExp(string: string): string;
    kebabCase(string: string): string;
    lowerCase(string: string): string;
    lowerFirst(string: string): string;
    pad(length: number): (string: string) => string;
    pad(length: number, string: string): string;
    padChars(
      chars: string,
    ): ((length: number) => (string: string) => string) &
      ((length: number, string: string) => string);
    padChars(chars: string, length: number): (string: string) => string;
    padChars(chars: string, length: number, string: string): string;
    padEnd(length: number): (string: string) => string;
    padEnd(length: number, string: string): string;
    padCharsEnd(
      chars: string,
    ): ((length: number) => (string: string) => string) &
      ((length: number, string: string) => string);
    padCharsEnd(chars: string, length: number): (string: string) => string;
    padCharsEnd(chars: string, length: number, string: string): string;
    padStart(length: number): (string: string) => string;
    padStart(length: number, string: string): string;
    padCharsStart(
      chars: string,
    ): ((length: number) => (string: string) => string) &
      ((length: number, string: string) => string);
    padCharsStart(chars: string, length: number): (string: string) => string;
    padCharsStart(chars: string, length: number, string: string): string;
    parseInt(radix: number): (string: string) => number;
    parseInt(radix: number, string: string): number;
    repeat(n: number): (string: string) => string;
    repeat(n: number, string: string): string;
    replace(
      pattern: RegExp | string,
    ): ((
      replacement: ((string: string) => string) | string,
    ) => (string: string) => string) &
      ((
        replacement: ((string: string) => string) | string,
        string: string,
      ) => string);
    replace(
      pattern: RegExp | string,
      replacement: ((string: string) => string) | string,
    ): (string: string) => string;
    replace(
      pattern: RegExp | string,
      replacement: ((string: string) => string) | string,
      string: string,
    ): string;
    snakeCase(string: string): string;
    split(separator: RegExp | string): (string: string) => Array<string>;
    split(separator: RegExp | string, string: string): Array<string>;
    startCase(string: string): string;
    startsWith(target: string): (string: string) => boolean;
    startsWith(target: string, string: string): boolean;
    template(string: string): Function;
    toLower(string: string): string;
    toUpper(string: string): string;
    trim(string: string): string;
    trimChars(chars: string): (string: string) => string;
    trimChars(chars: string, string: string): string;
    trimEnd(string: string): string;
    trimCharsEnd(chars: string): (string: string) => string;
    trimCharsEnd(chars: string, string: string): string;
    trimStart(string: string): string;
    trimCharsStart(chars: string): (string: string) => string;
    trimCharsStart(chars: string, string: string): string;
    truncate(options: TruncateOptions): (string: string) => string;
    truncate(options: TruncateOptions, string: string): string;
    unescape(string: string): string;
    upperCase(string: string): string;
    upperFirst(string: string): string;
    words(string: string): Array<string>;

    // Util
    attempt(func: Function): any;
    bindAll(methodNames: $ReadOnlyArray<string>): (object: Object) => Object;
    bindAll(methodNames: $ReadOnlyArray<string>, object: Object): Object;
    cond(pairs: NestedArray<Function>): Function;
    constant<T>(value: T): () => T;
    always<T>(value: T): () => T;
    defaultTo<T1: void | null, T2>(defaultValue: T2): (value: T1) => T2;
    defaultTo<T1: void | null, T2>(defaultValue: T2, value: T1): T2;
    defaultTo<T1: string | boolean, T2>(defaultValue: T2): (value: T1) => T1;
    defaultTo<T1: string | boolean, T2>(defaultValue: T2, value: T1): T1;
    // NaN is a number instead of its own type, otherwise it would behave like null/void
    defaultTo<T1: number, T2>(defaultValue: T2): (value: T1) => T1 | T2;
    defaultTo<T1: number, T2>(defaultValue: T2, value: T1): T1 | T2;
    flow: $ComposeReverse & ((funcs: $ReadOnlyArray<Function>) => Function);
    pipe: $ComposeReverse & ((funcs: $ReadOnlyArray<Function>) => Function);
    flowRight: $Compose & ((funcs: $ReadOnlyArray<Function>) => Function);
    compose: $Compose & ((funcs: $ReadOnlyArray<Function>) => Function);
    compose(funcs: $ReadOnlyArray<Function>): Function;
    identity<T>(value: T): T;
    iteratee(func: any): Function;
    matches(source: Object): (object: Object) => boolean;
    matches(source: Object, object: Object): boolean;
    matchesProperty(path: Path): (srcValue: any) => Function;
    matchesProperty(path: Path, srcValue: any): Function;
    propEq(path: Path): (srcValue: any) => Function;
    propEq(path: Path, srcValue: any): Function;
    pathEq(path: Path): (srcValue: any) => Function;
    pathEq(path: Path, srcValue: any): Function;
    method(path: Path): Function;
    methodOf(object: Object): Function;
    mixin<T: Function | Object>(
      object: T,
    ): ((source: Object) => (options: { chain: boolean, ... }) => T) &
      ((source: Object, options: { chain: boolean, ... }) => T);
    mixin<T: Function | Object>(
      object: T,
      source: Object,
    ): (options: { chain: boolean, ... }) => T;
    mixin<T: Function | Object>(
      object: T,
      source: Object,
      options: { chain: boolean, ... },
    ): T;
    noConflict(): Lodash;
    noop(...args: $ReadOnlyArray<mixed>): void;
    nthArg(n: number): Function;
    over(iteratees: $ReadOnlyArray<Function>): Function;
    juxt(iteratees: $ReadOnlyArray<Function>): Function;
    overEvery(predicates: $ReadOnlyArray<Function>): Function;
    allPass(predicates: $ReadOnlyArray<Function>): Function;
    overSome(predicates: $ReadOnlyArray<Function>): Function;
    anyPass(predicates: $ReadOnlyArray<Function>): Function;
    property(path: Path): (object: Object | $ReadOnlyArray<any>) => any;
    property(path: Path, object: Object | $ReadOnlyArray<any>): any;
    propertyOf(object: Object): (path: Path) => Function;
    propertyOf(object: Object, path: Path): Function;
    range(start: number): (end: number) => Array<number>;
    range(start: number, end: number): Array<number>;
    rangeStep(
      step: number,
    ): ((start: number) => (end: number) => Array<number>) &
      ((start: number, end: number) => Array<number>);
    rangeStep(step: number, start: number): (end: number) => Array<number>;
    rangeStep(step: number, start: number, end: number): Array<number>;
    rangeRight(start: number): (end: number) => Array<number>;
    rangeRight(start: number, end: number): Array<number>;
    rangeStepRight(
      step: number,
    ): ((start: number) => (end: number) => Array<number>) &
      ((start: number, end: number) => Array<number>);
    rangeStepRight(step: number, start: number): (end: number) => Array<number>;
    rangeStepRight(step: number, start: number, end: number): Array<number>;
    runInContext(context: Object): Function;

    stubArray(): Array<*>;
    stubFalse(): false;
    F(): false;
    stubObject(): { ... };
    stubString(): '';
    stubTrue(): true;
    T(): true;
    times<T>(iteratee: (i: number) => T): (n: number) => Array<T>;
    times<T>(iteratee: (i: number) => T, n: number): Array<T>;
    toPath(value: any): Array<string>;
    uniqueId(prefix: string): string;

    __: any;
    placeholder: any;

    convert(options: {
      cap?: boolean,
      curry?: boolean,
      fixed?: boolean,
      immutable?: boolean,
      rearg?: boolean,
      ...
    }): void;

    // Properties
    VERSION: string;
    templateSettings: TemplateSettings;
  }

  declare module.exports: Lodash;
}
