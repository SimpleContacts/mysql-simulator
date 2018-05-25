// @flow

import Column from './sim/Column';
import Database from './sim/Database';
import ForeignKey from './sim/ForeignKey';
import Index from './sim/Index';
import type { IndexType } from './sim/Index';
import { applySql, applySqlFile, applySqlFiles, dumpDb, simulate } from './sim/lib';
import Table from './sim/Table';

export type { IndexType };
export { applySql, applySqlFile, applySqlFiles, dumpDb, simulate, Column, Database, ForeignKey, Index, Table };
export default simulate;
