# Revisão arquitetural e decisões para a change `saal-functional-readiness`

**Status:** recomendação de revisão; ainda não aprovada como política operacional pela ONG.
**Escopo:** corrigir ordem técnica, dependências e lacunas de especificação antes de
qualquer `/opsx-apply`. Nenhum backend, banco, fluxo de negócio ou dependência foi criado.

**Atualização I1 (28/10/2026):** este review antecede a autorização técnica atual. Java 21
LTS, Spring Boot 4.1.2 condicionado, Maven Wrapper, Flyway, Spring Security, JPA, Bean
Validation, testes JUnit/Spring/Testcontainers, Docker, GitHub Actions e RFC 9457 foram
escolhidos pela equipe; Cloudflare Pages é a preferência de frontend e Render/Aiven são
opções apenas para teste/demonstração. Sessão server-side permanece preferência condicionada
à topologia. Consulte o `I1-approval-register.md` para o status vigente; as recomendações e
estados de aprovação abaixo são o registro histórico anterior e não substituem o registro
atual.

## Conclusão executiva

A direção arquitetural aprovada nos ADRs é coerente e deve ser preservada:

```text
React 18 + TypeScript + Vite
          │ HTTPS / REST / JSON
          ▼
API Java + Spring Boot (serviço separado)
          │ JDBC/JPA, regras server-side
          ▼
MySQL 8 (acesso exclusivo pelo backend)
```

Flyway e sessões server-side são recomendações técnicas para a próxima decisão, não decisões
já aprovadas. A documentação apenas aprova Spring Boot, REST/JSON e MySQL 8 como arquitetura
futura. A versão Java/Spring, Maven/Gradle, mecanismo de autenticação, framework/configuração
de autorização, migration tool, storage, hosting e políticas da ONG permanecem pendentes.

A change original tem lacunas em cobertura da experiência compartilhada, escopo de
autorizações/auditoria, contrato OpenAPI, limites do intake e ordenação: o CRUD administrativo
está misturado à primeira entrega pública de catálogo; os contratos só seriam ajustados depois
de banco e backend; e “rollback de migrations” é uma promessa insegura para DDL MySQL.
O plano revisado sequencia CI → decisões/contratos e modelo → backend mínimo → schema MySQL
com Flyway a aprovar → identidade → operações de animais/admin → fotos → catálogo público →
intake → gestão de adoção → contato → integração/auditoria operacional.

## Decisões já aprovadas pela documentação

| Decisão | Evidência | Efeito |
|---|---|---|
| React 18 + TypeScript + Vite permanece o frontend, com evolução incremental e identidade visual preservada | `specs/decisions/ADR-001-react-typescript-vite.md` | Não migrar ou reescrever a SPA nesta change. |
| Backend REST JSON em serviço Java/Spring Boot separado | `ADR-002-spring-boot.md`, `specs/architecture/backend.md` | Navegador consome API; regras e validações autoritativas no servidor. |
| MySQL 8 relacional acessado exclusivamente pelo backend | `ADR-003-mysql.md`, `specs/architecture/database.md` | Sem acesso SQL do browser; integrar Spring e DB por repositório, constraints e migrations aprovadas. |
| OpenSpec/SDD é processo vigente; estado real deve ser distinguido de protótipo | `specs/README.md`, features, `openspec/config.yaml` | Change segue schema `spec-driven`; atualizar capabilities/contratos antes da implementação pertinente. |
| O sistema presente é protótipo: sem persistência, backend ou sessão real | Código inspecionado e specs de features | Nenhum endpoint ou resultado visual equivale a uma operação persistida. |

O documento `specs/contracts/openapi.yaml` define apenas um contrato candidato e não altera
essas decisões. Seu `bearerAuth` JWT e `AuthResult.accessToken` são placeholders incompatíveis
com a decisão ainda pendente de sessão vs token; devem ser substituídos após ADR, não
interpretados como autorização para implementar JWT.

## Avaliação da arquitetura preferencial

