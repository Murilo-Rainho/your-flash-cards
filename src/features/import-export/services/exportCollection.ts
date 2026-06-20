import type { DeckExporter, ExportResult } from '@/domain/exporters/DeckExporter';
import type { CardExportReadRepository } from '@/domain/repositories/CardExportReadRepository';
import type { CollectionRepository } from '@/domain/repositories/CollectionRepository';

import { buildCollectionExportRows } from './buildCollectionExportRows';

export type ExportCollectionErrorCode = 'collection-not-found' | 'empty';

export class ExportCollectionError extends Error {
  constructor(readonly code: ExportCollectionErrorCode) {
    super(`Export failed: ${code}`);
    this.name = 'ExportCollectionError';
  }
}

export function isExportCollectionError(error: unknown): error is ExportCollectionError {
  return error instanceof ExportCollectionError;
}

export type ExportCollectionInput = {
  collectionId: string;
};

type ExportCollectionOptions = {
  collectionRepository: CollectionRepository;
  exportReadRepository: CardExportReadRepository;
  exporter: DeckExporter;
};

/** Reads a collection's cards and produces an export file via the chosen connector (§23/§24). */
export async function exportCollection(
  { collectionId }: ExportCollectionInput,
  { collectionRepository, exportReadRepository, exporter }: ExportCollectionOptions,
): Promise<ExportResult> {
  const collection = await collectionRepository.findById(collectionId);

  if (!collection) {
    throw new ExportCollectionError('collection-not-found');
  }

  const records = await exportReadRepository.listCardsByCollection(collectionId);
  const rows = buildCollectionExportRows(records);
  const input = { collection, rows };

  if (!exporter.canExport(input)) {
    throw new ExportCollectionError('empty');
  }

  return exporter.export(input);
}
