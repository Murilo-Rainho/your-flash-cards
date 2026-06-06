import { useQuery } from '@tanstack/react-query';

import { getSQLiteDevToolsRepository } from '@/infrastructure/database/sqlite/repositories';

export const DEV_TABLES_QUERY_KEY = ['dev-tools', 'tables'] as const;

export function useDevTables() {
  return useQuery({
    queryKey: DEV_TABLES_QUERY_KEY,
    queryFn: () => getSQLiteDevToolsRepository().listTables(),
  });
}