| Elemento | Avaliação técnica | Estado/recomendação |
|---|---|---|
| SPA atual React/TypeScript/Vite | Adequada e formalmente aceita; serviços tipados devem isolar REST da UI. A UI não pode autorizar operações. | **Aprovado documentalmente.** |
| Java + Spring Boot REST | Adequado para monólito modular de uma ONG; evita microserviços/custo operacional. Framework de segurança e versões não estão definidos. | **Aprovado como alvo**, não implementado. |
| MySQL 8 | Compatível com relações e transações para animais/solicitações/administradores; retenção, backup e escala operacional ainda dependem do ambiente. | **Aprovado como alvo**, não implementado. |
| REST/JSON/OpenAPI | Adequado; o contrato existente precisa deixar público/admin explícito, distinguir estados e validações, incluir logout/session, forbidden/conflict/ratelimit e fronteira de upload. | REST está **aprovado**; detalhes do contrato pendentes. |
| Flyway | Boa opção para migrations SQL versionadas junto ao Spring Boot e MySQL. Mais simples que introduzir duas representações concorrentes de schema para este domínio; requer execução ordenada e conta DB de migração separada. Flyway não converte mudanças destrutivas em reversíveis. | **Recomendação**, não aprovada. Escolher em ADR antes do schema. |
| Sessão server-side | Adequada a painel web same-site pequeno: revogação efetiva no logout, sem access token persistente em JS. Exige cookie seguro, CSRF, escopo SameSite e armazenamento de sessão que corresponda a topologia e réplica do deploy. | **Recomendação**, não aprovada; depende de origem/domínio e hosting. |
| Autorização server-side | Obrigatória em toda operação e objeto; guard de rota frontend é apenas UX. Papéis devem refletir equipe efetiva, não serem inventados a partir da tela atual. | **Requisito de segurança aprovado nas políticas**; papéis e atores pendentes. |
| Intake público | É core e já existe como jornada visual; ainda não há POST, destino ou garantia de resposta. Deve persistir somente após validar elegibilidade/transação e ter controles antiabuso e política LGPD. | Requisito da change; **regras de operação pendentes**. |
| Testes + CI | Essenciais, mas inexistentes no produto; workflow atual só prepara OpenSpec/Copilot. Definir lint/testes/frontend e Maven/Gradle/backend, Testcontainers ou ambiente DB confiável e secret/dependency scanning. | Meta de engenharia; ferramentas, checks obrigatórios e proteção de branch exigem configuração. |

### Flyway: recomendação e limites operacionais

Opções analisadas:

1. **Flyway (recomendado):** migrations SQL incrementais, checksum/histórico, integração
   Spring Boot e execução repetível em ambientes controlados; exige acordo sobre owner,
   versionamento, baseline, conta dedicada de migration, rollout concorrente e testes.
2. **Liquibase:** changelogs estruturados e mais recursos de diff/contexts; é opção viável,
   mas introduz formato/abstração maior sem necessidade observada que justifique no SAAL.
3. **SQL manual sem ferramenta:** rejeitado como operação de longo prazo; reduz custo inicial
   mas perde trilha repetível entre dev, CI, staging e produção.

Recomendação de operação: aprovação humana do ADR; migrations versionadas e revisadas; CI
valida do zero e de versão anterior; deployment executa migration em etapa controlada com
privilégio próprio; aplicação recebe apenas permissões de runtime necessárias; backups e
restore são ensaiados. Para MySQL, várias operações DDL causam commits implícitos e não
podem ser assumidas como rollback transacional. Corrigir migration publicada com nova
migration forward; rollback de aplicação deve preservar schema compatível. Mudança destrutiva
depende de backup/restore testado e aprovação explícita.

## Matriz de decisões pendentes

As opções e recomendações abaixo não substituem decisão do responsável da ONG. Decisões que
definem finalidade, permissões, fluxo ou tratamento de dados exigem **aprovação humana**;
opções de ferramenta exigem aprovação arquitetural/equipe e justificação, não são produto
ou requisito legal.

