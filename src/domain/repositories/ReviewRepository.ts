import type { CardType } from '@/constants/cardTypes';
import type { ReviewRating } from '@/constants/reviewRatings';
import type { VariantType } from '@/domain/entities/CardVariant';
import type { Media } from '@/domain/entities/Media';
import type { ReviewItem } from '@/domain/entities/ReviewItem';
import type { ReviewLog } from '@/domain/entities/ReviewLog';

/**
 * Card vencido pronto para a sessão de revisão (§20, §35).
 *
 * Carrega tudo que a UI precisa para montar o `FlashcardViewModel` e o estado completo de
 * scheduling (`reviewItem`) que alimenta o `ReviewScheduler`. A inversão front↔back do reverso
 * é responsabilidade da camada de apresentação — o repositório entrega os dados crus.
 */
export type DueReviewCard = {
  reviewItem: ReviewItem;
  cardId: string;
  cardType: CardType;
  front: string;
  back: string;
  notes?: string;
  variantType: VariantType;
  media: Media[];
};

/**
 * Resumo de um card revisado em um determinado dia (§33 #12, histórico do dia).
 *
 * `finalRating` é a nota do log mais recente do dia para o card (a "nota final"); `attempts`
 * é quantas avaliações o card recebeu no dia (inclui repetições de "Errei").
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
  /** Teto de cards da sessão (§20: `... ORDER BY next_review_at ASC LIMIT :sessionLimit`). */
  limit: number;
  /** Filtros futuros (§21) — ponto de extensão; a query base não muda quando ausentes. */
  collectionId?: string;
  deckId?: string;
};

/** Resultado já calculado pelo `ReviewScheduler`; o repositório só persiste. */
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
 * Porta local de revisão (§31): lê vencidos e aplica o resultado de uma avaliação de forma
 * atômica (atualiza `review_items` + grava `review_logs`). O cálculo SM-2 fica no domínio
 * (regra 01) — aqui só entra o `result` pronto.
 */
export type ReviewRepository = {
  listDueReviewCards(params: ListDueReviewCardsParams): Promise<DueReviewCard[]>;
  applyReview(input: ApplyReviewInput): Promise<ReviewLog>;
  /** Cards revisados no dia de `now` (start-of-day local → now), com a nota final por card. */
  listReviewsForDay(now: Date): Promise<DailyReviewedCard[]>;
};
