import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { LIMITS } from '@/constants/limits';
import type {
  CardListCursor,
  CardListMediaFilters,
} from '@/domain/repositories/CardListReadRepository';
import { getSQLiteCardListReadRepository } from '@/infrastructure/database/sqlite/repositories';
import { normalizeSearchText } from '@/utils/search';

export const DECK_CARDS_QUERY_KEY = ['deck-cards'] as const;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs, value]);

  return debouncedValue;
}

export function useDeckCards(
  deckId: string | undefined,
  query: string,
  mediaFilters: CardListMediaFilters,
) {
  const normalizedQuery = normalizeSearchText(query);
  const debouncedQuery = useDebouncedValue(normalizedQuery, 250);
  const result = useInfiniteQuery({
    queryKey: [
      ...DECK_CARDS_QUERY_KEY,
      deckId,
      debouncedQuery,
      mediaFilters.audio,
      mediaFilters.image,
    ],
    enabled: Boolean(deckId),
    initialPageParam: null as CardListCursor | null,
    queryFn: ({ pageParam }) =>
      getSQLiteCardListReadRepository().listPage({
        deckId: deckId ?? '',
        query: debouncedQuery,
        mediaFilters,
        limit: LIMITS.DEFAULT_CARD_LIST_PAGE_SIZE,
        cursor: pageParam ?? undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === deckId ? previousData : undefined,
  });

  const cards = useMemo(
    () => result.data?.pages.flatMap((page) => page.items) ?? [],
    [result.data?.pages],
  );

  return {
    ...result,
    cards,
    debouncedQuery,
    isFilterTransition: normalizedQuery !== debouncedQuery || result.isPlaceholderData,
  };
}
