# Regra Codex 03 — Premium Gating

Regra geral: **local = Free, remoto (internet/API/backend) = Premium** (§4/§28).

- Toda feature de rede passa por `PremiumGate.canUse(featureKey)` antes de executar.
- Bloqueio = motivo + benefício + alternativa local; nunca impedir o uso local (§28).
- Free é o default resiliente: billing/auth ausentes/falhos ⇒ uso local intacto.
- Free sem limite de quantidade de cards: criação local ilimitada (§4.1).
- `infrastructure/billing` e `infrastructure/auth` isolados; não são dependência de Free.

Fora de escopo da V1 (só gates/extensão, não implementar): sync, backup nuvem, marketplace,
IA, tradução/áudio por API (§37).
