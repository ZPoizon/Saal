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

- [x] 2.1 Registrar ONG-01–ONG-11 sem inferir respostas. Respostas da responsável da ONG comunicadas pelo mantenedor foram registradas em `specs/decisions/I1-approval-register.md` em 2026-10-29: 9 decisões parciais e 2 pendentes (ONG-07, ONG-09). Nenhuma decisão foi declarada integralmente aprovada; o terceiro canal de contato não foi fixado porque a pergunta original não está no repositório.
- [ ] 2.2 Consolidar escolhas técnicas autorizadas e manter propostas separadas: Java 21/Spring Boot 4.1.2 condicional, Maven Wrapper, Spring Security, JPA, Bean Validation, Flyway, testes, Docker, GitHub Actions e RFC 9457 foram registrados. Sessão/protocolo, origens/topologia e ferramenta OpenAPI para CI continuam pendentes de aprovação; revalidar a compatibilidade operacional do Spring Boot 4.1.2 antes do I2. O escopo de negócio não inclui papéis diferenciados.
- [x] 2.3 Revisar o modelo: `specs/contracts/data-model.md` foi reconciliado com os estados `AVAILABLE`/`ADOPTED`, 1–3 fotos, campos de intake aprovados, um administrador e ausência de workflow/auditoria detalhada. Demais campos, visibilidade, retenção, storage e limites continuam pendentes; não há modelo final de domínio.
- [x] 2.4 Reconciliar o rascunho OpenAPI com o escopo aprovado: estados, 1–3 fotos, intake com nome/WhatsApp/cidade/e-mail, gestão somente leitura e ausência de transições. Security scheme, demais campos, limites, upload e contato condicional permanecem bloqueados. Redocly CLI 2.72.0 validou a estrutura com `security-defined`, `no-empty-servers` e `info-license` desativados por ausência intencional de scheme/servidor/licença; aprovação para CI continua pendente.
- [x] 2.5 Associar cada ID de `docs/diagnostics/INTERACTION_INVENTORY.md` a requisito/capability, endpoint ou N/A, persistência, teste previsto e status/bloqueio em `docs/diagnostics/I1-INTERACTION-TRACEABILITY.md`; nenhum endpoint é declarado ativo. Reconciliar a remoção do fluxo de status e o adiamento do contato.

## 3. Serviço backend mínimo — I2

- [ ] 3.1 Criar serviço Spring Boot separado em `backend/` com wrapper de build e versões aprovadas; verificar build reproduzível no CI.
- [ ] 3.2 Implementar configuração por ambiente e health check mínimo sem revelar configuração, endpoint de negócio ou segredo; verificar erro explícito quando configuração necessária está ausente.
- [ ] 3.3 Definir logging seguro e tratamento de erro genérico/estruturado; verificar resposta não inclui stack trace, SQL, configuração ou dado pessoal.

## 4. MySQL e migrations — I3

- [x] 4.1 Aplicar a ferramenta selecionada Flyway, com credencial de migration separada da conta runtime; aprovação do tool não autoriza ainda schema ou migration sem decisões de domínio e aprovação do I3. Flyway configurado com URL/usuário/senha próprios; a aplicação falha se usuário ou senha coincidirem. Teste MySQL 8.4 prova migration com conta restrita e conta runtime sem acesso ao schema de teste. A configuração local também cria usuários distintos e mantém root fora da aplicação.
- [ ] 4.2 Implementar migrations versionadas para o modelo aprovado, com FK, constraints e índices justificados; verificar criação em MySQL 8 limpo e integridade referencial. **Bloqueada:** não há modelo de negócio/schema aprovado. ONG-02/03/05/06/08/10 mantêm pendentes visibilidade/ciclo de vida, campos, PII/retenção, storage e logs; criar entidades ou constraints agora inferiria requisitos. Nenhuma migration de produto foi criada.
- [ ] 4.3 Adicionar testes de integração reprodutíveis de schema, constraints e compatibilidade; verificar banco em CI do zero e de uma versão anterior conhecida. Testcontainers executa MySQL 8.4 limpo, valida Flyway e demonstra upgrade sintético v1→v2 com preservação de dado sintético. **Parcial/bloqueada:** testes de constraints/FK do schema de produto dependem da aprovação 4.2; não foram substituídos por constraints inventadas.
- [x] 4.4 Documentar backup/restore ensaiado e estratégia de correção forward; verificar que DDL MySQL não depende de rollback transacional e operação destrutiva exige aprovação explícita. `backend/docs/mysql-backup-restore.md` documenta o procedimento e limites. Teste MySQL 8.4 executa mysqldump de tabela sintética e restaura em schema isolado; a documentação registra forward-fix, ausência de rollback transacional presumido e aprovação explícita para operações destrutivas. Política operacional de produção (retenção, agenda, criptografia/RPO e hosting) permanece pendente.

