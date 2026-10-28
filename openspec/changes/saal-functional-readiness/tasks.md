# Tasks

## 1. Qualidade e CI mínimo — I0

- [x] 1.1 Inventariar comandos e toolchain existentes; escolher e documentar runner de testes, lint, secret/dependency scanning e execução de checks de formatação sem escrita; verificar compatibilidade com Node/pnpm e justificativa de cada dependência.
- [x] 1.2 Configurar CI em pull requests com instalação lockfile, typecheck, testes, lint, formatação em modo check, build, auditoria de dependências e varredura de segredos; verificar permissões mínimas, relatórios claros e nenhuma credencial nos logs. PR #1 (`chore/saal-i0-quality-foundation` → `main`) executou o workflow `Quality checks` no GitHub Actions (run 40626776841, conclusão `success`); todos os steps passaram. Permissões mínimas e ausência de credenciais no workflow/diff foram revisadas; 18 entradas de log hospedadas foram verificadas contra padrões de credenciais conhecidos, sem correspondências. O PR foi mesclado à `main` em 2026-10-28 (merge commit `8bb42b58deee54b02d3c0f592d783e148ee3e56c`); workflow confirmado na ref. A listagem de branches informa `protected=false`; regrasets não foram inspecionados, portanto não se alega que checks sejam obrigatórios para merge.
- [x] 1.3 Introduzir fixtures sintéticas e teste deliberadamente falho; verificar falha do job quando qualquer controle obrigatório falhar. O conjunto Vitest falhou conforme esperado com probe temporário; Secretlint também rejeitou probe sintético e mascarou o valor. Os probes foram removidos; workflow usa comandos com falha propagada.
- [x] 1.4 Documentar dependências e evidência da proteção de branch; só afirmar bloqueio de merge após verificar configuração efetiva no GitHub. A consulta anônima à API GitHub retornou HTTP 401; proteção de branch permanece não verificada e não é alegada como ativa.
- [x] 1.5 Executar checks existentes e registrar baseline/limitações sem corrigir problemas não relacionados; verificar `pnpm typecheck`, `pnpm build`, teste/lint/formatação/scan escolhidos. Checks executados em Node 22.23.4 com pnpm 10.34.3; Oxlint reporta três warnings preexistentes de imports não usados.

## 2. Aprovações, modelo de domínio e contratos — I1

Registro formal de decisões e checklist de aprovação:
[`specs/decisions/I1-approval-register.md`](../../../specs/decisions/I1-approval-register.md).
Recomendações ali não são decisões aprovadas; manter os gates abaixo pendentes até
registrar evidência ou bloqueio explícito.

- [x] 2.1 Registrar ONG-01–ONG-11 sem inferir respostas: decisões e valores do protótipo permanecem pendentes, cada uma com função responsável, requisitos afetados e escopo explicitamente fora do contrato implementável. Evidência em `specs/decisions/I1-approval-register.md` (2026-10-28); a conclusão é documental, não aprovação de negócio.
- [ ] 2.2 Consolidar escolhas técnicas autorizadas e manter propostas separadas: Java 21/Spring Boot 4.1.2 condicional, Maven Wrapper, Spring Security, JPA, Bean Validation, Flyway, testes, Docker, GitHub Actions e RFC 9457 foram registrados. Sessão/protocolo, origens/topologia e ferramenta OpenAPI para CI continuam pendentes de aprovação; revalidar a compatibilidade operacional do Spring Boot 4.1.2 antes do I2.
- [ ] 2.3 Revisar o modelo: tecnologias e invariantes técnicas aprovadas foram separadas de entidades/campos candidatos. Como nenhuma decisão de domínio/PII da ONG foi recebida, os campos do mock foram explicitamente excluídos do modelo implementável; não há modelo final de domínio.
- [x] 2.4 Reconciliar o rascunho OpenAPI com operações públicas e administrativas separadas, sem security scheme presumido, com Problem Details baseado em RFC 9457, códigos de erro e validação segura; campos/estados, limites operacionais, upload, intake, contato e operações admin permanecem bloqueados quando dependem de aprovação. Redocly CLI 2.72.0 foi validada localmente como candidata versionada; aprovação para incorporá-la ao CI continua pendente.
- [x] 2.5 Associar cada ID de `docs/diagnostics/INTERACTION_INVENTORY.md` a requisito/capability, endpoint ou N/A, persistência, teste previsto e status/bloqueio em `docs/diagnostics/I1-INTERACTION-TRACEABILITY.md`; nenhum endpoint é declarado ativo.

