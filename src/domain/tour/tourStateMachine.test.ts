import { describe, expect, it } from '@jest/globals';

import { CURRENT_TOUR_VERSION, INITIAL_TOUR_STATE, type TourState } from './TourState';
import {
  completeTour,
  getTourProgress,
  goToNextStep,
  goToPreviousStep,
  restartTour,
  skipTour,
  startTour,
} from './tourStateMachine';
import { BASE_TOUR_STEPS, type TourStep } from './tourSteps';

const inProgressAt = (currentStepId: string, completedStepIds: string[] = []): TourState => ({
  version: CURRENT_TOUR_VERSION,
  status: 'in_progress',
  currentStepId,
  completedStepIds,
});

describe('startTour / restartTour', () => {
  it('starts in_progress at the first step with no progress', () => {
    expect(startTour()).toEqual({
      version: CURRENT_TOUR_VERSION,
      status: 'in_progress',
      currentStepId: 'welcome',
      completedStepIds: [],
    });
  });

  it('restartTour resets progress and returns to the first step', () => {
    const dirty = inProgressAt('spaced-repetition', ['welcome', 'why-flashcards']);
    expect(restartTour()).toEqual(startTour());
    expect(restartTour()).not.toEqual(dirty);
  });

  it('completes immediately when the registry is empty', () => {
    const emptySteps: TourStep[] = [];
    expect(startTour(emptySteps).status).toBe('completed');
  });
});

describe('skipTour', () => {
  it('marks as skipped and clears the current step, keeping completed progress', () => {
    const state = inProgressAt('home-daily-review', ['welcome']);
    expect(skipTour(state)).toEqual({
      version: CURRENT_TOUR_VERSION,
      status: 'skipped',
      currentStepId: null,
      completedStepIds: ['welcome'],
    });
  });
});

describe('goToNextStep', () => {
  it('advances to the next step and marks the current as completed', () => {
    const next = goToNextStep(inProgressAt('welcome'));
    expect(next.currentStepId).toBe('why-flashcards');
    expect(next.completedStepIds).toEqual(['welcome']);
    expect(next.status).toBe('in_progress');
  });

  it('completes the tour when advancing from the last step', () => {
    const next = goToNextStep(
      inProgressAt(
        'finish',
        BASE_TOUR_STEPS.slice(0, 7).map((s) => s.id),
      ),
    );
    expect(next.status).toBe('completed');
    expect(next.currentStepId).toBeNull();
    expect(next.completedStepIds).toContain('finish');
  });

  it('does not duplicate ids and keeps registry order in completedStepIds', () => {
    const next = goToNextStep(inProgressAt('why-flashcards', ['welcome', 'why-flashcards']));
    expect(next.completedStepIds).toEqual(['welcome', 'why-flashcards']);
  });

  it('restarts from the first step when the current step is unknown', () => {
    const next = goToNextStep(inProgressAt('ghost-step'));
    expect(next).toEqual(startTour());
  });
});

describe('goToPreviousStep', () => {
  it('moves back to the previous step', () => {
    const prev = goToPreviousStep(inProgressAt('home-daily-review', ['welcome', 'why-flashcards']));
    expect(prev.currentStepId).toBe('why-flashcards');
    expect(prev.completedStepIds).toEqual(['welcome', 'why-flashcards']);
  });

  it('stays put when already at the first step', () => {
    const state = inProgressAt('welcome');
    expect(goToPreviousStep(state)).toEqual(state);
  });

  it('stays put when the current step is unknown', () => {
    const state = inProgressAt('ghost-step');
    expect(goToPreviousStep(state)).toEqual(state);
  });
});

describe('completeTour', () => {
  it('marks every step as completed', () => {
    const completed = completeTour(INITIAL_TOUR_STATE);
    expect(completed.status).toBe('completed');
    expect(completed.currentStepId).toBeNull();
    expect(completed.completedStepIds).toEqual(BASE_TOUR_STEPS.map((step) => step.id));
  });
});

describe('getTourProgress', () => {
  it('is 0 before starting and 100 when completed', () => {
    expect(getTourProgress(INITIAL_TOUR_STATE)).toBe(0);
    expect(getTourProgress(completeTour(INITIAL_TOUR_STATE))).toBe(100);
  });

  it('reflects the current step position', () => {
    expect(getTourProgress(inProgressAt('welcome'))).toBe(Math.round((1 / 8) * 100));
    expect(getTourProgress(inProgressAt('finish'))).toBe(100);
  });

  it('returns 0 for an empty registry', () => {
    expect(getTourProgress(INITIAL_TOUR_STATE, [])).toBe(0);
  });
});