## 5. Autenticação e autorização — I4

- [ ] 5.1 Implementar provisionamento controlado da única conta administrativa e hash adaptativo de senha; verificar ausência de autoinscrição, papéis diferenciados e admin/credenciais padrão não aprovados. Identidade, revogação e recuperação continuam pendentes (ONG-01).
- [ ] 5.2 Implementar login, sessão/token aprovado, expiração, revogação e logout; verificar credential anterior é negada após logout e não há segredo em URL, storage inseguro ou log.
- [ ] 5.3 Aplicar CSRF, cookie/session flags, CORS allowlist, headers e rate limit segundo arquitetura/origens aprovadas; verificar requests válidos e forjados.
- [ ] 5.4 Aplicar autorização server-side por operação a todo endpoint protegido, inclusive leitura e lista, mesmo com um único administrador; verificar testes positivos, 401, 403 e tentativas IDOR. Não há matriz de papéis a implementar.
- [ ] 5.5 Testar abuso, enumeração, autenticação inválida, expiração, revogação e proteção contra vazamento; verificar casos incluídos no CI e registrados na capability.

## 6. Operações administrativas de animais — I5

- [ ] 6.1 Implementar leitura administrativa de animais com proteção e consulta pública separada; verificar admin autorizado pode consultar registros não públicos e visitante não os recebe.
- [ ] 6.2 Implementar create/update com DTOs allowlist, validação server-side, consultas parametrizadas/ORM e concorrência definida; verificar dados aceitos persistem e inválidos não produzem gravação parcial.
- [ ] 6.3 Implementar somente os estados `AVAILABLE`/`ADOPTED` e a quantidade de 1–3 fotos; não implementar `TREATMENT`, publicação/rascunho, exclusão ou arquivamento no primeiro incremento. Verificar que animais adotados permanecem cadastrados e que referências não são removidas.
- [ ] 6.4 Implementar logs mínimos de segurança no escopo aprovado, sem histórico administrativo detalhado nem PII desnecessária; verificar actor, ação, resultado e acesso restrito. Escopo/retenção pendentes (ONG-08).
- [ ] 6.5 Implementar no painel estados de carregamento/vazio/erro, formulário/dialog acessível e feedback após confirmação do servidor; verificar edição/cancelamento/falha sem falso sucesso ou perda dos campos.

## 7. Imagens — I6

- [ ] 7.1 Integrar storage aprovado e metadados/ordenação da imagem, respeitando 1–3 fotos por animal; verificar persistência, associação ao animal, descarte/orphan handling e acesso configurado. Storage e formatos continuam pendentes (ONG-06).
- [ ] 7.2 Validar conteúdo decodificado, formato allowlist, tamanho/dimensão, nomes gerados e metadata; verificar extensão/MIME spoofados, arquivo inválido e excedente não são publicados.
- [ ] 7.3 Implementar preview e substituição acessíveis, falhas recuperáveis e remoção de foto conforme autorização administrativa, mantendo 1–3 fotos; verificar teclado, foco e upload sem simulação Base64 como persistência.
- [ ] 7.4 Documentar custo, credenciais, retenção e limites operacionais sem expor segredos; verificar configuração segura em ambiente.

