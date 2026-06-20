import {
  EXPORT_FORMATS,
  type DeckExporter,
  type ExportInput,
  type ExportResult,
} from '@/domain/exporters/DeckExporter';
import { serializeCardsCsv } from '@/domain/exporters/cardsCsv';

const CSV_MIME_TYPE = 'text/csv';

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'colecao';
}

/** CSV export connector (§23.1). Pure serialization; file writing/sharing lives in filesystem. */
export class CsvDeckExporter implements DeckExporter {
  readonly target = EXPORT_FORMATS.CSV;

  canExport(input: ExportInput): boolean {
    return input.rows.length > 0;
  }

  export(input: ExportInput): Promise<ExportResult> {
    return Promise.resolve({
      format: EXPORT_FORMATS.CSV,
      fileName: `${slugify(input.collection.name)}.csv`,
      mimeType: CSV_MIME_TYPE,
      content: serializeCardsCsv(input.rows),
      count: input.rows.length,
    });
  }
}

let csvDeckExporter: DeckExporter | null = null;

export function getCsvDeckExporter(): DeckExporter {
  if (!csvDeckExporter) {
    csvDeckExporter = new CsvDeckExporter();
  }

  return csvDeckExporter;
}
