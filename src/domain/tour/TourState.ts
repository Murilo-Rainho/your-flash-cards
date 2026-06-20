/**
 * Guided Tour state (Onboarding, §33). Pure TS, no React/Expo — concrete persistence
 * lives in infrastructure (KV `app_settings`) and state is serialized as JSON.
 */

export type TourStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export const TOUR_STATUSES: readonly TourStatus[] = [
  'not_started',
  'in_progress',
  'completed',
  'skipped',
] as const;

/**
 * Versioned central tour configuration. `version` allows reconciling/expanding steps
 * in the future without breaking existing users (see `tourStateSerialization`).
 */
export type TourState = {
  version: number;
  status: TourStatus;
  /** Current step id when `in_progress`; `null` in other states. */
  currentStepId: string | null;
  /** Completed step ids (no duplicates, in registration order). */
  completedStepIds: string[];
};

/** Current base tour schema version. */
export const CURRENT_TOUR_VERSION = 1;

/** Initial state (first run / reset). */
export const INITIAL_TOUR_STATE: TourState = {
  version: CURRENT_TOUR_VERSION,
  status: 'not_started',
  currentStepId: null,
  completedStepIds: [],
};

export function isTourStatus(value: unknown): value is TourStatus {
  return typeof value === 'string' && (TOUR_STATUSES as readonly string[]).includes(value);
}
