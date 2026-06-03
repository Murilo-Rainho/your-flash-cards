import { sqliteMigrations } from './migrations';
import type { SqliteDatabaseConnection } from './types';

const CREATE_MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
)`;

type AppliedMigrationRow = {
  version: string;
};

export async function migrateSqliteDatabase(db: SqliteDatabaseConnection): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON');
  await db.execAsync(CREATE_MIGRATIONS_TABLE_SQL);

  for (const migration of sqliteMigrations) {
    const appliedMigration = await db.getFirstAsync<AppliedMigrationRow>(
      'SELECT version FROM schema_migrations WHERE version = ?',
      [migration.version],
    );

    if (appliedMigration) {
      continue;
    }

    await db.withTransactionAsync(async () => {
      for (const statement of migration.statements) {
        const trimmedStatement = statement.trim();

        if (!trimmedStatement || trimmedStatement === 'PRAGMA foreign_keys = ON') {
          continue;
        }

        await db.execAsync(trimmedStatement);
      }

      await db.runAsync('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)', [
        migration.version,
        new Date().toISOString(),
      ]);
    });
  }
}
