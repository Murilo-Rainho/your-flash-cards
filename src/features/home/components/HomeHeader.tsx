import { Text, View } from 'react-native';

import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

type HomeHeaderProps = {
  greeting: string;
  dueCards: number;
};

/** Cabeçalho de boas-vindas: saudação + quantos cards aguardam revisão hoje. */
export function HomeHeader({ greeting, dueCards }: HomeHeaderProps) {
  const strings = useStrings();
  const { colors } = useTheme();

  const subtitle =
    dueCards > 0 ? `${dueCards} ${strings.home.dueCardsToday}` : strings.home.dueCardsTodayNone;

  return (
    <View className="gap-1">
      <Text style={{ color: colors.textPrimary }} className="text-3xl font-bold">
        {greeting}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="text-base">
        {subtitle}
      </Text>
    </View>
  );
}
