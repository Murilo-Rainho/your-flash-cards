/**
 * DECLARATIVE registry of base tour steps. Contains only structural data and stable
 * ids — title/description are resolved by id in the translation catalog (i18n),
 * keeping the domain free of copy and UI dependencies.
 *
 * To add a step later: include a new item with a unique `id` and sequential `order`.
 * `tourStateSerialization` reconciles old states automatically.
 */

/** Purely educational step (explains a concept) or interface step (points to an area). */
export type TourStepKind = 'educational' | 'interface';

/** Optional secondary action available on a step. */
export type TourStepAction = 'open-why-flashcards';

export type TourStepId =
  | 'welcome'
  | 'why-flashcards'
  | 'home-daily-review'
  | 'collections-decks-cards'
  | 'creating-good-cards'
  | 'cloze-cards'
  | 'spaced-repetition'
  | 'finish';

export type TourStep = {
  id: TourStepId;
  /** 1-based position in the sequence. */
  order: number;
  kind: TourStepKind;
  /** Optional secondary action shown on the step. */
  action?: TourStepAction;
};

/** Base tour steps, in order. Single source for the sequence. */
export const BASE_TOUR_STEPS: readonly TourStep[] = [
  { id: 'welcome', order: 1, kind: 'educational' },
  { id: 'why-flashcards', order: 2, kind: 'educational', action: 'open-why-flashcards' },
  { id: 'home-daily-review', order: 3, kind: 'interface' },
  { id: 'collections-decks-cards', order: 4, kind: 'interface' },
  { id: 'creating-good-cards', order: 5, kind: 'educational' },
  { id: 'cloze-cards', order: 6, kind: 'educational' },
  { id: 'spaced-repetition', order: 7, kind: 'educational' },
  { id: 'finish', order: 8, kind: 'educational', action: 'open-why-flashcards' },
] as const;

/** Set of valid registry ids (for reconciliation/validation). */
export const BASE_TOUR_STEP_IDS: readonly string[] = BASE_TOUR_STEPS.map((step) => step.id);

export function getFirstTourStep(steps: readonly TourStep[] = BASE_TOUR_STEPS): TourStep | null {
  return [...steps].sort((a, b) => a.order - b.order)[0] ?? null;
}

export function findTourStepById(
  id: string | null,
  steps: readonly TourStep[] = BASE_TOUR_STEPS,
): TourStep | null {
  if (id === null) {
    return null;
  }

  return steps.find((step) => step.id === id) ?? null;
}

export function getTourStepIndex(
  id: string | null,
  steps: readonly TourStep[] = BASE_TOUR_STEPS,
): number {
  if (id === null) {
    return -1;
  }

  const ordered = [...steps].sort((a, b) => a.order - b.order);
  return ordered.findIndex((step) => step.id === id);
}
