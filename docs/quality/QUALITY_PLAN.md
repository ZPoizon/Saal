# Plano de qualidade e confiabilidade do SAAL

**Status:** plano de governança; não comprova implementação de controles futuros.
**Escopo:** change OpenSpec `saal-functional-readiness`, incrementos I0–I11.
**Fonte normativa:** requisitos em `openspec/changes/saal-functional-readiness/` e
decisões registradas em `specs/decisions/I1-approval-register.md`.

## 1. Objetivo e princípios

Este plano define como demonstrar que uma mudança satisfaz seus requisitos, preserva o
comportamento existente e trata riscos de segurança, privacidade, acessibilidade e operação.
Build verde é necessário, mas não basta para declarar uma funcionalidade concluída.

- Manter React + TypeScript + Vite + pnpm no frontend e a futura API separada Java/Spring
  Boot com MySQL 8, conforme ADRs aceitos; não introduzir backend fictício.
- Testar requisitos e cenários identificados no OpenSpec, não apenas linhas ou arquivos.
- Marcar separadamente o estado como planejado, implementado, testado localmente, validado
  no CI, verificado em ambiente ou aprovado para produção.
- Usar dados sintéticos; não usar PII real em fixtures ou logs de teste.
- Falhas de serviço não podem ser convertidas em sucesso, nem resultar em fallback silencioso
  para mocks.
- Nenhuma decisão de negócio pendente da ONG pode ser inferida a partir de mocks, enums,
  texto histórico ou recomendação técnica.
- Usar o checklist de segurança em `docs/security/SECURITY_CHECKLIST.md` e a política em
  `docs/security/SECURITY_POLICY.md`. A checklist preenchida não é certificação.
- Tratar provedores gratuitos como opções de demonstração sujeitas a limites, sem pressupor
  disponibilidade, SLA ou prontidão para produção.

## 2. Estado comprovado dos controles I0

O workflow `.github/workflows/quality.yml` foi integrado ao I0. A execução hospedada do PR
#1, run [40626776841](https://github.com/ZPoizon/Saal/actions/runs/40626776841), terminou
com `success`. A evidência confirma aquela execução e aquele commit, não a configuração de
proteção da branch, nem checks obrigatórios para merges futuros.

| Controle existente | Evidência/configuração | Limite conhecido |
|---|---|---|
| CI frontend | GitHub Actions em PR, push para `main` e execução manual; um job frontend. | Não há jobs de backend, containers, deploy ou E2E. |
| Dependências frontend | Node 22, pnpm 10.34.3 e `pnpm install --frozen-lockfile`. | O workflow não configura uma toolchain Java. |
| Tipos | `pnpm typecheck` (`tsc --noEmit`). | Só cobre o TypeScript atual. |
| Testes | `pnpm test` com Vitest; dois testes unitários iniciais para helpers de animais. | Não cobrem componentes, formulários, HTTP, integração, API, persistência ou browser. |
| Lint | `pnpm lint` com Oxlint. | Baseline documentada com três warnings preexistentes; evitar novos warnings e acompanhar os antigos separadamente. |
| Formatação | `pnpm format:check`, modo sem escrita, para arquivos suportados alterados. | Não formata/verifica integralmente o legado fora do diff; `pnpm format` altera arquivos. |
| Segredos | `pnpm secrets:check` com Secretlint. | Analisa workspace visível conforme configuração/`.gitignore`, não todo o histórico Git nem arquivos ignorados. |
| Dependências | `pnpm audit --audit-level=moderate`. | Não substitui revisão de licença/origem, análise de código ou avaliação de risco operacional. |
| Build frontend | `pnpm build` com Vite. | Não é validação de deploy em Pages ou do comportamento no navegador real. |
| Mínimo de privilégios do workflow | `contents: read`; actions referenciadas por SHA. | Revisar cada alteração futura de workflow; isso não prova branch protection. |

O frontend continua sendo protótipo com dados mockados e estado em memória. Não há backend,
MySQL, migrações, sessão real, integração frontend/API nem deploy comprovados neste
repositório. A autenticação administrativa observada é insegura e não pode ser tratada como
controle funcional.

## 3. Lacunas de qualidade

1. **Backend:** sem Maven Wrapper, build Java, testes JUnit/Spring Boot, configuração de
   runtime ou job de CI backend.
2. **Banco:** sem MySQL de teste, validação Flyway ou evidência de integridade/upgrade de
   schema.
3. **Contrato:** OpenAPI é planejado e ainda precisa reconciliação com ADRs e decisões de
   negócio; não há validador versionado executado no CI.
4. **Frontend além de helpers:** faltam testes de componentes, navegação, formulários,
   estados loading/empty/error/success e acessibilidade automatizada.
5. **Integração e E2E:** sem API real conectada, Testcontainers ou jornada no browser;
   Playwright é uma opção a avaliar, não uma ferramenta já aprovada/configurada.
6. **Segurança:** não existem testes executáveis de autenticação/autorização, CSRF, abuso,
   validação server-side, IDOR, upload ou redaction de logs.
7. **Acessibilidade/responsividade:** não há evidência de execução com leitor de tela,
   axe/equivalente ou medidas sistemáticas nas viewports exigidas.
8. **Operação:** sem staging, deploy, smoke test, monitoramento, rehearsal de backup/restore
   ou validação de limites dos planos gratuitos.
9. **GitHub:** workflow configurado não significa que a branch exija aprovação/checks; a
   configuração administrativa precisa ser verificada pelo responsável autorizado.

## 4. Estratégia de testes

### Frontend

