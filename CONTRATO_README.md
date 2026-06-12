# CONTRATO_README.md

# Contrato de Implementação — App de Flashcards para Aprendizado de Idiomas

## 1. Objetivo do Produto

Este projeto é um aplicativo mobile de flashcards focado em aprendizado de idiomas.

A V1 deve permitir que o usuário estude idiomas usando repetição espaçada, cards com mídia, diferentes modelos de estudo e funcionamento offline-first.

O aplicativo deve ser pensado inicialmente para Android, usando React Native com Expo.

A V1 deve priorizar:

- estudo offline;
- criação manual de cards;
- revisão espaçada;
- organização por coleção, deck e cards;
- suporte a imagem, áudio local e text-to-speech local;
- importação/exportação local;
- plano Free funcional;
- arquitetura extensível para Premium, sync, IA e novos algoritmos no futuro.

---

## 2. Plataforma da V1

A V1 será inicialmente focada em Android.

O projeto pode ser desenvolvido em React Native com Expo, mas a arquitetura não deve impedir suporte futuro para iOS.

---

## 3. Modelo de Conta e Autenticação

O app deve funcionar sem conta para usuários Free.

No plano Free:

- o usuário pode usar o app localmente;
- os dados ficam armazenados no dispositivo;
- nenhuma conta é obrigatória;
- funcionalidades locais devem funcionar offline.

A conta será usada principalmente para usuários Premium.

A autenticação será necessária para:

- validar assinatura;
- liberar funcionalidades Premium;
- permitir sync futuro;
- permitir backup em nuvem futuro;
- permitir múltiplos dispositivos no futuro.

Na V1, o fluxo principal deve ser local-first.

---

## 4. Modelo de Negócio

A V1 terá modelo Free limitado + Premium.

### 4.1 Plano Free

O plano Free deve permitir:

- uso offline;
- coleções;
- decks;
- tags;
- criação manual de cards;
- imagens locais;
- áudio local;
- text-to-speech local;
- importação/exportação local quando tecnicamente possível;
- estatísticas;
- revisão espaçada.

O plano Free não impõe limite de quantidade de cards: o usuário pode criar quantos cards quiser localmente.

### 4.2 Plano Premium

Deve ser Premium tudo que exigir internet, servidor, API externa, storage remoto ou processamento remoto.

Exemplos de funcionalidades Premium futuras:

- sync entre dispositivos;
- backup em nuvem;
- restauração em nuvem;
- marketplace de decks;
- compartilhamento por link remoto;
- IA;
- tradução contextual via API;
- geração de áudio via API externa;
- importações online;
- recursos que dependam de backend.

Regra geral:

> Tudo que roda localmente deve ser Free. Tudo que exige internet/API/backend deve ser Premium.

---

## 5. Organização dos Estudos

A organização principal será:

```txt
Coleção -> Deck -> Cards
```

### 5.1 Coleção

A coleção representa um par de idiomas.

Exemplo:

```txt
Português -> Inglês
Português -> Espanhol
Inglês -> Japonês
```

Cada coleção deve possuir:

- idioma base;
- idioma alvo;
- nome;
- descrição opcional;
- data de criação;
- data de atualização.

A coleção não deve representar apenas o idioma alvo. Ela deve representar o par de idiomas porque funcionalidades futuras podem depender do par idioma base -> idioma alvo.

Exemplo futuro:

```txt
Frente:
I'm tired {agora}
Estoy cansado {agora}

Verso:
I'm tired now
Estoy cansado ahora
```

O design deve permitir, futuramente, estudo/reforço de mais de um idioma ao mesmo tempo.

### 5.2 Deck

O deck representa contexto, tema ou objetivo dentro de uma coleção.

Exemplos:

```txt
Travel
Business
Daily Life
Food
Phrasal Verbs
Past Tense
```

Decks pertencem a uma coleção.

A V1 não terá subdecks.

### 5.3 Cards

