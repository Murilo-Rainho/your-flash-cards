import { DevRouteGuard } from '@/features/dev-tools/components/DevRouteGuard';
import { DevToolsScreen } from '@/features/dev-tools/screens/DevToolsScreen';

export default function DevToolsRoute() {
  return (
    <DevRouteGuard>
      <DevToolsScreen />
    </DevRouteGuard>
  );
}
