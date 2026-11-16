# Especificações SDD do SAAL

Esta pasta é a fonte normativa para evolução incremental do SAAL. Documentos históricos
preservados em [`docs/legacy/`](../docs/legacy/README.md) são contexto, não especificações
normativas. Em caso de divergência sobre o estado implementado, prevalecem o código observado
e estas especificações.

As políticas permanentes que complementam as especificações estão em
[`docs/architecture/ARCHITECTURE.md`](../docs/architecture/ARCHITECTURE.md),
[`docs/security/SECURITY_POLICY.md`](../docs/security/SECURITY_POLICY.md),
[`docs/security/SECURITY_CHECKLIST.md`](../docs/security/SECURITY_CHECKLIST.md) e
[`docs/development/DEVELOPMENT_STANDARDS.md`](../docs/development/DEVELOPMENT_STANDARDS.md).
Consulte-as antes de implementar e ao revisar alterações.

## Como trabalhar

1. Escolha uma feature em `features/`.
2. Leia o contexto e os ADRs relacionados.
3. Resolva explicitamente qualquer `PENDENTE DE DECISÃO` necessário à tarefa.
4. Altere primeiro a especificação quando o comportamento desejado mudar.
5. Implemente a menor mudança que cumpra os critérios Dado/Quando/Então.
6. Atualize contrato, modelo e testes.
7. Execute as verificações pertinentes disponíveis (`pnpm typecheck`, `pnpm test`,
   `pnpm lint`, `pnpm format:check` e `pnpm build`); consulte
   [`docs/quality/QUALITY_PLAN.md`](../docs/quality/QUALITY_PLAN.md) para escopo e limites.
8. Registre evidências e limitações antes de marcar a feature como concluída.

## Estados

- **Implementado:** comportamento existe e usa infraestrutura real necessária.
- **Parcial:** parte dos critérios existe, mas faltam comportamentos.
- **Protótipo:** interface funciona com dados mockados, estado local ou simulação.
- **Não implementado:** não há comportamento utilizável.

## Mapa

| Área | Documento | Estado atual |
|---|---|---|
| Catálogo | `features/animal-catalog.md` | Implementado no worktree |
| Detalhes | `features/animal-details.md` | Parcial no worktree |
| Solicitação de adoção | `features/adoption-request.md` | Implementado no worktree; política de privacidade pendente |
| Gestão de animais | `features/animal-management.md` | Parcial no worktree; exclusão desabilitada |
| Autenticação admin | `features/admin-authentication.md` | Parcial somente nas branches de implementação; `main` ainda não integrado |
| Gestão de adoções | `features/adoption-management.md` | Implementado no worktree, somente leitura |
| Contato geral | — | Fora do primeiro incremento (ONG-07) |

## Rastreabilidade

- [Requisitos legados](../docs/legacy/REQUISITOS_FUNCIONAIS.md).
- [Documentação legada](../docs/legacy/DOCUMENTACAO_PROJETO.md).
- Contrato: `contracts/openapi.yaml`; descreve as rotas implementadas neste worktree, não um deploy ativo.
- Modelo conceitual: `contracts/data-model.md`.
- Mudanças arquiteturais: novo ADR em `decisions/`.

## Pendências transversais

- Definir identidade nominal, rotação/recuperação e operação de credenciais do único
  administrador; sessão server-side, CSRF e topologia same-site estão aprovados em ADR-006.
  Não há papéis diferenciados (ONG-01).
- Não há workflow de status de manifestação; a avaliação é manual e a gestão é somente leitura
  (ONG-04). Definir duplicidade e revisar limites operacionais antiabuso (ONG-09).
- Definir finalidade, consentimento/base legal, aviso, acesso, retenção e exclusão dos dados
  pessoais conforme LGPD (ONG-05).
- Definir publicação/visibilidade de adotados e exclusão/arquivamento de animais (ONG-02/ONG-03).
- Definir formatos, limites, storage, EXIF e moderação das 1–3 imagens (ONG-06).
- Definir demais campos do animal e vocabulário de espécie/sexo/porte (ONG-10).
- Definir o terceiro canal de contato, métricas e conteúdo institucional (ONG-11). O formulário
  de contato geral está fora do primeiro incremento (ONG-07).
- Escopo e retenção de logs mínimos de segurança (ONG-08).
- Ampliar testes além da base Vitest/Oxlint de I0, incluindo integrações backend e browser.
- Flyway V1/V2 e backend Spring Boot existem no worktree. A integração MySQL real e a
  implantação não são presumidas; decisões de finalidade e retenção de PII continuam pendentes.
