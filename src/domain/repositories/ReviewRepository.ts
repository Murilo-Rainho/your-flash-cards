import type { CardType } from '@/constants/cardTypes';
import type { ClozeContent } from '@/domain/cloze/clozeContent';
import type { ReviewRating } from '@/constants/reviewRatings';
import type { VariantType } from '@/domain/entities/CardVariant';
import type { Media } from '@/domain/entities/Media';
import type { ReviewItem } from '@/domain/entities/ReviewItem';
import type { ReviewLog } from '@/domain/entities/ReviewLog';

/**
 * Due card ready for a review session (§20, §35).
 *
 * Loads everything the UI needs to build the `FlashcardViewModel` and the full scheduling
 * state (`reviewItem`) that feeds `ReviewScheduler`. Reverse front↔back inversion is the
 * presentation layer's responsibility — the repository delivers raw data.
 */
export type DueReviewCard = {
  reviewItem: ReviewItem;
  cardId: string;
  cardType: CardType;
  front: string;
  back: string;
  /** Structured cloze content (when the card is cloze and was saved in the new format). */
  cloze?: ClozeContent;
  notes?: string;
  variantType: VariantType;
  media: Media[];
};

/**
 * Summary of a card reviewed on a given day (§33 #12, day history).
 *
 * `finalRating` is the most recent log rating for the card that day (the "final rating");
 * `attempts` is how many ratings the card received that day (includes Again re-queues).
 */
export type DailyReviewedCard = {
  cardId: string;
  cardType: CardType;
  front: string;
  back: string;
  finalRating: ReviewRating;
  attempts: number;
  reviewedAt: string;
};

export type ListDueReviewCardsParams = {
  now: Date;
  /** Session card cap (§20: `... ORDER BY next_review_at ASC LIMIT :sessionLimit`). */
  limit: number;
  /** Future filters (§21) — extension point; base query unchanged when absent. */
  collectionId?: string;
  deckId?: string;
};

/** Result already computed by `ReviewScheduler`; the repository only persists. */
export type ApplyReviewResult = {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lapses: number;
  nextReviewAt: string;
};

export type ApplyReviewInput = {
  reviewItemId: string;
  rating: ReviewRating;
  reviewedAt: Date;
  timeSpentMs: number;
  sessionId?: string;
  previousIntervalDays: number;
  previousEaseFactor: number;
  result: ApplyReviewResult;
};

/**
 * Local review port (§31): reads due cards and applies a rating result atomically (updates
 * `review_items` + writes `review_logs`). SM-2 calculation lives in the domain (rule 01) —
 * only the ready `result` enters here.
 */
export type ReviewRepository = {
  listDueReviewCards(params: ListDueReviewCardsParams): Promise<DueReviewCard[]>;
  applyReview(input: ApplyReviewInput): Promise<ReviewLog>;
  /** Cards reviewed on the day of `now` (local start-of-day → now), with final rating per card. */
  listReviewsForDay(now: Date): Promise<DailyReviewedCard[]>;
};
