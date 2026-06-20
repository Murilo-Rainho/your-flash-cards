import {
  CURRENT_TOUR_VERSION,
  INITIAL_TOUR_STATE,
  isTourStatus,
  type TourState,
} from './TourState';
import { BASE_TOUR_STEP_IDS, BASE_TOUR_STEPS, type TourStep } from './tourSteps';

/**
 * Tour state serialization/parse for the `app_settings` KV (JSON string).
 *
 * Parse is DEFENSIVE and reconciles versions: invalid JSON, mismatched version, or unexpected
 * format fall back to `INITIAL_TOUR_STATE`. Step ids no longer in the registry are dropped, and
 * invalid `currentStepId` is normalized — so adding/removing steps later does not break existing
 * users.
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

  // Version mismatch → safe reset (extension point for future migrations).
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

  // `in_progress` requires a valid current step; if reference is lost, restart.
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
