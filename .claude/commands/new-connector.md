---
description: Guia a criação de um importer/exporter plugável (CSV/ZIP/APKG) com inversão de dependência.
argument-hint: <conector, ex. "Quizlet importer" ou "ZIP exporter">
---

Projete o conector: $ARGUMENTS

Base: `local_files/CONTRATO_README.md` §23, §24, §25, §32.3/§32.4 e o agente
`import-export-connectors`.

Passos:

1. **Interface** (domínio): implemente `DeckImporter` (`source`, `canImport`, `import`) ou
   `DeckExporter` (`target`, `canExport`, `export`). A UI/features só conhecem a interface.
2. **Local da implementação**: `infrastructure/importers` ou `infrastructure/exporters`.
3. **Formato** (se ZIP): siga o §24 — `manifest.json` (versão, coleção, deck, idiomas,
   data, contagem, metadados de mídia), `cards.csv` (referenciando `media/...`) e pastas
   `media/images`, `media/audios`.
4. **Robustez** (se APKG/import): **melhor esforço** — importar o máximo, avisar, listar
   ignorados, nunca travar por 1 card inválido (§25). Sem export `.apkg` na V1.
5. **Limites**: sem IA para gerar cards (§16/§27); importação **online** é Premium futuro
   (deixe ponto de extensão, não implemente em Free).
6. **Testes** (`testing-quality`): round-trip (export→import), card inválido, contagem de
   ignorados.

Entregue: assinatura da interface usada, arquivos a criar e os testes previstos.
