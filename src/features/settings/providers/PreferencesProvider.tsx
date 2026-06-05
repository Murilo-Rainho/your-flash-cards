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
  isReady: boolean;
  setLocale: (locale: LocaleCode) => Promise<void>;
  setPalettePresetId: (presetId: ThemePalettePresetId) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

type PreferencesProviderProps = {
  children: ReactNode;
  repository?: AppSettingsRepository;
};

async function loadPreferences(repository: AppSettingsRepository): Promise<{
  locale: LocaleCode;
  palettePresetId: ThemePalettePresetId;
}> {
  const settings = await repository.getMany([
    APP_SETTINGS_KEYS.UI_LOCALE,
    APP_SETTINGS_KEYS.THEME_PALETTE,
  ]);

  const localeValue = settings[APP_SETTINGS_KEYS.UI_LOCALE];
  const paletteValue = settings[APP_SETTINGS_KEYS.THEME_PALETTE];

  return {
    locale: localeValue === 'en-US' || localeValue === 'pt-BR' ? localeValue : DEFAULT_LOCALE,
    palettePresetId:
      paletteValue && isThemePalettePresetId(paletteValue)
        ? paletteValue
        : DEFAULT_THEME_PALETTE_PRESET,
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadPreferences(repository).then((preferences) => {
      if (cancelled) {
        return;
      }

      setLocaleState(preferences.locale);
      setPalettePresetIdState(preferences.palettePresetId);
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

  const value = useMemo<PreferencesContextValue>(
    () => ({
      locale,
      strings: resolveStrings(locale),
      palettePresetId,
      isReady,
      setLocale,
      setPalettePresetId,
    }),
    [isReady, locale, palettePresetId, setLocale, setPalettePresetId],
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
