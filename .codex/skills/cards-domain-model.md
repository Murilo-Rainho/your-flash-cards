# Skill: cards-domain-model

> Pré-requisito: skill [`project-context`](./project-context.md).

## Objetivo

Modelar o domínio (entidades e invariantes) fiel ao §5, §17, §19, §20, §30, em TypeScript
puro. Detalhe em `.codex/context/domain-model.md`.

## Entradas

- Definições do §30 (Collection, Deck, Card, CardVariant, Media, Tag, CardTag, ReviewItem,
  ReviewLog) e dos tipos de card (§7–§12).

## Saídas

- Entidades/value objects puros; enums centralizados:
  `CardType = 'vocabulary'|'cloze'|'listening'|'typing'|'pronunciation'`,
  `Rating = 'again'|'hard'|'good'|'easy'`,
  `MediaSide = 'front'|'back'`, `MediaType = 'image'|'audio'|'recording'|'tts'`,
  `VariantType = 'original'|'reverse'`.
- Regras de domínio puras: integridade hierárquica, geração de reverso, normalização de
  digitação.

## Restrições

- Domínio não importa React/Expo/SQLite/infra.
- Não remover/renomear campos do §30 sem atualizar o contrato.
- Variant reversa gerada (`isGenerated`) é derivada do original — não é um card físico independente.

## Padrões obrigatórios

- Enums/identificadores num único lugar (`constants/` ou `domain/entities`), reutilizados.
- `Card` físico × `CardVariant` derivada bem separados.
- Normalização de digitação simples: trim/lowercase/pontuação/espaços (§11), sem validação
  linguística complexa.

## Anti-patterns (proibido)

- ❌ Espalhar literais de tipo/rating como strings soltas.
- ❌ Colocar metadados de revisão (`easeFactor` etc.) no `Card` (pertencem a `ReviewItem`).
- ❌ Tratar reverso gerado como card físico.
- ❌ Lógica de domínio dependendo de I/O.
