import { describe, expect, it } from '@jest/globals';

import { CURRENT_TOUR_VERSION, INITIAL_TOUR_STATE, type TourState } from './TourState';
import { parseTourState, serializeTourState } from './tourStateSerialization';

describe('serialize/parse round-trip', () => {
  it('preserves a valid in_progress state', () => {
    const state: TourState = {
      version: CURRENT_TOUR_VERSION,
      status: 'in_progress',
      currentStepId: 'home-daily-review',
      completedStepIds: ['welcome', 'why-flashcards'],
    };
    expect(parseTourState(serializeTourState(state))).toEqual(state);
  });

  it('preserves completed/skipped states', () => {
    const completed: TourState = {
      version: CURRENT_TOUR_VERSION,
      status: 'completed',
      currentStepId: null,
      completedStepIds: ['welcome'],
    };
    expect(parseTourState(serializeTourState(completed))).toEqual(completed);
  });
});

describe('parseTourState (defensivo / reconciliação)', () => {
  it('returns the initial state for null/empty input', () => {
    expect(parseTourState(null)).toEqual(INITIAL_TOUR_STATE);
    expect(parseTourState('')).toEqual(INITIAL_TOUR_STATE);
  });

  it('returns the initial state for invalid JSON', () => {
    expect(parseTourState('{not json')).toEqual(INITIAL_TOUR_STATE);
  });

  it('returns the initial state for non-object JSON', () => {
    expect(parseTourState('42')).toEqual(INITIAL_TOUR_STATE);
    expect(parseTourState('null')).toEqual(INITIAL_TOUR_STATE);
  });

  it('resets when the version differs (future migration point)', () => {
    const stored = JSON.stringify({
      version: 999,
      status: 'in_progress',
      currentStepId: 'welcome',
      completedStepIds: [],
    });
    expect(parseTourState(stored)).toEqual(INITIAL_TOUR_STATE);
  });

  it('resets when the status is invalid', () => {
    const stored = JSON.stringify({
      version: CURRENT_TOUR_VERSION,
      status: 'paused',
      currentStepId: null,
      completedStepIds: [],
    });
    expect(parseTourState(stored)).toEqual(INITIAL_TOUR_STATE);
  });

  it('drops unknown completed step ids and non-string entries', () => {
    const stored = JSON.stringify({
      version: CURRENT_TOUR_VERSION,
      status: 'completed',
      currentStepId: null,
      completedStepIds: ['welcome', 'ghost', 7, 'finish'],
    });
    expect(parseTourState(stored).completedStepIds).toEqual(['welcome', 'finish']);
  });

  it('normalizes currentStepId to null for non in_progress states', () => {
    const stored = JSON.stringify({
      version: CURRENT_TOUR_VERSION,
      status: 'skipped',
      currentStepId: 'welcome',
      completedStepIds: [],
    });
    expect(parseTourState(stored).currentStepId).toBeNull();
  });

  it('resets when in_progress points to an unknown step', () => {
    const stored = JSON.stringify({
      version: CURRENT_TOUR_VERSION,
      status: 'in_progress',
      currentStepId: 'ghost',
      completedStepIds: [],
    });
    expect(parseTourState(stored)).toEqual(INITIAL_TOUR_STATE);
  });

  it('defaults completedStepIds to [] when missing or not an array', () => {
    const stored = JSON.stringify({
      version: CURRENT_TOUR_VERSION,
      status: 'completed',
      currentStepId: null,
      completedStepIds: 'nope',
    });
    expect(parseTourState(stored).completedStepIds).toEqual([]);
  });
});
