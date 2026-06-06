/** Baseline SM-2 de um card recém-criado (§18, §30). Compartilhado entre criação e reset dev. */
export const INITIAL_REVIEW_ITEM_STATE = {
  schedulerType: 'sm2',
  schedulerVersion: 'v1',
  repetitions: 0,
  intervalDays: 0,
  easeFactor: 2.5,
  lapses: 0,
} as const;
