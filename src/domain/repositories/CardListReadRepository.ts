import type { Card } from '@/domain/entities/Card';

export type CardListItem = {
  card: Card;
  hasAudio: boolean;
  hasImage: boolean;
};

export type CardListCursor = {
  updatedAt: string;
  createdAt: string;
  id: string;
};

export type CardListMediaFilters = {
  audio: boolean;
  image: boolean;
};

export type CardListPageParams = {
  deckId: string;
  query: string;
  mediaFilters: CardListMediaFilters;
  limit: number;
  cursor?: CardListCursor;
};

export type CardListPage = {
  items: CardListItem[];
  nextCursor?: CardListCursor;
};

/** Porta de leitura local e paginada para a listagem de cards de um deck (§29.1). */
export type CardListReadRepository = {
  listPage(params: CardListPageParams): Promise<CardListPage>;
};
