import { Pressable, Text, View } from 'react-native';

import type { CollectionSummary } from '@/features/home/types';
import { useTheme } from '@/theme/useTheme';

type CollectionSummaryCardProps = {
  summary: CollectionSummary;
  onPress: () => void;
};

/** Resumo de uma coleção: nome, par de idiomas e progresso. */
export function CollectionSummaryCard({ summary, onPress }: CollectionSummaryCardProps) {
  const { colors, shadows } = useTheme();
  const { collection, totalCards, dueCards, masteredPercentage } = summary;
  const languagePair = `${collection.baseLanguage.toUpperCase()} → ${collection.targetLanguage.toUpperCase()}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Coleção ${collection.name}, ${dueCards} cards vencidos`}
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
        {totalCards} cards • {dueCards} vencidos • {masteredPercentage}% dominados
      </Text>
    </Pressable>
  );
}
