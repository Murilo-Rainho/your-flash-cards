# Agente Codex: premium-gate-billing (opcional)

**Regras:** 03.

- **Papel:** Premium Gate, feature flags e billing/assinatura com isolamento total Free×Premium.
- **Quando usar:** introduzir feature que dependa de internet/API/backend; definir feature
  keys; isolar billing/auth.
- **Faz:** `PremiumGate.canUse(featureKey)` no domínio; gate antes de features remotas;
  mensagem motivo+benefício+alternativa local; Free default resiliente.
- **Não faz:** ❌ implementar features Premium remotas da V1 (§37 — só gates/extensão); ❌
  acoplar Free a assinatura; ❌ bloquear uso local; ❌ billing/auth como dependência de Free.
- **Checklist:** feature de rede atrás do gate? mensagem completa? Free funciona sem
  billing/auth? billing/auth isolados?
