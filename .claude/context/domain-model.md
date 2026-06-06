# Contexto: Modelo de Domínio

> Fonte da verdade: [`CONTRATO_README.md`](../../CONTRATO_README.md) §5, §17, §19, §20, §30.
> As entidades abaixo são **conceituais**. Os campos são o contrato mínimo; não
> remover campos, não renomear sem atualizar o contrato.

## Hierarquia

```txt
Collection (par de idiomas: base → alvo)
  └── Deck (tema/contexto; pode gerar reversos automaticamente)
        └── Card (físico/original)
              ├── CardVariant (original | reverse; reverse = isGenerated)
              ├── Media (image | audio | recording | tts; side: front | back)
              ├── CardTag → Tag
              └── ReviewItem (unidade revisável; aponta p/ CardVariant)
                    └── ReviewLog (histórico de cada avaliação)
```

## Entidades (campos conceituais do §30)

### LocalProfile (§30.1)

`id, displayName, baseLanguagePreference, createdAt, updatedAt`
Existe mesmo **sem conta** (Free é local-first).

### Collection (§30.2) — representa um **par de idiomas**, não só o idioma alvo

`id, name, baseLanguage, targetLanguage, description?, createdAt, updatedAt, archivedAt?`

> A coleção é o par `base → alvo` porque features futuras dependem do par (§5.1).

### Deck (§30.3)

`id, collectionId, name, description?, autoGenerateReverseCards, createdAt, updatedAt, archivedAt?`

> V1 **não** tem subdecks (§5.2, §37). `autoGenerateReverseCards` controla a geração
> de variants reversas (§17).

### Card (§30.4) — **card físico/original**

`id, deckId, type, front, back, notes?, createdAt, updatedAt, archivedAt?`
`type ∈ { vocabulary, cloze, listening, typing, pronunciation }` (§7).

### CardVariant (§30.5) — reversos/variações derivadas

`id, cardId, variantType, isGenerated, createdAt, updatedAt`
`variantType ∈ { original, reverse }`.

> **Distinção importante:** variants `isGenerated` (reverso automático) são derivadas do
> card original e **não** são cards físicos independentes (§17). A variant não duplica
> conteúdo: `Card.front/back` são a fonte da verdade; `original` apresenta front/back e
> `reverse` apresenta back/front.

### Media (§30.6)

`id, cardId, cardVariantId?, side, type, uri, mimeType, createdAt, updatedAt`
`side ∈ { front, back }`; `type ∈ { image, audio, recording, tts }`.

> `cardVariantId` é opcional: nulo = mídia compartilhada do card; preenchido = mídia da
> variant. `uri` aponta para arquivo **local** no filesystem. Mídia é exportável em
> pacotes ZIP locais (§13, §24).

### Tag (§30.7) e CardTag (§30.8)

`Tag: id, collectionId, name, normalizedName, createdAt, updatedAt` · `CardTag: cardId, tagId`

> Tags flexíveis e reutilizáveis dentro de uma coleção; unicidade por
> `(collectionId, normalizedName)`. O app pode sugerir tags comuns por contexto da coleção (§6).

### ReviewItem (§30.9) — unidade revisável (metadados do SM-2)

`id, cardVariantId, schedulerType, schedulerVersion, repetitions, intervalDays, easeFactor, nextReviewAt, lastReviewedAt?, lapses, createdAt, updatedAt`

> Aponta para `CardVariant`. `schedulerType` + `schedulerVersion` permitem evoluir
> algoritmos sem quebrar histórico.

### ReviewLog (§30.10) — histórico de cada avaliação

`id, reviewItemId, sessionId?, rating, reviewedAt, timeSpentMs, previousIntervalDays, nextIntervalDays, previousEaseFactor, nextEaseFactor`

> `rating ∈ { again(Errei), hard(Difícil), good(Médio), easy(Fácil) }` (§19).
> Base de todas as estatísticas (§22).

### StudySession — sessão de estudo

`id, startedAt, endedAt?, collectionId?, deckId?, mode, cardsReviewed, durationMs, createdAt, updatedAt`

> Agregado local para estatísticas rápidas de sessão (§22), sem alterar o fluxo de revisão.

### AppSetting — configuração local

`key, value, updatedAt`

> Configurações simples locais; não depende de conta, internet ou backend.

## Tipos de Card da V1 (§7–§12)

| `type`          | Rótulo na UI (§7) | Regras-chave                                                                          |
| --------------- | ----------------- | ------------------------------------------------------------------------------------- |
| `vocabulary`    | Vocabulário       | frente/verso simples; mídia, tags, notas, exemplo opcionais (§8)                      |
| `cloze`         | Preencher lacuna  | **modelo mais recomendado**; lacuna/resposta definidas manualmente; sem IA na V1 (§9) |
| `listening`     | Escuta            | áudio local ou TTS local manual; áudio na frente ou verso (§10)                       |
| `typing`        | Escrita           | usuário digita; comparação simples + normalização; correção manual possível (§11)     |
| `pronunciation` | Pronúncia         | grava voz local; avaliação manual; sem comparação automática na V1 (§12)              |

## Invariantes de domínio (devem ser garantidas)

1. **Integridade hierárquica:** `Deck.collectionId` e `Card.deckId` sempre válidos;
   arquivar/excluir respeita a cadeia.
2. **Reverso derivado:** ao criar/editar card num deck com `autoGenerateReverseCards`,
   gerar/atualizar a variant `reverse` (`isGenerated = true`) — derivada do original (§17).
3. **ReviewItem por unidade revisável:** ao salvar card (e variant, se houver), criar o
   `ReviewItem` correspondente (§34).
4. **Sessão só com vencidos:** consultas de revisão filtram `nextReviewAt <= now` com
   `LIMIT` — nunca carregar todos os cards (§20, §35).
5. **Normalização de digitação:** trim, lowercase, pontuação/espaços opcionais — sem
   validação linguística complexa na V1 (§11).

## Normalização de nomes (do contrato → código)

O contrato usa rótulos em português/genéricos; o código usa identificadores estáveis:

- Avaliações: `Errei→again`, `Difícil→hard`, `Médio→good`, `Fácil→easy`.
- Tipos de card: ver tabela acima (`vocabulary`/`cloze`/`listening`/`typing`/`pronunciation`).

Mantenha **um** lugar (`constants/` ou `domain/entities`) definindo esses enums e
reutilize em todo o app. Não duplicar literais string espalhados.