| Decisão e estado documental | Opções plausíveis | Recomendação técnica (não aprovada) | Consequências/impacto de decidir | Aprovação humana? |
|---|---|---|---|---|
| **Quem acessa `/admin`?** Perfil/ciclo de cadastro pendentes em `specs/features/admin-authentication.md`. | Uma conta compartilhada; contas nominais para responsáveis; contas nominais com papéis; cadastro público/autoinscrição. | Contas individuais provisionadas por responsável autorizado, sem autoinscrição; começar com menor conjunto de papéis justificável, evitar credencial compartilhada e permitir revogar conta individual. | Define bootstrap, recuperação, trilha de autoria, acesso a PII, modelagem `Administrator`, endpoints e operação de suporte. | **Sim — a ONG define titulares e responsáveis.** |
| **Quais papéis e operações administrativas?** | Um papel “admin” com acesso total; papéis separados (cadastro de animais, solicitações, gestão de contas); matriz de permissões. | No primeiro release, acesso nominal e menor privilégio; só separar papéis se pessoas/tarefas reais justificarem; nenhuma concessão via UI. | Pode exigir autorização por operação e recurso, testes matriciais e UX de 403. “Quem atualiza/exclui” é definido aqui, inclusive gestão de outras contas. | **Sim — a ONG aprova membros e operações.** |
| **Quais status/publicação de animal?** O enum atual no código/modelo é available/treatment/adopted; publicação/remoção está pendente. | Apenas os três atuais; acrescentar draft/archived/inactive; status de vida separado de publicação; exclusão física. | Distinguir condição de adoção (`AVAILABLE`, `TREATMENT`, `ADOPTED`) de visibilidade/arquivamento operacional; manter semântica/status legado até migração aprovada; ocultar draft/arquivado do público por padrão. | Altera filtro público, página de detalhe, CTA de interesse, dashboard, relações com solicitações, exclusão e schema. | **Sim — estado público e significado são regras da ONG.** |
| **Ciclo de solicitação de adoção?** Código protótipo usa pending/accepted/rejected; processo divulgado inclui contato, entrevista/visita e adoção. | Três estados; estados intermediários contactado/em análise; retirada por candidato; aprovado distinto de adoção concluída; histórico. | Manter estados com significados inequívocos e transições explícitas; não equiparar `accepted` a adoção concluída; representar contato/revisão/conclusão apenas se equipe comprovar etapas. Incluir retirada/cancelamento se a ONG prevê isso. | Determina endpoints, validações transacionais, histórico, alertas, indicadores e critérios de lista/retention. | **Sim — processo cabe à ONG, com privacidade revisada.** |
| **Quais dados pessoais e finalidade?** Form atual contém nome, e-mail, telefone, mensagem opcional, animal e timestamp; notificação/destino é pendente. | Manter campos atuais; nome + um canal escolhido; adicionar moradia/endereço/documentos; mensagem livre; coletar consentimento ou registrar outra base. | Coletar o mínimo: nome, canal de retorno aprovado e animal; obter somente os canais necessários (não obrigar e-mail e telefone sem justificativa); mensagem opcional com limite. Não adicionar endereço/CPF/renda/dados familiares sem finalidade aprovada. Exibir aviso claro e definir base legal/retention com responsável de privacidade. Não presumir que checkbox de consentimento seja sempre a base apropriada. | Impacta OpenAPI, telas, base legal, retenção, resposta a titular, notificações, logs e restrição de acesso. | **Sim — finalidade/base legal exige responsável da ONG e revisão de privacidade/jurídica.** |
| **Como são guardados dados e solicitantes?** Retenção, anonimização/exclusão não definidos. | Excluir após adoção/recusa; prazo por status; anonimizar após período; guardar tudo indefinidamente. | Definir retenção por propósito/status e processo de solicitação de titulares; minimizar dados e restringir leitura/exportação. Nunca indefinido por default. | Migrations de archive/anonymization, backup lifecycle, legal holds e rotina de limpeza. Backup não deve reter sem limite os dados eliminados em sistema ativo. | **Sim — política/impacto LGPD.** |
| **Onde ficam imagens?** `AnimalImage` existe conceitualmente; provider e limite pendentes. | BLOB MySQL; filesystem local; object storage privado com CDN/read URL; URL externa livre. | Object storage separado do MySQL com metadados/ordem no DB; bucket privado e leitura pública derivada apenas para fotos publicadas; nomes opacos; formato raster allowlisted e decodificado/reescrito quando possível; stripping de EXIF; tamanhos definidos. Não aceitar URL arbitrária como upload/integração implícita. | Introduz custo/provedor, credenciais backend, CORS upload se direto, tratamento de órfãs, backup, autorização, cache e lifecycle. | **Sim — provider, custos, formatos/retention aprovados pela ONG; arquitetura ADR.** |
| **Quem edita/remove animais e solicitações?** CRUD no mock não tem autoria nem role. | Qualquer admin; dono do registro; papel separado; exclusão física/arquivo. | Servidor verifica capability para cada GET/POST/PUT/DELETE e recurso; guarda autor, timestamps e versão; ação destrutiva exige confirmação e regra de archive; sem privilégio derivado da UI. | Matriz de testes 401/403/IDOR, auditoria, concorrência e workflow de correção. | **Sim — autorizações e riscos operacionais são da ONG.** |
| **Quais alterações precisam trilha?** Specs pedem auditoria de backend, não definem eventos, acesso ou retenção. | Só logs técnicos; eventos de login e mutações; cada leitura PII; exportação/download; histórico completo. | Audit events de autenticação/negativas relevantes, CRUD e transições administrativas, e visualização/exportação de PII se operacionalmente necessárias. Guardar actor, recurso, timestamp, ação e resultado minimizados; separar auditoria de logs, restringir acesso e evitar payload/PII/secrets. Aprovar retenção e acesso. | Schema/serviço de auditoria, monitoramento, volume e gestão de incidentes; LGPD não autoriza logging indiscriminado. | **Sim — escopo/acesso/retention; técnico definido no ADR.** |
| **Como mitigar spam e força bruta?** Nenhum limite ou volume foi aprovado. | Rate limit por IP/conta; honeypot; CAPTCHA adaptativo; confirmação e-mail; WAF/provedor; limite de conteúdo. | Server-side rate limiting com quotas conservadoras inicialmente configuráveis, limites de payload, anti-automação de baixo atrito e monitoramento; considerar CAPTCHA por risco/abuso observado e rate distribuído se houver múltiplas réplicas. Não usar apenas disabled button, client validation ou IP isolado como controle. Login recebe política distinta; POST público deve ter idempotência/retry coerentes. | Redis/WAF/CAPTCHA podem adicionar custos/cookies/PII e impacto de acessibilidade; proxy confiável é necessário para extrair IP; configurar respostas e falsos positivos. | **Sim — política de acesso humano, limites e UX antiabuso; valores serão operacionais.** |
| **Mecanismo de sessão?** ADR 002 marca JWT ou cookie como pendente; OpenAPI provisoriamente prescreve bearer. | Sessão server-side em cookie; access/refresh tokens; IdP externo. | Sessão server-side same-site revogável, cookie `Secure`/`HttpOnly`/`SameSite` adequado, expiração/idle timeout e regeneração pós-login; endpoint logout invalidante; CSRF token/Origin validation. Não guardar access token em `localStorage`. Avaliar topologia multiinstância: store compartilhado ou sessão sticky documentada, evitando sessão in-memory efêmera em deploy com várias réplicas. | OpenAPI muda: `securitySchemes`, login/logout/session, cookies/CSRF. Cross-site deployment exige decisão diferente e revisão de cookies/CORS. | **Sim — aprovação de segurança/arquitetura e ambiente de deploy.** |
| **Tecnologia de migrations?** Banco ADR exige migrations, tool pendente. | Flyway, Liquibase, SQL manual. | Flyway SQL, conforme avaliação acima. | Dependência backend, convívio schema/runtime, owner e privilégios de migration; DDL MySQL forward-only. | **Aprovação arquitetural humana; não de negócio.** |
| **Versionamento Java/build/test?** Java/Spring version, Maven/Gradle em ADR; repositório pnpm não inclui backend. | Java LTS suportado; Maven ou Gradle wrapper; backend como projeto sibling `/backend`, no workspace pnpm ou fora dele. | Java LTS suportada pela versão Spring escolhida; começar backend separado em diretório próprio na raiz (`backend/`), wrapper Maven ou Gradle versionado; não forçar gestão Java para workspace pnpm. Eleger ferramenta após build/reprodutibilidade em CI. | CI independente, manutenção JDK, plugins, dependências, test reports e execução de DB de teste. | **Aprovação de engenharia e manutenção.** |
| **Formato de idade e limites de texto?** Idade hoje string livre; comprimentos indefinidos. | String livre com limite; campos numéricos; data/idade aproximada; dados estruturados de anos/meses. | Representação que equipe consegue atualizar corretamente; se idade aproximada, persistir unidade/faixa com rótulo calculado, não data de nascimento inferida. Limites pragmáticos por payload/domínio definidos antes de API e banco. | Altera DTOs, validação, formulário/consulta e migração de dados. | **Sim — significado exibido nos perfis é dado da ONG.** |
| **Métricas, localização, doação e voluntariado?** Estatísticas hardcoded; “ajudar” cards não têm ações. | Manter como conteúdo editorial rotulado; inserir fonte/destino; ocultar até validação; adicionar outros fluxos. | Auditar e rotular números como conteúdo editorial com responsável e data, ou omitir até fonte; manter cards informativos sem affordance, ou inserir link só para destino confirmado. Não abrir doações/voluntariado/blog como escopo desta change. | Precisão pública, links/canais e expansão de produto. | **Sim — fatos e serviços ofertados devem ser aprovados pela ONG.** |
| **SEO/host/ambientes?** Figma build marca `noindex`, lang English; hostname `0.0.0.0`; deploy inexistente. | SPA estática com indexação; domínio/proxy; prerender; manter `noindex` até domínio público. | Configurar `lang=pt-BR`, title/meta da marca e a política `noindex` por ambiente explicitamente; corrigir antes do deploy aprovado. Não trocar SSR/stack sem requisito. Endurecer host de dev/preview e deploy HTTPS. | SEO, rotas deep link/fallback, cache, CSP e configuração ambiente. | **Sim para domínio, indexação e conteúdo institucional; técnico para deploy.** |

