import type { ReviewRating } from '@/constants/reviewRatings';

/**
 * Registro imutável de uma avaliação de revisão (§19, §30.10).
 *
 * Espelha a tabela `review_logs` em camelCase. Guarda o "antes/depois" do scheduling para
 * estatísticas (§22) e auditoria, sem depender do algoritmo concreto. `sessionId` é opcional
 * (a tabela permite NULL) e fica como ponto de extensão para `study_sessions`.
 */
export type ReviewLog = {
  id: string;
  reviewItemId: string;
  sessionId?: string;
  rating: ReviewRating;
  reviewedAt: string;
  timeSpentMs: number;
  previousIntervalDays: number;
  nextIntervalDays: number;
  previousEaseFactor: number;
  nextEaseFactor: number;
};
