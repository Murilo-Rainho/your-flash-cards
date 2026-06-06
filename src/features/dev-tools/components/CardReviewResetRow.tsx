import { Pressable, Text, View } from 'react-native';

import type { DevCardReviewState } from '@/infrastructure/database/sqlite/repositories/SQLiteDevToolsRepository';
import { useTheme } from '@/theme/useTheme';

type CardReviewResetRowProps = {
  card: DevCardReviewState;
  selected: boolean;
  onToggle: (cardId: string) => void;
};

export function CardReviewResetRow({ card, selected, onToggle }: CardReviewResetRowProps) {
  const { colors } = useTheme();
  const totalLogs = card.variants.reduce((sum, variant) => sum + variant.logCount, 0);
  const maxRepetitions = Math.max(...card.variants.map((variant) => variant.repetitions));
  const maxLapses = Math.max(...card.variants.map((variant) => variant.lapses));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${card.front} — rep ${maxRepetitions}, lapses ${maxLapses}`}
      onPress={() => onToggle(card.cardId)}
      style={{
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.surface : colors.background,
        borderWidth: selected ? 2 : 1,
      }}
      className="gap-2 rounded-xl p-3 active:opacity-90"
    >
      <View className="flex-row items-start justify-between gap-2">
        <Text style={{ color: colors.textPrimary }} className="flex-1 text-base font-semibold">
          {card.front}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-xs">
          {selected ? '✓' : '○'}
        </Text>
      </View>
      <Text style={{ color: colors.textSecondary }} className="text-sm">
        {card.back}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="text-xs">
        rep {maxRepetitions} • lapses {maxLapses} • logs {totalLogs} • {card.variants.length}{' '}
        variant(s)
      </Text>
      {card.variants.map((variant) => (
        <Text
          key={variant.reviewItemId}
          style={{ color: colors.textSecondary }}
          className="text-xs"
        >
          {variant.variantType}: rep {variant.repetitions}, ease {variant.easeFactor.toFixed(2)},
          due {variant.nextReviewAt.slice(0, 10)}
        </Text>
      ))}
    </Pressable>
  );
}
