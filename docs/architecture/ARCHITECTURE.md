# Arquitetura do SAAL

## Estado atual

O SAAL é uma SPA de protótipo construída com React 18, TypeScript, Vite 6 e React Router 7,
gerenciada com pnpm. O frontend apresenta animais e fluxos administrativos/demonstrações. O catálogo e as
configurações públicas do site iniciam com os dados definidos pelo protótipo; alterações
administrativas são salvas no `localStorage` do navegador atual. Solicitações de adoção
continuam em memória. Não há backend nem persistência compartilhada no servidor neste
repositório. A entrada administrativa é aberta e somente demonstração, conforme
`specs/features/admin-authentication.md`; não publicar como autenticação real.

Estrutura observada:

- `src/main.tsx`: entrada do navegador.
- `src/app/routes.tsx`: roteamento.
- `src/app/pages/` e `src/app/components/`: páginas e interface reutilizável.
- `src/app/data/`: dados estáticos/de demonstração e leitura/escrita do catálogo local.
- `src/app/contexts/`: estado compartilhado da aplicação.
- `src/styles/`: tema e estilos.

Não reestruture essa organização por preferência. Preserve a identidade visual, navegação,
responsividade e comportamento existente, salvo mudança justificada pela especificação.

## Direção aprovada, ainda não implementada

Os ADRs `specs/decisions/ADR-001-react-typescript-vite.md`,
`ADR-002-spring-boot.md` e `ADR-003-mysql.md` estabelecem:

```text
Navegador (React + TypeScript + Vite)
          | HTTPS / REST / JSON
          v
API Java + Spring Boot (futura)
          | JDBC/JPA
          v
MySQL 8 (futuro)
```

O navegador nunca acessará o banco diretamente. O contrato em
`specs/contracts/openapi.yaml` é planejado, não representa endpoints ativos. Nenhum backend
fictício deve ser criado para simular persistência.

O backend será responsável por autenticação, autorização por papel e recurso, validação
autoritativa, regras de negócio, persistência, auditoria e proteção de dados. O frontend
validará entradas para usabilidade, mas essa validação nunca substitui a validação do
servidor.

## Limites e evolução incremental

- Componentes visuais recebem dados por props; páginas orquestram telas; quando a API for
  implementada, serviços/adaptadores isolam HTTP, DTOs e erros do frontend.
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

Java 21, Spring Boot 4.1.2 (condicionado à revalidação antes de I2), Maven Wrapper, Spring
Security, Spring Data JPA, Bean Validation, MySQL 8, Flyway, JUnit 5, Spring Boot Test,
Testcontainers/MySQL 8, Docker, GitHub Actions e RFC 9457 foram escolhas técnicas registradas
pela equipe; não estão implementadas. Consultar
[`specs/decisions/I1-approval-register.md`](../../specs/decisions/I1-approval-register.md)
para limites e evidência.

Continuam pendentes o protocolo/topologia de sessão, perfis, origem/proxy/CSRF, hosting de
produção, storage de imagens, retenção de dados e provedor de contato. Flyway está escolhido,
mas não há schema nem migrations aprovados ou criados. Não escolher silenciosamente uma
opção que altere segurança, domínio ou operação.

## Mudanças arquiteturais

Faça a menor mudança compatível com a feature. Registre decisões relevantes em um novo ADR
em `specs/decisions/` e atualize a especificação, contrato e documentação afetados. A política
de segurança correspondente está em `docs/security/SECURITY_POLICY.md`.