## 8. Catálogo e experiência pública — I7

- [ ] 8.1 Implementar listagem somente de animais `AVAILABLE` e detalhe com estado/fotos aprovados; verificar que `ADOPTED` não é oferecido para adoção, que a visibilidade pública de adotados segue ONG-02 e que PII/dados administrativos não são expostos.
- [ ] 8.2 Implementar busca/filtros/apresentação aprovados, allowlist de ordenação e limites/paginação quando aprovados; verificar combinação, vazio, entrada inválida e SQL injection.
- [ ] 8.3 Conectar home, catálogo e detalhe via serviço tipado sem fallback silencioso para mocks; verificar loading/erro/vazio/404 e reload refletem backend.
- [ ] 8.4 Corrigir alvos de ação aninhados, share/fallback, navegação direta/back, links de contato e conteúdo estático conforme aprovação; priorizar WhatsApp e telefone, não fixar o terceiro canal e verificar cada ID de interação correspondente.
- [ ] 8.5 Implementar e verificar teclado, foco, semântica, imagem/gallery, metadata `pt-BR`, regra de indexação aprovada, breakpoints e zoom; preservar identidade visual e registrar testes objetivos de viewport.

## 9. Manifestação pública de adoção — I8

- [ ] 9.1 Registrar campos aprovados (nome, WhatsApp, cidade, e-mail e referência ao animal) e fechar finalidade/aviso, retenção, duplicidade/idempotência, prazo/forma de resposta e limites antiabuso antes de aceitar dados reais. O campo de mensagem não foi aprovado.
- [ ] 9.2 Implementar POST transacional com validação server-side, animal `AVAILABLE` no momento da gravação, payload caps e rate limit; verificar indisponibilidade/concorrência não cria manifestação inconsistente e que `ADOPTED` é rejeitado.
- [ ] 9.3 Integrar formulário acessível com os campos aprovados, preservação de dados após falha, loading e confirmação somente após resposta persistida, sem afirmar aprovação da adoção; verificar reload e retry não duplicam fora da regra aprovada.
- [ ] 9.4 Testar validação, abuso, CSRF conforme método, repetição, XSS, SQLi e redaction PII; verificar logs sem dados excedentes e resultados no CI.

## 10. Gestão administrativa de solicitações — I9

- [ ] 10.1 Implementar leitura administrativa somente leitura e paginada/filtrada apenas nos critérios aprovados, com autorização server-side; verificar visitante e identidade sem autorização não acessam PII.
- [ ] 10.2 Não implementar transições, aprovação, recusa ou workflow de status; verificar que nenhum endpoint ou ação administrativa altera o estado da manifestação.
- [ ] 10.3 Integrar lista, filtros aprovados, estados vazios/loading/erro e detalhes em modo somente leitura; verificar reload e contagens consistentes.
- [ ] 10.4 Testar escopo de acesso, campos sensíveis, retenção e logs mínimos de segurança; verificar suite API/UI e revisão AppSec registrada. Não há histórico administrativo detalhado.

## 11. Contato — I10

- [ ] 11.1 **Adiado/fora do primeiro incremento.** Aprovar destino (persistência/encaminhamento), finalidade, retenção, provider, limite, texto de confirmação e tratamento de falha antes de implementar; verificar ADR/contrato/spec alinhados. Os canais WhatsApp e telefone permanecem como links.
- [ ] 11.2 **Adiado/fora do primeiro incremento.** Implementar validação, payload/rate limit e entrega real escolhida com logging redigido; verificar confirmação reflete recebimento/aceite definido e não promete entrega não comprovada.
- [ ] 11.3 **Adiado/fora do primeiro incremento.** Integrar loading/erro/retentativa acessíveis preservando campos; testar indisponibilidade, abuso, PII e operação de envio.

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
