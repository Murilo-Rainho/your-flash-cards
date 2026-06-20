/** SM-2 baseline for a newly created card (§18, §30). Shared by creation and dev reset. */
export const INITIAL_REVIEW_ITEM_STATE = {
  schedulerType: 'sm2',
  schedulerVersion: 'v1',
  repetitions: 0,
  intervalDays: 0,
  easeFactor: 2.5,
  lapses: 0,
} as const;
