import { initialSchemaMigration } from './001_initial_schema';
import { tagsCollectionScopeMigration } from './002_tags_collection_scope';
import { clozeMultiMigration } from './003_cloze_multi';
import { cardListSearchMigration } from './004_card_list_search';

export type { SqliteMigration } from './types';

export const sqliteMigrations = [
  initialSchemaMigration,
  tagsCollectionScopeMigration,
  clozeMultiMigration,
  cardListSearchMigration,
] as const;
