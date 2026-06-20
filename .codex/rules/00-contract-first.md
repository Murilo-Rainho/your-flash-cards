# Regra Codex 00 — Contract-First (PRINCIPAL)

`local_files/CONTRATO_README.md` é a fonte única da verdade. **Antes de qualquer mudança
arquitetural, feature, dependência, modelagem ou interface**, execute a skill
[`project-context`](../skills/project-context.md): leia o contrato e cite as seções.

- ❌ Não inventar features fora do contrato (§38).
- ❌ Não exigir internet/API/backend em fluxos Free (§29); em dúvida, **priorizar local** (§38).
- ❌ Não violar a regra de dependência entre camadas (regra 01).
- ❌ Sem IA na V1 (§27) — só pontos de extensão.

Em ambiguidade: apresente opções, recomende a mais simples/local, **não** decida sozinho
por algo remoto/complexo. Checklist: citei as seções? respeita offline-first e camadas?
nenhuma feature inventada? recursos de rede tratados como Premium/extensão?
