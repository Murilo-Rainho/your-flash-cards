import { QueryClient } from '@tanstack/react-query';

/** Cliente compartilhado do React Query. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
