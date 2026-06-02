# Contexto Codex: Glossário

Espelha `.claude/context/glossary.md`. Use estes nomes em código/PRs.

| Termo                 | Definição (ref.)                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Collection            | Par de idiomas base→alvo; contém decks (§5.1/§30.2)                                                                |
| Deck                  | Tema dentro da coleção; sem subdecks (§5.2)                                                                        |
| Card (físico)         | Unidade criada pelo usuário (original) (§30.4)                                                                     |
| CardVariant           | Derivada `original`/`reverse`; reverso gerado automaticamente (`isGenerated`), distinto do card físico (§30.5/§17) |
| Media                 | Imagem/áudio/gravação/TTS local de um lado do card (§30.6/§13/§14)                                                 |
| Tag/CardTag           | Rótulos reutilizáveis N:N (§6/§30.7-8)                                                                             |
| ReviewItem            | Unidade revisável com metadados SM-2 (§30.9)                                                                       |
| ReviewLog             | Registro de avaliação; base das estatísticas (§30.10/§22)                                                          |
| Rating                | `again`/`hard`/`good`/`easy` = Errei/Difícil/Médio/Fácil (§19)                                                     |
| ReviewScheduler       | Interface do algoritmo de revisão (SM-2 na V1) (§18/§32.1)                                                         |
| Sessão                | Cards vencidos (`nextReviewAt <= now`) com `LIMIT` (§20/§21/§35)                                                   |
| DeckImporter/Exporter | Conectores de import/export (§23/§32)                                                                              |
| APKG                  | Pacote Anki; import melhor-esforço, sem export na V1 (§25)                                                         |
| TtsProvider           | Interface de TTS local (expo-speech) (§14/§32.2)                                                                   |
| PremiumGate           | Decide se uma feature pode ser usada (§28/§32.5)                                                                   |
| Free / Premium        | Local = Free; remoto (internet/API/backend) = Premium (§4/§28)                                                     |
| Offline-first         | Base local é fonte primária; app funciona sem internet (§29)                                                       |

Mapa rótulo→código: tipos `Vocabulário/Preencher lacuna/Escuta/Escrita/Pronúncia` →
`vocabulary/cloze/listening/typing/pronunciation`; ratings `Errei/Difícil/Médio/Fácil` →
`again/hard/good/easy`; lados `frente/verso` → `front/back`.
