import type { SqliteMigration } from './types';

/**
 * Initial offline-first schema.
 *
 * Domain notes:
 * - `cards.front`/`cards.back` are the source of truth for user-authored content.
 * - `card_variants` stores presentation type only. The domain maps original to
 *   front/back and reverse to back/front.
 * - `review_items` points to `card_variants`, making the variant the official
 *   reviewable unit.
 * - Media can be shared by the physical card or scoped to a specific variant.
 */
export const initialSchemaMigration: SqliteMigration = {
  version: '001_initial_schema',
  description: 'Create initial offline-first flashcards schema.',
  statements: [
    'PRAGMA foreign_keys = ON',
    `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
)`,
    `
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`,
    `
CREATE TABLE IF NOT EXISTS local_profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  base_language_preference TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`,
    `
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT
)`,
    `
CREATE TABLE IF NOT EXISTS decks (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  auto_generate_reverse_cards INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  FOREIGN KEY (collection_id) REFERENCES collections (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
)`,
    `
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  deck_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vocabulary', 'cloze', 'listening', 'typing', 'pronunciation')),
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT,
  FOREIGN KEY (deck_id) REFERENCES decks (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
)`,
    `
CREATE TABLE IF NOT EXISTS card_variants (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  variant_type TEXT NOT NULL CHECK (variant_type IN ('original', 'reverse')),
  is_generated INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (card_id, variant_type),
  UNIQUE (id, card_id),
  FOREIGN KEY (card_id) REFERENCES cards (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
)`,
    `
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  card_variant_id TEXT,
  side TEXT NOT NULL CHECK (side IN ('front', 'back')),
  type TEXT NOT NULL CHECK (type IN ('image', 'audio', 'recording', 'tts')),
  uri TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (card_id) REFERENCES cards (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (card_variant_id, card_id) REFERENCES card_variants (id, card_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
)`,
    `
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (normalized_name)
)`,
    `
CREATE TABLE IF NOT EXISTS card_tags (
  card_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (card_id, tag_id),
  FOREIGN KEY (card_id) REFERENCES cards (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
)`,
    `
CREATE TABLE IF NOT EXISTS review_items (
  id TEXT PRIMARY KEY,
  card_variant_id TEXT NOT NULL,
  scheduler_type TEXT NOT NULL DEFAULT 'sm2',
  scheduler_version TEXT NOT NULL DEFAULT 'v1',
  repetitions INTEGER NOT NULL DEFAULT 0,
  interval_days INTEGER NOT NULL DEFAULT 0,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  next_review_at TEXT NOT NULL,
  last_reviewed_at TEXT,
  lapses INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (card_variant_id),
  FOREIGN KEY (card_variant_id) REFERENCES card_variants (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
)`,
    `
CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  collection_id TEXT,
  deck_id TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('collection', 'deck', 'tag', 'mixed')),
  cards_reviewed INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (collection_id) REFERENCES collections (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  FOREIGN KEY (deck_id) REFERENCES decks (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
)`,
    `
CREATE TABLE IF NOT EXISTS review_logs (
  id TEXT PRIMARY KEY,
  review_item_id TEXT NOT NULL,
  session_id TEXT,
  rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  reviewed_at TEXT NOT NULL,
  time_spent_ms INTEGER NOT NULL,
  previous_interval_days INTEGER NOT NULL,
  next_interval_days INTEGER NOT NULL,
  previous_ease_factor REAL NOT NULL,
  next_ease_factor REAL NOT NULL,
  FOREIGN KEY (review_item_id) REFERENCES review_items (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES study_sessions (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
)`,
    'CREATE INDEX IF NOT EXISTS idx_decks_collection_id ON decks (collection_id)',
    'CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards (deck_id)',
    'CREATE INDEX IF NOT EXISTS idx_card_variants_card_id ON card_variants (card_id)',
    'CREATE INDEX IF NOT EXISTS idx_media_card_id ON media (card_id)',
    'CREATE INDEX IF NOT EXISTS idx_media_card_variant_id ON media (card_variant_id)',
    'CREATE INDEX IF NOT EXISTS idx_card_tags_tag_id ON card_tags (tag_id)',
    'CREATE INDEX IF NOT EXISTS idx_review_items_due ON review_items (next_review_at)',
    'CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions (started_at)',
    'CREATE INDEX IF NOT EXISTS idx_review_logs_reviewed_at ON review_logs (reviewed_at)',
    'CREATE INDEX IF NOT EXISTS idx_review_logs_session_id ON review_logs (session_id)',
  ],
} as const;