Cards pertencem a um deck.

Cards também podem possuir tags.

---

## 6. Tags

Cards devem suportar tags.

O app deve permitir tags manuais e também sugerir tags comuns por contexto ou gramática.

Exemplos de tags sugeridas:

```txt
travel
food
business
daily-life
phrasal-verbs
past
present
future
verbs
adjectives
listening
pronunciation
```

As tags devem ser flexíveis e reutilizáveis **dentro de uma coleção**.

Cada tag pertence a uma coleção (`collectionId`). O mesmo nome pode existir em coleções
diferentes (ex.: `restaurant` em Português→Inglês e em Português→Francês), mas com `id`
distinto. A unicidade é por par `(collectionId, normalizedName)`.

Sugestões de tags comuns (travel, verbs, listening…) devem considerar o contexto da coleção
e o idioma alvo.

---

## 7. Tipos de Cards da V1

A V1 deve suportar os seguintes modelos de card:

1. Vocabulário simples;
2. Cloze/lacuna;
3. Listening;
4. Digitação da resposta;
5. Pronúncia.

O app não precisa forçar o usuário a criar todos os tipos ao mesmo tempo.

Ao criar um card, o usuário deve escolher o tipo/modelo do card.

A interface deve apresentar os modelos de forma amigável, evitando termos técnicos excessivos.

Exemplo:

```txt
Vocabulário
Preencher lacuna
Escuta
Escrita
Pronúncia
```

---

## 8. Modelo 1 — Vocabulário Simples

Indicado para iniciantes.

Exemplo:

```txt
Frente:
apple

Verso:
maçã
```

Também pode conter:

- imagem;
- áudio;
- tags;
- observações;
- frase de exemplo.

---

## 9. Modelo 2 — Cloze/Lacuna

Este deve ser o modelo mais recomendado pelo app.

Uma frase pode ter **uma ou mais lacunas**, e **cada lacuna pode ter uma ou mais respostas
aceitas**. O usuário define as lacunas e as respostas manualmente.

Exemplo de entrada (autoria — o trecho-dica fica entre `{}`):

```txt
It was raining. {Mesmo assim}, we went hiking.
```

Respostas aceitas para a lacuna: `Still`, `Even so`, `Nevertheless`.

Exemplo com várias lacunas:

```txt
I'd like {ambos} water {e} juice.
```

Respostas: lacuna 1 → `both`; lacuna 2 → `and`.

Autoria: o usuário escreve a frase, **seleciona um trecho e o transforma em lacuna**
(o trecho selecionado vira a dica, entre `{}`). Para cada lacuna ele adiciona/remove as
respostas aceitas (a primeira é a principal) e pode editar a dica/texto. Há uma **prévia**
da frase e a possibilidade de **testar** o card antes de salvar. Sem drag-and-drop, sem IA.

Revisão: a frente exibe a frase com a dica de cada lacuna entre `{chaves}` e um campo de
resposta por lacuna (com 1 lacuna o comportamento é idêntico ao modelo anterior). Uma
resposta é considerada correta se, **após a normalização padrão do projeto** (trim, caixa
baixa, remoção de pontuação, colapso de espaços; acentos preservados), bater com **qualquer
uma** das respostas aceitas daquela lacuna.

Persistência: o conteúdo cloze estruturado (lacunas + respostas aceitas) é a fonte da verdade,
guardado em `Card.cloze` (coluna `cloze_data`, JSON). `Card.front` (frase com `{dica}` por
lacuna) e `Card.back` (frase com a resposta primária de cada lacuna) são **derivados** desse
conteúdo, para exibição e compatibilidade. Cards cloze antigos (criados com exatamente uma
lacuna, sem `cloze_data`) continuam funcionando: o conteúdo é reconstruído a partir de
`front`/`back` (1 lacuna / 1 resposta) na leitura — sem migração de dados.

Na V1, o app não deve usar IA para traduzir automaticamente o conteúdo.

