import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/common/Icon';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { withAlpha } from '@/theme/createShadows';
import { useTheme } from '@/theme/useTheme';

import { TourModal } from '@/features/tour/components/TourModal';

type TourInvitationProps = {
  visible: boolean;
  onStart: () => void;
  /** "Agora não" — não exibir automaticamente de novo. */
  onSkip: () => void;
  /** Toque no scrim — dispensa só nesta sessão. */
  onScrimPress: () => void;
};

/** Convite inicial do tour (exibido só quando `not_started`). */
export function TourInvitation({ visible, onStart, onSkip, onScrimPress }: TourInvitationProps) {
  const strings = useStrings();
  const { colors } = useTheme();

  return (
    <TourModal
      visible={visible}
      onScrimPress={onScrimPress}
      closeAccessibilityLabel={strings.tour.invitation.closeA11y}
    >
      <View className="items-center gap-2">
        <View
          style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
          className="h-14 w-14 items-center justify-center rounded-full"
        >
          <Icon name="tour" tone="primary" size={28} />
        </View>
        <Text style={{ color: colors.textPrimary }} className="text-center text-xl font-bold">
          {strings.tour.invitation.question}
        </Text>
      </View>

      <View className="gap-3">
        <PrimaryButton label={strings.tour.invitation.start} icon="tour" onPress={onStart} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.tour.invitation.notNow}
          onPress={onSkip}
          className="items-center py-2 active:opacity-70"
        >
          <Text style={{ color: colors.textSecondary }} className="text-sm font-medium">
            {strings.tour.invitation.notNow}
          </Text>
        </Pressable>
      </View>
    </TourModal>
  );
}
