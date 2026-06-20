# Guia de Agentes, Skills e Regras de IA

Este documento explica a **infraestrutura de contexto para assistentes de IA** deste
repositório (Claude Code, OpenAI Codex e Cursor). Ele **não** implementa funcionalidades do
produto — apenas garante que qualquer IA contribua mantendo a **mesma arquitetura, regras de
negócio e padrões**, sempre ancorados no [`CONTRATO_README.md`](./local_files/CONTRATO_README.md).

> Regra zero, comum às três IAs: **consultar o `local_files/CONTRATO_README.md` antes de qualquer
> mudança arquitetural** e citar as seções relevantes. O contrato é a fonte única da verdade.

## 1. Mapa de arquivos por ferramenta

| Ferramenta       | Entrada principal                                    | Agentes                         | Comandos/Skills                               | Regras                      | Contexto               |
| ---------------- | ---------------------------------------------------- | ------------------------------- | --------------------------------------------- | --------------------------- | ---------------------- |
| **Claude Code**  | [`CLAUDE.md`](./CLAUDE.md) (auto-carregado)          | `.claude/agents/` (10)          | `.claude/commands/` (5 slash)                 | `.claude/rules/` (00–04)    | `.claude/context/` (4) |
| **OpenAI Codex** | [`AGENTS.md`](./AGENTS.md)                           | `.codex/agents/` (10)           | `.codex/skills/` (7, incl. `project-context`) | `.codex/rules/` (00–04)     | `.codex/context/` (4)  |
| **Cursor**       | `.cursor/rules/00-contract-first.mdc` (sempre ativo) | `.cursor/agents/` (10 personas) | — (usa regras)                                | `.cursor/rules/` (9 `.mdc`) | `.cursor/context/` (2) |

Todas as três fontes **espelham as mesmas regras e o mesmo modelo de domínio**. Ao alterar
uma regra/contexto, **replique nas outras duas** para manter a consistência.

## 2. Os agentes obrigatórios — responsabilidade e quando invocar

| #   | Agente                           | Responsabilidade (resumo)                                                 | Invoque quando…                                                                   |
| --- | -------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | **project-context-architecture** | Clean Architecture/DDD, camadas, dependências, estrutura de pastas        | for criar feature/módulo, decidir "onde mora o código", revisar acoplamento       |
| 2   | **react-native-expo**            | Expo/RN, navegação, componentes, performance, permissões, mídia, Expo Go  | criar/editar telas (§33) e componentes, configurar navegação, adicionar libs Expo |
| 3   | **offline-first-storage**        | SQLite, filesystem, repositórios, query de revisão, base para sync futuro | modelar tabelas, escrever repositórios, query de cards vencidos, mídia local      |
| 4   | **cards-domain-model**           | Entidades do §30, invariantes, enums, reverso                             | criar/alterar entidades, enums, regras de integridade/reverso                     |
| 5   | **spaced-repetition-scheduler**  | SM-2 atrás de `ReviewScheduler`, cálculo de intervalo/ease, `ReviewLog`   | implementar/alterar o algoritmo, mapear ratings, preparar FSRS futuro             |
| 6   | **import-export-connectors**     | CSV/ZIP/APKG plugáveis atrás de `DeckImporter`/`DeckExporter`             | implementar importer/exporter, formato ZIP, parsing/erros de APKG                 |
| 7   | **testing-quality**              | Testes (domínio/scheduler/import-export), cobertura, validação            | escrever/revisar testes, antes de concluir qualquer tarefa                        |

## 3. Os agentes opcionais

| #   | Agente                   | Responsabilidade                                                   | Invoque quando…                                                                 |
| --- | ------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 8   | **state-management**     | Zustand (UI/sessão) vs React Query (dados), sincronização de telas | decidir onde um estado mora, modelar store da sessão, cache/invalidação         |
| 9   | **ui-ux-mobile**         | UX de estudo, acessibilidade, microcopy, design de revisão         | desenhar fluxos (§34/§35), rótulos amigáveis, mensagens de Premium              |
| 10  | **premium-gate-billing** | `PremiumGate`, feature flags, isolamento Free×Premium              | adicionar feature que exige internet, definir feature keys, isolar billing/auth |

## 4. Como as três IAs produzem decisões consistentes

A consistência vem de **uma única fonte da verdade replicada em formatos nativos**:

1. **Mesmo contrato.** Todas começam pelo `local_files/CONTRATO_README.md` (regra `00-contract-first`).
2. **Mesmas invariantes.** Os "10 mandamentos" em `AGENTS.md` = regras `.claude/rules/` =
   regras `.cursor/rules/`. Mesmo conteúdo, formatos diferentes (markdown, `.mdc`, frontmatter).
3. **Mesmo modelo de domínio e glossário.** `*/context/domain-model.md` e `glossary.md`
   definem entidades, enums e nomes canônicos idênticos (use `vocabulary`/`again`/`front`…).
4. **Mesma estrutura de camadas.** A tabela de imports permitidos/proibidos é a mesma nos três.
5. **Mesmos pontos de extensão.** `ReviewScheduler`, `DeckImporter`/`DeckExporter`,
   `TtsProvider`, `PremiumGate` aparecem com a mesma assinatura nas três.

Resultado esperado: ao pedir "adicione o importador Quizlet" para Claude, Codex ou Cursor,
todos devem propor um `DeckImporter` na `infrastructure/importers`, marcar fonte online como
Premium futuro, e exigir testes — porque leem a mesma regra.

## 5. Fluxo recomendado para qualquer IA

```txt
1. Ler o local_files/CONTRATO_README.md e citar as seções relevantes.   (contract-first)
2. Consultar context/ (architecture, domain-model, tech-stack, glossary).
3. Escolher o(s) agente(s) pela especialidade da tarefa.
4. Planejar por camada (domain → infrastructure → features → app), com interfaces.
5. Implementar respeitando offline-first e Free×Premium.
6. Testar (domínio/scheduler/import-export) e rodar `npm run validate`.
7. Confirmar: nenhuma feature inventada; Free não quebrou; app funciona offline.
```

## 6. Princípios de longo prazo

- **Simplicidade** para o usuário, **extensibilidade** por dentro.
- **Offline-first** e **local-first**: em dúvida, escolha local; o que exigir rede é Premium.
- **Inversão de dependência** em tudo que pode mudar (algoritmo, conectores, TTS, billing).
- **Sem IA na V1** (§27) — apenas pontos de extensão.
- Manter este guia e os três conjuntos de regras **sincronizados** ao evoluir a arquitetura.
