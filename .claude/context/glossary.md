# Contexto: Glossário

Termos do domínio e da arquitetura. Use **estes** nomes em código, comentários e PRs
para manter consistência entre Claude, Codex e Cursor.

| Termo                           | Definição (ref. contrato)                                                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Collection**                  | Par de idiomas `base → alvo`. Contém decks. (§5.1, §30.2)                                                                         |
| **Deck**                        | Tema/contexto dentro de uma coleção. Sem subdecks na V1. (§5.2)                                                                   |
| **Card (físico/original)**      | Unidade criada pelo usuário (card original). (§30.4)                                                                              |
| **CardVariant**                 | Variação derivada (`original`/`reverse`). Reverso é gerado automaticamente (`isGenerated`), distinto do card físico. (§30.5, §17) |
| **Reverso automático**          | Variant `reverse` gerada quando o deck tem `autoGenerateReverseCards`. (§17)                                                      |
| **Media**                       | Imagem/áudio/gravação/TTS local associada a um lado do card. (§30.6, §13, §14)                                                    |
| **Tag / CardTag**               | Rótulos reutilizáveis; relação N:N com cards. (§6, §30.7/§30.8)                                                                   |
| **ReviewItem**                  | Unidade revisável com metadados SM-2 (`easeFactor`, `intervalDays`, `nextReviewAt`…). (§30.9)                                     |
| **ReviewLog**                   | Registro de cada avaliação; base das estatísticas. (§30.10, §22)                                                                  |
| **Rating**                      | Avaliação do card: `again`/`hard`/`good`/`easy` (Errei/Difícil/Médio/Fácil). (§19)                                                |
| **ReviewScheduler**             | Interface do algoritmo de revisão. SM-2 na V1; FSRS/custom no futuro. (§18, §32.1)                                                |
| **SM-2**                        | Algoritmo de repetição espaçada inicial. (§18, §20)                                                                               |
| **Sessão de estudo**            | Conjunto de cards vencidos (`nextReviewAt <= now`) a revisar, com `LIMIT`. (§20, §21, §35)                                        |
| **DeckImporter / DeckExporter** | Interfaces de conectores de importação/exportação. (§23, §32.3/§32.4)                                                             |
| **APKG**                        | Pacote Anki (`.apkg`). Import = melhor esforço; sem export na V1. (§25)                                                           |
| **TtsProvider**                 | Interface de text-to-speech local (expo-speech). (§14.2, §32.2)                                                                   |
| **PremiumGate**                 | Interface que decide se uma feature pode ser usada. (§28, §32.5)                                                                  |
| **Free**                        | Tudo que roda localmente. Funciona offline, sem conta. (§4.1)                                                                     |
| **Premium**                     | Tudo que exige internet/API/servidor/storage remoto. (§4.2)                                                                       |
| **Offline-first**               | Base local é a fonte primária; o app funciona sem internet. (§29)                                                                 |
| **Local Profile**               | Perfil local opcional, existe sem conta. (§30.1)                                                                                  |

## Mapa rótulo (UI/contrato) → identificador (código)

- Tipos de card: `Vocabulário→vocabulary`, `Preencher lacuna→cloze`, `Escuta→listening`,
  `Escrita→typing`, `Pronúncia→pronunciation`.
- Avaliações: `Errei→again`, `Difícil→hard`, `Médio→good`, `Fácil→easy`.
- Lados de mídia: `frente→front`, `verso→back`.
- Tipos de mídia: `image`, `audio`, `recording`, `tts`.
