import { ROUTES } from '@/constants/routes';

import { getHomeQuickActions } from './homeQuickActions';

describe('getHomeQuickActions', () => {
  it('points collection and deck actions to their creation routes', () => {
    const actions = getHomeQuickActions();

    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'new-collection', route: ROUTES.COLLECTION_NEW }),
        expect.objectContaining({ id: 'new-deck', route: ROUTES.DECK_NEW }),
      ]),
    );
  });

  it('keeps future actions disabled while their screens do not exist', () => {
    const actions = getHomeQuickActions();
    const cardAction = actions.find((action) => action.id === 'new-card');
    const importAction = actions.find((action) => action.id === 'import');

    expect(cardAction).toMatchObject({ id: 'new-card', disabled: true });
    expect(cardAction).not.toHaveProperty('route');
    expect(importAction).toMatchObject({ id: 'import', disabled: true });
    expect(importAction).not.toHaveProperty('route');
  });

  it('returns clones instead of exposing the internal action list', () => {
    const [firstAction] = getHomeQuickActions();

    firstAction.label = 'Changed';

    expect(getHomeQuickActions()[0]?.label).toBe('Nova Coleção');
  });
});
