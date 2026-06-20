import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { ROUTES } from '@/constants/routes';

/**
 * Navigates to the previous screen; when there is no history, goes to Home.
 * Centralizes the repeated pattern on form screens.
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
