import type { CardType } from '@/constants/cardTypes';
import type { Collection } from '@/domain/entities/Collection';

/** Local export targets (§23.1). V1 ships CSV; ZIP/APKG are future connectors. */
export const EXPORT_FORMATS = {
  CSV: 'csv',
} as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[keyof typeof EXPORT_FORMATS];

/**
 * One physical card flattened for export (§24). Media cells hold a local path, or `tts:<lang>`
 * for TTS voices; the spoken text stays in `front`/`back`. Real media files ship later in a ZIP.
 */
export type ExportCardRow = {
  deck: string;
  type: CardType;
  front: string;
  back: string;
  tags: string[];
  notes?: string;
  imageFront?: string;
  audioFront?: string;
  imageBack?: string;
  audioBack?: string;
};

export type ExportInput = {
  collection: Collection;
  rows: ExportCardRow[];
};

export type ExportResult = {
  format: ExportFormat;
  fileName: string;
  mimeType: string;
  content: string;
  count: number;
};

/**
 * Export connector (§23.1/§32.4). Implementations live in `infrastructure/exporters`; the
 * pure serialization logic lives in the domain so it can be tested without Expo.
 */
export type DeckExporter = {
  target: ExportFormat;
  canExport(input: ExportInput): boolean;
  export(input: ExportInput): Promise<ExportResult>;
};
