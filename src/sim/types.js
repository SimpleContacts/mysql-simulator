// @flow

export type ForeignKey = {|
  +name: string,
  +columns: Array<string>,
  +reference: {|
    +table: string,
    +columns: Array<string>,
  |},
|};
