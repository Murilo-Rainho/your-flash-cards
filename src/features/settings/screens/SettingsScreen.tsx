import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { type Href, useRouter } from 'expo-router';

import { Header } from '@/components/common/Header';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ROUTES } from '@/constants/routes';
import { TTS_PLAYBACK_SPEEDS, type TtsPlaybackSpeed } from '@/constants/tts';
import { FormScreen } from '@/components/forms/FormScreen';
import { SelectField, type SelectOption } from '@/components/forms/SelectField';
import { usePreferences, useStrings } from '@/features/settings/providers/PreferencesProvider';
import { SUPPORTED_LOCALES, type LocaleCode } from '@/strings/types';
import { withAlpha } from '@/theme/createShadows';
import { THEME_PALETTE_PRESETS, type ThemePalettePresetId } from '@/theme/palettes';
import { useTheme } from '@/theme/useTheme';

const paletteOptions: Array<{
  id: ThemePalettePresetId;
  labelKey:
    | 'paletteDefault'
    | 'paletteOcean'
    | 'paletteForest'
    | 'paletteSunset'
    | 'paletteSakura'
    | 'paletteEmerald'
    | 'paletteRoyal'
    | 'paletteMidnight'
    | 'paletteCarbon';
}> = [
  { id: 'default', labelKey: 'paletteDefault' },
  { id: 'ocean', labelKey: 'paletteOcean' },
  { id: 'forest', labelKey: 'paletteForest' },
  { id: 'sunset', labelKey: 'paletteSunset' },
  { id: 'sakura', labelKey: 'paletteSakura' },
  { id: 'emerald', labelKey: 'paletteEmerald' },
  { id: 'royal', labelKey: 'paletteRoyal' },
  { id: 'midnight', labelKey: 'paletteMidnight' },
  { id: 'carbon', labelKey: 'paletteCarbon' },
];

type SettingsSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  const { colors, shadows } = useTheme();

  return (
    <View className="gap-3">
      <SectionTitle title={title} />
      <View
        style={{ borderColor: colors.border, backgroundColor: colors.surface, ...shadows.sm }}
        className="gap-4 rounded-2xl border p-4"
      >
        <Text style={{ color: colors.textSecondary }} className="text-sm">
          {description}
        </Text>
        {children}
      </View>
    </View>
  );
}

export function SettingsScreen() {
  const router = useRouter();
  const strings = useStrings();
  const { colors } = useTheme();
  const {
    locale,
    palettePresetId,
    setLocale,
    setPalettePresetId,
    setTtsPlaybackSpeed,
    ttsPlaybackSpeed,
  } = usePreferences();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const localeOptions: SelectOption[] = SUPPORTED_LOCALES.map((supportedLocale) => ({
    value: supportedLocale,
    label: supportedLocale,
  }));
  const themeOptions: SelectOption[] = paletteOptions.map((option) => ({
    value: option.id,
    label: strings.settings[option.labelKey],
  }));
  const ttsSpeedOptions: SelectOption[] = [
    { value: TTS_PLAYBACK_SPEEDS.FAST, label: strings.common.fast },
    { value: TTS_PLAYBACK_SPEEDS.SLOW, label: strings.common.slow },
  ];
  const selectedPalette = THEME_PALETTE_PRESETS[palettePresetId];

  const handleLocaleChange = async (nextLocale: LocaleCode) => {
    await setLocale(nextLocale);
    setSavedMessage(strings.settings.saved);
  };

  const handlePaletteChange = async (nextPreset: ThemePalettePresetId) => {
    await setPalettePresetId(nextPreset);
    setSavedMessage(strings.settings.saved);
  };

  const handleTtsPlaybackSpeedChange = async (nextSpeed: TtsPlaybackSpeed) => {
    await setTtsPlaybackSpeed(nextSpeed);
    setSavedMessage(strings.settings.saved);
  };

  return (
    <FormScreen>
      <Header variant="page" title={strings.settings.title} />

      <SettingsSection
        title={strings.settings.languageSection}
        description={strings.settings.languageDescription}
      >
        <SelectField
          label={strings.settings.languageSection}
          value={locale}
          placeholder={strings.settings.languageSection}
          options={localeOptions}
          showLabel={false}
          closeAccessibilityLabel={`${strings.common.cancel} ${strings.settings.languageSection}`}
          onChange={(nextLocale) => void handleLocaleChange(nextLocale as LocaleCode)}
        />
      </SettingsSection>

      <SettingsSection
        title={strings.settings.themeSection}
        description={strings.settings.themeDescription}
      >
        <SelectField
          label={strings.settings.themeSection}
          value={palettePresetId}
          placeholder={strings.settings.themeSection}
          options={themeOptions}
          showLabel={false}
          closeAccessibilityLabel={`${strings.common.cancel} ${strings.settings.themeSection}`}
          onChange={(nextPreset) => void handlePaletteChange(nextPreset as ThemePalettePresetId)}
        />
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className="flex-row gap-2"
        >
          <View
            style={{ backgroundColor: selectedPalette.primary }}
            className="h-8 w-8 rounded-full"
          />
          <View
            style={{ backgroundColor: selectedPalette.secondary }}
            className="h-8 w-8 rounded-full"
          />
          <View
            style={{ backgroundColor: selectedPalette.background, borderColor: colors.border }}
            className="h-8 w-8 rounded-full border"
          />
        </View>
      </SettingsSection>

      <SettingsSection
        title={strings.settings.ttsSpeedSection}
        description={strings.settings.ttsSpeedDescription}
      >
        <SelectField
          label={strings.settings.ttsSpeedSection}
          value={ttsPlaybackSpeed}
          placeholder={strings.settings.ttsSpeedSection}
          options={ttsSpeedOptions}
          showLabel={false}
          closeAccessibilityLabel={`${strings.common.cancel} ${strings.settings.ttsSpeedSection}`}
          onChange={(nextSpeed) => void handleTtsPlaybackSpeedChange(nextSpeed as TtsPlaybackSpeed)}
        />
      </SettingsSection>

      {__DEV__ ? (
        <SettingsSection
          title={strings.settings.devToolsSection}
          description={strings.settings.devToolsDescription}
        >
          <SecondaryButton
            label={strings.settings.devToolsButton}
            onPress={() => router.push(ROUTES.DEV_TOOLS as Href)}
          />
        </SettingsSection>
      ) : null}

      {savedMessage ? (
        <View
          style={{
            borderColor: colors.success,
            backgroundColor: withAlpha(colors.success, 0.14),
          }}
          className="rounded-2xl border px-4 py-3"
        >
          <Text style={{ color: colors.success }} className="text-sm font-semibold">
            {savedMessage}
          </Text>
        </View>
      ) : null}
    </FormScreen>
  );
}
