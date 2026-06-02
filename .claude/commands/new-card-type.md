---
description: Guia a adição/ajuste de um tipo de card respeitando o domínio e a UX da V1.
argument-hint: <tipo de card ou comportamento>
---

Trabalhe o tipo/comportamento de card: $ARGUMENTS

Contexto: a V1 suporta 5 tipos (§7–§12): `vocabulary`, `cloze`, `listening`, `typing`,
`pronunciation`. **Não invente** novos tipos fora do contrato.

Passos:

1. Confirme no `CONTRATO_README.md` as regras do tipo (ex.: §9 cloze, §11 typing, §12
   pronunciation) e seus rótulos amigáveis (§7).
2. **Domínio** (`cards-domain-model`): o `CardType` já cobre? Quais campos de `Card`/
   `Media`/`CardVariant` são usados? Há normalização (digitação §11) ou validação de TTS
   (§14.2) envolvida?
3. **Mídia/infra** (`offline-first-storage` / `react-native-expo`): áudio/imagem/gravação
   local, TTS via `TtsProvider`. TTS deve checar disponibilidade e bloquear+informar se
   indisponível. Nunca gerar áudio automaticamente para todos os cards (§14.3).
4. **Revisão** (`spaced-repetition-scheduler`): o tipo afeta apenas a apresentação; o
   scheduling continua via `ReviewScheduler`. Avaliação manual onde o contrato pede
   (typing/pronunciation).
5. **UI/UX** (`ui-ux-mobile`): fluxo de criação (§34) e de revisão (§35) para o tipo,
   rótulos amigáveis, estados de erro.
6. **Testes** (`testing-quality`): cobrir regras do tipo (ex.: normalização de digitação).

Entregue o plano por camada. Não implemente IA (§27).
