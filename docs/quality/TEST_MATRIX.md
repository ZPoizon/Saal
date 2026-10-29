# Matriz de testes rastreável ao OpenSpec

Esta matriz planeja evidências; **não afirma que os testes listados existam ou passaram**.
Requisitos de produto são futuros e dependem de decisões aprovadas. Onde o contrato
condiciona um comportamento à regra da ONG, o caso só se torna normativo depois de essa regra
ser registrada. Usar fixtures sintéticas.

## Convenções de evidência

- **Unit/UI:** Vitest ou runner aprovado; comportamento de unidade/componente.
- **API/DB:** JUnit 5 + Spring Boot Test; MySQL 8 via Testcontainers e Flyway quando aplicável.
- **Contrato:** Redocly CLI 2.72.0 é candidata documentada TEC-07; validar após aprovação
  e comparar request, response, status e schemas.
- **E2E:** Playwright é candidato; não aprovado/configurado. Executar só quando frontend,
  API e dados de teste existirem.
- **Manual:** browser, teclado/leitor de tela, viewport/zoom, revisão AppSec ou operação,
  com evidência registrada.
- Todos os cenários incluem resultado negativo/falha aplicável; nenhum mock de teste pode
  ser utilizado como persistência em produção.

## I0 — Qualidade e CI

| ID | Fonte OpenSpec | Cenários/asserções | Camada | Estado observado |
|---|---|---|---|---|
| Q-I0-01 | `tasks.md` 1.1–1.5 | Instalação frozen, typecheck, testes, lint, format check, secret scan, audit e build propagam falha; guardar versões e saída. | CI | Workflow configurado; run #40626776841 concluiu success. |
| Q-I0-02 | `tasks.md` 1.3 | Probe de teste falho e segredo sintético fazem os checks correspondentes falhar; segredo de fixture fica mascarado e probes são removidos. | CI | A task registra execução temporária dos probes; não repetir sem necessidade. |
| Q-I0-03 | `src/app/data/animals.test.ts` | Helpers retornam animais disponíveis e resolvem ID conhecido/desconhecido. | Vitest unitário | Dois testes iniciais no runner existente; escopo limitado aos helpers. |
| Q-I0-04 | `tasks.md` 1.2/1.4; `quality.yml` | Permissões mínimas, actions fixadas, execução de PR observada; verificar separadamente se branch rules realmente exigem checks. | Revisão CI/GitHub | Workflow tem `contents: read` e actions pinadas; regra administrativa não é inferida do workflow. |

## I1 — Aprovações, modelo e contratos (tasks 2.1–2.5)

| ID | Fonte OpenSpec | Cenários/asserções | Camada | Evidência de aceite |
|---|---|---|---|---|
| Q-I1-01 | `tasks.md` 2.1; `I1-approval-register.md` ONG-01–ONG-11 | Cada item tem aprovador/autoridade, data, evidência, escopo ou bloqueio explícito e requisitos excluídos; nenhuma resposta é inferida. | Revisão documental | Registro de decisões e bloqueios; nenhuma decisão da ONG inventada. |
| Q-I1-02 | `tasks.md` 2.2; TEC-01–TEC-11 | ADRs distinguem decisão escolhida, proposta condicional e pendência; fontes/version compatibility são verificáveis. | Revisão ADR | Referências e escopo aprovados pelos responsáveis competentes. |
| Q-I1-03 | `tasks.md` 2.3; `specs/contracts/data-model.md` | Cada campo/entidade incluído tem finalidade, visibilidade, obrigatoriedade, validação, acesso e retention quando aplicável; pendências são excluídas do contrato implementável. | Revisão de modelo/privacidade | Modelo reconciliado sem transformar mocks em domínio. |
| Q-I1-04 | `tasks.md` 2.4; `specs/contracts/openapi.yaml` | Público/admin separados; auth/logout e security scheme conforme ADR; erros e schemas coerentes; limites/upload/intake/contact somente onde aprovados. | Redocly CLI 2.72.0 (candidata TEC-07) + revisão | Strict OpenSpec; execução do validador versionado; aprovação para CI pendente; placeholders identificados. |
| Q-I1-05 | `tasks.md` 2.5; `INTERACTION_INVENTORY.md` | Todo ID do inventário mapeado a capability/requisito, endpoint ou N/A justificado, persistência ou N/A, teste e status. | Rastreabilidade documental | Cobertura integral e links internos válidos. |

