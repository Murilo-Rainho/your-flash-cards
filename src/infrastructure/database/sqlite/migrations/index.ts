import { initialSchemaMigration } from './001_initial_schema';
import { tagsCollectionScopeMigration } from './002_tags_collection_scope';

export type { SqliteMigration } from './types';

export const sqliteMigrations = [initialSchemaMigration, tagsCollectionScopeMigration] as const;
