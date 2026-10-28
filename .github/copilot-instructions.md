# Instruções do GitHub Copilot para o SAAL

Antes de qualquer alteração de código, leia `AGENTS.md`, `specs/README.md`, a
especificação e os ADRs relacionados, além de:

- `docs/architecture/ARCHITECTURE.md`;
- `docs/development/DEVELOPMENT_STANDARDS.md`;
- `docs/security/SECURITY_POLICY.md` e `docs/security/SECURITY_CHECKLIST.md`, conforme o
  risco da mudança.

Siga o fluxo OpenSpec/SDD e confirme o estado implementado no código. Preserve a identidade
visual e a estrutura React + TypeScript + Vite. Não trate mocks, estado em memória, login de
demonstração ou contratos planejados como funcionalidades com backend ou persistência real.
Não introduza segredos nem dependências sem justificativa.

Após cada mudança relevante, examine regressões e vulnerabilidades aplicáveis e execute as
verificações disponíveis descritas em `AGENTS.md` e `DEVELOPMENT_STANDARDS.md`. Relate os
comandos realmente executados, limitações e riscos pendentes. Não afirme que CI, lint, testes
ou proteções de branch estão ativos sem verificar.

Para revisão de segurança, solicite explicitamente o agente **Security Reviewer** no seletor
de agentes do GitHub Copilot. Ele é um revisor sob demanda e não é executado automaticamente.
No OpenCode, mencione `@security-reviewer`; no Kilo Code, selecione o modo **Security
Reviewer** no seletor de modos. Essas integrações também são sob demanda.