## Inconsistências corrigidas no planejamento

1. **Contrato OpenAPI e capabilities:** nenhum `openspec/specs/` existia; as six capabilities
   são novas. Agora a experiência pública/compartilhada (menus, card, contatos externos, home,
   404, teclado, responsividade e metadata) tem spec própria, em vez de ficar sem owner.
2. **Contrato antes de backend/DB:** contrato e modelo são pré-requisitos próprios depois do
   CI e da aprovação das decisões de negócio; escolhas de ferramenta/banco não definem fluxo
   de negócio implicitamente.
3. **CRUD admin precede catálogo público:** operações administrativas autenticadas agora
   criam a única fonte persistida antes que a UI pública consuma essa fonte.
4. **Flyway e reversibilidade:** Flyway é recomendação explícita e pendente de ADR.
   Removida a promessa de rollback automático; migrations aceitas são versionadas,
   forward-fix, compatíveis entre versões, com backup/restore testado e aprovação para
   operações destrutivas.
5. **Session vs JWT:** requisito não presume cookie; o OpenAPI atual é reconhecido como
   placeholder e o primeiro gate inclui substituí-lo depois da aprovação.
6. **Status e visibilidade:** os três statuses do protótipo são vocabulário observado, não
   lifecycle aprovado; público e admin precisam de regras de visibilidade separadas e leitura
   admin explicitamente protegida.
