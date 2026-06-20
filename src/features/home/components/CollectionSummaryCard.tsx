import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { Icon } from '@/components/common/Icon';
import { ProgressBar } from '@/components/common/ProgressBar';
import type { CollectionSummary } from '@/features/home/types';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

type CollectionSummaryCardProps = {
  summary: CollectionSummary;
  onPress: () => void;
};

/** Collection summary: name, language pair, and mastery progress. */
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
  const cardsText = `${totalCards} ${cardLabel}`;
  const dueText = `${dueCards} ${dueLabel}`;
  const masteredText = `${masteredPercentage}% ${masteredLabel}`;
  const accessibilitySummary = `${cardsText} • ${dueText} • ${masteredText}`;
  const initial = collection.name.trim().charAt(0).toUpperCase() || '•';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${summaryStrings.accessibilityPrefix} ${collection.name}, ${accessibilitySummary}`}
      onPress={onPress}
      style={{
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...shadows.sm,
      }}
      className="gap-3 rounded-2xl border p-4 active:opacity-90"
    >
      <View className="flex-row items-center gap-3">
        <View
          style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
          className="h-11 w-11 items-center justify-center rounded-2xl"
        >
          <Text style={{ color: colors.primary }} className="text-lg font-bold">
            {initial}
          </Text>
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text
            style={{ color: colors.textPrimary }}
            className="text-lg font-bold"
            numberOfLines={1}
          >
            {collection.name}
          </Text>
          <View className="flex-row">
            <Badge label={languagePair} tone="textSecondary" />
          </View>
        </View>
        {dueCards > 0 ? <Badge label={dueText} tone="warning" /> : null}
        <Icon name="chevron" size={22} tone="textSecondary" />
      </View>

      <View className="gap-1">
        <View className="flex-row items-center justify-between">
          <Text style={{ color: colors.textSecondary }} className="text-xs">
            {cardsText}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-xs">
            {masteredText}
          </Text>
        </View>
        <ProgressBar value={masteredPercentage} tone="primary" />
      </View>
    </Pressable>
  );
}
