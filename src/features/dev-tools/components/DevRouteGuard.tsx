import { useEffect, type ReactNode } from 'react';
import { type Href, useRouter } from 'expo-router';

import { ROUTES } from '@/constants/routes';

type DevRouteGuardProps = {
  children: ReactNode;
};

/** Redirects to Home when the dev route is accessed outside `__DEV__`. */
export function DevRouteGuard({ children }: DevRouteGuardProps) {
  const router = useRouter();

  useEffect(() => {
    if (!__DEV__) {
      router.replace(ROUTES.HOME as Href);
    }
  }, [router]);

  if (!__DEV__) {
    return null;
  }

  return children;
}
