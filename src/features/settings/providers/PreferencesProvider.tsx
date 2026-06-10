import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { APP_SETTINGS_KEYS } from '@/constants/appSettingsKeys';
import {
  DEFAULT_TTS_PLAYBACK_SPEED,
  resolveTtsPlaybackSpeedPreference,
  type TtsPlaybackSpeed,
} from '@/constants/tts';
import type { AppSettingsRepository } from '@/domain/repositories/AppSettingsRepository';
import { getSQLiteAppSettingsRepository } from '@/infrastructure/database/sqlite/repositories';
import { resolveStrings } from '@/strings';
import { DEFAULT_LOCALE, type LocaleCode, type StringCatalog } from '@/strings/types';
import { ThemeProvider } from '@/theme/ThemeContext';
import {
  DEFAULT_THEME_PALETTE_PRESET,
  isThemePalettePresetId,
  type ThemePalettePresetId,
} from '@/theme/palettes';

type PreferencesContextValue = {
  locale: LocaleCode;
  strings: StringCatalog;
  palettePresetId: ThemePalettePresetId;
  ttsPlaybackSpeed: TtsPlaybackSpeed;
  isReady: boolean;
  setLocale: (locale: LocaleCode) => Promise<void>;
  setPalettePresetId: (presetId: ThemePalettePresetId) => Promise<void>;
  setTtsPlaybackSpeed: (speed: TtsPlaybackSpeed) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

type PreferencesProviderProps = {
  children: ReactNode;
  repository?: AppSettingsRepository;
};

async function loadPreferences(repository: AppSettingsRepository): Promise<{
  locale: LocaleCode;
  palettePresetId: ThemePalettePresetId;
  ttsPlaybackSpeed: TtsPlaybackSpeed;
}> {
  const settings = await repository.getMany([
    APP_SETTINGS_KEYS.UI_LOCALE,
    APP_SETTINGS_KEYS.THEME_PALETTE,
    APP_SETTINGS_KEYS.TTS_PLAYBACK_SPEED,
  ]);

  const localeValue = settings[APP_SETTINGS_KEYS.UI_LOCALE];
  const paletteValue = settings[APP_SETTINGS_KEYS.THEME_PALETTE];
  const ttsPlaybackSpeedValue = settings[APP_SETTINGS_KEYS.TTS_PLAYBACK_SPEED];

  return {
    locale: localeValue === 'en-US' || localeValue === 'pt-BR' ? localeValue : DEFAULT_LOCALE,
    palettePresetId:
      paletteValue && isThemePalettePresetId(paletteValue)
        ? paletteValue
        : DEFAULT_THEME_PALETTE_PRESET,
    ttsPlaybackSpeed: resolveTtsPlaybackSpeedPreference(ttsPlaybackSpeedValue),
  };
}

export function PreferencesProvider({
  children,
  repository = getSQLiteAppSettingsRepository(),
}: PreferencesProviderProps) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [palettePresetId, setPalettePresetIdState] = useState<ThemePalettePresetId>(
    DEFAULT_THEME_PALETTE_PRESET,
  );
  const [ttsPlaybackSpeed, setTtsPlaybackSpeedState] = useState<TtsPlaybackSpeed>(
    DEFAULT_TTS_PLAYBACK_SPEED,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadPreferences(repository).then((preferences) => {
      if (cancelled) {
        return;
      }

      setLocaleState(preferences.locale);
      setPalettePresetIdState(preferences.palettePresetId);
      setTtsPlaybackSpeedState(preferences.ttsPlaybackSpeed);
      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  const setLocale = useCallback(
    async (nextLocale: LocaleCode) => {
      setLocaleState(nextLocale);
      await repository.set(APP_SETTINGS_KEYS.UI_LOCALE, nextLocale);
    },
    [repository],
  );

  const setPalettePresetId = useCallback(
    async (nextPresetId: ThemePalettePresetId) => {
      setPalettePresetIdState(nextPresetId);
      await repository.set(APP_SETTINGS_KEYS.THEME_PALETTE, nextPresetId);
    },
    [repository],
  );

  const setTtsPlaybackSpeed = useCallback(
    async (nextSpeed: TtsPlaybackSpeed) => {
      setTtsPlaybackSpeedState(nextSpeed);
      await repository.set(APP_SETTINGS_KEYS.TTS_PLAYBACK_SPEED, nextSpeed);
    },
    [repository],
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      locale,
      strings: resolveStrings(locale),
      palettePresetId,
      ttsPlaybackSpeed,
      isReady,
      setLocale,
      setPalettePresetId,
      setTtsPlaybackSpeed,
    }),
    [
      isReady,
      locale,
      palettePresetId,
      setLocale,
      setPalettePresetId,
      setTtsPlaybackSpeed,
      ttsPlaybackSpeed,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>
      <ThemeProvider palettePresetId={palettePresetId}>{children}</ThemeProvider>
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }

  return context;
}

/** Atalho para o catálogo de strings da locale ativa. */
export function useStrings(): StringCatalog {
  return usePreferences().strings;
}
