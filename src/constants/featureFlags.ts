/**
 * Chaves de feature usadas pelo `PremiumGate` (§28, §32.5).
 *
 * Regra (§4.2): tudo que exige internet/API/backend/storage remoto é Premium.
 * Aqui ficam apenas as CHAVES (constantes) — a decisão de liberar/bloquear vive
 * na infraestrutura. Nenhuma destas features é implementada na V1 (§37); são
 * pontos de extensão.
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
