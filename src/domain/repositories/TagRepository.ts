import type { Tag } from '@/domain/entities/Tag';

export type TagRepository = {
  /**
   * Creates the tag if it does not exist yet (key: `collectionId` + `normalizedName`) and
   * always returns the stored canonical row — the existing one when one with the same key
   * already exists.
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
