import { type Href, useRouter } from 'expo-router';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/common/Icon';
import { ROUTES } from '@/constants/routes';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
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
 * Drawer lateral do app, aberto pelo Hamburger Menu do `Header`. Usa o mesmo padrão
 * de `Modal` transparente do `QuickActionsFab` (sem lib de navegação extra). Por ora
 * só oferece "Voltar para Home" e "Configurações" (§33).
 */
export function AppDrawer({ visible, onClose }: AppDrawerProps) {
  const router = useRouter();
  const strings = useStrings();
  const { colors, shadows } = useTheme();

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
        {/* Painel: Pressable que não propaga o toque para não fechar ao tocar dentro. */}
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
