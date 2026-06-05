import { Pressable, Text, View } from 'react-native';

import {
  REVIEW_RATING_LABELS,
  REVIEW_RATING_ORDER,
  type ReviewRating,
} from '@/constants/reviewRatings';

type RatingButtonsProps = {
  onRate: (rating: ReviewRating) => void;
  disabled?: boolean;
};

/** Estilos por rating (cor sempre acompanhada do rótulo — nunca cor sozinha). */
const RATING_STYLES: Record<ReviewRating, { bg: string; text: string }> = {
  again: { bg: 'bg-danger', text: 'text-background' },
  hard: { bg: 'bg-warning', text: 'text-textPrimary' },
  good: { bg: 'bg-secondary', text: 'text-background' },
  easy: { bg: 'bg-success', text: 'text-background' },
};

/** Linha das 4 avaliações (§19). Aparece apenas no estado ANSWER (verso revelado). */
export function RatingButtons({ onRate, disabled = false }: RatingButtonsProps) {
  return (
    <View className="flex-row gap-2">
      {REVIEW_RATING_ORDER.map((rating) => {
        const style = RATING_STYLES[rating];
        const label = REVIEW_RATING_LABELS[rating];

        return (
          <Pressable
            key={rating}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => onRate(rating)}
            className={`flex-1 items-center rounded-xl px-1 py-3 active:opacity-90 ${style.bg} ${
              disabled ? 'opacity-50' : ''
            }`}
          >
            <Text className={`text-sm font-semibold ${style.text}`}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
