# AGENTS.md

Ponto de entrada para o **OpenAI Codex** (e outros agentes que leem `AGENTS.md`) neste
repositório. Espelha as regras definidas para Claude (`CLAUDE.md`, `.claude/`) e Cursor
(`.cursor/`). Mantenha as três fontes alinhadas.

## ⚠️ Skill principal: `project-context` (OBRIGATÓRIA)

**Antes de iniciar qualquer implementação**, execute a skill
[`project-context`](./.codex/skills/project-context.md): leia o
[`CONTRATO_README.md`](./CONTRATO_README.md) (fonte única da verdade) e os arquivos de
`.codex/context/` e `.codex/rules/`. Cite as seções do contrato que embasam sua mudança.

Não comece a codar sem passar por essa skill.

## Resumo do produto

App mobile de flashcards para aprendizado de idiomas. React Native + Expo (SDK 54) +
TypeScript. Offline-first, SQLite local. Organização **Coleção → Deck → Cards**. Revisão
espaçada **SM-2** (extensível). Importação/exportação por **conectores**. Arquitetura
preparada para **Premium/Sync** futuros. Sem IA na V1.

## Invariantes inegociáveis (os 10 mandamentos)

1. **Contract-first.** `CONTRATO_README.md` manda. Não invente features (§38).
2. **Clean Architecture/DDD.** `app/+components → features → domain ← infrastructure`. O
   `domain/` é TypeScript puro (sem React/Expo/SQLite/infra).
3. **Sem regra de negócio na UI**; **sem acesso a SQLite fora dos repositórios** da infra.
4. **Offline-first** (§29): app abre, estuda, cria, revisa, vê estatísticas e importa/
   exporta localmente sem internet. Base local é a fonte primária.
5. **SM-2 atrás de `ReviewScheduler`** (§18/§32.1). Nada de cálculo de scheduling espalhado.
6. **Importers/Exporters atrás de `DeckImporter`/`DeckExporter`** (§23/§32). APKG = melhor
   esforço (não trava por 1 card inválido); sem export `.apkg` na V1.
7. **`PremiumGate.canUse(featureKey)`** (§28/§32.5): local = Free, remoto = Premium. Free
   nunca quebra.
8. **Modelo de domínio = §30.** Diferencie card físico × variant gerada (reverso); a variant
   reversa é derivada, não um card físico independente. Free não tem limite de cards.
9. **`TtsProvider` (expo-speech)** (§14/§32.2): valide disponibilidade; bloqueie+informe se
   indisponível; nunca gere áudio automaticamente para todos os cards.
10. **Testes obrigatórios** para domínio, scheduler e import/export. TS `strict`. Só tokens
    de tema (sem cor crua). V1 simples, internamente extensível.

## Estrutura (reconciliada com Expo Router)

```txt
app/                 # rotas Expo Router (a "camada app/" do contrato vive na raiz)
src/
  components/        # UI burra (ui/ já existe)
  features/          # casos de uso + hooks (orquestração)
  domain/            # entities/ repositories/ services/ schedulers/ importers/ exporters/  (TS puro)
  infrastructure/    # database/ filesystem/ tts/ importers/ exporters/ auth/ billing/
  shared/            # types/ utils/ constants/
  providers/ theme/ lib/   # já existentes
```

Detalhe completo em [`.codex/context/architecture.md`](./.codex/context/architecture.md).

## Comandos

```bash
npm run typecheck && npm run lint && npm run test   # antes de concluir qualquer tarefa
npm run validate                                    # typecheck + lint + format:check
```

## Regra de Expo Go

Versões de `react-native`/`reanimated`/`worklets` estão fixadas; há `overrides` e
`babel-preset-expo` explícitos para compatibilidade com Expo Go. Não atualizar/remover sem
validar.

## Índice `.codex/`

- **Skills** (`.codex/skills/`): [`project-context`](./.codex/skills/project-context.md) (principal),
  [`react-native-expo`](./.codex/skills/react-native-expo.md),
  [`offline-first-storage`](./.codex/skills/offline-first-storage.md),
  [`cards-domain-model`](./.codex/skills/cards-domain-model.md),
  [`spaced-repetition-scheduler`](./.codex/skills/spaced-repetition-scheduler.md),
  [`import-export-connectors`](./.codex/skills/import-export-connectors.md),
  [`testing-quality`](./.codex/skills/testing-quality.md).
- **Agents** (`.codex/agents/`): os 10 papéis (7 obrigatórios + 3 opcionais), iguais aos do
  Claude. Veja [`.codex/agents/`](./.codex/agents/).
- **Rules** (`.codex/rules/`): `00-contract-first`, `01-layering`, `02-offline-first`,
  `03-premium-gating`, `04-testing`.
- **Context** (`.codex/context/`): `architecture`, `domain-model`, `tech-stack`, `glossary`.
