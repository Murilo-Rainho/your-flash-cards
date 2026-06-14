/**
 * Estado do Guided Tour (Onboarding, §33). TS puro, sem React/Expo — a persistência
 * concreta vive na infraestrutura (KV `app_settings`) e o estado é serializado em JSON.
 */

export type TourStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export const TOUR_STATUSES: readonly TourStatus[] = [
  'not_started',
  'in_progress',
  'completed',
  'skipped',
] as const;

/**
 * Configuração central versionada do tour. `version` permite reconciliar/expandir steps
 * no futuro sem quebrar usuários existentes (ver `tourStateSerialization`).
 */
export type TourState = {
  version: number;
  status: TourStatus;
  /** Id do step atual quando `in_progress`; `null` nos demais estados. */
  currentStepId: string | null;
  /** Ids de steps já concluídos (sem duplicados, na ordem do registro). */
  completedStepIds: string[];
};

/** Versão atual do esquema do tour base. */
export const CURRENT_TOUR_VERSION = 1;

/** Estado inicial (primeira execução / reset). */
export const INITIAL_TOUR_STATE: TourState = {
  version: CURRENT_TOUR_VERSION,
  status: 'not_started',
  currentStepId: null,
  completedStepIds: [],
};

export function isTourStatus(value: unknown): value is TourStatus {
  return typeof value === 'string' && (TOUR_STATUSES as readonly string[]).includes(value);
}
