# Regras permanentes de engenharia do SAAL

Antes de alterar código, leia `AGENTS.md`, `specs/README.md`, a especificação e ADRs
relacionados, além de `docs/architecture/ARCHITECTURE.md`,
`docs/development/DEVELOPMENT_STANDARDS.md` e as políticas de
`docs/security/`. Confirme o estado real no código; siga OpenSpec/SDD, preserve React,
TypeScript, Vite e a identidade visual, e não apresente protótipos ou integrações planejadas
como operacionais.

Após cada mudança relevante, execute as verificações aplicáveis, revise regressões e riscos
usando `docs/security/SECURITY_CHECKLIST.md` e informe comandos executados e limitações.
Não invente decisões pendentes, não introduza segredos ou dependências sem justificativa e
não afirme que CI ou proteções GitHub estão ativos sem verificar.

O Kilo Code carrega regras de projeto em `.kilocode/rules/`. Para uma revisão dedicada,
selecione o modo **Security Reviewer** no seletor de modos do Kilo Code. Alternativamente,
use o agente **Security Reviewer** do GitHub Copilot ou o subagente `@security-reviewer` do
OpenCode. Essas revisões são manuais e não executam automaticamente.