7. **Escopo de operações/admin:** inclusão de query/listagem administrativa protegida,
   bloqueio de autoinscrição até approval, auditoria por evento/actor a decidir, história de
   edição/conflitos e leitura de PII.
8. **Security acceptance:** SQL parametrizado/ORM e ordenação allowlist, XSS/context/URL e
   CSP, CSRF conforme cookie, cookies/sessões, rate limiting, validação e tamanhos de entrada,
   PII/log redaction, uploads decodificados/isolados, CORS, erros sem stack/SQL, segredos,
   testes de abuso/authZ e revisão de segurança são critérios explicitos por incrementos,
   não apenas uma checklist de final do projeto.
9. **Prioridade de incremento:** primeira etapa é pipeline mínimo que torna futuros artefatos
   e builds verificáveis; depois contrato/dados aprovados, servidor, DB, auth, operações
   administrativas, produto público e prova de sistema. Nenhuma execução de
   `/opsx-apply` ou funcionalidade ocorre nesta revisão.

## Cobertura de elementos do inventário

`INTERACTION_INVENTORY.md` permanece como fonte enumerada por controle; a tabela abaixo
confirma seu destino de especificação ou registra conscientemente o escopo que não será
inventado nesta change.

| IDs do inventário | Coverage no OpenSpec revisado | Disposição/decisão aberta |
|---|---|---|
| NAV-01–03 | `public-experience` | Rotas, logo, menu/teclado, estado ativo e mobilidade. |
| NAV-04 | `public-experience`, `admin-authentication` | Navegação acessível; autorização efetiva independe do link. |
| NAV-05–06 | `public-experience` | Destinos externos e WhatsApp serão verificados manualmente, não persistência API. |
| HOME-01–03 | `public-experience`, `public-animal-catalog` | CTA/navegação, conteúdo e cards apontam para catálogo real. |
| HOME-04 | `public-experience` | Estatísticas só com fonte/data confirmadas pela ONG; senão rotular/remover. |
| HOME-05 | `public-experience` | Cards de ajuda sem botão fantasma; destino exige decisão da ONG. |
| CAT-01–04, CAT-06, CAT-09 | `public-animal-catalog` | Busca, filtros aprovados, vazio, detalhe, estado e CTA por disponibilidade. |
| CAT-03 (status, ordenação, paginação) | `public-animal-catalog` | Status no filtro, ordenação e paginação não presumidos; decisão de produto/volume. |
| CAT-05 | `public-experience` | Um destino interativo sem link/botão aninhado. |
| CAT-07–08 | `public-animal-catalog` | Acesso por teclado/estado de galeria; compartilhar e fallback/erro tratados. |
| INT-01–04 | `adoption-requests`, `public-animal-catalog`, `public-experience` | Existência/disponibilidade server-side, campos PII, persistência/error/success e navegação. |
| CONTACT-01 | `public-experience`, `contact-messages` | Destinos e horário/mensagem factual verificados pela ONG. |
| CONTACT-02–03 | `contact-messages` | Intake real e confirmação apenas após aceite; persistência/entrega depende de decisão. |
| ADMIN-01–03 | `admin-authentication` | login/logout/sessão/rota; atores e papel final dependem de aprovação. |
| ADMIN-04–06, 09–10 | `animal-management` | dashboard derivado do server, create/edit, errors/concurrency e delete/archive aprovado. |
| ADMIN-07 | `animal-management` | Upload é incremento próprio e espera decisão de storage/política. |
| ADMIN-08, ADMIN-11 | `animal-management`, `public-experience` | Modal, tabela, teclado, foco e viewport verificáveis. |
| ADMIN-12–14 | `adoption-management` | Lista e acesso a PII, estado e lifecycle; filtros, contato, export precisam decisão de escopo. |
| NF-01 | `public-experience` | Rota 404, recuperação, foco e deep-link. |
| Componentes UI sem import no app | Não são superfície funcional ativa; sem spec individual | Scaffolding não usado não vira requisito ou autorização para remodelar todo componente. |

