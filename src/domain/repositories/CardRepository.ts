import type { Card } from '@/domain/entities/Card';
import type { CardVariant } from '@/domain/entities/CardVariant';
import type { Media } from '@/domain/entities/Media';
import type { ReviewItem } from '@/domain/entities/ReviewItem';
import type { Tag } from '@/domain/entities/Tag';

export type CardAggregate = {
  card: Card;
  variants: CardVariant[];
  media: Media[];
  tags: Tag[];
  reviewItems: ReviewItem[];
};

/**
 * Local port to persist the card creation aggregate (§34).
 */
export type CardRepository = {
  createAggregate(aggregate: CardAggregate): Promise<CardAggregate>;
  findAggregateById(id: string): Promise<CardAggregate | null>;
  /**
   * Updates the physical card and syncs media/tags with the given aggregate.
   * Preserves variants and review_items (keeps SM-2 history).
   */
  updateAggregate(aggregate: CardAggregate): Promise<CardAggregate>;
  /** Soft-delete: marks the card as archived (does not physically remove it). */
  archiveCard(id: string, archivedAt: string): Promise<void>;
};
