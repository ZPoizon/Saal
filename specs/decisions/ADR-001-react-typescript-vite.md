# ADR-001: React, TypeScript e Vite

- **Status:** Aceito
- **Contexto:** O frontend existente e funcional usa React 18, TypeScript e Vite. Recriar ou
  migrar aumentaria risco sem benefício para a preparação SDD.
- **Decisão:** Manter React + TypeScript + Vite como frontend oficial e evoluir de forma
  incremental, preservando interface e rotas.
- **Consequências:** A equipe mantém a base atual; contratos HTTP serão adicionados por
  serviços; build gera SPA estática; SSR não faz parte desta decisão.
- **Alternativas rejeitadas:** migração imediata para Vue/Next.js e reescrita integral.
