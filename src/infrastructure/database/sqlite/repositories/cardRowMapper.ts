import type { CardType } from '@/constants/cardTypes';
import { deserializeClozeContent } from '@/domain/cloze/clozeContent';
import type { Card } from '@/domain/entities/Card';

export type CardRow = {
  id: string;
  deckId: string;
  type: CardType;
  front: string;
  back: string;
  clozeData: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};

export function mapCardRow(row: CardRow): Card {
  const cloze = deserializeClozeContent(row.clozeData);

  return {
    id: row.id,
    deckId: row.deckId,
    type: row.type,
    front: row.front,
    back: row.back,
    ...(cloze ? { cloze } : {}),
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt ?? undefined,
  };
}
