import { describe, expect, it } from '@jest/globals';

import { clozeMultiMigration } from './003_cloze_multi';

describe('clozeMultiMigration', () => {
  it('adds the structured cloze_data column to cards', () => {
    expect(clozeMultiMigration.version).toBe('003_cloze_multi');
    expect(clozeMultiMigration.statements).toEqual([
      'ALTER TABLE cards ADD COLUMN cloze_data TEXT',
    ]);
  });

  it('is additive: no data backfill or table swap', () => {
    expect(clozeMultiMigration.migrateData).toBeUndefined();
    expect(clozeMultiMigration.finalizeStatements).toBeUndefined();
  });
});
