export type ReviewItem = {
  id: string;
  cardVariantId: string;
  schedulerType: string;
  schedulerVersion: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: string;
  lastReviewedAt?: string;
  lapses: number;
  createdAt: string;
  updatedAt: string;
};
