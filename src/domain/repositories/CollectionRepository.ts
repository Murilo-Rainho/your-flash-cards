import type { Collection } from '@/domain/entities/Collection';

/**
 * Local read/write port for collections.
 *
 * Concrete implementations may use SQLite, but features depend only on this contract.
 */
export type CollectionRepository = {
  create(collection: Collection): Promise<Collection>;
  update(collection: Collection): Promise<Collection>;
  listActive(): Promise<Collection[]>;
  findById(id: string): Promise<Collection | null>;
};
