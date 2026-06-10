import { View } from 'react-native';

import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

function SkeletonCard() {
  const { colors, shadows } = useTheme();
  const muted = withAlpha(colors.textSecondary, 0.08);

  return (
    <View
      style={{ borderColor: colors.border, backgroundColor: colors.surface, ...shadows.sm }}
      className="gap-3 rounded-2xl border p-4"
    >
      <View className="flex-row items-center gap-3">
        <View style={{ backgroundColor: muted }} className="h-11 w-11 rounded-2xl" />
        <View className="flex-1 gap-2">
          <View style={{ backgroundColor: muted, width: '66%' }} className="h-4 rounded-full" />
          <View style={{ backgroundColor: muted, width: '40%' }} className="h-3 rounded-full" />
        </View>
      </View>
      <View style={{ backgroundColor: muted }} className="h-2 w-full rounded-full" />
    </View>
  );
}

type CollectionListSkeletonProps = {
  count?: number;
};

/**
 * Placeholders de carregamento da lista de coleções. Estático (sem animação) para não
 * depender de reanimated/worklets fixados ao Expo Go.
 */
export function CollectionListSkeleton({ count = 3 }: CollectionListSkeletonProps) {
  const strings = useStrings();

  return (
    <View accessibilityLabel={strings.home.loadingLocalData} className="gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={`collection-skeleton-${index}`} />
      ))}
    </View>
  );
}
