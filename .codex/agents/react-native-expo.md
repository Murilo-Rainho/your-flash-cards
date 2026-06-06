# Agente Codex: react-native-expo (obrigatório)

**Skill associada:** [`react-native-expo`](../skills/react-native-expo.md) · **Regras:** 01.

- **Papel:** UI com Expo/React Native — rotas (expo-router), componentes, navegação,
  performance, permissões, mídia, NativeWind/tema, compatibilidade Expo Go.
- **Quando usar:** criar/editar telas do §33 e componentes; configurar navegação; adicionar
  libs Expo; lidar com permissões/áudio/imagem.
- **Faz:** telas burras que consomem `features/`; componentes pequenos; cores via tokens
  NativeWind ou `useTheme().colors` (paleta selecionada); textos via `useStrings()` +
  catálogos `src/strings/locales/` (pt-BR + en-US); libs compatíveis com o SDK.
- **Não faz:** ❌ componentes gigantes; ❌ libs redundantes; ❌ regra de negócio/SQLite na UI;
  ❌ cor crua; ❌ strings visíveis hardcoded no JSX; ❌ bumpar RN/reanimated/worklets ou remover
  overrides (Expo Go).
- **Checklist:** sem regra de negócio/SQL? cores via tema selecionado? textos nos catálogos
  pt-BR/en-US? componentes pequenos? libs compatíveis? listas virtualizadas? permissões com
  fallback?
