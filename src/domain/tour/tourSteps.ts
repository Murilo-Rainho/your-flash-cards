import { ROUTES, type Route } from '@/constants/routes';

/**
 * Registro DECLARATIVO dos steps do tour base. Contém apenas dados estruturais e ids
 * estáveis — título/descrição são resolvidos por id no catálogo de tradução (i18n),
 * mantendo o domínio livre de texto e de dependências de UI.
 *
 * Para adicionar um step no futuro: inclua um novo item com `id` único e `order`
 * sequencial. O `tourStateSerialization` reconcilia estados antigos automaticamente.
 */

/** Step puramente educacional (explica um conceito) ou de interface (aponta uma área). */
export type TourStepKind = 'educational' | 'interface';

/** Ação secundária opcional disponível em um step. */
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
  /** Posição 1-based na sequência. */
  order: number;
  kind: TourStepKind;
  /** Rota associada (opcional) — usada por ações de navegação do step. */
  route?: Route;
  /** Ação secundária opcional exibida no step. */
  action?: TourStepAction;
};

/** Steps do tour base, em ordem. Fonte única da sequência. */
export const BASE_TOUR_STEPS: readonly TourStep[] = [
  { id: 'welcome', order: 1, kind: 'educational' },
  { id: 'why-flashcards', order: 2, kind: 'educational', action: 'open-why-flashcards' },
  { id: 'home-daily-review', order: 3, kind: 'interface', route: ROUTES.HOME },
  { id: 'collections-decks-cards', order: 4, kind: 'interface' },
  { id: 'creating-good-cards', order: 5, kind: 'educational' },
  { id: 'cloze-cards', order: 6, kind: 'educational' },
  { id: 'spaced-repetition', order: 7, kind: 'educational' },
  { id: 'finish', order: 8, kind: 'educational', action: 'open-why-flashcards' },
] as const;

/** Conjunto de ids válidos do registro (para reconciliação/validação). */
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