## Sequência proposta de incrementos e aceite

Cada etapa é deliberadamente pequena. Somente I0 está detalhada para início seguro; outros
gates são divididos nas tarefas OpenSpec sem compromisso de implementar business decisions
sem aprovação.

| Incremento | Propósito / dependências | Critérios verificáveis de saída |
|---|---|---|
| **I0 — Qualidade/CI mínimo** | Sem dependência; em revisão documental selecionar testes/lint/scan com justificativa, depois reproduzir na máquina CI com Node/pnpm existentes. Não cria endpoint nem define regra de adoção. | Build reproduzível via `pnpm install --frozen-lockfile`; CI de PR emite relatórios legíveis de typecheck, teste (runner escolhido), lint (escolhido), build, auditoria de dependências e secret scan; `oxfmt --check` valida sem modificar arquivos; cada job tem permissões mínimas. PR intencionalmente falho demonstra gate; não afirmar merge-blocking sem proteção de branch efetivamente ligada e verificada no GitHub. Test fixture não usa dados pessoais reais. |
| **I1 — ADRs e contrato/modelo v1** | I0 verde. ONG aprova decisões de atores, estados, PII, storage e transições antes que o contrato torne regras definitivas. | ADRs registram autor/aprovador, opções descartadas, decisão e consequências; modelo não contém campo sem finalidade; OpenAPI lint/validation confirma sessão/logout alinhados, público/admin separados, códigos 400/401/403/404/409/429/5xx, limites de input/página, erros genéricos, request de upload separado, campos públicos e compatibilidade de cliente; nenhum `PENDENTE` crítico para o incremento que iniciar. |
| **I2 — Backend vazio/configuração** | I1; Java/Spring e build tooling aprovados. | Serviço `backend/` separado compila via wrapper fixado, health não vaza config, perfil local/test aceita valores não secretos, startup falha explicitamente sem datasource necessário e nenhum pseudo-endpoint de negócio/mocks. CI constrói projeto sem incluir credenciais. |
| **I3 — MySQL/Flyway/migrations** | I2; schema e tool aprovados. Recomendação Flyway SQL versionado. | CI sobe banco de teste MySQL compatível e migration limpa. Teste update desde baseline conhecida, constraints/FKs e restore do backup aprovados; tabela/owner de schema e least privilege verificadas. Não é exigido rollback SQL de DDL; migration publicada corrige-se forward. |
| **I4 — Auth/session e autorização base** | I3; ADR de sessão/atores aprovado e origem/ambiente definido. | Testes de login genérico, sessão regenerada/expirada/revogada, logout inválida cookie, CSRF aprovado, cookie atributos, CORS allowlist, rate limit, primeira conta provisionada externamente, ausência de self-signup; todos endpoints admin retornam 401/403 sem vazamento e verificam permission server-side. |
| **I5 — Operação administrativa Animal** | I4; status, visibilidade e política de archive/delete aprovados. O público não depende ainda do novo endpoint. | GET admin distingue all records de public list e exige permissão; CRUD validado por recurso/versão/autor, SQL/JPA parametrizado, texto validado/escapado; delete/archive impede perda de referências; consulta e mutações negativas/positivas são auditadas no escopo aprovado; integração e reload comprovam MySQL. |
| **I6 — Imagem segura** | I5; storage, formatos, limites, acesso a bucket e retenção aprovados. | Conteúdo decodificado/validado contra allowlist, limites antes/durante de upload, nomes aleatórios, sem SVG por default, stripping de metadata definido, armazenamento isolado e URL pública somente de imagem publicada; testes de spoof/MIME inválido/oversize/falha/revogação e orphan cleanup. |
| **I7 — Catálogo/detalhe público** | I5/I6 e semântica de public visibility aprovada. | `GET` apresenta somente campos e registros publicados/permitidos; busca/filter combinados com allowlist, limite/ordenação/página bounded; card tem interação semântica; loading/empty/404/erro e image/share falhas; integração após reload mostra CRUD persistido; nenhuma fallback silenciosa a mocks. |
| **I8 — Manifestação pública** | I3–I4/I7; campos, purpose/notice, retention e anti-abuso aprovados. | POST valida no servidor; transação rejeita animal indisponível e repetição conforme regra; quotas/payload caps/rate; sem mensagem de sucesso antes de commit; falha mantém dados; testes de payload invalid, spam, CSRF applicable, replay/retry, SQL injection e armazenamento sem PII além do aprovado. |
| **I9 — Gestão de solicitações** | I4/I8; transições finais e papeis aprovados. | `GET/PATCH` exige autorização por papel e recurso, protege campos e logs de PII; transições válidas/invalidas auditadas conforme retention; conflito/retry mantém consistência; filtros/page só aprovados e testados. |
| **I10 — Contato** | I0–I4; destino de entrega, retention e erros de provider aprovados. | Mensagem é aceita/entregue de acordo com contrato; formulário não mostra sucesso de entrega por mero enqueue salvo wording explícito; validação, rate/payload caps, logs redigidos, timeout/retry testados. |
| **I11 — Testes integrados/AppSec/UX/deploy readiness** | Increments aplicáveis concluídos; environment escolhido. | Browser journeys públicos/admin MySQL integration pass; security reviewer conclui checklist sem P0; testes de OWASP controle (authZ/IDOR/CSRF/SQLi/XSS/uploads/rate/secrets/PII/errors), WCAG 2.2 AA/teclado/leitor, matriz de viewport e metadata/lang, backup/restore e deployment runbook evidenciados; nenhum P0 nem decisão crítica pendente. Não equivale a autorização automática para produção. |

