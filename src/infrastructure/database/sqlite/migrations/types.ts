import type { SqliteDatabaseConnection } from '../types';

export type SqliteMigration = {
  version: string;
  description: string;
  statements: readonly string[];
  /** Runs after `statements` and before `finalizeStatements` (e.g. data backfill). */
  migrateData?: (db: SqliteDatabaseConnection) => Promise<void>;
  /** Runs after `migrateData` when present (e.g. table swap). */
  finalizeStatements?: readonly string[];
};
