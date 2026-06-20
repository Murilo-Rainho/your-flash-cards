import { describe, expect, it } from '@jest/globals';

import type { Tag } from '@/domain/entities/Tag';
import type { TagRepository } from '@/domain/repositories/TagRepository';

import { deleteTag } from './deleteTag';

class FakeTagRepository implements TagRepository {
  tags: Tag[] = [];

  async createIfAbsent(tag: Tag): Promise<Tag> {
    this.tags.push(tag);
    return tag;
  }

  async listByCollection(): Promise<Tag[]> {
    return this.tags;
  }

  async findById(id: string): Promise<Tag | null> {
    return this.tags.find((tag) => tag.id === id) ?? null;
  }

  async findByCollectionAndNormalizedName(): Promise<Tag | null> {
    return null;
  }

  async update(tag: Tag): Promise<Tag> {
    return tag;
  }

  async delete(id: string): Promise<void> {
    this.tags = this.tags.filter((tag) => tag.id !== id);
  }
}

describe('deleteTag', () => {
  it('removes tag by id', async () => {
    const repository = new FakeTagRepository();
    repository.tags.push({
      id: 'tag-1',
      collectionId: 'collection-pt-en',
      name: 'Travel',
      normalizedName: 'travel',
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z',
    });

    await deleteTag('tag-1', { repository });

    expect(repository.tags).toHaveLength(0);
  });

  it('ignores empty id', async () => {
    const repository = new FakeTagRepository();
    repository.tags.push({
      id: 'tag-1',
      collectionId: 'collection-pt-en',
      name: 'Travel',
      normalizedName: 'travel',
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z',
    });

    await deleteTag('   ', { repository });

    expect(repository.tags).toHaveLength(1);
  });
});
