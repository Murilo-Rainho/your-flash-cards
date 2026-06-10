import { sortByName } from './sort';

describe('sortByName', () => {
  it('orders named items alphabetically ignoring case and accents', () => {
    const items = [
      { id: 'travel', name: 'Travel' },
      { id: 'audio', name: 'Áudio' },
      { id: 'business', name: 'business' },
    ];

    expect(sortByName(items).map((item) => item.id)).toEqual(['audio', 'business', 'travel']);
  });

  it('does not mutate the original list', () => {
    const items = [
      { id: 'b', name: 'Beta' },
      { id: 'a', name: 'Alpha' },
    ];

    expect(sortByName(items)).not.toBe(items);
    expect(items.map((item) => item.id)).toEqual(['b', 'a']);
  });

  it('keeps the original order for equivalent names', () => {
    const items = [
      { id: 'first', name: 'audio' },
      { id: 'second', name: 'Áudio' },
    ];

    expect(sortByName(items).map((item) => item.id)).toEqual(['first', 'second']);
  });
});
