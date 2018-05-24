// @flow

import { emptyDb } from './sim/core';
import {
  applySql,
  applySqlFile,
  applySqlFiles,
  dumpDb,
  simulate,
} from './sim/lib';
import type {
  Column,
  Database,
  ForeignKey,
  Index,
  IndexType,
  Table,
} from './sim/types';

export type { Column, Database, ForeignKey, Index, IndexType, Table };

export default simulate;
export { applySql, applySqlFile, applySqlFiles, dumpDb, emptyDb, simulate };
