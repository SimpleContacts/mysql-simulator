// @flow

import Column from './sim/Column';
import Database from './sim/Database';
import ForeignKey from './sim/ForeignKey';
import type { IndexType } from './sim/Index';
import Index from './sim/Index';
import { applySql, applySqlFile, applySqlFiles, dumpDb, simulate } from './sim/lib';
import Table from './sim/Table';

export type { Column, ForeignKey, Index, IndexType };

export default simulate;
export { applySql, applySqlFile, applySqlFiles, Database, dumpDb, simulate, Table };
