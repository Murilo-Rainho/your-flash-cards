/** Keys persisted in the `app_settings` table. */
export const APP_SETTINGS_KEYS = {
  UI_LOCALE: 'ui.locale',
  THEME_PALETTE: 'theme.palette',
  TTS_PLAYBACK_SPEED: 'tts.playbackSpeed',
  TOUR_BASE_STATE: 'tour.baseTour.state',
} as const;

export type AppSettingsKey = (typeof APP_SETTINGS_KEYS)[keyof typeof APP_SETTINGS_KEYS];
