import { Pressable, Text, View } from 'react-native';

import { shadows } from '@/theme';
import type { CollectionSummary } from '@/features/home/types';

type CollectionSummaryCardProps = {
  summary: CollectionSummary;
  onPress: () => void;
};

/** Resumo de uma coleção: nome, par de idiomas e progresso. */
export function CollectionSummaryCard({ summary, onPress }: CollectionSummaryCardProps) {
  const { collection, totalCards, dueCards, masteredPercentage } = summary;
  const languagePair = `${collection.baseLanguage.toUpperCase()} → ${collection.targetLanguage.toUpperCase()}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Coleção ${collection.name}, ${dueCards} cards vencidos`}
      onPress={onPress}
      style={shadows.sm}
      className="rounded-2xl border border-border bg-background p-4 active:opacity-90"
    >
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-lg font-semibold text-textPrimary" numberOfLines={1}>
          {collection.name}
        </Text>
        <Text className="ml-2 text-xs font-medium text-textSecondary">{languagePair}</Text>
      </View>
      <Text className="mt-2 text-sm text-textSecondary">
        {totalCards} cards • {dueCards} vencidos • {masteredPercentage}% dominados
      </Text>
    </Pressable>
  );
}
