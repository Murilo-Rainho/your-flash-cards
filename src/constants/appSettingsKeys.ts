/** Chaves persistidas na tabela `app_settings`. */
export const APP_SETTINGS_KEYS = {
  UI_LOCALE: 'ui.locale',
  THEME_PALETTE: 'theme.palette',
} as const;

export type AppSettingsKey = (typeof APP_SETTINGS_KEYS)[keyof typeof APP_SETTINGS_KEYS];
