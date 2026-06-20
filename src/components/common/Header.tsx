import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { AppDrawer } from '@/components/common/AppDrawer';
import { Icon } from '@/components/common/Icon';
import { useStrings } from '@/features/settings/providers/PreferencesProvider';
import { useGoBack } from '@/hooks/useGoBack';
import { useTheme } from '@/theme/useTheme';

import logoSource from '../../../assets/icon.png';

type HeaderProps = {
  /** `home` shows the logo on the left; `page` shows the back button. */
  variant?: 'home' | 'page';
  title?: string;
  subtitle?: string;
  /** Back button action (variant `page`); default = `useGoBack()`. */
  onBack?: () => void;
};

/**
 * Common app header: left (logo on Home / back elsewhere), center
 * (title + optional subtitle) and right (Hamburger Menu opening `AppDrawer`).
 * Must not be used during review/card test (immersive screens).
 */
export function Header({ variant = 'page', title, subtitle, onBack }: HeaderProps) {
  const strings = useStrings();
  const { colors } = useTheme();
  const goBack = useGoBack();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleBack = onBack ?? goBack;

  return (
    <>
      <View className="flex-row items-center gap-3">
        {variant === 'home' ? (
          <Image
            source={logoSource}
            resizeMode="contain"
            accessibilityLabel={strings.common.appName}
            className="h-10 w-10 rounded-xl"
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.common.back}
            onPress={handleBack}
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            className="h-10 w-10 items-center justify-center rounded-full border active:opacity-90"
          >
            <Icon name="back" tone="textPrimary" />
          </Pressable>
        )}

        <View className="min-w-0 flex-1">
          {title ? (
            <Text
              style={{ color: colors.textPrimary }}
              className="text-lg font-bold"
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={{ color: colors.textSecondary }} className="text-sm" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.common.openMenu}
          onPress={() => setDrawerOpen(true)}
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          className="h-10 w-10 items-center justify-center rounded-full border active:opacity-90"
        >
          <Icon name="menu" tone="textPrimary" />
        </Pressable>
      </View>

      <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
