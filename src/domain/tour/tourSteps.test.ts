import { describe, expect, it } from '@jest/globals';

import { BASE_TOUR_STEPS, findTourStepById, getFirstTourStep, getTourStepIndex } from './tourSteps';

describe('BASE_TOUR_STEPS (invariantes do registro)', () => {
  it('has 8 steps with unique, stable ids', () => {
    expect(BASE_TOUR_STEPS).toHaveLength(8);
    const ids = BASE_TOUR_STEPS.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has contiguous 1-based order', () => {
    const orders = BASE_TOUR_STEPS.map((step) => step.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('only uses known step kinds', () => {
    for (const step of BASE_TOUR_STEPS) {
      expect(['educational', 'interface']).toContain(step.kind);
    }
  });
});

describe('tourSteps helpers', () => {
  it('returns the first step by order', () => {
    expect(getFirstTourStep()?.id).toBe('welcome');
  });

  it('returns null first step for an empty registry', () => {
    expect(getFirstTourStep([])).toBeNull();
  });

  it('finds a step by id', () => {
    expect(findTourStepById('finish')?.order).toBe(8);
  });

  it('returns null when finding a missing or null id', () => {
    expect(findTourStepById('does-not-exist')).toBeNull();
    expect(findTourStepById(null)).toBeNull();
  });

  it('returns the ordered index of a step', () => {
    expect(getTourStepIndex('welcome')).toBe(0);
    expect(getTourStepIndex('finish')).toBe(7);
    expect(getTourStepIndex('missing')).toBe(-1);
    expect(getTourStepIndex(null)).toBe(-1);
  });
});