Caso exista alguma transformação automática local no futuro, ela deve validar se o par idioma base -> idioma alvo é suportado.

---

## 10. Modelo 3 — Listening

O card de listening deve permitir que o usuário pratique escuta.

Possibilidades da V1:

- usuário pode adicionar áudio local;
- usuário pode usar text-to-speech local;
- usuário pode escolher gerar/reproduzir TTS manualmente;
- o app não deve gerar áudio automaticamente para todos os cards.

Fluxo recomendado:

```txt
Usuário cria o card
Usuário escolhe a fonte do áudio (gravar na hora, enviar arquivo ou TTS local)
Usuário escreve a transcrição da frase (verso, obrigatória)
```

### Criação

- O **áudio fica na frente** e pode vir de gravação na hora, arquivo enviado ou TTS local.
- O **verso é a transcrição** da frase (texto), **obrigatório** — é o que o usuário escreve.
- No modo **TTS**, a frase digitada já é a transcrição: o TTS lê o próprio texto do verso
  (uma só digitação, sem campo duplicado).

### Revisão

- **Frente**: o áudio para ouvir + um campo para **escrever** o que ouviu **ou** um botão
  para **gravar** a própria fala. O usuário usa o que preferir.
- **Verso**: reouve o áudio do card, vê a transcrição e a própria tentativa:
  - se **escreveu** → comparação local (normalizada, como na Escrita §11), com override manual;
  - se **gravou** → **sem comparação automática**: apenas um botão para reouvir a própria
    gravação e comparar manualmente com o card.

Tudo é local (gravação, TTS e comparação) — permanece Free e offline-first (§4/§29).

---

## 11. Modelo 4 — Digitação da Resposta

O card de digitação deve exigir que o usuário escreva a resposta.

### Criação

- A **frente é sempre uma mídia** (o enunciado) escolhida num seletor com as opções:
  enviar arquivo de áudio, gravar áudio, **texto para TTS na revisão**, tirar foto com a
  câmera ou escolher imagem da galeria. Não há campo de texto livre na frente — no modo
  TTS o texto digitado é apenas a fonte falada na revisão.
- O **verso é a resposta esperada** (texto), obrigatório — **exceto no modo TTS**: nele o
  verso reutiliza automaticamente o próprio texto digitado na frente (sem campo separado),
  como na Escuta. O exercício vira um ditado/transcrição do que foi falado.
- O **idioma do TTS** vem automaticamente da coleção (como nos demais tipos), sem seletor
  manual no formulário.

### Revisão

- **Frente**: o áudio/imagem do enunciado + um campo para o usuário **escrever** a resposta.
- **Verso**: mostra a resposta esperada e o resultado da comparação local (normalizada),
  com **override manual** (marcar como certo/errado).

Exemplo:

```txt
Frente (enunciado):
[áudio/TTS: "Estou cansado agora."]  (ou uma imagem)

Input do usuário:
I'm tired now.

Verso esperado:
I'm tired now.
```

A comparação inicial pode ser simples.

A V1 deve evitar validações linguísticas complexas.

Sugestão de avaliação:

- resposta exatamente igual;
- resposta normalizada;
- permitir o usuário marcar manualmente como correto/incorreto após ver a resposta.

A normalização pode considerar:

- trim;
- lowercase;
- remoção de pontuação opcional;
- remoção de espaços duplicados.

---

## 12. Modelo 5 — Pronúncia

O card de pronúncia deve permitir que o usuário pratique fala.

Na V1:

- o usuário pode ouvir o áudio correto;
- o usuário pode gravar sua própria voz;
- o app pode salvar a gravação localmente;
- o usuário avalia manualmente se foi bem ou não.

A V1 não deve comparar automaticamente a pronúncia.

A arquitetura deve permitir substituição futura por um avaliador automático de pronúncia.

---

## 13. Imagens

Cards devem suportar imagem.