- Manter Vitest para regras puras, helpers, conversões/validação e estados.
- Para componentes, formulários e navegação, escolher ferramentas compatíveis com o stack
   existente após inventário de dependências; testes de serviço podem usar doubles somente
  no ambiente de teste, nunca como fallback de produção.
- Cobrir respostas e transições de estado: loading, lista vazia, sucesso confirmado pelo
  servidor, erro recuperável, timeout/rede, retry e preservação dos campos.
- Testar teclado, foco, labels, mensagens associadas a campos e semântica; usar axe ou
  equivalente como complemento a inspeção manual.
- Não usar snapshot como substituto de comportamento. Testes visuais exigem browser e
  evidência real de execução.

### Backend

- JUnit 5 e Spring Boot Test para unidades, slice tests e integração da API.
- Testcontainers com imagem MySQL 8 fixada para Flyway, constraints, repositórios e
  transações; H2 não é substituto único da semântica MySQL.
- Testar validação na fronteira do servidor, DTO allowlist, parâmetros de consulta,
  respostas RFC 9457, códigos de erro e ausência de detalhes internos.
- Testar autenticação, autorização por operação/recurso, sessão, logout, CSRF e rate limit
  apenas depois de aprovados os requisitos/ADR aplicáveis.
- Usar fixtures sintéticas e credenciais efêmeras de CI; jamais incluir segredo de ambiente
  real em testes, logs ou artefatos.

### Contrato, integração e E2E

- Redocly CLI 2.72.0 está selecionada como candidata versionada (TEC-07) e foi executada
  nesta revisão documental; a aprovação do API owner/mantenedor de CI ainda é necessária
  antes de adicionar a ferramenta ao pipeline ou tratar o contrato como implementável.
- E2E com Playwright é proposta para avaliação quando frontend e API existirem. Não instalar
  ou considerar aprovado por este plano.
- Jornadas E2E devem verificar persistência após reload e comportamento negativo, não apenas
  feedback visual. Não executar jornadas que dependam de fluxo de negócio ainda não aprovado.
- Testar browser com origens, cookies, CSRF e proxy reais da topologia aprovada antes de
  afirmar que autenticação opera em produção.

## 5. Segurança, privacidade e acessibilidade na qualidade

Aplicar análise de ameaças proporcional a cada mudança, incluindo atores, dados pessoais,
fronteiras de confiança, abusos, mitigação, teste e risco residual. Priorizar:

- SQL injection, XSS, validação de entrada/saída e erros;
- autenticação, sessão/cookies, CSRF, CORS, autorização e IDOR/BOLA;
- abuso, enumeração, rate limits, idempotência e limites de payload;
- uploads: conteúdo real, formatos/limites aprovados, storage isolado e falhas;
- exposição de PII em respostas, logs, traces, auditoria, backups e testes;
- segredos, variáveis `VITE_*`, dependências e permissões do CI;
- foco, teclado, nomes/estados acessíveis, contraste e overflow em telas/zoom previstos.

Nenhum dado real de adoção deve ser aceito antes de decisão de finalidade, transparência,
acesso, retenção e responsáveis pela ONG. Nenhum upload deve ser habilitado antes de decisão
de política e storage. A referência WCAG 2.2 AA não é uma declaração de conformidade.

## 6. Pipeline evolutivo

Preservar os checks I0 e adicionar controles somente quando seus componentes e requisitos
forem autorizados e existirem:

1. **I0:** checks frontend já existentes, com execução observada no run indicado acima.
2. **I1:** validação OpenSpec estrita, links/rastreabilidade documental e OpenAPI validado
   por ferramenta versionada após aprovação; sem build de backend.
3. **I2:** Maven Wrapper/build Java, testes unitários backend, imagem Docker reproduzível,
   scan de dependências/segredos e evidência de configuração segura.
4. **I3:** MySQL 8 em Testcontainers, Flyway em banco limpo e upgrade suportado; sem depender
   de rollback transacional de DDL.
5. **I4–I10:** testes API/UI e negativos correspondentes a cada capability, controles de
   autorização/PII/abuso e validação de erro/falha.
6. **I11:** suites integradas/E2E, revisão AppSec, acessibilidade, viewports, deploy de
   demonstração, recovery e evidência operacional.

O CI deve falhar quando controle obrigatório do job falhar. Fixar versões de runtimes,
containers, actions e ferramentas; limitar permissões; não expor segredos em logs/artefatos.
Testes dependentes de infraestrutura precisam de timeout, diagnóstico sanitizado e teardown.

## 7. Evidência exigida por mudança

Para cada PR/incremento, registrar:

- IDs dos requisitos OpenSpec atendidos e critérios deliberadamente bloqueados;
- commit/branch, toolchains e versões executadas;
- comandos, resultado e link/ID de execução do CI (se executado);
- testes novos/alterados e cenários negativos cobertos;
- revisão de segurança e privacidade, acessibilidade e regressões aplicáveis;
- limitações, warnings preexistentes versus novos, exceções com responsável/prazo;
- para ambiente implantado: ambiente, data, versão/commit, smoke tests e limitações.

Relatório, checklist ou teste estático não prova execução no CI/browser/ambiente. Não declarar
prontidão para produção só com build verde.

## 8. Referências

- [Change OpenSpec e tarefas I0–I11](../../openspec/changes/saal-functional-readiness/)
- [Matriz de testes](TEST_MATRIX.md)
- [Gates de release](RELEASE_GATES.md)
- [Política de segurança](../security/SECURITY_POLICY.md)
- [Checklist AppSec](../security/SECURITY_CHECKLIST.md)
- [Padrões de desenvolvimento](../development/DEVELOPMENT_STANDARDS.md)
- [Diagnóstico e rastreabilidade](../diagnostics/TRACEABILITY_AND_ROADMAP.md)
