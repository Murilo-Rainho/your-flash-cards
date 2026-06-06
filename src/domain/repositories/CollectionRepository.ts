import type { Collection } from '@/domain/entities/Collection';

/**
 * Porta local de escrita/leitura de coleções.
 *
 * Implementações concretas podem usar SQLite, mas features dependem apenas deste contrato.
 */
export type CollectionRepository = {
  create(collection: Collection): Promise<Collection>;
  update(collection: Collection): Promise<Collection>;
  listActive(): Promise<Collection[]>;
  findById(id: string): Promise<Collection | null>;
};
