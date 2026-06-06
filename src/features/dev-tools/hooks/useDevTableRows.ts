import { useQuery } from '@tanstack/react-query';

import { getSQLiteDevToolsRepository } from '@/infrastructure/database/sqlite/repositories';

export const DEV_TABLE_ROWS_QUERY_KEY = ['dev-tools', 'table-rows'] as const;

const PAGE_SIZE = 50;

export function useDevTableRows(tableName: string | undefined, page: number) {
  return useQuery({
    queryKey: [...DEV_TABLE_ROWS_QUERY_KEY, tableName, page],
    queryFn: () =>
      getSQLiteDevToolsRepository().listTableRows(tableName!, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: Boolean(tableName),
  });
}

export { PAGE_SIZE as DEV_TABLE_PAGE_SIZE };
