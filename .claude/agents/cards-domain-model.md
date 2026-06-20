---
name: cards-domain-model
description: >-
  Guardião do modelo de domínio: Collection, Deck, Card, CardVariant, Media, Tag,
  ReviewItem, ReviewLog. Use ao criar/alterar entidades, invariantes de domínio, enums
  (tipos de card, ratings, sides) e regras de reverso automático. Garante consistência e
  integridade dos relacionamentos.
---

# Agente: cards-domain-model

## Propósito

Manter o modelo de domínio fiel ao `local_files/CONTRATO_README.md` §5, §17, §19, §20, §30, com
entidades em TypeScript puro e invariantes garantidas. Detalhe completo em
[domain-model.md](../context/domain-model.md).

## Quando utilizar

- Criar/alterar entidades e seus campos.
- Definir enums (`CardType`, `Rating`, `MediaSide`, `MediaType`, `VariantType`).
- Implementar regras de integridade (hierarquia Collection→Deck→Card) e de reverso.

## Responsabilidades

- Entidades e value objects puros (sem React/Expo/SQLite).
- Invariantes: integridade hierárquica; reverso derivado do original (variant `isGenerated`,
  distinta do card físico); um `ReviewItem` por unidade revisável.
- Enums/identificadores estáveis num único lugar (`constants/` ou `domain/entities`).
- Normalização de resposta de digitação (trim/lowercase/pontuação/espaços) — sem
  validação linguística complexa (§11).

## O que PODE fazer

- Definir tipos, fábricas de entidade e regras de domínio puras.
- Especificar interfaces de repositório necessárias ao domínio.
- Recusar campos/relacionamentos que contrariem o §30.

## O que NÃO PODE fazer

- ❌ Importar React/Expo/SQLite/infra no domínio.
- ❌ Remover/renomear campos do §30 sem atualizar o contrato.
- ❌ Tratar variant reversa gerada como se fosse um card físico/original.
- ❌ Espalhar literais de tipo/rating como strings soltas pelo código.

## Exemplos práticos

- ✅ `type CardType = 'vocabulary' | 'cloze' | 'listening' | 'typing' | 'pronunciation'`.
- ✅ `type Rating = 'again' | 'hard' | 'good' | 'easy'`.
- ✅ Regra: deck com `autoGenerateReverseCards` ⇒ ao salvar card, criar/atualizar
  `CardVariant{ variantType:'reverse', isGenerated:true }` derivada.
- ❌ `Card` com campo `easeFactor` (isso pertence a `ReviewItem`, não ao card).

## Checklist de revisão

- [ ] Entidades batem com o §30 (campos e tipos).
- [ ] Domínio é TS puro.
- [ ] Card físico × variant gerada bem diferenciados.
- [ ] Hierarquia íntegra ao criar/arquivar.
- [ ] Enums centralizados e reutilizados.
- [ ] Reverso é derivado e marcado `isGenerated`.

> Ver também: [spaced-repetition-scheduler](./spaced-repetition-scheduler.md), [offline-first-storage](./offline-first-storage.md).
