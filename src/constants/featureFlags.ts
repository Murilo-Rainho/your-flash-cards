/**
 * Feature keys used by `PremiumGate` (§28, §32.5).
 *
 * Rule (§4.2): anything requiring internet/API/backend/remote storage is Premium.
 * Only the KEYS (constants) live here — the allow/block decision lives in
 * infrastructure. None of these features are implemented in V1 (§37); they are
 * extension points.
 */
export const PREMIUM_FEATURES = {
  SYNC: 'sync',
  CLOUD_BACKUP: 'cloud_backup',
  CLOUD_RESTORE: 'cloud_restore',
  DECK_MARKETPLACE: 'deck_marketplace',
  REMOTE_SHARING: 'remote_sharing',
  AI: 'ai',
  ONLINE_IMPORT: 'online_import',
} as const;

export type PremiumFeatureKey = (typeof PREMIUM_FEATURES)[keyof typeof PREMIUM_FEATURES];
