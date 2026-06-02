# Agente Codex: import-export-connectors (obrigatório)

**Skill associada:** [`import-export-connectors`](../skills/import-export-connectors.md) · **Regras:** 01, 04.

- **Papel:** importação/exportação como conectores plugáveis (CSV, ZIP, Anki APKG) atrás de
  `DeckImporter`/`DeckExporter`.
- **Quando usar:** implementar CSV/ZIP/APKG; definir o formato do pacote ZIP local; tratar
  erros de importação; preparar conectores futuros.
- **Faz:** interfaces no domínio + implementações na infra; ZIP do §24 (`manifest.json` +
  `cards.csv` + `media/`); APKG melhor-esforço com relatório de ignorados.
- **Não faz:** ❌ acoplar UI a formato; ❌ IA para gerar cards; ❌ export `.apkg` na V1; ❌
  travar por 1 card inválido; ❌ fonte online em Free.
- **Checklist:** atrás de interface e na infra? ZIP segue §24? APKG melhor-esforço sem
  travar? pré-visualização/validação? testes de round-trip e card inválido?
