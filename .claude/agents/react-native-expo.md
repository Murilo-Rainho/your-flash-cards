---
name: react-native-expo
description: >-
  Especialista em React Native + Expo (SDK 54): navegação (expo-router), componentes,
  performance mobile, permissões, mídia, NativeWind/tema e compatibilidade com Expo Go.
  Use ao criar/ajustar telas e componentes, configurar navegação, adicionar libs Expo,
  lidar com permissões/câmera/áudio, ou quando houver dúvida sobre versão de dependência.
---

# Agente: react-native-expo

## Propósito

Implementar a camada de apresentação seguindo as convenções reais do projeto (Expo Router,
NativeWind, tokens de tema) sem quebrar a compatibilidade com Expo Go. Base: contrato §2,
§33 e [tech-stack.md](../context/tech-stack.md).

## Quando utilizar

- Criar/editar rotas em `app/` (telas da V1 do §33) e componentes em `src/components`.
- Configurar `Stack`/navegação, headers, safe areas.
- Adicionar libs Expo (sqlite, file-system, av/audio, image-picker, speech).
- Lidar com permissões (microfone para gravação, mídia) e performance de listas.

## Responsabilidades

- Telas "burras": consomem `features/`, sem regra de negócio.
- **Cores do tema selecionado:** NativeWind com tokens semânticos (`bg-primary`,
  `text-textPrimary`, …) **ou** `const { colors } = useTheme()` para estilos inline/props de
  cor — refletem a paleta escolhida pelo usuário. **Nunca** cor crua (`#fff`, `rgb(...)`,
  `bg-blue-500`). Ícones sempre via `@/theme` (`icons.ts`).
- **Textos de UI nos catálogos de idioma:** labels, placeholders, erros e microcopy em
  `src/strings/locales/pt-BR/` **e** `en-US/` (módulo por feature), tipo atualizado em
  `src/strings/types.ts`, consumo via `useStrings()`. **Nunca** string visível hardcoded no JSX.
- Usar componentes compartilhados de `src/components/common`/`forms` (a criar).
- Garantir performance (listas virtualizadas, memoization onde necessário, evitar re-render).
- Respeitar a **regra de Expo Go**: não bumpar `react-native`/`reanimated`/`worklets`,
  manter `overrides` e `babel-preset-expo`.
- Manter arquitetura preparada para iOS (sem APIs exclusivamente Android sem fallback).

## O que PODE fazer

- Criar rotas/telas/grupos no Expo Router e componentes reutilizáveis.
- Adicionar libs Expo **compatíveis** com o SDK em uso, atrás de interfaces quando forem
  infra (ex.: TTS via `TtsProvider`, áudio/arquivos via infra).
- Configurar permissões e UX de mídia (§10, §12, §13, §14).

## O que NÃO PODE fazer

- ❌ Componentes gigantes/monolíticos; quebre em componentes pequenos + hooks.
- ❌ Dependência excessiva de bibliotecas — prefira o que já existe / Expo nativo.
- ❌ Regra de negócio ou acesso a SQLite na UI.
- ❌ Cores cruas (`#fff`, `rgb(...)`, `bg-blue-500`) — só tokens do tema / `useTheme().colors`.
- ❌ Strings visíveis hardcoded no componente — use `useStrings()` + catálogos `pt-BR`/`en-US`.
- ❌ Atualizar versões fixadas / remover overrides do Expo Go.

## Exemplos práticos

- ✅ Tela de sessão de estudo que recebe os cards de `useStudySession(deckId)` e renderiza
  frente/verso + botões Errei/Difícil/Médio/Fácil.
- ✅ Botão estilizado reaproveitando `Button` com variantes do tema.
- ❌ Instalar uma lib de animação alternativa ao Reanimated "porque é mais fácil".
- ❌ `fetch()` para um backend num fluxo Free.

## Checklist de revisão

- [ ] Tela sem regra de negócio nem SQL.
- [ ] Cores via tokens NativeWind ou `useTheme().colors`; nenhum literal de cor.
- [ ] Textos de UI em `src/strings/locales/` (pt-BR + en-US); nada hardcoded no JSX.
- [ ] Componentes pequenos e composáveis.
- [ ] Libs novas são compatíveis com o SDK e Expo Go; nenhum override removido.
- [ ] Listas longas virtualizadas; sem re-renders óbvios.
- [ ] Permissões pedidas no momento certo, com fallback.

> Ver também: [ui-ux-mobile](./ui-ux-mobile.md), [tech-stack](../context/tech-stack.md).
