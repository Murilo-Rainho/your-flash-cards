# Regra 03 — Premium Gating

> Base: `CONTRATO_README.md` §4, §28, §32.5, §37.

## Regra geral (decoreba)

> **Tudo que roda localmente é Free. Tudo que exige internet/API/backend/storage remoto
> é Premium.**

## Regras

- ✅ Toda funcionalidade que dependa de rede/servidor passa por
  `PremiumGate.canUse(featureKey)` antes de executar.
- ✅ Ao bloquear, o app deve: **explicar o motivo**, **mostrar o benefício**, **permitir
  assinar/autenticar (futuro)** e **nunca impedir o uso local** (§28).
- ✅ O caminho Free precisa continuar funcionando mesmo que billing/auth falhem ou estejam
  ausentes. Free é o default.
- ✅ Sem limite de quantidade de cards no Free: criação local de cards é ilimitada (§4.1).

## Isolamento Free × Premium

- `infrastructure/billing` e `infrastructure/auth` ficam **isolados** e não podem ser
  dependência de fluxos Free (§31).
- O `domain/` define apenas a interface `PremiumGate`; a decisão concreta (assinatura
  válida etc.) vive na infra.
- Features Premium da V1 são **fora de escopo de implementação** (§37): sync, backup em
  nuvem, marketplace, IA, tradução por API, áudio por API. Apenas deixe os **gates** e
  pontos de extensão.

## Proibições

- ❌ Acoplar lógica Free a verificações de assinatura.
- ❌ Implementar features Premium remotas na V1.
- ❌ Quebrar/bloquear o uso local quando o usuário é Free.

## Checklist

- [ ] A feature precisa de internet? Então está atrás de `PremiumGate`.
- [ ] A mensagem de bloqueio explica motivo + benefício + alternativa local?
- [ ] O fluxo Free funciona com billing/auth ausentes?
