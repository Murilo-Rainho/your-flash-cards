---
description: Verifica se uma ideia/mudança está em conformidade com o CONTRATO_README.md antes de implementar.
argument-hint: <descrição da mudança ou feature>
---

Você vai fazer uma checagem de conformidade **antes** de qualquer implementação.

Mudança proposta: $ARGUMENTS

Passos:

1. Leia [`CONTRATO_README.md`](../../CONTRATO_README.md) e identifique TODAS as seções
   relevantes à mudança (cite os números, ex.: §18, §29).
2. Consulte os arquivos de contexto em `.claude/context/` e as regras em `.claude/rules/`.
3. Avalie e responda:
   - **Está no escopo da V1?** (ver §36 e §37). Se for §37 (fora de escopo), pare e diga.
   - **Exige internet/API/backend?** Então é Premium ou ponto de extensão (§4/§28). Free
     deve continuar local.
   - **Em que camada(s)** isso vive (domain/infrastructure/features/app)? Respeita a regra
     de dependência?
   - **Precisa de interface** (scheduler/importer/exporter/TTS/premium gate)?
   - **Impacto no modelo de domínio** (§30) e em invariantes (reverso, integridade hierárquica).
4. Conclua com: ✅ Conforme / ⚠️ Conforme com ressalvas / ❌ Fora do contrato — e as
   seções que embasam a decisão. Se houver ambiguidade, liste opções e recomende a mais
   simples/local; **não** decida sozinho por algo remoto/complexo.

Não implemente nada nesta etapa — apenas a análise de conformidade.
