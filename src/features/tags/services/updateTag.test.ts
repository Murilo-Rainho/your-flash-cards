import type { Tag } from '@/domain/entities/Tag';
import type { TagRepository } from '@/domain/repositories/TagRepository';

import { isUpdateTagInputError, updateTag, type UpdateTagInputError } from './updateTag';

const COLLECTION_ID = 'collection-pt-en';

const existingTag: Tag = {
  id: 'tag-1',
  collectionId: COLLECTION_ID,
  name: 'Travel',
  normalizedName: 'travel',
  createdAt: '2026-06-01T12:00:00.000Z',
  updatedAt: '2026-06-01T12:00:00.000Z',
};

class FakeTagRepository implements TagRepository {
  tags: Tag[] = [];

  async createIfAbsent(tag: Tag): Promise<Tag> {
    this.tags.push(tag);
    return tag;
  }

  async listByCollection(collectionId: string): Promise<Tag[]> {
    return this.tags.filter((tag) => tag.collectionId === collectionId);
  }

  async findById(id: string): Promise<Tag | null> {
    return this.tags.find((tag) => tag.id === id) ?? null;
  }

  async findByCollectionAndNormalizedName(
    collectionId: string,
    normalizedName: string,
  ): Promise<Tag | null> {
    return (
      this.tags.find(
        (tag) => tag.collectionId === collectionId && tag.normalizedName === normalizedName,
      ) ?? null
    );
  }

  async update(tag: Tag): Promise<Tag> {
    const index = this.tags.findIndex((stored) => stored.id === tag.id);

    if (index >= 0) {
      this.tags[index] = tag;
    }

    return tag;
  }

  async delete(id: string): Promise<void> {
    this.tags = this.tags.filter((tag) => tag.id !== id);
  }
}

function createOptions(repository = new FakeTagRepository()) {
  return {
    repository,
    now: () => new Date('2026-06-05T12:00:00.000Z'),
  };
}

describe('updateTag', () => {
  it('atualiza o nome e a chave normalizada da tag', async () => {
    const repository = new FakeTagRepository();
    repository.tags.push(existingTag);

    const updated = await updateTag(
      { id: 'tag-1', name: '  Business ' },
      createOptions(repository),
    );

    expect(updated).toEqual({
      id: 'tag-1',
      collectionId: COLLECTION_ID,
      name: 'Business',
      normalizedName: 'business',
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-05T12:00:00.000Z',
    });
  });

  it('permite renomear mantendo a mesma chave normalizada', async () => {
    const repository = new FakeTagRepository();
    repository.tags.push(existingTag);

    const updated = await updateTag({ id: 'tag-1', name: 'TRAVEL' }, createOptions(repository));

    expect(updated.name).toBe('TRAVEL');
    expect(updated.normalizedName).toBe('travel');
  });

  it('rejeita conflito com outra tag na mesma collection', async () => {
    const repository = new FakeTagRepository();
    repository.tags.push(existingTag, {
      id: 'tag-2',
      collectionId: COLLECTION_ID,
      name: 'Food',
      normalizedName: 'food',
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z',
    });

    expect.assertions(2);

    try {
      await updateTag({ id: 'tag-1', name: 'food' }, createOptions(repository));
    } catch (error) {
      expect(isUpdateTagInputError(error)).toBe(true);
      expect((error as UpdateTagInputError).fieldErrors.name).toBeDefined();
    }
  });

  it('rejeita tag inexistente', async () => {
    expect.assertions(2);

    try {
      await updateTag({ id: 'missing', name: 'Travel' }, createOptions());
    } catch (error) {
      expect(isUpdateTagInputError(error)).toBe(true);
      expect((error as UpdateTagInputError).fieldErrors.name).toBeDefined();
    }
  });

  it('rejeita nome vazio', async () => {
    const repository = new FakeTagRepository();
    repository.tags.push(existingTag);

    expect.assertions(2);

    try {
      await updateTag({ id: 'tag-1', name: '   ' }, createOptions(repository));
    } catch (error) {
      expect(isUpdateTagInputError(error)).toBe(true);
      expect((error as UpdateTagInputError).fieldErrors.name).toBeDefined();
    }
  });
});