A imagem deve ser armazenada localmente.

A imagem pode estar associada ao card como mídia.

A arquitetura deve permitir exportar/importar imagens em pacotes locais.

---

## 14. Áudio

A V1 deve suportar áudio local e text-to-speech local.

### 14.1 Áudio local

O usuário pode:

- anexar arquivo de áudio;
- gravar áudio no app;
- associar áudio à frente;
- associar áudio ao verso.

### 14.2 Text-to-Speech local

O app deve usar TTS local quando disponível.

Em Expo, pode ser usado `expo-speech`.

O TTS local é Free.

O app deve validar se o TTS está disponível para o idioma/par de idiomas antes de oferecer a funcionalidade.

Quando não estiver disponível, o app deve bloquear a ação e informar o usuário.

### 14.3 Geração automática

O app não deve gerar automaticamente áudio para todos os cards.

O usuário deve escolher manualmente quando usar TTS.

---

## 15. Criação de Cards

A V1 deve suportar:

1. criação manual;
2. importação via CSV;
3. criação em lote por texto colado.

### 15.1 Recomendação de UX

O app deve recomendar a criação manual card por card como melhor método para aprendizado.

CSV e colagem em lote devem ser apresentados como recursos úteis para importar cards já existentes de outros apps ou materiais próprios do usuário.

Mensagem conceitual sugerida:

```txt
Para aprender melhor, recomendamos criar seus cards manualmente.
Use importação em lote principalmente para trazer cards que você já criou em outro lugar.
```

---

## 16. Criação em Lote

A criação em lote deve permitir:

- importar CSV;
- colar pares de pergunta/resposta;
- pré-visualizar antes de salvar;
- escolher coleção;
- escolher deck;
- adicionar tags comuns a todos os cards importados;
- validar erros antes de confirmar.

Exemplo de texto colado:

```txt
house = casa
dog = cachorro
cat = gato
```

Exemplo CSV:

```csv
front,back,type,tags
house,casa,vocabulary,"home,basic"
dog,cachorro,vocabulary,"animals,basic"
```

A V1 não deve usar IA para criar cards automaticamente a partir de textos longos.

---

## 17. Card Reverso Automático

Decks devem ter configuração para gerar reversos automaticamente.

Exemplo:

```txt
house -> casa
casa -> house
```

Configuração no deck:

```txt
Gerar cards reversos automaticamente: Sim/Não
```

O card reverso deve ser derivado do card original.

A arquitetura deve diferenciar:

- card físico/original;
- variação derivada/reversa.

---

## 18. Sistema de Revisão Espaçada

A V1 deve implementar repetição espaçada baseada no algoritmo SM-2.

A implementação deve ser customizável e aberta para novos algoritmos.

Deve haver inversão de dependência para o algoritmo de revisão.

Exemplo conceitual:

```ts
interface ReviewScheduler {
  schedule(input: ReviewInput): ReviewResult;
}
```

A implementação inicial será:

```txt
SM-2 Scheduler
```

No futuro, o app poderá suportar:

- FSRS;
- algoritmo próprio;
- algoritmo por tipo de card;
- algoritmo customizado por usuário.

---

## 19. Avaliação do Card

Durante a revisão, o usuário deve avaliar o card com quatro opções:

```txt
Errei
Difícil
Médio
Fácil
```

Não usar apenas “acertei” e “errei”.

Cada resposta deve afetar:

- intervalo;
- facilidade/ease factor;
- repetições;
- próxima data de revisão;
- estatísticas.

---

## 20. Lógica Geral do SM-2

Cada card revisável deve possuir metadados de revisão.

Campos conceituais:

```txt
repetitions
intervalDays
easeFactor
nextReviewAt
lastReviewedAt
lapses
```

Consulta de revisão:

```sql
SELECT *
FROM review_items
WHERE next_review_at <= CURRENT_TIMESTAMP
ORDER BY next_review_at ASC
LIMIT :sessionLimit
```

