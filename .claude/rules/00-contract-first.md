# Regra 00 — Contract-First (REGRA PRINCIPAL, OBRIGATÓRIA)

> Esta é a regra de maior prioridade do projeto. Ela vincula Claude, e está espelhada
> para Codex (`.codex/rules/`, skill `project-context`) e Cursor (`.cursor/rules/`).

## A regra

[`CONTRATO_README.md`](../../local_files/CONTRATO_README.md) é a **fonte única da verdade** do produto
e da arquitetura.

**Antes de propor ou aplicar qualquer mudança arquitetural, criar uma feature, adicionar
dependência, modelar dados, definir interfaces ou alterar fluxos, você DEVE:**

1. **Ler/consultar o `local_files/CONTRATO_README.md`** e identificar as seções relevantes
   (cite o número da seção, ex.: "conforme §18").
2. **Conferir os arquivos de contexto** em `.claude/context/` (arquitetura, modelo de
   domínio, stack, glossário).
3. **Verificar conformidade** com as regras 01–04 deste diretório.

## Proibições absolutas

- ❌ **Não inventar funcionalidades** fora do contrato (§38). Se não está no contrato,
  não implemente — pergunte ou registre como ponto de extensão futuro.
- ❌ Não introduzir dependência obrigatória de **internet/API/backend** em fluxos Free
  (§29). Em dúvida entre local e remoto, **priorizar local** (§38).
- ❌ Não violar a **regra de dependência** entre camadas (ver regra 01).
- ❌ Não adicionar IA na V1 (§27). Apenas pontos de extensão.

## O que fazer em caso de conflito ou ambiguidade

1. O contrato vence sobre suposições suas.
2. Se o contrato e a estrutura real do projeto divergirem em **localização de arquivos**,
   siga `.claude/context/architecture.md` (reconciliação Expo Router) e **explique**.
3. Se o contrato for **silencioso ou ambíguo**, NÃO escolha sozinho um caminho que
   adicione complexidade ou dependência remota. Apresente as opções, recomende a mais
   simples/local e peça confirmação.

## Checklist antes de qualquer entrega

- [ ] Citei a(s) seção(ões) do contrato que embasam a mudança.
- [ ] A mudança respeita offline-first e a separação de camadas.
- [ ] Nenhuma feature nova foi inventada além do contrato.
- [ ] Recursos que exigem internet foram tratados como Premium ou ponto de extensão.
- [ ] Atualizei contexto/regras se a arquitetura evoluiu.
