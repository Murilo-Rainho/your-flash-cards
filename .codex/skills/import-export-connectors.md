# Skill: import-export-connectors

> Pré-requisito: skill [`project-context`](./project-context.md).

## Objetivo

Implementar importação/exportação como conectores plugáveis (CSV, ZIP, Anki APKG) atrás de
interfaces, com inversão de dependência. Base: §15, §16, §23, §24, §25, §32.3/§32.4.

## Entradas

- Arquivo/origem (CSV, ZIP, `.apkg`) e destino (ZIP local).
- Coleção/deck alvo, tags comuns do lote.

## Saídas

- Interfaces no domínio:
  ```ts
  interface DeckImporter {
    source: string;
    canImport(i: ImportInput): boolean;
    import(i: ImportInput): Promise<ImportResult>;
  }
  interface DeckExporter {
    target: string;
    canExport(i: ExportInput): boolean;
    export(i: ExportInput): Promise<ExportResult>;
  }
  ```
- Implementações em `infrastructure/importers` e `infrastructure/exporters`.
- Pacote ZIP local (§24): `manifest.json` + `cards.csv` + `media/images` + `media/audios`.
- `ImportResult` com `{ imported, skipped[] }` para relatório.

## Restrições

- UI/features só conhecem as interfaces (nunca o formato concreto).
- APKG: **melhor esforço** — importar o máximo, avisar, listar ignorados, não travar por 1
  card inválido. Sem export `.apkg` na V1.
- Sem IA para gerar cards a partir de texto (§16/§27).
- Importação online é Premium futuro (ponto de extensão, não implementar em Free).

## Padrões obrigatórios

- `manifest.json` com versão, coleção, deck, idiomas, data, contagem e metadados de mídia.
- CSV referenciando arquivos locais (`media/images/..`, `media/audios/..`).
- Pré-visualização + validação antes de salvar (lote).

## Anti-patterns (proibido)

- ❌ Acoplar features/telas a um parser específico.
- ❌ Abortar a importação inteira por um item inválido.
- ❌ Exportar `.apkg` na V1.
- ❌ Importar de fonte online em fluxo Free.
