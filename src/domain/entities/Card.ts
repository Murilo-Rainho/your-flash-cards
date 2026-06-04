import type { CardType } from '@/constants/cardTypes';

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
  notes?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};