## 3. Serviço backend mínimo — I2

- [ ] 3.1 Criar serviço Spring Boot separado em `backend/` com wrapper de build e versões aprovadas; verificar build reproduzível no CI.
- [ ] 3.2 Implementar configuração por ambiente e health check mínimo sem revelar configuração, endpoint de negócio ou segredo; verificar erro explícito quando configuração necessária está ausente.
- [ ] 3.3 Definir logging seguro e tratamento de erro genérico/estruturado; verificar resposta não inclui stack trace, SQL, configuração ou dado pessoal.

## 4. MySQL e migrations — I3

- [ ] 4.1 Aplicar a ferramenta selecionada Flyway, com credencial de migration separada da conta runtime; aprovação do tool não autoriza ainda schema ou migration sem decisões de domínio e aprovação do I3.
- [ ] 4.2 Implementar migrations versionadas para o modelo aprovado, com FK, constraints e índices justificados; verificar criação em MySQL 8 limpo e integridade referencial.
- [ ] 4.3 Adicionar testes de integração reprodutíveis de schema, constraints e compatibilidade; verificar banco em CI do zero e de uma versão anterior conhecida.
- [ ] 4.4 Documentar backup/restore ensaiado e estratégia de correção forward; verificar que DDL MySQL não depende de rollback transacional e operação destrutiva exige aprovação explícita.

## 5. Autenticação e autorização — I4

- [ ] 5.1 Implementar provisionamento controlado de primeira conta, gestão de conta conforme papel aprovado e hash adaptativo de senha; verificar ausência de autoinscrição/admin/credenciais padrão não aprovados.
- [ ] 5.2 Implementar login, sessão/token aprovado, expiração, revogação e logout; verificar credential anterior é negada após logout e não há segredo em URL, storage inseguro ou log.
- [ ] 5.3 Aplicar CSRF, cookie/session flags, CORS allowlist, headers e rate limit segundo arquitetura/origens aprovadas; verificar requests válidos e forjados.
- [ ] 5.4 Aplicar autorização server-side por operação e recurso a todo endpoint protegido, inclusive leitura e lista; verificar testes positivos, 401, 403 e tentativas IDOR.
- [ ] 5.5 Testar abuso, enumeração, autenticação inválida, expiração, revogação e proteção contra vazamento; verificar casos incluídos no CI e registrados na capability.

## 6. Operações administrativas de animais — I5

- [ ] 6.1 Implementar leitura administrativa de animais com proteção e consulta pública separada; verificar admin autorizado pode consultar registros não públicos e visitante não os recebe.
- [ ] 6.2 Implementar create/update com DTOs allowlist, validação server-side, consultas parametrizadas/ORM e concorrência definida; verificar dados aceitos persistem e inválidos não produzem gravação parcial.
- [ ] 6.3 Implementar status, publicação e archive/delete conforme decisão aprovada; verificar referências de solicitações e histórico são preservados conforme política.
- [ ] 6.4 Registrar alterações administrativas no escopo de auditoria aprovado, sem conteúdo PII desnecessário; verificar actor, ação, resultado e acesso restrito.
- [ ] 6.5 Implementar no painel estados de carregamento/vazio/erro, formulário/dialog acessível e feedback após confirmação do servidor; verificar edição/cancelamento/falha sem falso sucesso ou perda dos campos.

## 7. Imagens — I6

- [ ] 7.1 Integrar storage aprovado e metadados/ordenação da imagem; verificar persistência, associação ao animal, descarte/orphan handling e acesso configurado.
- [ ] 7.2 Validar conteúdo decodificado, formato allowlist, tamanho/dimensão, nomes gerados e metadata; verificar extensão/MIME spoofados, arquivo inválido e excedente não são publicados.
- [ ] 7.3 Implementar preview e substituição acessíveis, falhas recuperáveis e remoção conforme permissão; verificar teclado, foco e upload sem simulação Base64 como persistência.
- [ ] 7.4 Documentar custo, credenciais, retenção e limites operacionais sem expor segredos; verificar configuração segura em ambiente.

## 8. Catálogo e experiência pública — I7

