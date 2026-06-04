import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { ROUTES } from '@/constants/routes';

/**
 * Navega para a tela anterior; quando não há histórico, volta para a Home.
 * Centraliza o padrão repetido nas telas de formulário.
 */
export function useGoBack(): () => void {
  const router = useRouter();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.HOME);
  }, [router]);
}
