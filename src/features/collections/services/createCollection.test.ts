import type { Collection } from '@/domain/entities/Collection';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';

import { createCollection } from './createCollection';

class FakeCollectionRepository implements CollectionRepository {
  collections: Collection[] = [];

  async create(collection: Collection): Promise<Collection> {
    this.collections.push(collection);
    return collection;
  }

  async listActive(): Promise<Collection[]> {
    return this.collections;
  }

  async findById(id: string): Promise<Collection | null> {
    return this.collections.find((collection) => collection.id === id) ?? null;
  }
}

describe('createCollection', () => {
  it('trims input and creates a local collection with injected id and timestamp', async () => {
    const repository = new FakeCollectionRepository();

    await expect(
      createCollection(
        {
          name: '  Português para Inglês  ',
          baseLanguage: 'pt',
          targetLanguage: 'en',
          description: '   ',
        },
        {
          repository,
          idFactory: () => 'collection-fixed',
          now: () => new Date('2026-06-03T12:00:00.000Z'),
        },
      ),
    ).resolves.toEqual({
      id: 'collection-fixed',
      name: 'Português para Inglês',
      baseLanguage: 'pt',
      targetLanguage: 'en',
      description: undefined,
      createdAt: '2026-06-03T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    });

    expect(repository.collections).toHaveLength(1);
  });

  it('rejects missing name and equal language pair before persisting', async () => {
    const repository = new FakeCollectionRepository();

    await expect(
      createCollection(
        {
          name: '   ',
          baseLanguage: 'pt',
          targetLanguage: 'pt',
          description: '',
        },
        { repository },
      ),
    ).rejects.toMatchObject({
      fieldErrors: {
        name: 'Informe o nome da coleção.',
        targetLanguage: 'O idioma alvo deve ser diferente do idioma base.',
      },
    });

    expect(repository.collections).toEqual([]);
  });
});
