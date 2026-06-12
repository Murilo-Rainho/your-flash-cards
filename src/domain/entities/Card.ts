import type { CardType } from '@/constants/cardTypes';
import type { ClozeContent } from '@/domain/cloze/clozeContent';

/**
 * Card fisico (§30.4). Variants derivadas definem apresentacao; o conteudo
 * autorado segue como fonte da verdade aqui.
 */
export type Card = {
  id: string;
  deckId: string;
  type: CardType;
  front: string;
  back: string;
  /**
   * Conteúdo estruturado do cloze (§9): múltiplas lacunas e múltiplas respostas aceitas por
   * lacuna. Fonte da verdade para cards `cloze`; `front`/`back` são derivados dele. Ausente em
   * outros tipos e em cards cloze legados (reconstruído via `clozeContentFromLegacy`).
   */
  cloze?: ClozeContent;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};
