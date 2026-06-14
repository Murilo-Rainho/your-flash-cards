import { CURRENT_TOUR_VERSION, INITIAL_TOUR_STATE, type TourState } from './TourState';
import { BASE_TOUR_STEPS, getFirstTourStep, getTourStepIndex, type TourStep } from './tourSteps';

/**
 * Transições PURAS e determinísticas do tour. Cada função recebe o estado atual e
 * retorna um novo estado (imutável) — sem efeitos colaterais, sem React, sem I/O.
 * A persistência é responsabilidade da camada de feature/infra.
 */

/** Ordena os steps por `order` (cópia, não muta a entrada). */
function orderedSteps(steps: readonly TourStep[]): TourStep[] {
  return [...steps].sort((a, b) => a.order - b.order);
}

/** Acrescenta um id a `completedStepIds` mantendo unicidade e a ordem do registro. */
function withCompleted(
  completedStepIds: readonly string[],
  stepId: string,
  steps: readonly TourStep[],
): string[] {
  const next = new Set([...completedStepIds, stepId]);
  return orderedSteps(steps)
    .map((step) => step.id)
    .filter((id) => next.has(id));
}

/** Inicia o tour do primeiro step (`not_started`/qualquer estado → `in_progress`). */
export function startTour(steps: readonly TourStep[] = BASE_TOUR_STEPS): TourState {
  const first = getFirstTourStep(steps);

  if (!first) {
    return { ...INITIAL_TOUR_STATE, status: 'completed' };
  }

  return {
    version: CURRENT_TOUR_VERSION,
    status: 'in_progress',
    currentStepId: first.id,
    completedStepIds: [],
  };
}

/** Reinicia do zero (limpa progresso) e começa do primeiro step. */
export function restartTour(steps: readonly TourStep[] = BASE_TOUR_STEPS): TourState {
  return startTour(steps);
}

/** Marca o tour como pulado, preservando o que já havia sido concluído. */
export function skipTour(state: TourState): TourState {
  return { ...state, status: 'skipped', currentStepId: null };
}

/** Marca o tour como concluído (todos os steps viram concluídos). */
export function completeTour(
  state: TourState,
  steps: readonly TourStep[] = BASE_TOUR_STEPS,
): TourState {
  return {
    ...state,
    status: 'completed',
    currentStepId: null,
    completedStepIds: orderedSteps(steps).map((step) => step.id),
  };
}

/**
 * Avança para o próximo step, marcando o atual como concluído. Avançar a partir do
 * último step finaliza o tour (`completed`).
 */
export function goToNextStep(
  state: TourState,
  steps: readonly TourStep[] = BASE_TOUR_STEPS,
): TourState {
  const ordered = orderedSteps(steps);
  const currentIndex = getTourStepIndex(state.currentStepId, ordered);

  if (currentIndex === -1) {
    // Estado inconsistente: (re)começa do primeiro step.
    return startTour(ordered);
  }

  const currentStep = ordered[currentIndex];
  const completedStepIds = withCompleted(state.completedStepIds, currentStep.id, ordered);
  const nextStep = ordered[currentIndex + 1];

  if (!nextStep) {
    return {
      ...state,
      status: 'completed',
      currentStepId: null,
      completedStepIds,
    };
  }

  return {
    ...state,
    status: 'in_progress',
    currentStepId: nextStep.id,
    completedStepIds,
  };
}

/** Volta para o step anterior. Voltar no primeiro step mantém o estado atual. */
export function goToPreviousStep(
  state: TourState,
  steps: readonly TourStep[] = BASE_TOUR_STEPS,
): TourState {
  const ordered = orderedSteps(steps);
  const currentIndex = getTourStepIndex(state.currentStepId, ordered);

  if (currentIndex <= 0) {
    return state;
  }

  const previousStep = ordered[currentIndex - 1];

  return {
    ...state,
    status: 'in_progress',
    currentStepId: previousStep.id,
  };
}

/** Progresso 0–100 com base na posição do step atual / concluídos. */
export function getTourProgress(
  state: TourState,
  steps: readonly TourStep[] = BASE_TOUR_STEPS,
): number {
  const ordered = orderedSteps(steps);
  const total = ordered.length;

  if (total === 0) {
    return 0;
  }

  if (state.status === 'completed') {
    return 100;
  }

  const index = getTourStepIndex(state.currentStepId, ordered);
  const position = index === -1 ? 0 : index + 1;

  return Math.round((position / total) * 100);
}
