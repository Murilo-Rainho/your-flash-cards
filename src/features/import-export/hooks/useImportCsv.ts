import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { IMPORT_SOURCES, type ImportParseResult } from '@/domain/importers/DeckImporter';
import { DECK_CARDS_QUERY_KEY } from '@/features/cards/hooks/useDeckCards';
import {
  ACTIVE_COLLECTIONS_QUERY_KEY,
  useActiveCollections,
} from '@/features/collections/hooks/useActiveCollections';
import { ACTIVE_DECKS_QUERY_KEY } from '@/features/decks/hooks/useActiveDecks';
import { HOME_DATA_QUERY_KEY } from '@/features/home/hooks/useHomeData';
import {
  getSQLiteCardRepository,
  getSQLiteCollectionRepository,
  getSQLiteDeckRepository,
} from '@/infrastructure/database/sqlite/repositories';
import { getExpoLocalMediaStorage } from '@/infrastructure/filesystem/ExpoLocalMediaStorage';
import { getCsvDeckImporter } from '@/infrastructure/importers/CsvDeckImporter';
import { pickCsvFile } from '@/infrastructure/filesystem/pickCsvFile';

import { importCsvCards, type ImportCardsResult } from '../services/importCsvCards';

export type ImportPhase = 'select' | 'preview' | 'importing' | 'result';
export type ImportError = 'read-error' | 'import-error';

/** Drives the CSV import preview flow (§16): pick file -> preview -> confirm into a collection. */
export function useImportCsv(defaultDeckName: string) {
  const collectionsQuery = useActiveCollections();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<ImportPhase>('select');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ImportParseResult | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [error, setError] = useState<ImportError | null>(null);
  const [result, setResult] = useState<ImportCardsResult | null>(null);

  const pickFile = useCallback(async () => {
    setError(null);

    try {
      const file = await pickCsvFile();

      if (!file) {
        return;
      }

      const parsed = getCsvDeckImporter().parse({
        source: IMPORT_SOURCES.CSV,
        content: file.content,
      });

      setFileName(file.name);
      setParseResult(parsed);
      setPhase('preview');
    } catch {
      setError('read-error');
    }
  }, []);

  const confirmImport = useCallback(async () => {
    if (!parseResult || !selectedCollectionId) {
      return;
    }

    setError(null);
    setPhase('importing');

    try {
      const saveResult = await importCsvCards(
        { collectionId: selectedCollectionId, cards: parseResult.cards },
        {
          collectionRepository: getSQLiteCollectionRepository(),
          deckRepository: getSQLiteDeckRepository(),
          cardRepository: getSQLiteCardRepository(),
          mediaStorage: getExpoLocalMediaStorage(),
          defaultDeckName,
        },
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HOME_DATA_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_COLLECTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ACTIVE_DECKS_QUERY_KEY }),
        queryClient.resetQueries({ queryKey: DECK_CARDS_QUERY_KEY }),
      ]);

      setResult(saveResult);
      setPhase('result');
    } catch {
      setError('import-error');
      setPhase('preview');
    }
  }, [defaultDeckName, parseResult, queryClient, selectedCollectionId]);

  const reset = useCallback(() => {
    setPhase('select');
    setFileName(null);
    setParseResult(null);
    setSelectedCollectionId('');
    setError(null);
    setResult(null);
  }, []);

  return {
    collections: collectionsQuery.data ?? [],
    collectionsLoading: collectionsQuery.isLoading,
    phase,
    fileName,
    parseResult,
    selectedCollectionId,
    setSelectedCollectionId,
    error,
    result,
    pickFile,
    confirmImport,
    reset,
  };
}
