import { Pressable, Text } from 'react-native';

import type { ReviewNowCardState } from '@/features/home/services/getReviewNowCardState';
import { useTheme } from '@/theme/useTheme';

type ReviewNowCardProps = {
  state: ReviewNowCardState;
  onPress: () => void;
};

/**
 * CTA principal da Home — o elemento de maior destaque visual.
 * Renderiza o estado já calculado pela feature, sem decidir regras de onboarding.
 */
export function ReviewNowCard({ state, onPress }: ReviewNowCardProps) {
  const { colors, shadows } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={state.accessibilityLabel}
      onPress={onPress}
      style={{ backgroundColor: colors.primary, ...shadows.lg }}
      className="rounded-2xl p-6 active:opacity-90"
    >
      <Text style={{ color: colors.background }} className="text-2xl font-bold">
        {state.title}
      </Text>
      <Text style={{ color: colors.background }} className="mt-1 text-base font-medium opacity-90">
        {state.subtitle}
      </Text>
    </Pressable>
  );
}