## Controles de segurança e testes que devem acompanhar os incrementos

- **SQL injection / mass assignment:** JPA com parâmetros/criteria; dynamic sort/filter via
  allowlist; DTO input explicitamente permitido; testes de payload e enum/length bounds.
- **XSS/links/conteúdo:** não usar HTML raw; React escaping contextual; sanitizar se conteúdo
  rico for aprovado; validar `https:` allowlist/policy de image URL; CSP ajustada a fonts,
  storage e hosting; testes contra campos admin/public e dados persistidos.
- **CSRF/sessões:** decisão cookie first-site; CSRF tokens/validação origin para mutações;
  regenerar session ID pós-login; expirar/revogar no servidor; `Secure`,`HttpOnly`,
  `SameSite` com domínio aprovado; CORS explícito, credentials sem `*`.
- **AuthN/AuthZ:** hashes adaptativos conforme padrão suportado; generic errors, rate limit,
  disable/demo credentials, secure bootstrap; authorization method/resource ID enforced for
  every CRUD/list/read/update/delete; no `localStorage` token; logout invalidates server side.
- **PII/LGPD:** collect approved minimum; notice and purpose; access by needed role; data
  retention/delete/export and backup expiry; redact logs; record audit actions minimally;
  no real PII in tests/fixtures.
- **Rate/abuse:** server enforced login/intake caps and request size; trust forwarded IP only
  from configured proxy; monitor throttle outcomes; avoid CAPTCHA until justified and test
  accessible alternatives; idempotency semantics defined to mitigate duplicate intake.
- **Uploads:** independent storage; content signature + decode/re-encode, file-size/dimensions,
  type allowlist, generated key, malware considerations, EXIF removal, isolated serving,
  failed/orphan cleanup.
- **Errors/security headers:** typed Problem responses; never stack/sql/env detail; safe
  logs with correlation without secrets/PII; TLS/HSTS when appropriate; CSP,
  `frame-ancestors`, nosniff/referrer, secure cache policy for admin PII.
- **Migrations/supply chain:** pin toolchain and lockfiles/wrappers, dependency and secret
  scan, migration ownership/review, compatibility and clean-install test, backup restore,
  no destructive DB/retention task without approval.

As políticas `docs/security/` descrevem expectativas; estes são critérios futuros de revisão
e testes, não evidência de controle já configurado.
