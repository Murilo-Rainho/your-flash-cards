/**
 * Constantes globais do aplicativo.
 *
 * Observação (§4.1): o plano Free NÃO impõe limite de quantidade de cards — o
 * usuário pode criar quantos cards quiser localmente. Por isso não existe um
 * `cardLimitFree`: criação local de cards é ilimitada.
 */
export const appConfig = {
  appName: 'Flashcards',
  version: '1.0.0',
} as const;

export type AppConfig = typeof appConfig;
