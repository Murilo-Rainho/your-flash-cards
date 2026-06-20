import { CARD_TYPES, type CardType } from '@/constants/cardTypes';
import { parseCsv } from '@/domain/csv/csv';
import { TAGS_CSV_SEPARATOR, TTS_CSV_PREFIX } from '@/domain/exporters/cardsCsv';

import type { ImportParseResult, ParsedImportCard, SkippedRow } from './DeckImporter';

/** Stable skip reason codes (localized in the UI). */
export const IMPORT_SKIP_REASONS = {
  INVALID_TYPE: 'invalid-type',
  MISSING_FIELDS: 'missing-required-fields',
} as const;

type ColumnIndex = {
  deck: number;
  type: number;
  front: number;
  back: number;
  tags: number;
  notes: number;
  imageFront: number;
  audioFront: number;
  imageBack: number;
  audioBack: number;
};

function isCardType(value: string): value is CardType {
  return Object.values(CARD_TYPES).includes(value as CardType);
}

function splitTags(raw: string): string[] {
  return raw
    .split(TAGS_CSV_SEPARATOR)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseMediaCell(raw: string): { tts?: string; fileRef?: string } {
  const value = raw.trim();

  if (!value) {
    return {};
  }

  if (value.toLowerCase().startsWith(TTS_CSV_PREFIX)) {
    return { tts: value.slice(TTS_CSV_PREFIX.length).trim() };
  }

  return { fileRef: value };
}

function resolveColumns(header: readonly string[]): ColumnIndex {
  const normalized = header.map((cell) => cell.trim().toLowerCase());
  const indexOf = (name: string) => normalized.indexOf(name);

  return {
    deck: indexOf('deck'),
    type: indexOf('type'),
    front: indexOf('front'),
    back: indexOf('back'),
    tags: indexOf('tags'),
    notes: indexOf('notes'),
    imageFront: indexOf('image_front'),
    audioFront: indexOf('audio_front'),
    imageBack: indexOf('image_back'),
    audioBack: indexOf('audio_back'),
  };
}

function cellAt(row: readonly string[], index: number): string {
  return index >= 0 ? (row[index] ?? '').trim() : '';
}

/**
 * Parses the local cards CSV into validated cards + skipped rows. Column order is resolved by
 * header name, so files written by other tools (e.g. §16's `front,back,type,tags`) still work.
 */
export function parseCardsCsv(content: string): ImportParseResult {
  const rows = parseCsv(content);
  const cards: ParsedImportCard[] = [];
  const skipped: SkippedRow[] = [];

  if (rows.length === 0) {
    return { cards, skipped };
  }

  const columns = resolveColumns(rows[0]);

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 1;

    if (row.every((cell) => cell.trim() === '')) {
      continue;
    }

    const type = cellAt(row, columns.type);
    const front = cellAt(row, columns.front);
    const back = cellAt(row, columns.back);
    const rawLine = row.join(TAGS_CSV_SEPARATOR);

    if (!isCardType(type)) {
      skipped.push({ rowNumber, reason: IMPORT_SKIP_REASONS.INVALID_TYPE, raw: rawLine });
      continue;
    }

    if (!front && !back) {
      skipped.push({ rowNumber, reason: IMPORT_SKIP_REASONS.MISSING_FIELDS, raw: rawLine });
      continue;
    }

    const audioFront = parseMediaCell(cellAt(row, columns.audioFront));
    const audioBack = parseMediaCell(cellAt(row, columns.audioBack));
    const imageFront = parseMediaCell(cellAt(row, columns.imageFront));
    const imageBack = parseMediaCell(cellAt(row, columns.imageBack));

    const fileMediaRefs = [
      imageFront.fileRef,
      audioFront.fileRef,
      imageBack.fileRef,
      audioBack.fileRef,
    ].filter((ref): ref is string => Boolean(ref));

    cards.push({
      rowNumber,
      deck: cellAt(row, columns.deck),
      type,
      front,
      back,
      tags: splitTags(cellAt(row, columns.tags)),
      notes: cellAt(row, columns.notes) || undefined,
      ...(audioFront.tts !== undefined ? { ttsFront: audioFront.tts } : {}),
      ...(audioBack.tts !== undefined ? { ttsBack: audioBack.tts } : {}),
      fileMediaRefs,
    });
  }

  return { cards, skipped };
}
