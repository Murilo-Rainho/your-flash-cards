import type { Tag } from '@/domain/entities/Tag';

import { SQLiteTagRepository } from './SQLiteTagRepository';
import type { SqliteDatabaseConnection } from '../types';

class FakeTagDatabase {
  runCalls: Array<{ source: string; params: unknown[] }> = [];
  allCalls: Array<{ source: string; params: unknown[] }> = [];
  firstCalls: Array<{ source: string; params: unknown[] }> = [];

  allRows: unknown[] = [];
  firstRow: unknown | null = null;

  async execAsync(): Promise<void> {}

  async runAsync(source: string, ...params: unknown[]): Promise<unknown> {
    this.runCalls.push({ source, params });
    return {};
  }

  async getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]> {
    this.allCalls.push({ source, params });
    return this.allRows as T[];
  }

  async getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null> {
    this.firstCalls.push({ source, params });
    return this.firstRow as T | null;
  }

  async withTransactionAsync(task: () => Promise<void>): Promise<void> {
    await task();
  }

  asConnection(): SqliteDatabaseConnection {
    return this as unknown as SqliteDatabaseConnection;
  }
}

function createRepository(db: FakeTagDatabase): SQLiteTagRepository {
  return new SQLiteTagRepository(async () => db.asConnection());
}

const tag: Tag = {
  id: 'tag-1',
  name: 'Travel',
  normalizedName: 'travel',
  createdAt: '2026-06-05T12:00:00.000Z',
  updatedAt: '2026-06-05T12:00:00.000Z',
};

describe('SQLiteTagRepository', () => {
  it('faz upsert por normalized_name e retorna a linha canônica armazenada', async () => {
    const db = new FakeTagDatabase();
    // Simula uma tag já existente com a mesma chave normalizada, porém id distinto.
    db.firstRow = {
      id: 'tag-existente',
      name: 'Travel',
      normalizedName: 'travel',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-06-05T12:00:00.000Z',
    };

    await expect(createRepository(db).createIfAbsent(tag)).resolves.toEqual({
      id: 'tag-existente',
      name: 'Travel',
      normalizedName: 'travel',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-06-05T12:00:00.000Z',
    });

    expect(db.runCalls[0]?.source).toContain('INSERT OR IGNORE INTO tags');
    expect(db.runCalls[1]?.source).toContain('UPDATE tags');
    expect(db.firstCalls[0]?.source).toContain('WHERE normalized_name = $normalizedName');
    expect(db.firstCalls[0]?.params[0]).toEqual({ $normalizedName: 'travel' });
  });

  it('retorna a própria tag quando nenhuma linha é encontrada após o insert', async () => {
    const db = new FakeTagDatabase();
    db.firstRow = null;

    await expect(createRepository(db).createIfAbsent(tag)).resolves.toBe(tag);
  });

  it('lista todas as tags ordenadas por nome e mapeia os campos', async () => {
    const db = new FakeTagDatabase();
    db.allRows = [
      {
        id: 'tag-1',
        name: 'Travel',
        normalizedName: 'travel',
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-03T12:00:00.000Z',
      },
    ];

    await expect(createRepository(db).listAll()).resolves.toEqual([
      {
        id: 'tag-1',
        name: 'Travel',
        normalizedName: 'travel',
        createdAt: '2026-06-01T12:00:00.000Z',
        updatedAt: '2026-06-03T12:00:00.000Z',
      },
    ]);

    expect(db.allCalls[0]?.source).toContain('FROM tags');
    expect(db.allCalls[0]?.source).toContain('ORDER BY name COLLATE NOCASE ASC');
  });
});
