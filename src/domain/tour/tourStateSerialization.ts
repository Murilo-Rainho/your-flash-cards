import {
  CURRENT_TOUR_VERSION,
  INITIAL_TOUR_STATE,
  isTourStatus,
  type TourState,
} from './TourState';
import { BASE_TOUR_STEP_IDS, BASE_TOUR_STEPS, type TourStep } from './tourSteps';

/**
 * Serialização/parse do estado do tour para o KV `app_settings` (string JSON).
 *
 * O parse é DEFENSIVO e reconcilia versões: JSON inválido, versão diferente ou formato
 * inesperado caem para `INITIAL_TOUR_STATE`. Ids de steps que não existem mais no registro
 * são descartados, e `currentStepId` inválido é normalizado — garantindo que adicionar/
 * remover steps no futuro não quebre usuários existentes.
 */

export function serializeTourState(state: TourState): string {
  return JSON.stringify(state);
}

function knownStepIds(steps: readonly TourStep[]): readonly string[] {
  return steps === BASE_TOUR_STEPS ? BASE_TOUR_STEP_IDS : steps.map((step) => step.id);
}

export function parseTourState(
  raw: string | null,
  steps: readonly TourStep[] = BASE_TOUR_STEPS,
): TourState {
  if (!raw) {
    return INITIAL_TOUR_STATE;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return INITIAL_TOUR_STATE;
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return INITIAL_TOUR_STATE;
  }

  const candidate = parsed as Record<string, unknown>;

  // Versão diferente da atual → reset seguro (ponto de extensão para migrações futuras).
  if (candidate.version !== CURRENT_TOUR_VERSION) {
    return INITIAL_TOUR_STATE;
  }

  if (!isTourStatus(candidate.status)) {
    return INITIAL_TOUR_STATE;
  }

  const validIds = knownStepIds(steps);

  const completedStepIds = Array.isArray(candidate.completedStepIds)
    ? candidate.completedStepIds.filter(
        (id): id is string => typeof id === 'string' && validIds.includes(id),
      )
    : [];

  const rawCurrent = candidate.currentStepId;
  const currentStepId =
    typeof rawCurrent === 'string' && validIds.includes(rawCurrent) ? rawCurrent : null;

  // `in_progress` exige um step atual válido; se perdeu a referência, recomeça.
  if (candidate.status === 'in_progress' && currentStepId === null) {
    return INITIAL_TOUR_STATE;
  }

  return {
    version: CURRENT_TOUR_VERSION,
    status: candidate.status,
    currentStepId: candidate.status === 'in_progress' ? currentStepId : null,
    completedStepIds,
  };
}
