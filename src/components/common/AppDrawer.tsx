import { type Href, useRouter } from 'expo-router';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/common/Icon';
import { ROUTES } from '@/constants/routes';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useTour } from '@/features/tour/providers/TourProvider';
import { withAlpha } from '@/theme/createShadows';
import type { IconName } from '@/theme/icons';
import { useTheme } from '@/theme/useTheme';

type AppDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

type DrawerItem = {
  id: string;
  icon: IconName;
  label: string;
  onPress: () => void;
};

/**
 * App side drawer, opened by the `Header` Hamburger Menu. Uses the same pattern
 * as the `QuickActionsFab` transparent `Modal` (no extra navigation lib). For now
 * only offers "Back to Home" and "Settings" (§33).
 */
export function AppDrawer({ visible, onClose }: AppDrawerProps) {
  const router = useRouter();
  const strings = useStrings();
  const { colors, shadows } = useTheme();
  const { openFromMenu } = useTour();

  const navigate = (action: () => void) => {
    onClose();
    action();
  };

  const items: DrawerItem[] = [
    {
      id: 'home',
      icon: 'home',
      label: strings.common.backToHome,
      onPress: () => navigate(() => router.replace(ROUTES.HOME as Href)),
    },
    {
      id: 'tour',
      icon: 'tour',
      label: strings.tour.menu.startTour,
      onPress: () => navigate(openFromMenu),
    },
    {
      id: 'why-flashcards',
      icon: 'guide',
      label: strings.whyFlashcards.menuLabel,
      onPress: () => navigate(() => router.push(ROUTES.WHY_FLASHCARDS as Href)),
    },
    {
      id: 'settings',
      icon: 'settings',
      label: strings.common.settings,
      onPress: () => navigate(() => router.push(ROUTES.SETTINGS as Href)),
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={strings.common.closeMenu}
        onPress={onClose}
        style={{ backgroundColor: withAlpha(colors.textPrimary, 0.4) }}
        className="flex-1 flex-row justify-end"
      >
        {/* Panel: Pressable that does not propagate taps so inner touches do not close. */}
        <Pressable
          onPress={() => undefined}
          style={{ backgroundColor: colors.background, width: 288, ...shadows.lg }}
          className="h-full"
        >
          <SafeAreaView edges={['top']} className="flex-1">
            <View className="gap-1 p-4">
              <Text
                style={{ color: colors.textSecondary }}
                className="mb-2 px-3 text-xs font-semibold uppercase"
              >
                {strings.common.menu}
              </Text>
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={item.onPress}
                  className="flex-row items-center gap-3 rounded-xl p-3 active:opacity-90"
                >
                  <View
                    style={{ backgroundColor: withAlpha(colors.primary, 0.16) }}
                    className="h-10 w-10 items-center justify-center rounded-full"
                  >
                    <Icon name={item.icon} tone="primary" />
                  </View>
                  <Text style={{ color: colors.textPrimary }} className="text-base font-medium">
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
