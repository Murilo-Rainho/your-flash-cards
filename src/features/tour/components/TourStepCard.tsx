import { Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import type { TourStep } from '@/domain/tour/tourSteps';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

type TourStepCardProps = {
  step: TourStep;
  /** Triggered by the secondary action "Open full guide". */
  onOpenGuide: () => void;
};

/**
 * Tour step content: icon by type (educational/interface), title and description
 * short (i18n by id) and an optional secondary action (e.g. open full guide).
 */
export function TourStepCard({ step, onOpenGuide }: TourStepCardProps) {
  const strings = useStrings();
  const { colors } = useTheme();

  const text = strings.tour.steps[step.id];
  const iconName = step.kind === 'interface' ? 'tour' : 'guide';

  return (
    <View className="gap-3">
      <View
        style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
        className="h-12 w-12 items-center justify-center rounded-full"
      >
        <Icon name={iconName} tone="primary" size={24} />
      </View>

      <Text style={{ color: colors.textPrimary }} className="text-xl font-bold">
        {text.title}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="text-base leading-6">
        {text.description}
      </Text>

      {step.action === 'open-why-flashcards' ? (
        <SecondaryButton
          label={strings.tour.openGuide}
          icon="guide"
          onPress={onOpenGuide}
          compact
        />
      ) : null}
    </View>
  );
}
