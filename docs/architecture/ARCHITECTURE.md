# Arquitetura do SAAL

## Estado atual

O SAAL contém uma SPA React 18, TypeScript, Vite 6 e React Router 7, gerenciada com pnpm, e
uma API Java 21/Spring Boot com JPA, Spring Security e Flyway. Catálogo, CRUD administrativo
e manifestações de interesse têm integração de API no worktree. MySQL é a persistência
configurada para o backend; não se presume banco disponível nem deploy ativo. Imagens seguem
como referências URL, sem upload. Consulte as especificações para capacidades ainda parciais.

Estrutura observada:

- `src/main.tsx`: entrada do navegador.
- `src/app/routes.tsx`: roteamento.
- `src/app/pages/` e `src/app/components/`: páginas e interface reutilizável.
- `src/app/data/`: modelos e DTOs da interface.
- `src/app/services/`: adaptadores HTTP e tratamento de respostas da API.
- `src/app/contexts/`: contexto legado ainda sem persistência.
- `backend/`: API, migrations e testes do servidor.
- `src/styles/`: tema e estilos.

Não reestruture essa organização por preferência. Preserve a identidade visual, navegação,
responsividade e comportamento existente, salvo mudança justificada pela especificação.

## Arquitetura implementada no worktree (não significa deploy ativo)

Os ADRs `specs/decisions/ADR-001-react-typescript-vite.md`,
`ADR-002-spring-boot.md` e `ADR-003-mysql.md` estabelecem:

```text
Navegador (React + TypeScript + Vite)
          | HTTPS / REST / JSON
          v
API Java + Spring Boot
          | JDBC/JPA
          v
MySQL 8
```

O navegador nunca acessa o banco diretamente. O contrato em
`specs/contracts/openapi.yaml` descreve as rotas do backend deste worktree, mas não representa
um serviço implantado ou disponível em produção.

O backend é responsável por autenticação, autorização por papel e recurso, validação
autoritativa, regras de negócio e persistência. O frontend valida entradas para usabilidade,
mas essa validação nunca substitui a validação do servidor. Retenção e finalidade de PII
continuam pendentes.

## Limites e evolução incremental

- Componentes visuais recebem dados por props; páginas orquestram telas; serviços/adaptadores
  isolam HTTP, DTOs e erros do frontend.
- Componentes não devem incorporar acesso direto à API nem regras de autorização.
- Não retornar entidades JPA diretamente como DTOs públicos.
- Mudanças de contrato devem atualizar OpenAPI e especificações relacionadas.
- MySQL deve ser acessado somente pelo backend, com consultas parametrizadas/ORM seguro e
  migrations versionadas. Não executar migrações destrutivas sem autorização explícita.
- Variáveis `VITE_*` são incluídas no bundle do navegador e são públicas. Nunca colocar
  senhas, tokens privados ou chaves nelas.
- A URL de API (`VITE_API_URL`), provedores externos e integrações ainda não implementadas
  não devem ser descritos como operacionais.

## Decisões e pendências

Java 21, Spring Boot 4.1.2, Maven Wrapper, Spring Security, Spring Data JPA, Bean Validation,
MySQL 8, Flyway, JUnit 5, Spring Boot Test, Testcontainers/MySQL 8, Docker e RFC 9457 estão
implementados no backend deste worktree. Disponibilidade do banco, deploy e execução do CI
devem ser verificados separadamente. Consultar
[`specs/decisions/I1-approval-register.md`](../../specs/decisions/I1-approval-register.md)
para limites e evidência.

Continuam pendentes storage de imagens, retenção/finalidade de dados pessoais e hosting de
produção. Não escolher silenciosamente uma opção que altere segurança, domínio ou operação.

## Mudanças arquiteturais

Faça a menor mudança compatível com a feature. Registre decisões relevantes em um novo ADR
em `specs/decisions/` e atualize a especificação, contrato e documentação afetados. A política
de segurança correspondente está em `docs/security/SECURITY_POLICY.md`.
