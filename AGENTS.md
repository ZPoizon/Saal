# AGENTS.md — SAAL

Instruções permanentes para assistentes de IA que trabalhem neste repositório.

## Contexto

- Aplicação oficial: React 18 + TypeScript + Vite, gerenciada com pnpm.
- Identidade visual existente: deve ser preservada integralmente.
- Estado atual: frontend funcional com dados mockados e operações em memória.
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

## Comandos oficiais

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm format
```

Não há suíte de testes ou lint configurados atualmente. Não afirmar que testes/lint passaram.

## Arquivos de referência

- `specs/`: fonte normativa para desenvolvimento.
- `src/main.tsx`: entrada do navegador.
- `src/app/routes.tsx`: rotas.
- `src/app/data/animals.ts`: modelo e dados mockados atuais.
- `src/app/contexts/InterestContext.tsx`: solicitações mantidas apenas em memória.
- `vite.figma.config.ts`: configuração usada pelos scripts Vite.
- `.mise.toml`: versões da toolchain.
- `guidelines/Guidelines.md`: orientações adicionais do projeto.
