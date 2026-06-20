import { MEDIA_SIDES, MEDIA_TYPES } from '@/domain/entities/Media';
import type { Media, MediaSide } from '@/domain/entities/Media';
import { ttsCsvCell } from '@/domain/exporters/cardsCsv';
import type { ExportCardRow } from '@/domain/exporters/DeckExporter';
import type { ExportCardRecord } from '@/domain/repositories/CardExportReadRepository';

function parseTtsLanguage(uri: string): string {
  const match = /^tts:\/\/local\/([^/]+)\//.exec(uri);
  return match?.[1] ? decodeURIComponent(match[1]) : '';
}

type SideMedia = { image?: string; audio?: string };

function resolveSideMedia(media: readonly Media[], side: MediaSide): SideMedia {
  const result: SideMedia = {};

  for (const item of media) {
    if (item.side !== side) {
      continue;
    }

    if (item.type === MEDIA_TYPES.IMAGE) {
      result.image = item.uri;
    } else if (item.type === MEDIA_TYPES.TTS) {
      result.audio = ttsCsvCell(parseTtsLanguage(item.uri));
    } else if (item.type === MEDIA_TYPES.AUDIO || item.type === MEDIA_TYPES.RECORDING) {
      result.audio = item.uri;
    }
  }

  return result;
}

/**
 * Flattens collection export records into CSV rows (§24): media cells hold a local path, or
 * `tts:<lang>` for TTS voices; the spoken text stays in `front`/`back`.
 */
export function buildCollectionExportRows(records: readonly ExportCardRecord[]): ExportCardRow[] {
  return records.map((record) => {
    const front = resolveSideMedia(record.media, MEDIA_SIDES.FRONT);
    const back = resolveSideMedia(record.media, MEDIA_SIDES.BACK);

    return {
      deck: record.deckName,
      type: record.card.type,
      front: record.card.front,
      back: record.card.back,
      tags: record.tags.map((tag) => tag.name),
      ...(record.card.notes ? { notes: record.card.notes } : {}),
      ...(front.image ? { imageFront: front.image } : {}),
      ...(front.audio ? { audioFront: front.audio } : {}),
      ...(back.image ? { imageBack: back.image } : {}),
      ...(back.audio ? { audioBack: back.audio } : {}),
    };
  });
}