## I2–I3 — Serviço e persistência

| ID | Fonte OpenSpec | Cenários/asserções | Camada | Estado |
|---|---|---|---|---|
| Q-I2-01 | `tasks.md` 3.1 | Maven Wrapper reproduz build Spring Boot com toolchain aprovada e dependências verificadas. | Build CI | Futuro; backend inexistente. |
| Q-I2-02 | `tasks.md` 3.2 | Configuração ausente/inválida falha explicitamente; health check não revela segredo nem configuração. | Spring Boot Test + API | Futuro; dependente do runtime configurado. |
| Q-I2-03 | `tasks.md` 3.3; ADRs de erro/log | Respostas RFC 9457 e logs não contêm stack trace, SQL, credenciais ou PII desnecessária. | Teste API/log + revisão | Futuro; RFC/implementação ainda precisam de contrato operacional. |
| Q-I3-01 | `tasks.md` 4.1–4.2 | Flyway aplica migrations versionadas em MySQL 8 limpo; FKs/constraints/índices aprovados funcionam; migration usa credencial separada e mínima. | Testcontainers MySQL | Futuro; nenhuma migration existe/autorizada. |
| Q-I3-02 | `tasks.md` 4.3 | Upgrade de uma versão de schema suportada e constraints são reprodutíveis no CI com MySQL de destino. | Testcontainers + CI | Futuro; sem versão prévia ou schema decidido. |
| Q-I3-03 | `tasks.md` 4.4 | Rehearsal de backup/restore e correção forward; demonstrar que operação não depende de rollback transacional de DDL MySQL. | Evidência operacional | Futuro; retenção e provider precisam aprovação. |

## I4 — Autenticação e autorização

| ID | Fonte OpenSpec | Cenários/asserções | Camada |
|---|---|---|---|
| Q-I4-01 | `admin-authentication/spec.md`: autenticação server-side | Credencial válida cria contexto sem devolver/logar senha; inválida tem erro genérico, sem enumeração; bootstrap sem autoinscrição ou conta padrão. | Spring Security API tests |
| Q-I4-02 | `admin-authentication/spec.md`: operações admin | Não autenticado recebe negação; autenticado sem permissão e ID de outro recurso não obtêm acesso/leitura/mutação (IDOR/BOLA). | API authorization matrix |
| Q-I4-03 | `admin-authentication/spec.md`: logout invalida credencial | Operação protegida após logout/expiração/revogação é negada; sessão não reaparece após reinício quando JDBC session aprovada e DB disponível. | API + MySQL integration |
| Q-I4-04 | `admin-authentication/spec.md`: abuse | Tentativas inválidas/excessivas não enumeram contas; rate limit, log redigido e resposta segura conforme política aprovada. | API security/abuse tests |
| Q-I4-05 | `tasks.md` 5.2–5.5 | Cookies flags, CSRF, CORS/origin e proxy são testados em topologia/browser aprovados; requisição forjada é recusada; CORS não é a única barreira. | Browser E2E + API + AppSec |

## I5–I7 — Animais, imagens, catálogo e experiência pública

