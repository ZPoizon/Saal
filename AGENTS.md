# AGENTS.md — SAAL

Instruções permanentes para assistentes de IA que trabalhem neste repositório.

## Contexto

- Aplicação oficial: React 18 + TypeScript + Vite, gerenciada com pnpm.
- Identidade visual existente: deve ser preservada integralmente.
- Estado atual: frontend de protótipo com dados de demonstração; alterações do catálogo ficam
  no armazenamento local do navegador e solicitações permanecem em memória.
- Arquitetura futura aprovada: API REST em Java + Spring Boot e MySQL 8.
- O backend futuro não está implementado. Nunca descreva protótipos locais como persistência real.

## Fluxo Spec-Driven Development

1. Antes de implementar, leia `specs/README.md`, a especificação da funcionalidade e os ADRs relacionados.
2. Confirme o estado atual registrado na spec: implementado, parcial, protótipo ou não implementado.
3. Se uma regra necessária estiver marcada `PENDENTE DE DECISÃO`, não a invente. Solicite decisão ou documente a pendência.
4. Faça a menor alteração coerente que satisfaça os critérios de aceitação.
5. Atualize a spec, o OpenAPI ou um ADR quando a implementação alterar comportamento ou arquitetura.
6. Não declare conclusão sem executar as verificações disponíveis e registrar limitações.

## Regras obrigatórias

- Preservar cores, imagens, fontes, componentes, layouts, responsividade e navegação existentes.
- Não migrar o frontend, recriar o projeto ou adicionar backend fictício.
- Não modificar arquivos fora do escopo sem justificativa.
- Não adicionar bibliotecas desnecessárias; preferir APIs e padrões já usados.
- Não armazenar senhas, tokens, chaves ou credenciais no código.
- Não substituir dados reais por dados fictícios silenciosamente.
- Usar TypeScript estrito e tipagem adequada; evitar `any`.
- Criar componentes reutilizáveis quando houver reutilização real.
- Separar interface, regras de negócio e futuro acesso à API.
- Implementar tratamento de erros e validar entradas no cliente e, futuramente, no servidor.
- Criar ou atualizar testes para comportamentos alterados quando a infraestrutura de testes existir.
- Executar build, verificação de tipos e testes aplicáveis.
- Documentar decisões arquiteturais importantes em `specs/decisions/`.
- Tratar dados pessoais conforme LGPD e aplicar menor privilégio na área administrativa.

## Políticas de engenharia e segurança

Antes de alterar código:

1. Leia este arquivo, `specs/README.md`, a especificação da funcionalidade e os ADRs
   relacionados.
2. Consulte `docs/architecture/ARCHITECTURE.md`,
   `docs/development/DEVELOPMENT_STANDARDS.md` e as partes aplicáveis de
   `docs/security/SECURITY_POLICY.md`.
3. Use `docs/security/SECURITY_CHECKLIST.md` para identificar ameaças e controles relevantes.
   Não invente regras marcadas `PENDENTE DE DECISÃO`.
4. Preserve alterações preexistentes no worktree e não amplie o escopo sem justificativa.

Após cada alteração relevante, revise regressões e riscos de segurança e execute as
verificações disponíveis para a mudança. Informe exatamente o que foi executado e o que
permanece sem cobertura; não declare testes, lint, CI ou proteções do GitHub como existentes
ou aprovados sem evidência.

As políticas descrevem controles esperados, não garantem que estejam implementados. O
frontend atual é um protótipo e autenticação, autorização, persistência e proteção de dados
precisam ser aplicadas no backend quando ele for aprovado e construído.

## Comandos oficiais

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check
pnpm audit --audit-level=moderate
pnpm secrets:check
pnpm build
pnpm format
```

Testes, lint, verificação de formatação em arquivos de código alterados, auditoria de
dependências e scanner de segredos são executados pelo workflow
`.github/workflows/quality.yml`. `pnpm format` modifica arquivos; usar `pnpm format:check`
para validação sem escrita. A existência do workflow não prova que ele já executou no GitHub
nem que seus checks sejam obrigatórios para merge; verificar a configuração da branch antes
de fazer essa afirmação.

## Arquivos de referência

- `specs/`: fonte normativa para desenvolvimento.
- `docs/architecture/ARCHITECTURE.md`: arquitetura atual e direção aprovada.
- `docs/security/SECURITY_POLICY.md`: política de segurança.
- `docs/security/SECURITY_CHECKLIST.md`: revisão por mudança.
- `docs/development/DEVELOPMENT_STANDARDS.md`: padrões, verificações e plano de automação.
- `src/main.tsx`: entrada do navegador.
- `src/app/routes.tsx`: rotas.
- `src/app/data/animals.ts`: modelo e dados mockados atuais.
- `src/app/contexts/InterestContext.tsx`: solicitações mantidas apenas em memória.
- `vite.figma.config.ts`: configuração usada pelos scripts Vite.
- `.mise.toml`: versões da toolchain.
- `guidelines/Guidelines.md`: orientações adicionais do projeto.
