import { Pressable, Text, View } from 'react-native';

import { REVIEW_RATING_ORDER, type ReviewRating } from '@/constants/reviewRatings';
import { useTheme } from '@/theme/useTheme';

type RatingButtonsProps = {
  labels: Record<ReviewRating, string>;
  onRate: (rating: ReviewRating) => void;
  disabled?: boolean;
};

/** Linha das 4 avaliações (§19). Aparece apenas no estado ANSWER (verso revelado). */
export function RatingButtons({ labels, onRate, disabled = false }: RatingButtonsProps) {
  const { colors } = useTheme();

  const ratingColors: Record<ReviewRating, { background: string; text: string }> = {
    again: { background: colors.danger, text: colors.background },
    hard: { background: colors.warning, text: colors.textPrimary },
    good: { background: colors.secondary, text: colors.background },
    easy: { background: colors.success, text: colors.background },
  };

  return (
    <View className="flex-row gap-2">
      {REVIEW_RATING_ORDER.map((rating) => {
        const palette = ratingColors[rating];
        const label = labels[rating];

        return (
          <Pressable
            key={rating}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => onRate(rating)}
            style={{
              backgroundColor: palette.background,
              opacity: disabled ? 0.5 : 1,
            }}
            className="flex-1 items-center rounded-xl px-1 py-3 active:opacity-90"
          >
            <Text style={{ color: palette.text }} className="text-sm font-semibold">
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
