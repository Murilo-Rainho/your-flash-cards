import { serializeCsv } from '@/domain/csv/csv';

import type { ExportCardRow } from './DeckExporter';

/** Marker prefix in audio cells denoting a TTS voice (§24 media metadata), e.g. `tts:en-US`. */
export const TTS_CSV_PREFIX = 'tts:';

/** Separator used inside the single `tags` cell. */
export const TAGS_CSV_SEPARATOR = ',';

/** Column order of the local cards CSV (§24, extended with `deck` + `notes`). */
export const CARDS_CSV_HEADER = [
  'deck',
  'type',
  'front',
  'back',
  'tags',
  'notes',
  'image_front',
  'audio_front',
  'image_back',
  'audio_back',
] as const;

/** Builds the audio cell value for a TTS voice. */
export function ttsCsvCell(language: string): string {
  return `${TTS_CSV_PREFIX}${language}`;
}

function serializeTags(tags: readonly string[]): string {
  return tags.join(TAGS_CSV_SEPARATOR);
}

/** Serializes export rows to the local CSV format (header + one line per physical card). */
export function serializeCardsCsv(rows: readonly ExportCardRow[]): string {
  const header = [...CARDS_CSV_HEADER];
  const body = rows.map((row) => [
    row.deck,
    row.type,
    row.front,
    row.back,
    serializeTags(row.tags),
    row.notes ?? '',
    row.imageFront ?? '',
    row.audioFront ?? '',
    row.imageBack ?? '',
    row.audioBack ?? '',
  ]);

  return serializeCsv([header, ...body]);
}
