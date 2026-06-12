import { describe, expect, it } from '@jest/globals';

import { initialSchemaMigration } from './001_initial_schema';

const migrationSql = initialSchemaMigration.statements.join('\n');
const compactSql = migrationSql.replace(/\s+/g, ' ');

function createTableSql(tableName: string): string {
  const statement = initialSchemaMigration.statements.find((migrationStatement) =>
    migrationStatement.trimStart().startsWith(`CREATE TABLE IF NOT EXISTS ${tableName}`),
  );

  if (!statement) {
    throw new Error(`CREATE TABLE statement not found for ${tableName}`);
  }

  return statement.replace(/\s+/g, ' ');
}

describe('initialSchemaMigration', () => {
  it('models card variants as presentation metadata without duplicated content', () => {
    const cardVariantsSql = createTableSql('card_variants');

    expect(cardVariantsSql).toContain('card_id TEXT NOT NULL');
    expect(cardVariantsSql).toContain(
      "variant_type TEXT NOT NULL CHECK (variant_type IN ('original', 'reverse'))",
    );
    expect(cardVariantsSql).toContain('UNIQUE (card_id, variant_type)');
    expect(cardVariantsSql).not.toContain('front TEXT');
    expect(cardVariantsSql).not.toContain('back TEXT');
  });

  it('makes review items point to variants with scheduler versioning', () => {
    const reviewItemsSql = createTableSql('review_items');

    expect(reviewItemsSql).toContain('card_variant_id TEXT NOT NULL');
    expect(reviewItemsSql).toContain("scheduler_type TEXT NOT NULL DEFAULT 'sm2'");
    expect(reviewItemsSql).toContain("scheduler_version TEXT NOT NULL DEFAULT 'v1'");
    expect(reviewItemsSql).toContain('UNIQUE (card_variant_id)');
    expect(reviewItemsSql).not.toContain('card_id TEXT');
  });

  it('adds app settings and normalized tags', () => {
    const appSettingsSql = createTableSql('app_settings');
    const tagsSql = createTableSql('tags');

    expect(appSettingsSql).toContain('key TEXT PRIMARY KEY');
    expect(appSettingsSql).toContain('value TEXT NOT NULL');
    expect(tagsSql).toContain('normalized_name TEXT NOT NULL');
    expect(tagsSql).toContain('UNIQUE (normalized_name)');
  });

  it('captures study session aggregates and optional review log sessions', () => {
    const studySessionsSql = createTableSql('study_sessions');
    const reviewLogsSql = createTableSql('review_logs');

    expect(studySessionsSql).toContain('cards_reviewed INTEGER NOT NULL DEFAULT 0');
    expect(studySessionsSql).toContain('duration_ms INTEGER NOT NULL DEFAULT 0');
    expect(studySessionsSql).toContain(
      "mode TEXT NOT NULL CHECK (mode IN ('collection', 'deck', 'tag', 'mixed'))",
    );
    expect(reviewLogsSql).toContain('session_id TEXT');
  });

  it('creates the requested indexes', () => {
    expect(compactSql).toContain(
      'CREATE INDEX IF NOT EXISTS idx_decks_collection_id ON decks (collection_id)',
    );
    expect(compactSql).toContain('CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards (deck_id)');
    expect(compactSql).toContain(
      'CREATE INDEX IF NOT EXISTS idx_card_variants_card_id ON card_variants (card_id)',
    );
    expect(compactSql).toContain('CREATE INDEX IF NOT EXISTS idx_media_card_id ON media (card_id)');
    expect(compactSql).toContain(
      'CREATE INDEX IF NOT EXISTS idx_media_card_variant_id ON media (card_variant_id)',
    );
    expect(compactSql).toContain(
      'CREATE INDEX IF NOT EXISTS idx_card_tags_tag_id ON card_tags (tag_id)',
    );
    expect(compactSql).toContain(
      'CREATE INDEX IF NOT EXISTS idx_review_items_due ON review_items (next_review_at)',
    );
    expect(compactSql).toContain(
      'CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions (started_at)',
    );
    expect(compactSql).toContain(
      'CREATE INDEX IF NOT EXISTS idx_review_logs_reviewed_at ON review_logs (reviewed_at)',
    );
    expect(compactSql).toContain(
      'CREATE INDEX IF NOT EXISTS idx_review_logs_session_id ON review_logs (session_id)',
    );
  });
});
