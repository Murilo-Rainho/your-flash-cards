import { Pressable, Text, View } from 'react-native';

import type { CollectionSummary } from '@/features/home/types';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTheme } from '@/theme/useTheme';

type CollectionSummaryCardProps = {
  summary: CollectionSummary;
  onPress: () => void;
};

/** Resumo de uma coleção: nome, par de idiomas e progresso. */
export function CollectionSummaryCard({ summary, onPress }: CollectionSummaryCardProps) {
  const { colors, shadows } = useTheme();
  const strings = useStrings();
  const { collection, totalCards, dueCards, masteredPercentage } = summary;
  const languagePair = `${collection.baseLanguage.toUpperCase()} → ${collection.targetLanguage.toUpperCase()}`;
  const summaryStrings = strings.home.collectionSummary;
  const cardLabel = totalCards === 1 ? summaryStrings.cardSingular : summaryStrings.cardPlural;
  const dueLabel = dueCards === 1 ? summaryStrings.dueSingular : summaryStrings.duePlural;
  const masteredLabel =
    masteredPercentage === 1 ? summaryStrings.masteredSingular : summaryStrings.masteredPlural;
  const summaryText = `${totalCards} ${cardLabel} • ${dueCards} ${dueLabel} • ${masteredPercentage}% ${masteredLabel}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${summaryStrings.accessibilityPrefix} ${collection.name}, ${summaryText}`}
      onPress={onPress}
      style={{
        borderColor: colors.border,
        backgroundColor: colors.background,
        ...shadows.sm,
      }}
      className="rounded-2xl border p-4 active:opacity-90"
    >
      <View className="flex-row items-center justify-between">
        <Text
          style={{ color: colors.textPrimary }}
          className="flex-1 text-lg font-semibold"
          numberOfLines={1}
        >
          {collection.name}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="ml-2 text-xs font-medium">
          {languagePair}
        </Text>
      </View>
      <Text style={{ color: colors.textSecondary }} className="mt-2 text-sm">
        {summaryText}
      </Text>
    </Pressable>
  );
}
