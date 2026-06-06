import { DevRouteGuard } from '@/features/dev-tools/components/DevRouteGuard';
import { DevTableDetailScreen } from '@/features/dev-tools/screens/DevTableDetailScreen';

export default function DevTableDetailRoute() {
  return (
    <DevRouteGuard>
      <DevTableDetailScreen />
    </DevRouteGuard>
  );
}
