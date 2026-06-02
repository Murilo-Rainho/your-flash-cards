# Your Flash Cards

App mobile em **Expo (SDK 54) + React Native + TypeScript + NativeWind (Tailwind)**.
As versões estão fixadas para serem compatíveis com o **Expo Go** publicado na loja.

## Começando

```bash
npm install
npm start        # abre o Metro; leia o QR code no Expo Go
npm run android  # abre direto no Android
npm run ios      # abre direto no iOS
npm run web      # abre no navegador
```

## Estrutura

```
app/                 # Rotas (expo-router, file-based routing)
  _layout.tsx        # Layout raiz: providers globais + Stack + StatusBar
  index.tsx          # Tela inicial
  +not-found.tsx     # Rota 404
src/
  theme/
    tokens.js        # ⭐ Fonte única de cores/tokens (edite aqui)
    tokens.d.ts      # Tipagem dos tokens
    index.ts         # API do tema para uso em JS (theme, colors, ...)
  components/ui/      # Componentes base (Screen, Text, Button, Card)
  providers/          # AppProviders (React Query + SafeArea)
  lib/                # Infra compartilhada (queryClient, ...)
global.css           # Diretivas do Tailwind
tailwind.config.js   # Lê as cores de src/theme/tokens.js
```

O alias `@/*` aponta para `src/*` (configurado em `tsconfig.json` e `babel.config.js`).

## Mudando as cores (tema)

Toda a paleta vive em **`src/theme/tokens.js`** (fonte única de verdade):

- As classes do NativeWind (`bg-background`, `text-content-primary`,
  `bg-income`, `bg-expense`, `text-danger`, ...) são geradas a partir do objeto
  `light` desse arquivo.
- Em contextos que não aceitam `className` (react-navigation, StatusBar,
  gráficos, estilos inline), importe os valores brutos de `@/theme`.

Para re-tematizar o app inteiro, basta alterar os valores em `tokens.js` — não é
preciso tocar em telas nem componentes. Há também uma paleta `dark` pronta para
quando quiser habilitar tema escuro.

### Regra de ouro

Telas e componentes **sempre** usam os tokens semânticos do tema (via classes do
NativeWind ou via `@/theme`), **nunca** cores cruas (`#fff`, `bg-blue-500`).

## Qualidade

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write
npm run validate     # roda os três acima
```
