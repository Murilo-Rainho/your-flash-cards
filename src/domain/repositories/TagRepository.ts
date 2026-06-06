import type { Tag } from '@/domain/entities/Tag';

export type TagRepository = {
  /**
   * Cria a tag se ainda não existir (chave: `collectionId` + `normalizedName`) e retorna
   * sempre a linha canônica armazenada — a existente quando já houver uma com a mesma chave.
   */
  createIfAbsent(tag: Tag): Promise<Tag>;
  listByCollection(collectionId: string): Promise<Tag[]>;
  findById(id: string): Promise<Tag | null>;
  findByCollectionAndNormalizedName(
    collectionId: string,
    normalizedName: string,
  ): Promise<Tag | null>;
  update(tag: Tag): Promise<Tag>;
  delete(id: string): Promise<void>;
};