O app nunca deve carregar todos os cards para revisar.

Mesmo com 5000 cards, apenas cards vencidos devem aparecer na sessão.

---

## 21. Sessão de Estudo

A sessão de estudo deve priorizar:

1. cards vencidos;
2. cards errados recentemente;
3. cards difíceis;
4. cards novos, se configurado.

O usuário deve poder estudar:

- coleção inteira;
- deck específico;
- cards por tag;
- cards vencidos;
- cards novos;
- cards difíceis.

A V1 pode iniciar com fluxo simples, mas a modelagem deve permitir os filtros acima.

---

## 22. Estatísticas

A V1 deve ter estatísticas completas.

Exemplos:

- cards estudados hoje;
- cards revisados;
- cards novos;
- acertos;
- erros;
- taxa de retenção;
- streak;
- progresso por coleção;
- progresso por deck;
- progresso por tag;
- cards mais difíceis;
- cards vencidos;
- cards dominados;
- histórico diário;
- tempo médio de sessão.

As estatísticas devem ser calculadas localmente.

---

## 23. Importação e Exportação

A V1 deve suportar:

- exportar ZIP local;
- importar ZIP local;
- importar CSV local;
- importar `.apkg` do Anki.

A V1 não precisa exportar `.apkg`.

### 23.1 Inversão de dependência

A importação/exportação deve usar interfaces/conectores.

Exemplo conceitual:

```ts
interface DeckImporter {
  import(input: ImportInput): Promise<ImportResult>;
}

interface DeckExporter {
  export(input: ExportInput): Promise<ExportResult>;
}
```

Implementações iniciais:

```txt
CSV Importer
ZIP Importer
ZIP Exporter
Anki APKG Importer
```

Implementações futuras possíveis:

```txt
Anki APKG Exporter
Quizlet Importer
Mochi Importer
RemNote Importer
Cloud Importer
```

---

## 24. Formato Local de Exportação

Quando possível, a exportação local deve gerar um pacote ZIP.

Estrutura sugerida:

```txt
deck-export.zip
  manifest.json
  cards.csv
  media/
    images/
    audios/
```

O `manifest.json` deve conter:

- versão do formato;
- coleção;
- deck;
- idiomas;
- data de exportação;
- contagem de cards;
- metadados de mídia.

O CSV deve referenciar arquivos locais dentro do pacote.

Exemplo:

```csv
type,front,back,tags,image_front,audio_front,image_back,audio_back
vocabulary,house,casa,"home,basic",media/images/house.png,media/audios/house.mp3,,
```

---

## 25. Compatibilidade com Anki

A V1 deve importar arquivos `.apkg` do Anki.

A V1 não precisa exportar `.apkg`.

A importação do Anki deve ser isolada em um conector.

O app deve tratar importações do Anki como melhor esforço.

Caso algum tipo de card do Anki não seja suportado, o app deve:

- importar o máximo possível;
- avisar o usuário;
- listar cards ignorados ou parcialmente importados;
- não travar a importação inteira por causa de um card inválido.

---

## 26. Backup

Na V1, backup será manual via exportação local.

Não haverá backup automático em nuvem na V1 Free.

Backup em nuvem é Premium futuro.

---

## 27. IA

A V1 não terá IA.

Não implementar na V1:

- geração automática de cards com IA;
- tradução contextual com IA;
- avaliação automática de pronúncia com IA;
- geração de exemplos com IA;
- correção semântica por IA.

A arquitetura pode deixar pontos de extensão para essas features no futuro.

---

## 28. Funcionalidades Premium — Regra de Bloqueio

Toda funcionalidade que dependa de internet/API/backend deve ser bloqueada para usuários Free.

Ao tentar acessar uma funcionalidade Premium, o app deve:

- explicar o motivo;
- mostrar benefício;
- permitir autenticação/assinatura futura;
- não impedir o uso local do app.

