import {
  IMPORT_SOURCES,
  type DeckImporter,
  type ImportInput,
  type ImportParseResult,
} from '@/domain/importers/DeckImporter';
import { parseCardsCsv } from '@/domain/importers/cardsCsv';

/** CSV import connector (§23.1/§25). Best-effort parsing delegated to the domain parser. */
export class CsvDeckImporter implements DeckImporter {
  readonly source = IMPORT_SOURCES.CSV;

  canImport(input: ImportInput): boolean {
    return input.source === IMPORT_SOURCES.CSV;
  }

  parse(input: ImportInput): ImportParseResult {
    return parseCardsCsv(input.content);
  }
}

let csvDeckImporter: DeckImporter | null = null;

export function getCsvDeckImporter(): DeckImporter {
  if (!csvDeckImporter) {
    csvDeckImporter = new CsvDeckImporter();
  }

  return csvDeckImporter;
}
