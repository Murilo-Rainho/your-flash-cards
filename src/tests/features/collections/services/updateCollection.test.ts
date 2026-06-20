import { describe, expect, it } from '@jest/globals';

import type { Collection } from '@/domain/entities/Collection';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';

import { updateCollection } from '@/features/collections/services/updateCollection';

class FakeCollectionRepository implements CollectionRepository {
  collections: Collection[] = [];

  async create(collection: Collection): Promise<Collection> {
    this.collections.push(collection);
    return collection;
  }

  async update(collection: Collection): Promise<Collection> {
    this.collections = this.collections.map((existing) =>
      existing.id === collection.id ? collection : existing,
    );
    return collection;
  }

  async listActive(): Promise<Collection[]> {
    return this.collections;
  }

  async findById(id: string): Promise<Collection | null> {
    return this.collections.find((collection) => collection.id === id) ?? null;
  }
}

function seedCollection(repository: FakeCollectionRepository): Collection {
  const collection: Collection = {
    id: 'collection-1',
    name: 'Português para Inglês',
    baseLanguage: 'pt',
    targetLanguage: 'en',
    description: 'Original',
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
  };
  repository.collections.push(collection);
  return collection;
}

describe('updateCollection', () => {
  it('updates only name and description, keeping languages and bumping updatedAt', async () => {
    const repository = new FakeCollectionRepository();
    seedCollection(repository);

    await expect(
      updateCollection(
        {
          id: 'collection-1',
          name: '  Novo nome  ',
          description: '   ',
        },
        {
          repository,
          now: () => new Date('2026-06-05T12:00:00.000Z'),
        },
      ),
    ).resolves.toEqual({
      id: 'collection-1',
      name: 'Novo nome',
      baseLanguage: 'pt',
      targetLanguage: 'en',
      description: undefined,
      createdAt: '2026-06-01T10:00:00.000Z',
      updatedAt: '2026-06-05T12:00:00.000Z',
    });

    expect(repository.collections[0]?.name).toBe('Novo nome');
  });

  it('rejects an empty name before persisting', async () => {
    const repository = new FakeCollectionRepository();
    seedCollection(repository);

    await expect(
      updateCollection({ id: 'collection-1', name: '   ' }, { repository }),
    ).rejects.toMatchObject({
      fieldErrors: { name: 'Informe o nome da coleção.' },
    });

    expect(repository.collections[0]?.name).toBe('Português para Inglês');
  });

  it('rejects when the collection does not exist', async () => {
    const repository = new FakeCollectionRepository();

    await expect(
      updateCollection({ id: 'missing', name: 'Qualquer' }, { repository }),
    ).rejects.toMatchObject({
      fieldErrors: { name: 'Coleção não encontrada.' },
    });
  });
});