- [ ] 8.1 Implementar listagem/detalhe somente de registros publicados e campos públicos aprovados; verificar estados/visibilidade não expõem drafts, PII ou dados administrativos.
- [ ] 8.2 Implementar busca/filtros/apresentação aprovados, allowlist de ordenação e limites/paginação quando aprovados; verificar combinação, vazio, entrada inválida e SQL injection.
- [ ] 8.3 Conectar home, catálogo e detalhe via serviço tipado sem fallback silencioso para mocks; verificar loading/erro/vazio/404 e reload refletem backend.
- [ ] 8.4 Corrigir alvos de ação aninhados, share/fallback, navegação direta/back, links de contato e conteúdo estático conforme aprovação; verificar cada ID de interação correspondente.
- [ ] 8.5 Implementar e verificar teclado, foco, semântica, imagem/gallery, metadata `pt-BR`, regra de indexação aprovada, breakpoints e zoom; preservar identidade visual e registrar testes objetivos de viewport.

## 9. Manifestação pública de adoção — I8

- [ ] 9.1 Aprovar/registrar os campos mínimos, finalidade/aviso, retention, duplicidade/idempotência, prazo/forma de resposta e limites antiabuso antes de aceitar dados reais.
- [ ] 9.2 Implementar POST transacional com validação server-side, animal publicado/elegível no momento da gravação, payload caps e rate limit; verificar indisponibilidade/concorrência não cria solicitação inconsistente.
- [ ] 9.3 Integrar formulário acessível com preservação de dados após falha, loading e confirmação somente após resposta persistida; verificar reload e retry não duplicam fora da regra aprovada.
- [ ] 9.4 Testar validação, abuso, CSRF conforme método, repetição, XSS, SQLi e redaction PII; verificar logs sem dados excedentes e resultados no CI.

## 10. Gestão administrativa de solicitações — I9

- [ ] 10.1 Implementar leitura administrativa paginada/filtrada apenas nos critérios aprovados, com autorização por papel/recurso; verificar visitante e usuário sem permissão não acessam PII.
- [ ] 10.2 Implementar transições aprovadas, controle de concorrência e trilha de estado; verificar transições válidas/inválidas, repetidas e conflitantes.
- [ ] 10.3 Integrar lista, filtros aprovados, estados vazios/loading/erro, detalhes e ações com resposta do servidor; verificar reload e contagens consistentes.
- [ ] 10.4 Testar escopo de acesso, campos sensíveis, auditoria, retention e logging; verificar suite API/UI e revisão AppSec registrada.

## 11. Contato — I10

- [ ] 11.1 Aprovar destino (persistência/encaminhamento), finalidade, retention, provider, limite, texto de confirmação e tratamento de falha; verificar ADR/contrato/spec alinhados.
- [ ] 11.2 Implementar validação, payload/rate limit e entrega real escolhida com logging redigido; verificar confirmação reflete recebimento/aceite definido e não promete entrega não comprovada.
- [ ] 11.3 Integrar loading/erro/retentativa acessíveis preservando campos; testar indisponibilidade, abuso, PII e operação de envio.

## 12. Integração, revisão AppSec e prontidão — I11

- [ ] 12.1 Executar jornadas públicas/admin ponta a ponta contra API e MySQL; verificar persistência, autorização, estados de erro, retry e reload.
- [ ] 12.2 Verificar WCAG 2.2 AA com axe/equivalente, teclado e leitor de tela; verificar achados críticos corrigidos ou exceção documentada com risco/aprovação.
- [ ] 12.3 Verificar viewport 320×568, 375×667, 390×844, 768×1024, 1024×768, 1440×900 e 1920×1080, zoom 200% e altura reduzida; registrar ausência de corte/overflow inesperado.
- [ ] 12.4 Executar revisão de segurança de auth, autorização/IDOR, SQLi, XSS, CSRF, rate limit, upload, PII/LGPD, logs, erros, headers, CORS, segredos e dependências; verificar nenhum P0 aberto.
- [ ] 12.5 Ensaiar deploy, secrets, migration, backup/restore, compatibilidade/rollback de aplicação, observabilidade e resposta a incidente; verificar evidências e aprovações antes de qualquer produção.
- [ ] 12.6 Marcar documentação histórica contraditória como supersedida com fonte/escopo e corrigir afirmações “pronto para produção” ou testes não reproduzidos; verificar preservação explícita do histórico.

## Workflow follow-up

- Não executar `/opsx-apply` ou iniciar implementação até aprovação deste plano pelo usuário e
  dos gates de negócio/arquitetura aplicáveis.
- Após autorização, implementar um incremento de cada vez, atualizar OpenSpec e provar seus
  critérios antes de avançar. Nenhuma sugestão nesta mudança é uma decisão aprovada.
