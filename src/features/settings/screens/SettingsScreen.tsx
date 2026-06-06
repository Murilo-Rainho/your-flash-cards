import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { type Href, useRouter } from 'expo-router';

import { SecondaryButton } from '@/components/common/SecondaryButton';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/components/forms/FormScreen';
import { SelectableCard } from '@/components/forms/SelectableCard';
import { usePreferences, useStrings } from '@/features/settings/providers/PreferencesProvider';
import { SUPPORTED_LOCALES, type LocaleCode } from '@/strings/types';
import { THEME_PALETTE_PRESETS, type ThemePalettePresetId } from '@/theme/palettes';
import { useTheme } from '@/theme/useTheme';
import { useGoBack } from '@/hooks/useGoBack';

const paletteOptions: Array<{
  id: ThemePalettePresetId;
  labelKey:
    | 'paletteDefault'
    | 'paletteOcean'
    | 'paletteForest'
    | 'paletteMidnight'
    | 'paletteCarbon';
}> = [
  { id: 'default', labelKey: 'paletteDefault' },
  { id: 'ocean', labelKey: 'paletteOcean' },
  { id: 'forest', labelKey: 'paletteForest' },
  { id: 'midnight', labelKey: 'paletteMidnight' },
  { id: 'carbon', labelKey: 'paletteCarbon' },
];

export function SettingsScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const strings = useStrings();
  const { colors } = useTheme();
  const { locale, palettePresetId, setLocale, setPalettePresetId } = usePreferences();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleLocaleChange = async (nextLocale: LocaleCode) => {
    await setLocale(nextLocale);
    setSavedMessage(strings.settings.saved);
  };

  const handlePaletteChange = async (nextPreset: ThemePalettePresetId) => {
    await setPalettePresetId(nextPreset);
    setSavedMessage(strings.settings.saved);
  };

  return (
    <FormScreen>
      <ScreenHeader title={strings.settings.title} onBack={goBack} />

      <View className="gap-3">
        <Text style={{ color: colors.textPrimary }} className="text-lg font-semibold">
          {strings.settings.languageSection}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {strings.settings.languageDescription}
        </Text>
        <View className="gap-2">
          {SUPPORTED_LOCALES.map((supportedLocale) => (
            <SelectableCard
              key={supportedLocale}
              title={supportedLocale}
              selected={locale === supportedLocale}
              accessibilityLabel={`${strings.settings.languageSection} ${supportedLocale}`}
              onPress={() => void handleLocaleChange(supportedLocale)}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text style={{ color: colors.textPrimary }} className="text-lg font-semibold">
          {strings.settings.themeSection}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {strings.settings.themeDescription}
        </Text>
        <View className="gap-2">
          {paletteOptions.map((option) => {
            const palette = THEME_PALETTE_PRESETS[option.id];

            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={strings.settings[option.labelKey]}
                onPress={() => void handlePaletteChange(option.id)}
                style={{
                  borderColor: palettePresetId === option.id ? palette.primary : colors.border,
                  backgroundColor: colors.surface,
                  borderWidth: palettePresetId === option.id ? 2 : 1,
                }}
                className="gap-3 rounded-xl p-4 active:opacity-90"
              >
                <Text style={{ color: colors.textPrimary }} className="text-base font-semibold">
                  {strings.settings[option.labelKey]}
                </Text>
                <View className="flex-row gap-2">
                  <View
                    style={{ backgroundColor: palette.primary }}
                    className="h-8 w-8 rounded-full"
                  />
                  <View
                    style={{ backgroundColor: palette.secondary }}
                    className="h-8 w-8 rounded-full"
                  />
                  <View
                    style={{ backgroundColor: palette.background, borderColor: colors.border }}
                    className="h-8 w-8 rounded-full border"
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {__DEV__ ? (
        <View className="gap-3">
          <Text style={{ color: colors.textPrimary }} className="text-lg font-semibold">
            {strings.settings.devToolsSection}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-sm">
            {strings.settings.devToolsDescription}
          </Text>
          <SecondaryButton
            label={strings.settings.devToolsButton}
            onPress={() => router.push(ROUTES.DEV_TOOLS as Href)}
          />
        </View>
      ) : null}

      {savedMessage ? (
        <Text style={{ color: colors.success }} className="text-sm font-medium">
          {savedMessage}
        </Text>
      ) : null}
    </FormScreen>
  );
}
