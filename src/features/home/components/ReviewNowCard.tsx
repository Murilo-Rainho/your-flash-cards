import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
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
      className="flex-row items-center gap-4 rounded-2xl p-6 active:opacity-90"
    >
      <View
        style={{ backgroundColor: colors.surface }}
        className="h-14 w-14 items-center justify-center rounded-2xl"
      >
        <Icon name={state.icon} size={28} tone="primary" />
      </View>
      <View className="flex-1">
        <Text style={{ color: colors.background }} className="text-2xl font-bold">
          {state.title}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          <Text
            style={{ color: colors.background, flexShrink: 1 }}
            className="text-sm font-medium opacity-90"
          >
            {state.subtitle}
          </Text>
          {state.action === 'done' ? (
            <Icon name="streak" size={14} color={colors.background} />
          ) : null}
        </View>
      </View>
      <Icon name="chevron" size={26} color={colors.background} />
    </Pressable>
  );
}
