import { Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

type HomeHeaderProps = {
  greeting: string;
  dueCards: number;
};

/** Welcome header: greeting + how many cards await review today. */
export function HomeHeader({ greeting, dueCards }: HomeHeaderProps) {
  const strings = useStrings();
  const { colors } = useTheme();

  const subtitle =
    dueCards > 0
      ? `${dueCards} ${
          dueCards === 1 ? strings.home.dueCardsTodaySingular : strings.home.dueCardsTodayPlural
        }`
      : strings.home.dueCardsTodayNone;

  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-2">
        <Text style={{ color: colors.textPrimary, flexShrink: 1 }} className="text-3xl font-bold">
          {greeting}
        </Text>
        <Icon name="greeting" size={28} tone="textPrimary" />
      </View>
      <Text style={{ color: colors.textSecondary }} className="text-sm">
        {subtitle}
      </Text>
    </View>
  );
}
