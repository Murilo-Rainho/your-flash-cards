import { describe, expect, it } from '@jest/globals';

import { ROUTES } from '@/constants/routes';
import { ptBR } from '@/strings/locales/pt-BR';

import { getHomeQuickActions } from './homeQuickActions';

describe('getHomeQuickActions', () => {
  it('retorna as quatro ações da Home com rotas conhecidas', () => {
    const actions = getHomeQuickActions(ptBR.home.quickActions);

    expect(actions).toHaveLength(4);
    expect(actions[0]).toMatchObject({
      id: 'new-collection',
      label: 'Nova Coleção',
      route: ROUTES.COLLECTION_NEW,
    });
    expect(actions[1]?.route).toBe(ROUTES.DECK_NEW);
    expect(actions[2]?.route).toBe(ROUTES.CARD_NEW);
    expect(actions[3]).toMatchObject({ id: 'import', disabled: true });
  });

  it('retorna cópias independentes a cada chamada', () => {
    const actions = getHomeQuickActions(ptBR.home.quickActions);
    actions[0]!.label = 'Alterado';

    expect(getHomeQuickActions(ptBR.home.quickActions)[0]?.label).toBe('Nova Coleção');
  });

  it('expõe a primeira ação como Nova Coleção', () => {
    const [firstAction] = getHomeQuickActions(ptBR.home.quickActions);

    expect(firstAction?.id).toBe('new-collection');
    expect(getHomeQuickActions(ptBR.home.quickActions)[0]?.label).toBe('Nova Coleção');
  });
});
