import { CURRENT_TOUR_VERSION, INITIAL_TOUR_STATE, type TourState } from './TourState';
import { BASE_TOUR_STEPS, getFirstTourStep, getTourStepIndex, type TourStep } from './tourSteps';

/**
 * PURE deterministic tour transitions. Each function receives the current state and
 * returns a new (immutable) state — no side effects, no React, no I/O.
 * Persistence is the feature/infra layer's responsibility.
 */

/** Sorts steps by `order` (copy; does not mutate input). */
function orderedSteps(steps: readonly TourStep[]): TourStep[] {
  return [...steps].sort((a, b) => a.order - b.order);
}

/** Appends an id to `completedStepIds` keeping uniqueness and registration order. */
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

/** Starts the tour from the first step (`not_started`/any state → `in_progress`). */
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

/** Restarts from scratch (clears progress) and begins at the first step. */
export function restartTour(steps: readonly TourStep[] = BASE_TOUR_STEPS): TourState {
  return startTour(steps);
}

/** Marks the tour as skipped, preserving what was already completed. */
export function skipTour(state: TourState): TourState {
  return { ...state, status: 'skipped', currentStepId: null };
}

/** Marks the tour as completed (all steps become completed). */
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
 * Advances to the next step, marking the current one completed. Advancing from the
 * last step finishes the tour (`completed`).
 */
export function goToNextStep(
  state: TourState,
  steps: readonly TourStep[] = BASE_TOUR_STEPS,
): TourState {
  const ordered = orderedSteps(steps);
  const currentIndex = getTourStepIndex(state.currentStepId, ordered);

  if (currentIndex === -1) {
    // Inconsistent state: (re)start from the first step.
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

/** Goes to the previous step. Going back on the first step keeps current state. */
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

/** Progress 0–100 based on current step position / completed. */
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
