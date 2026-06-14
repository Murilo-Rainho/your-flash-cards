import { cards } from './cards';
import { collections } from './collections';
import { common } from './common';
import { decks } from './decks';
import { home } from './home';
import { review } from './review';
import { settings } from './settings';
import { tags } from './tags';
import { tour } from './tour';
import { whyFlashcards } from './whyFlashcards';

export const ptBR = {
  common,
  home,
  collections,
  decks,
  cards,
  review,
  tags,
  settings,
  tour,
  whyFlashcards,
} as const;
