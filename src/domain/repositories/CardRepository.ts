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
 * Porta local para persistir o aggregate de criacao de card (§34).
 */
export type CardRepository = {
  createAggregate(aggregate: CardAggregate): Promise<CardAggregate>;
};
