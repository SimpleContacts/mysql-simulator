// @flow

import Database from './sim/Database';
import {
  applySql,
  applySqlFile,
  applySqlFiles,
  dumpDb,
  simulate,
} from './sim/lib';
import Table from './sim/Table';
import type { Column, ForeignKey, Index, IndexType } from './sim/types';

export type { Column, ForeignKey, Index, IndexType };

export default simulate;
export {
  applySql,
  applySqlFile,
  applySqlFiles,
  Database,
  dumpDb,
  simulate,
  Table,
};
