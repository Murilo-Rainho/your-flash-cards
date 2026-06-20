import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

import { TourModal } from '@/features/tour/components/TourModal';

type TourResumeProps = {
  visible: boolean;
  onContinue: () => void;
  onRestart: () => void;
  onSkip: () => void;
  /** Scrim tap — dismiss for this session only. */
  onScrimPress: () => void;
};

/** Resume prompt (shown when `in_progress` on app open). */
export function TourResume({
  visible,
  onContinue,
  onRestart,
  onSkip,
  onScrimPress,
}: TourResumeProps) {
  const strings = useStrings();
  const { colors } = useTheme();

  return (
    <TourModal
      visible={visible}
      onScrimPress={onScrimPress}
      closeAccessibilityLabel={strings.tour.resume.closeA11y}
    >
      <View className="items-center gap-2">
        <View
          style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
          className="h-14 w-14 items-center justify-center rounded-full"
        >
          <Icon name="tour" tone="primary" size={28} />
        </View>
        <Text style={{ color: colors.textPrimary }} className="text-center text-xl font-bold">
          {strings.tour.resume.title}
        </Text>
      </View>

      <View className="gap-3">
        <PrimaryButton label={strings.tour.resume.continueLabel} icon="next" onPress={onContinue} />
        <SecondaryButton label={strings.tour.resume.restart} icon="review" onPress={onRestart} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.tour.resume.skip}
          onPress={onSkip}
          className="items-center py-2 active:opacity-70"
        >
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium">
            {strings.tour.resume.skip}
          </Text>
        </Pressable>
      </View>
    </TourModal>
  );
}
