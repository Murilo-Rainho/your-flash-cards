import { Pressable, Text, View } from 'react-native';

import { REVIEW_RATING_ORDER, type ReviewRating } from '@/constants/reviewRatings';
import type { ColorToken } from '@/theme/colors';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

type RatingButtonsProps = {
  labels: Record<ReviewRating, string>;
  onRate: (rating: ReviewRating) => void;
  disabled?: boolean;
};

/**
 * Tom semântico de cada avaliação (§19). Usa apenas tokens estáveis do tema
 * (`danger`/`warning`/`success`) + a cor `primary` da marca para "good" — evita colisões
 * entre presets (ex.: paletas onde `secondary` == `warning`) e mantém matizes distintos.
 */
const RATING_TONE: Record<ReviewRating, ColorToken> = {
  again: 'danger',
  hard: 'warning',
  good: 'primary',
  easy: 'success',
};

/** Linha das 4 avaliações (§19). Aparece apenas no estado ANSWER (verso revelado). */
export function RatingButtons({ labels, onRate, disabled = false }: RatingButtonsProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row gap-2">
      {REVIEW_RATING_ORDER.map((rating) => {
        const accent = colors[RATING_TONE[rating]];
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
              backgroundColor: withAlpha(accent, 0.16),
              borderColor: accent,
              opacity: disabled ? 0.5 : 1,
            }}
            className="flex-1 items-center rounded-xl border px-1 py-3 active:opacity-90"
          >
            <Text style={{ color: colors.textPrimary }} className="text-sm font-semibold">
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
