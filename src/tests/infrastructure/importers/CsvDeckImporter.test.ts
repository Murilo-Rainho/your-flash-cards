import { describe, expect, it } from '@jest/globals';

import { IMPORT_SOURCES } from '@/domain/importers/DeckImporter';
import { CsvDeckImporter, getCsvDeckImporter } from '@/infrastructure/importers/CsvDeckImporter';

describe('CsvDeckImporter', () => {
  it('accepts the csv source', () => {
    const importer = new CsvDeckImporter();

    expect(importer.source).toBe(IMPORT_SOURCES.CSV);
    expect(importer.canImport({ source: IMPORT_SOURCES.CSV, content: '' })).toBe(true);
    expect(importer.canImport({ source: 'zip' as never, content: '' })).toBe(false);
  });

  it('parses csv content into cards and skipped rows', () => {
    const importer = new CsvDeckImporter();
    const csv = 'front,back,type,tags\nhouse,casa,vocabulary,home\n,,vocabulary,';

    const result = importer.parse({ source: IMPORT_SOURCES.CSV, content: csv });

    expect(result.cards).toHaveLength(1);
    expect(result.cards[0]?.front).toBe('house');
    expect(result.skipped).toHaveLength(1);
  });

  it('returns a shared singleton instance', () => {
    expect(getCsvDeckImporter()).toBe(getCsvDeckImporter());
  });
});
