// @flow strict

import Column from './sim/Column';
import { applySql, applySqlFile, applySqlFiles, getMigrations, simulate } from './sim/core';
import Database from './sim/Database';
import type { DataType } from './ast';
import ForeignKey from './sim/ForeignKey';
import Index from './sim/Index';
import type { IndexType } from './sim/Index';
import Table from './sim/Table';

export type { DataType, IndexType };
export { applySql, applySqlFile, applySqlFiles, getMigrations, simulate, Column, Database, ForeignKey, Index, Table };
export type { MigrationInfo } from './sim/core';
export default simulate;