Exemplo:

```txt
Este recurso usa sincronização em nuvem e está disponível apenas no Premium.
Você ainda pode exportar seus decks localmente no plano Free.
```

---

## 29. Offline-first

O app deve funcionar offline por padrão.

A base local deve ser a fonte primária de dados.

Sugestão:

- SQLite local;
- arquivos de mídia no filesystem local;
- camada de repositórios;
- serviços independentes de UI.

O app não deve depender de internet para:

- abrir;
- estudar;
- criar cards;
- revisar cards;
- visualizar estatísticas;
- exportar localmente, se tecnicamente possível;
- importar arquivos locais.

---

## 30. Entidades Conceituais

### 30.1 User/Local Profile

Mesmo sem conta, pode existir um perfil local.

Campos sugeridos:

```txt
id
displayName
baseLanguagePreference
createdAt
updatedAt
```

### 30.2 Collection

```txt
id
name
baseLanguage
targetLanguage
description
createdAt
updatedAt
archivedAt
```

### 30.3 Deck

```txt
id
collectionId
name
description
autoGenerateReverseCards
createdAt
updatedAt
archivedAt
```

### 30.4 Card

```txt
id
deckId
type
front
back
notes
createdAt
updatedAt
archivedAt
```

### 30.5 Card Variant

Usado para reversos ou variações derivadas.

```txt
id
cardId
variantType
isGenerated
createdAt
updatedAt
```

Exemplo de `variantType`:

```txt
original
reverse
```

A variant não duplica conteúdo textual. `cards.front` e `cards.back` são a fonte da
verdade; a apresentação é calculada pela camada de domínio/UI:

```txt
original -> front/back do card
reverse -> back/front do card
```

### 30.6 Media

```txt
id
cardId
cardVariantId
side
type
uri
mimeType
createdAt
updatedAt
```

`cardVariantId` é opcional. Quando preenchido, a mídia pertence àquela variant; quando
nulo, a mídia é compartilhada pelo card físico.

Exemplo de `side`:

```txt
front
back
```

Exemplo de `type`:

```txt
image
audio
recording
tts
```

### 30.7 Tag

```txt
id
collectionId
name
normalizedName
createdAt
updatedAt
```

### 30.8 CardTag

```txt
cardId
tagId
```

### 30.9 Review Item

Representa uma unidade revisável.

A unidade revisável oficial é a `CardVariant`.

```txt
id
cardVariantId
schedulerType
schedulerVersion
repetitions
intervalDays
easeFactor
nextReviewAt
lastReviewedAt
lapses
createdAt
updatedAt
```

### 30.10 Review Log

```txt
id
reviewItemId
sessionId
rating
reviewedAt
timeSpentMs
previousIntervalDays
nextIntervalDays
previousEaseFactor
nextEaseFactor
```

### 30.11 Study Session

```txt
id
startedAt
endedAt
collectionId
deckId
mode
cardsReviewed
durationMs
createdAt
updatedAt
```

### 30.12 App Setting

```txt
key
value
updatedAt
```

---

## 31. Arquitetura Recomendada

A arquitetura deve evitar acoplamento direto entre UI e regras de negócio.

Camadas sugeridas:

```txt
src/
  app/
  components/
  features/
    collections/
    decks/
    cards/
    review/
    import-export/
    stats/
    premium/
  domain/
    entities/
    repositories/
    services/
    schedulers/
    importers/
    exporters/
  infrastructure/
    database/
    filesystem/
    tts/
    importers/
    exporters/
    auth/
    billing/
  shared/
    types/
    utils/
    constants/
```

Regras:

- domínio não deve depender de UI;
- algoritmo SM-2 deve ser substituível;
- importadores/exportadores devem ser substituíveis;
- TTS deve ser isolado atrás de interface;
- billing/auth devem ser isolados para não afetar o uso Free local.

---

## 32. Interfaces Importantes

### 32.1 Review Scheduler

