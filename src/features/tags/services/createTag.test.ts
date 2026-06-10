import type { Tag } from '@/domain/entities/Tag';
import type { TagRepository } from '@/domain/repositories/TagRepository';

import { createTag, isCreateTagInputError, type CreateTagInputError } from './createTag';

const COLLECTION_ID = 'collection-pt-en';

class FakeTagRepository implements TagRepository {
  tags: Tag[] = [];

  async createIfAbsent(tag: Tag): Promise<Tag> {
    const existing = this.tags.find(
      (stored) =>
        stored.collectionId === tag.collectionId && stored.normalizedName === tag.normalizedName,
    );

    if (existing) {
      return existing;
    }

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

function createIdFactory() {
  let count = 0;

  return () => {
    count += 1;
    return `tag-${count}`;
  };
}

function createOptions(repository = new FakeTagRepository()) {
  return {
    repository,
    idFactory: createIdFactory(),
    now: () => new Date('2026-06-05T12:00:00.000Z'),
  };
}

describe('createTag', () => {
  it('cria uma tag normalizando nome e chave na collection', async () => {
    const repository = new FakeTagRepository();

    const tag = await createTag(
      { collectionId: COLLECTION_ID, name: '  Phrasal   Verbs ' },
      createOptions(repository),
    );

    expect(tag).toEqual({
      id: 'tag-1',
      collectionId: COLLECTION_ID,
      name: 'Phrasal Verbs',
      normalizedName: 'phrasal verbs',
      createdAt: '2026-06-05T12:00:00.000Z',
      updatedAt: '2026-06-05T12:00:00.000Z',
    });
    expect(repository.tags).toHaveLength(1);
  });

  it('reaproveita a tag existente quando a chave normalizada coincide na mesma collection', async () => {
    const repository = new FakeTagRepository();

    const first = await createTag(
      { collectionId: COLLECTION_ID, name: 'verb' },
      createOptions(repository),
    );
    const second = await createTag(
      { collectionId: COLLECTION_ID, name: '  Verb ' },
      createOptions(repository),
    );

    expect(second.id).toBe(first.id);
    expect(repository.tags).toHaveLength(1);
  });

  it('permite o mesmo nome em collections diferentes', async () => {
    const repository = new FakeTagRepository();
    const options = createOptions(repository);

    const englishTag = await createTag(
      { collectionId: 'collection-pt-en', name: 'restaurant' },
      options,
    );
    const spanishTag = await createTag(
      { collectionId: 'collection-pt-es', name: 'restaurant' },
      options,
    );

    expect(englishTag.id).not.toBe(spanishTag.id);
    expect(repository.tags).toHaveLength(2);
  });

  it('rejeita collection ausente com erro de campo', async () => {
    expect.assertions(2);

    try {
      await createTag({ collectionId: '', name: 'travel' }, createOptions());
    } catch (error) {
      expect(isCreateTagInputError(error)).toBe(true);
      expect((error as CreateTagInputError).fieldErrors.collectionId).toBeDefined();
    }
  });

  it('rejeita nome vazio com erro de campo', async () => {
    expect.assertions(2);

    try {
      await createTag({ collectionId: COLLECTION_ID, name: '   ' }, createOptions());
    } catch (error) {
      expect(isCreateTagInputError(error)).toBe(true);
      expect((error as CreateTagInputError).fieldErrors.name).toBeDefined();
    }
  });

  it('rejeita nome acima do limite de caracteres', async () => {
    expect.assertions(1);

    try {
      await createTag({ collectionId: COLLECTION_ID, name: 'a'.repeat(33) }, createOptions());
    } catch (error) {
      expect(isCreateTagInputError(error)).toBe(true);
    }
  });
});
