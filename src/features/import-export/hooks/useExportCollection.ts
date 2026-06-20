import { useCallback, useState } from 'react';

import { useActiveCollections } from '@/features/collections/hooks/useActiveCollections';
import {
  getSQLiteCardExportReadRepository,
  getSQLiteCollectionRepository,
} from '@/infrastructure/database/sqlite/repositories';
import { getCsvDeckExporter } from '@/infrastructure/exporters/CsvDeckExporter';
import { shareExportFile } from '@/infrastructure/filesystem/exportShare';

import { exportCollection, isExportCollectionError } from '../services/exportCollection';

export type ExportStatus = 'idle' | 'exporting' | 'success' | 'empty' | 'error';

/** Wires the CSV export connector + share sheet for the home export modal. */
export function useExportCollection() {
  const collectionsQuery = useActiveCollections();
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [exportedCount, setExportedCount] = useState(0);

  const runExport = useCallback(async (collectionId: string) => {
    setStatus('exporting');

    try {
      const result = await exportCollection(
        { collectionId },
        {
          collectionRepository: getSQLiteCollectionRepository(),
          exportReadRepository: getSQLiteCardExportReadRepository(),
          exporter: getCsvDeckExporter(),
        },
      );

      await shareExportFile({
        fileName: result.fileName,
        content: result.content,
        mimeType: result.mimeType,
      });

      setExportedCount(result.count);
      setStatus('success');
      return true;
    } catch (error) {
      if (isExportCollectionError(error) && error.code === 'empty') {
        setStatus('empty');
        return false;
      }

      setStatus('error');
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setExportedCount(0);
  }, []);

  return {
    collections: collectionsQuery.data ?? [],
    collectionsLoading: collectionsQuery.isLoading,
    status,
    exportedCount,
    runExport,
    reset,
  };
}