```ts
interface ReviewScheduler {
  type: string;
  schedule(input: ReviewScheduleInput): ReviewScheduleResult;
}
```

### 32.2 TTS Provider

```ts
interface TtsProvider {
  isAvailable(input: TtsAvailabilityInput): Promise<boolean>;
  speak(input: TtsSpeakInput): Promise<void>;
}
```

### 32.3 Importer

```ts
interface DeckImporter {
  source: string;
  canImport(input: ImportInput): boolean;
  import(input: ImportInput): Promise<ImportResult>;
}
```

### 32.4 Exporter

```ts
interface DeckExporter {
  target: string;
  canExport(input: ExportInput): boolean;
  export(input: ExportInput): Promise<ExportResult>;
}
```

### 32.5 Premium Gate

```ts
interface PremiumGate {
  canUse(featureKey: string): Promise<boolean>;
}
```

---

## 33. Telas da V1

Telas mínimas:

1. Onboarding;
2. Home/Dashboard;
3. Lista de coleções;
4. Criar/editar coleção;
5. Lista de decks;
6. Criar/editar deck;
7. Lista de cards;
8. Criar/editar card;
9. Importar cards;
10. Exportar deck;
11. Sessão de estudo;
12. Resultado da sessão;
13. Estatísticas;
14. Configurações;
15. Tela/Modal de Premium bloqueado.

---

## 34. Fluxo de Criação de Card

Fluxo base:

```txt
Selecionar coleção
Selecionar deck
Escolher tipo de card
Preencher campos
Adicionar mídia opcional
Adicionar tags
Salvar
Gerar variação reversa se deck estiver configurado
Criar item de revisão
```

---

## 35. Fluxo de Revisão

Fluxo base:

```txt
Usuário escolhe estudar coleção/deck/tag
App busca cards vencidos
App mostra frente
Usuário responde mentalmente, digitando, ouvindo ou falando
Usuário vira card
App mostra verso
Usuário avalia: Errei / Difícil / Médio / Fácil
Scheduler calcula próxima revisão
App salva ReviewLog
App avança para próximo card
```

---

## 36. Critérios de Aceite da V1

A V1 só deve ser considerada pronta se:

- funcionar offline;
- permitir criar coleção;
- permitir criar deck;
- permitir criar cards dos 5 tipos;
- permitir imagem em card;
- permitir áudio local;
- permitir TTS local quando disponível;
- permitir tags;
- permitir estudo com SM-2;
- permitir avaliação com Errei/Difícil/Médio/Fácil;
- revisar apenas cards vencidos;
- bloquear funcionalidades com internet para Free;
- exportar ZIP local;
- importar ZIP local;
- importar CSV;
- importar `.apkg` do Anki;
- mostrar estatísticas completas;
- permitir backup manual local;
- não exigir conta para uso Free;
- ter interfaces para scheduler, importers, exporters, TTS e premium gate.

---

## 37. Fora do Escopo da V1

Não implementar na V1:

- sync real entre dispositivos;
- backup automático em nuvem;
- marketplace de decks;
- compartilhamento por link remoto;
- IA;
- tradução automática contextual;
- geração de áudio via API;
- avaliação automática de pronúncia;
- exportação `.apkg`;
- subdecks;
- app web;
- painel admin;
- ranking social;
- chat;
- gamificação complexa.

---

## 38. Observações Finais para o Agent

Não inventar funcionalidades fora deste contrato.

Caso exista dúvida entre implementar algo local ou remoto, priorizar local.

Caso algo exija internet, API ou servidor, tratar como Premium ou deixar como ponto de extensão futuro.

Priorizar arquitetura limpa, extensível e offline-first.

A V1 deve ser simples para o usuário, mas bem estruturada internamente para crescer.

O objetivo não é criar apenas um CRUD de flashcards, mas um app de estudo de idiomas baseado em revisão espaçada, mídia, contexto e progresso.
