import type { CardType } from '@/constants/cardTypes';

/** Local import sources (§23.1/§25). V1 accepts CSV; ZIP/APKG are future connectors. */
export const IMPORT_SOURCES = {
  CSV: 'csv',
} as const;

export type ImportSource = (typeof IMPORT_SOURCES)[keyof typeof IMPORT_SOURCES];

/** A card parsed from an import source, normalized to a domain-friendly shape. */
export type ParsedImportCard = {
  /** 1-based line number in the source (header is line 1), for user-facing messages. */
  rowNumber: number;
  deck: string;
  type: CardType;
  front: string;
  back: string;
  tags: string[];
  notes?: string;
  /** TTS voice languages to recreate per side (text comes from `front`/`back`). */
  ttsFront?: string;
  ttsBack?: string;
  /** File-media references present in the source but not importable without a ZIP. */
  fileMediaRefs: string[];
};

export type SkippedRow = {
  rowNumber: number;
  /** Stable reason code (localized in the UI), see `IMPORT_SKIP_REASONS`. */
  reason: string;
  raw?: string;
};

export type ImportParseResult = {
  cards: ParsedImportCard[];
  skipped: SkippedRow[];
};

export type ImportInput = {
  source: ImportSource;
  content: string;
};

/**
 * Import connector (§23.1/§25). `parse` is split from persistence so the UI can preview before
 * saving (§16). Best-effort: invalid rows go to `skipped`; a single bad row never aborts parsing.
 */
export type DeckImporter = {
  source: ImportSource;
  canImport(input: ImportInput): boolean;
  parse(input: ImportInput): ImportParseResult;
};
