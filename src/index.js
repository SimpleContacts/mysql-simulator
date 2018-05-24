// @flow

import { emptyDb } from './sim/core';
import { applySql, applySqlFile, dumpDb } from './sim/lib';
import type {
  Column,
  Database,
  ForeignKey,
  Index,
  IndexType,
  Table,
} from './sim/types';

export type { Column, Database, ForeignKey, Index, IndexType, Table };

export default {
  applySql,
  applySqlFile,
  dumpDb,
  emptyDb,
};
