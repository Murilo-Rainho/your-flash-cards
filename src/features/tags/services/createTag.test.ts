import type { Tag } from '@/domain/entities/Tag';
import type { TagRepository } from '@/domain/repositories/TagRepository';

import { createTag, isCreateTagInputError, type CreateTagInputError } from './createTag';

class FakeTagRepository implements TagRepository {
  readonly tags: Tag[] = [];

  async createIfAbsent(tag: Tag): Promise<Tag> {
    const existing = this.tags.find((stored) => stored.normalizedName === tag.normalizedName);

    if (existing) {
      return existing;
    }

    this.tags.push(tag);
    return tag;
  }

  async listAll(): Promise<Tag[]> {
    return this.tags;
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
  it('cria uma tag normalizando nome e chave', async () => {
    const repository = new FakeTagRepository();

    const tag = await createTag({ name: '  Phrasal   Verbs ' }, createOptions(repository));

    expect(tag).toEqual({
      id: 'tag-1',
      name: 'Phrasal Verbs',
      normalizedName: 'phrasal verbs',
      createdAt: '2026-06-05T12:00:00.000Z',
      updatedAt: '2026-06-05T12:00:00.000Z',
    });
    expect(repository.tags).toHaveLength(1);
  });

  it('reaproveita a tag existente quando a chave normalizada coincide (Verb vs verb)', async () => {
    const repository = new FakeTagRepository();

    const first = await createTag({ name: 'verb' }, createOptions(repository));
    const second = await createTag({ name: '  Verb ' }, createOptions(repository));

    expect(second.id).toBe(first.id);
    expect(repository.tags).toHaveLength(1);
  });

  it('rejeita nome vazio com erro de campo', async () => {
    expect.assertions(2);

    try {
      await createTag({ name: '   ' }, createOptions());
    } catch (error) {
      expect(isCreateTagInputError(error)).toBe(true);
      expect((error as CreateTagInputError).fieldErrors.name).toBeDefined();
    }
  });

  it('rejeita nome acima do limite de caracteres', async () => {
    expect.assertions(1);

    try {
      await createTag({ name: 'a'.repeat(33) }, createOptions());
    } catch (error) {
      expect(isCreateTagInputError(error)).toBe(true);
    }
  });
});
