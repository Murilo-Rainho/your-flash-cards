import { Pressable, Text } from 'react-native';

import type { ReviewNowCardState } from '@/features/home/services/getReviewNowCardState';
import { shadows } from '@/theme';

type ReviewNowCardProps = {
  state: ReviewNowCardState;
  onPress: () => void;
};

/**
 * CTA principal da Home — o elemento de maior destaque visual.
 * Renderiza o estado já calculado pela feature, sem decidir regras de onboarding.
 */
export function ReviewNowCard({ state, onPress }: ReviewNowCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={state.accessibilityLabel}
      onPress={onPress}
      style={shadows.lg}
      className="rounded-2xl bg-primary p-6 active:opacity-90"
    >
      <Text className="text-2xl font-bold text-background">{state.title}</Text>
      <Text className="mt-1 text-base font-medium text-background opacity-90">
        {state.subtitle}
      </Text>
    </Pressable>
  );
}
