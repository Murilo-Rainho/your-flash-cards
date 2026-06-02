# Contexto Codex: Modelo de Domínio

Base: `CONTRATO_README.md` §5, §17, §19, §20, §30. Espelha `.claude/context/domain-model.md`.

## Hierarquia

`Collection (par base→alvo) → Deck → Card → { CardVariant, Media, CardTag→Tag, ReviewItem → ReviewLog }`

## Entidades (campos do §30)

- **LocalProfile**: `id, displayName, baseLanguagePreference, createdAt, updatedAt` (existe sem conta).
- **Collection**: `id, name, baseLanguage, targetLanguage, description?, createdAt, updatedAt, archivedAt?` (par de idiomas).
- **Deck**: `id, collectionId, name, description?, autoGenerateReverseCards, createdAt, updatedAt, archivedAt?` (sem subdecks).
- **Card** (físico): `id, deckId, type, front, back, notes?, createdAt, updatedAt, archivedAt?`.
- **CardVariant**: `id, cardId, variantType('original'|'reverse'), front, back, isGenerated, createdAt, updatedAt`.
- **Media**: `id, cardId, side('front'|'back'), type('image'|'audio'|'recording'|'tts'), uri, mimeType, createdAt, updatedAt`.
- **Tag**: `id, name, createdAt, updatedAt`; **CardTag**: `cardId, tagId`.
- **ReviewItem**: `id, cardId, cardVariantId?, schedulerType, repetitions, intervalDays, easeFactor, nextReviewAt, lastReviewedAt?, lapses, createdAt, updatedAt`.
- **ReviewLog**: `id, reviewItemId, rating, reviewedAt, timeSpentMs, previousIntervalDays, nextIntervalDays, previousEaseFactor, nextEaseFactor`.

## Tipos de card (§7–§12)

`vocabulary` (Vocabulário), `cloze` (Preencher lacuna — mais recomendado), `listening`
(Escuta), `typing` (Escrita), `pronunciation` (Pronúncia).

## Ratings (§19)

`again` (Errei), `hard` (Difícil), `good` (Médio), `easy` (Fácil).

## Invariantes

1. Integridade hierárquica de `collectionId`/`deckId`.
2. Deck com `autoGenerateReverseCards` ⇒ gerar/atualizar variant `reverse` (`isGenerated`).
3. Criar `ReviewItem` por unidade revisável.
4. Sessão só com vencidos (`nextReviewAt <= now`, com `LIMIT`).
5. Normalização de digitação simples (trim/lowercase/pontuação/espaços).

> Use os identificadores em código (`vocabulary`, `again`, `front`...), não os rótulos PT.
