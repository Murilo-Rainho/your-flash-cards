import type { Card } from '@/domain/entities/Card';
import type { Media } from '@/domain/entities/Media';
import type { Tag } from '@/domain/entities/Tag';

/** A physical card plus its deck name, tags and media, flattened for export. */
export type ExportCardRecord = {
  deckName: string;
  card: Card;
  tags: Tag[];
  media: Media[];
};

/**
 * Local read port: all active cards of a collection (across its decks) for export (§23/§24).
 * Used only by explicit export actions, not by review sessions.
 */
export type CardExportReadRepository = {
  listCardsByCollection(collectionId: string): Promise<ExportCardRecord[]>;
};