| ID | Fonte OpenSpec | Cenários/asserções | Camada |
|---|---|---|---|
| Q-I5-01 | `animal-management/spec.md`: cadastro/edição/status | Admin autorizado cria/edita valores válidos persistentes; invalid input não persiste parcialmente; mudança afeta público somente conforme status/publicação aprovados. | API + MySQL integration |
| Q-I5-02 | `animal-management/spec.md`: archive/delete | Ação autorizada aplica política aprovada e preserva referências/histórico; não inferir exclusão ou archive. | API + DB integration |
| Q-I5-03 | `animal-management/spec.md`: falha/formulário | Falha de serviço não comunica sucesso, preserva campos; diálogo possui foco/teclado e erros associados. | Vitest/component + E2E + manual |
| Q-I6-01 | `animal-management/spec.md`: upload | Rejeitar conteúdo inválido, MIME/extensão spoofados e excedentes conforme limites aprovados; storage persistente externo ao container; preview local não é persistência. | API upload integration + storage adapter tests |
| Q-I7-01 | `public-animal-catalog/spec.md`: listagem e filtros | Exibir somente animais elegíveis/publicados; combinar busca e espécie; vazio/limpar; validação e paginação apenas conforme contrato aprovado. | API + UI + E2E |
| Q-I7-02 | `public-animal-catalog/spec.md`: detalhe/galeria | Dados públicos aprovados e ordem da galeria; status inelegível sem CTA; 404 recuperável; falha de imagem sem sucesso falso. | API + component + E2E |
| Q-I7-03 | `public-experience/spec.md`: navegação/destinos | Link/rota/deep link/refresh/404; um alvo semântico por ação; sem CTA/dado institucional sem aprovação; share tem fallback acessível. | Component + E2E + revisão de conteúdo |
| Q-I7-04 | `public-experience/spec.md`: acessibilidade/metadata; `tasks.md` 12.2–12.3 | Teclado, nomes/estados, foco, labels/erros, idioma/título/indexação por ambiente; viewports 320×568, 375×667, 390×844, 768×1024, 1024×768, 1440×900 e 1920×1080; zoom 200% e altura reduzida, sem overflow/corte inesperado. | axe/equivalente + manual browser/leitor + viewport |

## I8–I11 — Solicitações, contato e prontidão integrada

| ID | Fonte OpenSpec | Cenários/asserções | Camada |
|---|---|---|---|
| Q-I8-01 | `adoption-requests/spec.md`: animal e submissão | Animal `AVAILABLE` no momento da gravação; inexistente/`ADOPTED` não persiste; campos nome/WhatsApp/cidade/e-mail e PII somente conforme decisão ONG. | API + transaction/MySQL |
| Q-I8-02 | `adoption-requests/spec.md`: persistência/falha/privacidade | Confirmação só após persistência, sem afirmar aprovação; timeout/erro preserva campos, retry/duplicidade conforme política aprovada; visitante não lê PII. | API + UI + E2E |
| Q-I9-01 | `adoption-management/spec.md`: lista autorizada | Admin autorizado vê persistidos em modo somente leitura; vazio distinto de erro; visitante/identidade sem autorização recebe negação sem PII. | API auth + DB + UI |
| Q-I9-02 | `adoption-management/spec.md`: ausência de transições | Nenhum endpoint/ação altera estado; tentativa de aprovar/recusar não persiste; logs mínimos sem conteúdo sensível ou histórico detalhado. | API + log review |
| Q-I10-01 | `contact-messages/spec.md` | **Adiado/fora do primeiro incremento** até ONG-07/ONG-09; WhatsApp e telefone permanecem links. | N/A até aprovação |
| Q-I11-01 | `tasks.md` 12.1 | Jornadas públicas/admin contra API + MySQL: persistência, autorização, erros, retry e reload. | E2E + integração |
| Q-I11-02 | `tasks.md` 12.2–12.3 | WCAG 2.2 AA como referência, axe/equivalente, teclado/leitor de tela e viewports definidos; achados e exceções com risco/aprovação. | A11y tooling + manual |
| Q-I11-03 | `tasks.md` 12.4 | Revisão AppSec cobre auth/IDOR, injeções, XSS, CSRF, rate, upload, PII, logs, CORS, segredos e dependências; P0 não permanece aberto. | AppSec review + CI evidence |
| Q-I11-04 | `tasks.md` 12.5 | Build/deploy, migrations, secrets, backup/restore, compatibilidade, observabilidade e resposta a incidente ensaiados; separar demonstração de produção ONG. | Staging/operations evidence |
| Q-I11-05 | `tasks.md` 12.6 | Afirmações históricas não verificadas são identificadas/supersedidas com escopo e fonte, sem apagar histórico. | Revisão documental |

## Rastreabilidade e uso

Cada PR deve listar os IDs Q-* aplicáveis e os IDs dos requisitos OpenSpec de origem. Casos
condicionados a regra da ONG ficam **bloqueados** até haver decisão ou bloqueio documentado
com o escopo excluído. Caso N/A precisa justificativa revisável. Não marcar este quadro como
concluído globalmente: seu status é planejamento até que cada teste seja implementado,
executado e evidenciado no gate do incremento correspondente.
