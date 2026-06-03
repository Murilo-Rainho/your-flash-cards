import { initialSchemaMigration } from './001_initial_schema';

export type { SqliteMigration } from './types';

export const sqliteMigrations = [initialSchemaMigration] as const;
