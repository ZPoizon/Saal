# Registro de decisões e aprovações — I1

**Change:** `saal-functional-readiness`
**Estado deste registro:** decisões técnicas expressamente autorizadas, recomendações
condicionais e bloqueios pendentes; este registro não aprova decisões da ONG.
**Última revisão técnica:** 2026-10-28

## Finalidade e regras de governança

Este registro separa decisões arquiteturais já aceitas de recomendações técnicas e decisões
operacionais que pertencem à ONG. Uma recomendação não é uma aprovação e não pode ser usada
como requisito normativo de API, schema, implementação ou implantação.

Estados permitidos:

- **Aprovada:** há decisão verificável registrada por autoridade competente, com evidência
  referenciada.
- **Proposta:** há recomendação técnica aguardando revisão e aprovação.
- **Pendente:** a decisão ainda pertence a um responsável identificado, sem aprovação
  registrada.
- **Rejeitada:** a autoridade competente rejeitou a opção, com evidência e alternativa
  registrada.

Para registrar uma aprovação, acrescentar: decisão adotada, nome e papel de quem aprovou,
data, referência verificável à ata/ADR/aprovação e escopo autorizado. Se não houver decisão,
registrar explicitamente o bloqueio, a pessoa/função responsável e quais requisitos
permanecem fora do contrato. Conversa informal ou recomendação técnica não é evidência
suficiente.

## Arquitetura já aceita

Somente as seguintes escolhas tecnológicas estão registradas como aprovadas para a
arquitetura futura:

| ID | Decisão aprovada | Status | Evidência | Limites da aprovação |
|---|---|---|---|
| ARQ-01 | Manter o frontend existente em React + TypeScript + Vite. | Aprovada | `specs/decisions/ADR-001-react-typescript-vite.md` (Aceito) | Não aprova mudança de versão de dependências, SSR, hospedagem ou bibliotecas adicionais. |
| ARQ-02 | Construir futuramente uma API REST/JSON separada em Java + Spring Boot. | Aprovada | `specs/decisions/ADR-002-spring-boot.md` | Arquitetura futura, não implementada; endpoint e domínio sujeitos às decisões pendentes. |
| ARQ-03 | Usar MySQL 8 futuro, acessado exclusivamente pelo backend. | Aprovada | `specs/decisions/ADR-003-mysql.md` | Arquitetura futura, não implementada; não aprova schema, retenção, hosting ou exclusão de dados. |

## Decisões técnicas expressamente autorizadas pela equipe

A evidência é a autorização explícita do responsável técnico nesta solicitação, datada de
2026-10-28. A identidade nominal do responsável não está disponível nesta evidência; não
inventar nome nem converter escolhas condicionais em aprovação irrestrita.

| Tema | Escolha autorizada | Estado e limites |
|---|---|---|
| Runtime Java/Spring | Java 21 LTS e Spring Boot 4.1.2 | A escolha do patch está condicionada à confirmação de compatibilidade, disponibilidade e suporte no início do I2. |
| Build | Maven Wrapper | A versão concreta do wrapper será fixada ao iniciar I2; nenhum backend é criado por esta decisão. |
| Segurança e persistência | Spring Security, Spring Data JPA e Bean Validation | Tecnologias futuras aprovadas; não define contas, papéis, campos nem regras de negócio. |
| Banco/migrations | MySQL 8 e Flyway | A escolha Flyway está aprovada; não aprova schema/migrations ou execução de I3. |
| Testes backend | JUnit 5, Spring Boot Test e Testcontainers com MySQL 8 | Ferramentas-alvo aprovadas; não afirma que estejam instaladas ou executadas. |
| Empacotamento e automação | Docker e GitHub Actions | Direção aprovada; não aprova deploy, configuração administrativa ou novo workflow nesta tarefa. |
| Contrato/erros | API REST e respostas estruturadas baseadas em RFC 9457 | RFC 9457 é a base de resposta de erro; não define valores de limites ou regras de negócio. |
| Segredos | Segredos fora do repositório e de bundles `VITE_*` | Princípio aprovado; secret store e ambientes concretos permanecem pendentes. |
| Hosting | Cloudflare Pages preferencial para frontend; Render/Aiven como opções para teste/demonstração | Não são aprovados para produção nem constituem topologia final. |
| Autenticação | Sessão server-side revogável como preferência | Desenho final depende da topologia e da segurança browser/API; não aprova cookies, CSRF, origens ou protocolo. |
| Validação OpenAPI | Redocly CLI 2.72.0 selecionado como alternativa candidata para validação documental | Compatibilidade verificada contra o contrato OpenAPI 3.0.3 nesta tarefa; seleção de ferramenta/versão para CI fica proposta até aprovação do API owner/mantenedor de CI. |

As decisões registradas aqui autorizam documentação e planejamento, não implementação
funcional, criação de backend, migrations, configuração administrativa ou deploy.

## Decisões técnicas

### TEC-01 — Versão Java e linha Spring Boot

- **Assunto:** versões suportadas do JDK e Spring Boot para o serviço futuro.
- **Opções possíveis:** uma distribuição JDK LTS suportada com Spring Boot 3.5.x ainda
  mantido; JDK 21 LTS com uma linha Spring Boot 4.x mantida; outra combinação coberta pela
  matriz oficial de compatibilidade e pela plataforma de deploy.
- **Escolha autorizada com condição:** Java 21 LTS e Spring Boot 4.1.2. A compatibilidade
  da matriz Java/Maven é documentada oficialmente; disponibilidade, suporte upstream,
  plugins e imagem/runtime ainda devem ser confirmados no início do I2.
- **Justificativa:** JDK LTS, compatibilidade documentada e escolha de linha atual reduzem
  risco de suporte sem antecipar uma versão de patch que pode ficar desatualizada antes do
  I2.
- **Riscos:** atualização principal pode exigir ecossistema/plugins compatíveis; suporte do
  provedor de deploy e dependências do projeto ainda não foram inspecionados.
- **Responsável pela aprovação:** Tech Lead/arquitetura e mantenedor responsável pelo
  runtime.
- **Status:** aprovada com condição de revalidação antes do I2.
- **Evidência da aprovação:** autorização expressa do responsável técnico, 2026-10-28
  (identidade nominal não fornecida); [Spring Boot — System Requirements](https://docs.spring.io/spring-boot/system-requirements.html),
  consultada em 2026-10-28.
- **Impacto:** ADR-002 e documentação backend; build/CI, imagem/runtime, compatibilidade de
  dependências e tarefa 2.2. A escolha final também condiciona I2 (3.1), mas não aprova
  nenhuma regra de negócio.
- **Escopo desbloqueado:** documentar baseline condicional de I2; não autoriza criar backend.

### TEC-02 — Ferramenta de build Java

- **Assunto:** Maven ou Gradle para o serviço `backend/`.
- **Opções possíveis:** Maven Wrapper; Gradle Wrapper; outra ferramenta com wrapper e
  execução reprodutível demonstrada.
- **Escolha autorizada:** Maven Wrapper; fixar versão concreta quando o build I2 for criado.
- **Justificativa:** reduz dependência de instalação global, favorece builds previsíveis e
  tem uso consolidado no ecossistema Spring; é suficiente para um serviço inicial sem
  necessidade observada de lógica avançada de build.
- **Riscos:** familiaridade da equipe pode favorecer Gradle; plugins, JDK e cache de CI
  precisam ser verificados antes de fixar a escolha.
- **Responsável pela aprovação:** Tech Lead e mantenedor do backend/CI.
- **Status:** aprovada.
- **Evidência da aprovação:** autorização expressa do responsável técnico, 2026-10-28
  (identidade nominal não fornecida).
- **Impacto:** ADR-002, estrutura e wrapper em `backend/`, pipeline e tarefa 2.2; pré-requisito
  para I2 (3.1).
- **Escopo desbloqueado:** planejar build reproduzível de I2; o wrapper será criado somente
  no incremento autorizado.

### TEC-03 — Ferramenta de migrations

- **Assunto:** versionamento e execução do schema MySQL.
- **Opções possíveis:** Flyway com SQL versionado; Liquibase; ferramenta alternativa
  equivalente com histórico reproduzível. SQL manual isolado não é recomendado como fluxo
  permanente.
- **Escolha autorizada:** Flyway com migrations SQL ordenadas, validação de
  checksum, usuário de migration separado do usuário runtime e execução controlada.
- **Justificativa:** fluxo simples e auditável para o schema relacional previsto, sem manter
  changelogs abstratos paralelos ao SQL. DDL MySQL não deve ser presumido transacionalmente
  reversível; corrigir mudanças publicadas com migration forward e estratégia de restore.
- **Riscos:** locking, mudanças incompatíveis entre versões, privilégios excessivos,
  alteração destrutiva e falha de backup/restore.
- **Responsável pela aprovação:** Tech Lead/arquitetura, mantenedor de banco e responsável
  operacional.
- **Status:** aprovada como ferramenta futura.
- **Evidência da aprovação:** autorização expressa do responsável técnico, 2026-10-28
  (identidade nominal não fornecida); ADR-003.
- **Impacto:** ADR-003, backend, pipeline de teste, permissões e estratégia de recuperação;
  tarefa 2.2 e, após aprovação, I3 (4.1–4.4). Não determina os campos do domínio.
- **Escopo desbloqueado:** seleção da ferramenta está resolvida; migrations e schema
  continuam bloqueados pelas decisões de domínio e pela autorização de I3.

### TEC-04 — Mecanismo de autenticação administrativa

- **Assunto:** sessão/cookie, token ou provedor de identidade.
- **Opções possíveis:** sessão server-side revogável; token com ciclo de rotação/revogação
  documentado; provedor de identidade externo, se houver necessidade e operação aprovada.
- **Preferência técnica, não desenho aprovado:** sessão server-side para a SPA administrativa se frontend e
  API forem implantados no mesmo site; cookie com `Secure`, `HttpOnly`, escopo restrito e
  `SameSite` escolhido conforme o fluxo; regenerar identificador após login, definir
  expiração/revogação e invalidar no logout. Não armazenar bearer token persistente em
  `localStorage`.
- **Justificativa:** permite invalidação efetiva no logout e reduz exposição de credenciais
  a JavaScript; o risco de CSRF é tratado explicitamente quando cookies são enviados
  automaticamente.
- **Riscos:** topologia cross-site pode tornar cookies impraticáveis; armazenamento de sessão,
  alta disponibilidade, expiração, recuperação e operação de contas ainda não foram
  definidos. `SameSite` não substitui proteção CSRF.
- **Responsável pela aprovação:** responsável de segurança/AppSec e Tech Lead, com aceite do
  responsável operacional pela hospedagem.
- **Status:** preferência registrada; decisão final pendente.
- **Evidência:** autorização expressa do responsável técnico, 2026-10-28, determina a
  preferência por sessão server-side revogável e condiciona o desenho final à topologia e à
  segurança entre frontend/API. O `bearerAuth`/JWT e `AuthResult.accessToken` antigos são
  placeholders e não constituem decisão.
- **Impacto:** ADR-002, OpenAPI (`securitySchemes`, login, estado da sessão e logout),
  autorização e testes; tarefa 2.2 e pré-requisito para I4 (5.1–5.5). Identidade e papéis
  continuam decisão separada da ONG (ONG-01).
- **Escopo desbloqueado se aprovada:** documentar o esquema de auth no contrato e planejar os
  testes de I4; não cria contas, papéis nem implementação de autenticação.

### TEC-05 — Topologia, origens, cookies, CSRF e CORS

- **Assunto:** relação de origem/site do frontend e API e defesas de browser.
- **Opções possíveis:** frontend e API sob o mesmo site, com proxy/reverse proxy; origens
  distintas mas same-site; sites distintos com avaliação explícita de cookies third-party
  e autenticação alternativa.
- **Proposta condicional (não aprovada):** preferir mesmo site HTTPS com API atrás de proxy; definir
  allowlist explícita de origens e métodos, nunca combinar credenciais com `Access-Control-Allow-Origin: *`.
  Para autenticação por cookie, exigir proteção CSRF (token apropriado e validação de
  `Origin`/origem conforme desenho); `SameSite` é defesa adicional, não substituto.
  Especificar `Secure`, `HttpOnly`, duração e escopo do cookie com a topologia final.
- **Justificativa:** reduz complexidade de cookies/CORS e dependência de cookies cross-site,
  preservando controles explícitos de origem e CSRF.
- **Riscos:** domínio, proxy confiável, ambiente, origens, TLS, réplicas e infraestrutura
  ainda não foram escolhidos; CORS incorreto pode expor operações ou bloquear clientes.
- **Responsável pela aprovação:** responsável de infraestrutura/hosting, Tech Lead e AppSec;
  a ONG aprova domínio e política pública de publicação quando houver impacto operacional.
- **Status:** pendente.
- **Evidência:** a equipe prefere Cloudflare Pages para frontend e considera Render/Aiven
  opções gratuitas para teste/demonstração; não foi escolhida origem/domínio/proxy nem hosting
  de produção. A sessão preferencial depende dessa topologia.
- **Impacto:** ADRs de autenticação/implantação, contrato OpenAPI, configurações de cookie,
  CSRF e CORS, CI por ambiente; tarefa 2.2 e gate para I4.
- **Escopo desbloqueado se aprovada:** fechar premissas de origem e requisitos de cookie/CSRF
  para o desenho de I4; hosting e configuração executável seguem fora desta aprovação.

### TEC-06 — Estratégia de testes e ambientes

- **Assunto:** testes de frontend/backend, integração com MySQL e configuração de ambiente.
- **Opções possíveis:** unitários e integração com banco real/containerizado; banco em memória
  como único teste; E2E browser; ambientes locais/test/staging/prod com configurações
  distintas.
- **Decisão parcial:** manter Vitest no frontend e usar JUnit 5,
  Spring Boot Test e Testcontainers com imagem MySQL 8 fixada para integração de migrations,
  constraints, repositórios e endpoints; não tratar H2 como substituto único de compatibilidade
  MySQL. Adicionar E2E de browser nos fluxos integrados quando houver API/UI conectadas.
  Separar perfis local/test/staging/prod, fixtures sintéticas e segredos fornecidos fora do
  repositório; nenhum PII real em testes.
- **Justificativa:** cobre contratos e semântica do banco de destino, mantém testes
  repetíveis e evita vazamento ou dependência de dados reais.
- **Riscos:** custo/tempo de containers no CI, runtime Docker disponível, atualização da
  imagem MySQL e escopo de E2E ainda precisam validação operacional.
- **Responsável pela aprovação:** Tech Lead, QA e mantenedor de CI; AppSec aprova manejo de
  segredos/dados.
- **Status:** ferramentas nomeadas aprovadas; E2E e ambientes continuam proposta.
- **Evidência:** autorização expressa do responsável técnico, 2026-10-28, seleciona JUnit 5,
  Spring Boot Test e Testcontainers/MySQL 8. Vitest/checks frontend estão no I0. Playwright
  segue apenas como candidato a avaliar.
- **Impacto:** decisões técnicas do ADR-002/003, CI, ambiente, dados de teste, verificação do
  OpenAPI e tarefas 2.2/2.4; base para I2/I3 e verificação integrada em I11.
- **Escopo desbloqueado:** registrar a estratégia selecionada e planejar jobs futuros; não
  instala ferramentas nem cria backend nesta etapa.

### TEC-07 — Validação e lint do contrato OpenAPI

- **Assunto:** verificação automatizada de sintaxe, regras e compatibilidade do contrato.
- **Opções possíveis:** Redocly CLI; Spectral; validador compatível com OpenAPI 3.0; revisão
  manual isolada.
- **Alternativa selecionada para avaliação documental:** Redocly CLI 2.72.0, com pacote e
  execução fixados por versão e OpenAPI 3.0.3. Não adicionar ao CI nem ao manifest sem
  aprovação do API owner/mantenedor de CI.
- **Justificativa:** YAML parseável não prova que referências, schemas, parâmetros,
  security schemes e respostas constituem um contrato OpenAPI consistente.
- **Riscos:** regras genéricas podem rejeitar placeholders intencionais ou impor requisitos
  irrelevantes; configuração permissiva pode passar problemas importantes.
- **Responsável pela aprovação:** Tech Lead/API owner e mantenedor do CI.
- **Status:** proposta para aprovação.
- **Evidência:** versão 2.72.0 publicada no npm, licença MIT, Node >=22.12.0 (compatível com
  Node 22 do I0) e comando `lint`; documentação oficial do CLI e execução local nesta tarefa
  validaram o documento como OpenAPI 3.0.3. Nenhum validador de CI está configurado.
- **Impacto:** `specs/contracts/openapi.yaml`, configuração de lint e CI, tarefa 2.4 e critério
  de contrato do I1. Não instalar ferramenta nesta etapa.
- **Escopo desbloqueado:** candidato de validação escolhido; a aprovação e qualquer inclusão
  em CI requerem decisão explícita e PR correspondente.

### TEC-08 — Convenções HTTP, limites e concorrência

- **Assunto:** envelope de erro, limites de payload/página, retry, conflitos e versões de
  recursos.
- **Opções possíveis:** Problem Details (RFC 9457) ou formato próprio; limites fixos ou
  configuráveis; `ETag`/`If-Match`, versão explícita ou controle transacional interno.
- **Decisão autorizada em parte:** usar RFC 9457 como base para erro estruturado sem detalhe
  interno; documentar explicitamente `400/401/403/404/409/429/5xx`, paginação bounded, allowlist de
  ordenação e limites de tamanho; avaliar Problem Details RFC 9457 e `ETag`/`If-Match` para
  concorrência. Valores numéricos devem ser escolhidos com limites de abuso e UX após
  requisitos e volume estimado.
- **Justificativa:** evita respostas semânticas ambíguas, exposição de stack/SQL e abuso de
  consultas sem transformar valores arbitrários em política de negócio.
- **Riscos:** valores baixos prejudicam uso legítimo; valores altos ampliam consumo; formatos
  de erro e concorrência impactam clientes e compatibilidade.
- **Responsável pela aprovação:** API owner/Tech Lead e AppSec; a ONG aprova impactos de UX
  ou limites que afetem operação.
- **Status:** RFC 9457 aprovada; códigos HTTP e limites concretos permanecem proposta/
  dependentes das regras e operação.
- **Evidência:** autorização expressa do responsável técnico, 2026-10-28, para respostas de
  erro baseadas em RFC 9457.
- **Impacto:** OpenAPI, validadores, testes de contrato, tarefas 2.3/2.4; dependências em I2 e
  nas operações I5/I8/I9. Não fixar valores ou transições no contrato antes de aprovação.
- **Escopo desbloqueado se aprovada:** documentar formatos e limites técnicos genéricos
  aplicáveis; valores que dependem de volume, PII ou UX continuam sujeitos aos gates da ONG.

### TEC-09 — Segredos, perfis e operação de ambientes

- **Assunto:** configuração local, CI, staging e produção; identidade e privilégio de
  credenciais operacionais.
- **Opções possíveis:** secret manager do provedor; secrets protegidos de CI; configuração
  local por variáveis e `.env` ignorado; ambientes efêmeros/reutilizados.
- **Decisão autorizada em parte:** segredos fora do repositório e do bundle público. A
  recomendação para configurações tipadas por ambiente; valores não secretos
  em configuração controlada; credenciais obtidas de secret store; `.env.example` somente
  com nomes/valores demonstrativos; credenciais distintas para migration e runtime;
  isolamento entre teste e dados reais; negar startup se configuração obrigatória estiver
  ausente.
- **Justificativa:** não versionar segredos, reduzir privilégio e falhar de forma explícita
  em vez de usar defaults de sucesso ou configurações permissivas.
- **Riscos:** provedor, custos, acesso operacional, rotação e responsabilidade por backup e
  incidentes ainda estão indefinidos.
- **Responsável pela aprovação:** responsável de infraestrutura/operações e AppSec; Tech
  Lead revisa configuração.
- **Status:** princípio de segredos aprovado; perfil, secret store e operação de hosting
  pendentes.
- **Evidência:** autorização expressa do responsável técnico, 2026-10-28, proíbe segredos no
  repositório; nenhum provedor de secret store foi escolhido.
- **Impacto:** ADRs de implantação e dados, CI, configurações backend, credenciais, backup e
  resposta a incidentes; tarefa 2.2 e gates I2/I3/I11.
- **Escopo desbloqueado se aprovada:** fechar apenas o modelo documental de configuração e
  segredos; nenhum ambiente é provisionado e nenhum segredo é criado por esta decisão.

### TEC-10 — Persistência Java e validação de fronteira

- **Assunto:** tecnologia de acesso a dados e validação de entrada no serviço futuro.
- **Escolha autorizada:** Spring Data JPA e Bean Validation, sem expor entidades JPA como
  DTOs de API.
- **Justificativa:** tecnologias escolhidas pela equipe para persistência relacional e
  validação de fronteira, mantendo regras de negócio no backend.
- **Riscos/limites:** não define entidades, campos, enums, constraints, validações de domínio,
  consultas, schema ou comportamento de API; esses itens dependem das decisões da ONG.
- **Status:** aprovada como baseline técnica futura.
- **Evidência:** autorização expressa do responsável técnico, 2026-10-28 (identidade nominal
  não fornecida); ADR-002.
- **Impacto:** ADR-002, futura estrutura backend e tarefas I2/I3; não cria persistência.

### TEC-11 — Empacotamento e automação

- **Assunto:** empacotamento do serviço e execução automatizada de qualidade.
- **Escolha autorizada:** Docker e GitHub Actions.
- **Limites:** nenhuma configuração administrativa do GitHub, pipeline backend, imagem ou
  deploy é alterado por esta decisão documental.
- **Status:** aprovada como direção técnica futura.
- **Evidência:** autorização expressa do responsável técnico, 2026-10-28 (identidade nominal
  não fornecida).
- **Impacto:** ADR-002 e evolução futura do CI; aplicar permissões mínimas, ações versionadas
  e segredos fora do repositório quando autorizado.

## Decisões reservadas à ONG

Os enums e campos existentes são observações do protótipo/modelo, não aprovação de regra de
negócio. Para todos os registros abaixo, não existe evidência de aprovação registrada nesta
change. A ONG deve identificar quem decide, e a evidência deve registrar nome/papel/data e
escopo. Quando houver tratamento de dados pessoais, incluir responsável de privacidade ou
assessoria apropriada, sem declarar conformidade LGPD automaticamente.

### ONG-01 — Identidades administrativas, contas e permissões

- **Assunto:** quem acessa `/admin`, como contas são provisionadas/revogadas e quais
  operações cada pessoa pode executar.
- **Opções possíveis:** conta compartilhada; contas nominais com um papel; contas nominais
  com papéis diferenciados; provedor de identidade; autoinscrição (não recomendada).
- **Recomendação técnica:** identidade nominal, provisionamento controlado, sem autoinscrição
  nem privilégio vindo do cliente; menor privilégio e revogação por pessoa. A ONG define
  participantes e atribuições.
- **Justificativa:** atribuição de responsabilidade, revogação individual e controle de
  acesso a dados pessoais.
- **Riscos:** conta compartilhada dificulta auditoria; papéis excessivos ou mal definidos
  expõem PII e permitem alteração/exclusão não autorizadas.
- **Responsável pela aprovação:** representante da ONG com autoridade administrativa,
  incluindo responsável por cadastro de contas.
- **Status:** pendente.
- **Evidência da aprovação:** nenhuma; opções não escolhidas.
- **Impacto:** requisito/capability `admin-authentication`, entidade Administrator,
  matriz server-side de autorização, OpenAPI admin, auditoria e tarefas 2.1/2.3/2.4; gate
  obrigatório antes de I4.
- **Escopo desbloqueado se aprovada:** especificar as identidades e permissões efetivamente
  aprovadas em 2.3/2.4; implementação ainda depende de I2–I4.

### ONG-02 — Estados, elegibilidade e publicação de animais

- **Assunto:** significado dos estados, disponibilidade para adoção, publicação, rascunho e
  visibilidade pública/admin.
- **Opções possíveis:** manter apenas estados observados (`AVAILABLE`, `TREATMENT`,
  `ADOPTED`); adicionar estado operacional de publicação; separar lifecycle de adoção e
  visibilidade; outras regras definidas pela ONG.
- **Recomendação técnica:** não reutilizar estado único para semânticas diferentes; explicitar
  elegibilidade e visibilidade com transições e efeitos públicos separados, se a operação
  exigir. A recomendação não escolhe os estados finais.
- **Justificativa:** catálogo, CTA de interesse e administração precisam concordar com a
  disponibilidade autoritativa.
- **Riscos:** um enum ambíguo pode expor animais não publicados ou aceitar interesse em
  animal inelegível; mudança posterior afeta API e migração.
- **Responsável pela aprovação:** coordenação de adoção/animais da ONG.
- **Status:** pendente.
- **Evidência da aprovação:** nenhuma; enums existentes são apenas observados.
- **Impacto:** Animal, campos públicos, filtros, OpenAPI catálogo/admin, critérios de
  elegibilidade e tarefas 2.1/2.3/2.4; bloqueia contrato final e I5/I7/I8.
- **Escopo desbloqueado se aprovada:** tornar normativos somente os estados, publicação e
  elegibilidade aprovados no modelo/contrato; não inicia CRUD nem catálogo implementado.

### ONG-03 — Arquivamento, exclusão e referências de animais

- **Assunto:** quem pode arquivar/excluir, quando permitido e como preservar solicitações,
  imagens e histórico.
- **Opções possíveis:** arquivamento reversível; exclusão lógica; exclusão física após
  retenção; combinação com fluxo de aprovação.
- **Recomendação técnica:** evitar exclusão destrutiva como padrão e preservar integridade e
  histórico conforme a política aprovada. Definir o que fica visível e quem pode executar
  cada ação.
- **Justificativa:** solicitações existentes podem referenciar animais removidos; DDL/DML
  e dados pessoais não são trivialmente reversíveis.
- **Riscos:** exclusão pode destruir contexto/auditoria; arquivamento indefinido pode reter
  dados além da finalidade.
- **Responsável pela aprovação:** coordenação da ONG e responsável por privacidade/dados.
- **Status:** pendente.
- **Evidência da aprovação:** nenhuma; não presumir archive ou delete.
- **Impacto:** constraints e lifecycle de Animal/AnimalImage/AdoptionRequest, endpoint,
  autorização e auditoria; tarefas 2.1/2.3/2.4, I3 e I5.
- **Escopo desbloqueado se aprovada:** especificar a operação e restrições de referência em
  modelo/OpenAPI; não autoriza migration destrutiva nem exclusão real.

### ONG-04 — Ciclo de vida e transições da adoção

- **Assunto:** estados de solicitação, significado de cada estado, transições, retirada,
  contato/entrevista, aprovação e conclusão.
- **Opções possíveis:** `PENDING/ACCEPTED/REJECTED` como observados; etapas intermediárias
  comprovadas pela ONG; cancelamento/retirada; aprovação distinta de adoção concluída.
- **Recomendação técnica:** descrever estados com significado operacional e matriz explícita
  de transições; não equiparar aceite à adoção concluída sem confirmação. Incluir somente
  etapas usadas pela equipe.
- **Justificativa:** validação transacional, indicadores, mensagens e histórico dependem do
  processo real.
- **Riscos:** status ambíguos podem comunicar decisão incorreta ao candidato e corromper
  métricas/histórico; alterações retroativas complicam dados.
- **Responsável pela aprovação:** coordenação de adoções da ONG.
- **Status:** pendente.
- **Evidência da aprovação:** nenhuma; status do mock não é ciclo aprovado.
- **Impacto:** AdoptionRequest, transições/API, histórico, UI e auditoria; tarefas
  2.1/2.3/2.4, I8 e I9.
- **Escopo desbloqueado se aprovada:** documentar o lifecycle e suas transições na capability,
  modelo e OpenAPI; intake e gestão seguem bloqueados até seus incrementos.

### ONG-05 — Dados pessoais, finalidade, transparência e retenção

- **Assunto:** campos coletados, necessidade, finalidade, base legal, aviso, acesso, direitos
  dos titulares e períodos de retenção/exclusão/anonimização.
- **Opções possíveis:** nome e um canal de retorno; e-mail e telefone; mensagem opcional
  limitada; outros campos somente com finalidade demonstrada; bases legais e avisos definidos
  com assessoria responsável.
- **Recomendação técnica:** minimização; não exigir e-mail e telefone cumulativamente sem
  necessidade documentada; não adicionar endereço, documentos ou dados familiares por
  inferência; definir prazo e procedimento por categoria/status, incluindo cópias de backup.
  A ONG e a assessoria decidem finalidade/base legal/transparência, não o agente.
- **Justificativa:** a API e modelo precisam de finalidade por campo e regras de acesso e
  retenção; validação técnica não substitui decisão jurídica/operacional.
- **Riscos:** coleta excessiva, retenção indefinida, divulgação, logs ou backups sem política
  causam dano a titulares e risco regulatório.
- **Responsável pela aprovação:** representante da ONG responsável pelo tratamento, com
  encarregado/assessoria de privacidade ou jurídica quando aplicável.
- **Status:** pendente.
- **Evidência da aprovação:** nenhuma; campos do protótipo não são autorização de coleta.
- **Impacto:** todos os campos PII, schemas/request/response, permissões, logs, retenção e
  solicitações de titulares; tarefas 2.1/2.3/2.4, I8–I10 e I11.
- **Escopo desbloqueado se aprovada:** definir somente coleta, finalidade, transparência,
  acesso e retenção confirmados para atualizar modelo/contrato; habilitar intake depende de
  implementação e testes posteriores.

### ONG-06 — Imagens: formatos, limites, armazenamento e moderação

- **Assunto:** tipos de arquivo, tamanho/dimensões, quantidade, armazenamento, acesso,
  metadados, retenção, moderação e custo aceitável.
- **Opções possíveis:** object storage privado; storage gerenciado; filesystem operado;
  BLOB no MySQL; URL externa (não presumir como upload validado).
- **Recomendação técnica:** comparar storage isolado com BLOB; validar bytes e decodificação
  no servidor, allowlist, limites, nome opaco e remoção de EXIF conforme formato. Definir
  política de publicação e órfãs antes de habilitar upload.
- **Justificativa:** bytes de imagem têm perfil de volume e risco diferente de metadados
  relacionais; extensão/MIME do cliente e preview local não provam segurança nem persistência.
- **Riscos:** custo e dependência de fornecedor, arquivo malicioso, abuso de recurso, URL
  exposta, dados de localização em EXIF e órfãs.
- **Responsável pela aprovação:** coordenação da ONG para operação, custos e publicação;
  Tech Lead/Infra/AppSec aprovam desenho técnico e controles.
- **Status:** pendente.
- **Evidência da aprovação:** nenhuma; provider, formatos e quotas não definidos.
- **Impacto:** AnimalImage, fronteira de upload OpenAPI, storage, CORS se aplicável, retenção
  e UI; tarefas 2.1/2.3/2.4 e I6.
- **Escopo desbloqueado se aprovada:** especificar formatos/limites e fronteira do upload no
  contrato; storage/upload continuam aguardando I5/I6 e validação de segurança.

### ONG-07 — Contato, encaminhamento, confirmação e histórico

- **Assunto:** destino do formulário, persistência ou entrega por provedor, campos, texto de
  confirmação, responsável de resposta e retenção.
- **Opções possíveis:** fila/registro persistido; encaminhamento por e-mail; serviço externo;
  não habilitar formulário até existir destino operacional.
- **Recomendação técnica:** confirmar somente o que o destinatário realmente aceitou
  (recebido/registrado não equivale a lido/respondido); minimizar conteúdo em logs e escolher
  retenção compatível com a finalidade.
- **Justificativa:** o protótipo apresenta sucesso sem envio; o contrato não pode prometer
  entrega ou prazo não comprovados.
- **Riscos:** mensagem perdida, PII em provider/backup, custo e dependência externa, falsa
  expectativa de resposta.
- **Responsável pela aprovação:** responsável de atendimento da ONG e responsável por
  privacidade; mantenedor técnico aprova integração.
- **Status:** pendente.
- **Evidência da aprovação:** nenhuma; entrega/persistência são explicitamente pendentes.
- **Impacto:** ContactMessage condicional, POST e resposta OpenAPI, configuração de provider,
  logs e retention; tarefas 2.1/2.3/2.4 e I10.
- **Escopo desbloqueado se aprovada:** definir o destino e o texto de confirmação para
  contrato; não envia mensagem nem configura provider.

### ONG-08 — Escopo, acesso e retenção de auditoria

- **Assunto:** eventos a registrar, acesso, finalidade e retenção de trilhas administrativas.
- **Opções possíveis:** autenticações e falhas; mutações e transições; leituras/exportações
  de PII quando necessárias; histórico ampliado; retenção definida por classe.
- **Recomendação técnica:** registrar actor, ação, recurso, timestamp e resultado mínimos;
  separar trilha de auditoria de logs de aplicação; não copiar senhas, tokens, payloads ou PII
  integral; limitar acesso e definir prazo.
- **Justificativa:** investigar operações requer evidência, mas logging excessivo aumenta
  exposição e retenção de dados pessoais.
- **Riscos:** ausência de trilha reduz responsabilização; excesso de eventos ou retenção
  amplia superfície de vazamento e custo.
- **Responsável pela aprovação:** direção/coordenação da ONG e responsável por privacidade;
  AppSec define controles técnicos.
- **Status:** pendente.
- **Evidência da aprovação:** nenhuma; evento/retention/access não foram especificados.
- **Impacto:** entidades/eventos de audit, policy de acesso, logs, testes e contratos de
  operações admin; tarefas 2.1/2.3/2.4, I5/I9/I11.
- **Escopo desbloqueado se aprovada:** registrar eventos, acesso e retention mínimos nos
  requisitos e desenho; não cria tabela nem coleta logs reais.

### ONG-09 — Abuso, spam e limites de submissão

- **Assunto:** tolerância a abuso, limites de login e formulários, fricção anti-automação,
  tratamento de repetição e critérios para CAPTCHA/contato.
- **Opções possíveis:** rate limit e caps de payload; honeypot; CAPTCHA adaptativo; confirmação
  de contato; WAF/provedor; combinações monitoradas.
- **Recomendação técnica:** controles server-side em todos os casos, limites de corpo e
  rate-limit, tratamento coerente de retry/idempotência e monitoramento; considerar CAPTCHA
  somente com evidência de abuso e alternativa acessível. Não confiar apenas em validação do
  cliente ou IP não confiável.
- **Justificativa:** protege disponibilidade e evita duplicatas sem excluir usuários
  legítimos nem tratar mitigação visual como controle.
- **Riscos:** bloqueio de usuários legítimos, custo/PII/cookies de CAPTCHA, endereços de proxy
  falsificados e quotas por IP inadequadas.
- **Responsável pela aprovação:** coordenação da ONG para experiência e limites operacionais;
  AppSec/Infra para eficácia e implantação.
- **Status:** pendente.
- **Evidência da aprovação:** nenhuma; limite, política e UX não foram aprovados.
- **Impacto:** limites/429, payloads, idempotência e observabilidade no OpenAPI; configurações
  de ambiente e dados; tarefas 2.1/2.4, I4, I8 e I10.
- **Escopo desbloqueado se aprovada:** especificar políticas/valores autorizados e mapear
  resposta antiabuso; controles ativos só podem ser implementados nos incrementos próprios.

### ONG-10 — Campos de domínio, idade e informação pública

- **Assunto:** significado e formato de espécie, idade, sexo, porte, descrição, personalidade
  e informações médicas; campos visíveis ao público/admin e limites de texto.
- **Opções possíveis:** preservar campos atuais com limites; normalizar idade aproximada em
  faixa/unidade; revisar vocabulário de espécie/porte/sexo; tornar dados médicos privados ou
  publicar subconjunto aprovado.
- **Recomendação técnica:** modelar apenas valores que a equipe consegue manter com
  consistência; separar DTO administrativo e público e excluir informação interna/medical
  por padrão até autorização expressa; definir limites de entrada após requisitos de conteúdo.
- **Justificativa:** strings do protótipo não têm semântica nem limite, e campos médicos
  podem ser dados sensíveis/contextuais.
- **Riscos:** apresentação enganosa de idade, enum incompatível com a operação, exposição de
  informação interna e abuso de payload.
- **Responsável pela aprovação:** responsável por cadastro/saúde animal da ONG e
  coordenação de adoções; AppSec revisa fronteiras de saída.
- **Status:** pendente.
- **Evidência da aprovação:** nenhuma; campos do mock são observados, não domínio final.
- **Impacto:** data model, DTOs públicos/admin, filtros, validação e OpenAPI; tarefas
  2.1/2.3/2.4 e I5/I7.
- **Escopo desbloqueado se aprovada:** incluir campos e visibilidade aprovados nos contratos;
  campos controversos ou sem finalidade permanecem excluídos/bloqueados.

### ONG-11 — Métricas, conteúdo institucional e destinos de ações públicas

- **Assunto:** fonte e validade de estatísticas, horários/alegações, canais externos e
  destinação de ações institucionais.
- **Opções possíveis:** publicar com fonte, responsável e atualização; remover ou rotular
  conteúdo sem fonte; links somente para destinos verificados e aprovados.
- **Recomendação técnica:** não apresentar números ou serviços como fatos atuais sem fonte e
  responsável; não dar affordance de botão a conteúdo sem destino real.
- **Justificativa:** conteúdo incorreto ou CTA sem destino cria falsa expectativa e risco à
  confiança da ONG.
- **Riscos:** informação desatualizada, redirecionamento para canal errado e expansão
  silenciosa de escopo para doações/voluntariado.
- **Responsável pela aprovação:** comunicação/direção da ONG.
- **Status:** pendente.
- **Evidência da aprovação:** nenhuma; conteúdo atualmente observado no diagnóstico não é
  validação institucional.
- **Impacto:** capability `public-experience`, conteúdo, links e critérios de teste; tarefas
  2.1/2.5 e I7. Não cria requisito comercial novo.
- **Escopo desbloqueado se aprovada:** associar conteúdo/destinos validados a requisitos e
  critérios de aceite; não cria fluxos de doação, voluntariado ou serviços adicionais.

## Bloqueios explícitos de requisitos de negócio

Não houve resposta da responsável pela ONG nesta execução. Os itens abaixo permanecem
**pendentes de decisão e bloqueados**, e os valores observados no protótipo não podem ser
implementados como regras definitivas. A coluna “excluído do contrato implementável” delimita
o que não pode ser tratado como aprovado; os requisitos de segurança/resultado geral das
capabilities continuam sendo metas, não autorização para escolher valores.

| Decisão | Requisitos OpenSpec afetados | Excluído do contrato implementável até aprovação |
|---|---|---|
| ONG-01 | `admin-authentication`: provisionamento, perfis e permissões; `animal-management` e `adoption-management`: escopo de acesso administrativo | Identidades, cadastro/provisionamento de contas, papéis, matriz de permissões e acesso por recurso. |
| ONG-02 | `public-animal-catalog`: elegibilidade, estados e publicação; `animal-management`: status/visibilidade; `adoption-requests`: animal elegível | Enum/status do mock, regra de publicação, elegibilidade e efeitos públicos/CTA. |
| ONG-03 | `animal-management`: remoção/ciclo de vida e referências | Delete físico/lógico, archive, retenção de imagens e efeito em solicitações/histórico. |
| ONG-04 | `adoption-requests`: estado inicial; `adoption-management`: transições persistidas | Estados e transições definitivos, significado de aceite/recusa, retirada, entrevista e conclusão. |
| ONG-05 | `adoption-requests`: campos, finalidade e acesso; `contact-messages`: campos/destino; `adoption-management`: PII e direitos | Campos PII, obrigatoriedade, finalidade/base legal/aviso, retenção, exclusão/anonimização e solicitação de titular. |
| ONG-06 | `animal-management`: upload e publicação de imagem | Formatos, limites, dimensões, quantidade, storage, moderação, retenção e URLs publicáveis. |
| ONG-07 | `contact-messages`: processamento, aceite e falha | Persistência ou e-mail, destinatário, texto de confirmação, prazo de resposta e retenção. |
| ONG-08 | `adoption-management`: auditoria e privacidade; `animal-management`: operações auditadas | Eventos de auditoria, acesso e retenção; não registrar payloads/PII integral como default. |
| ONG-09 | `admin-authentication`: abuso de login; `adoption-requests` e `contact-messages`: abuso público | Quotas numéricas, política de duplicidade/retry, CAPTCHA/mitigação e efeitos de bloqueio. |
| ONG-10 | `animal-management`: campos/validação; `public-animal-catalog`: DTO público e filtros | Vocabulário, idade, sexo, porte, limites e visibilidade de descrição, personalidade e dados médicos. |
| ONG-11 | `public-experience`: conteúdo, links e ações; home/indicadores observados | Estatísticas, alegações atuais, horários, destinos externos e ações de doação/voluntariado. |

## Checklist de aprovação e gates do I1

As caixas refletem a evidência documental desta revisão. Um item de negócio pode continuar
bloqueado se a decisão não foi tomada; o bloqueio e os requisitos afetados permanecem fora do
contrato implementável.

| Tarefa OpenSpec | Gate e evidência exigida | Responsável(is) | O que fica desbloqueado após aprovação/registro | Estado |
|---|---|---|---|---|
| **2.1** | Registrar ONG-01–ONG-11 como aprovados ou explicitamente bloqueados, com funções responsáveis, evidência disponível, impacto e requisitos excluídos. Nenhuma resposta da ONG foi inventada. | Representantes da ONG por domínio e responsável de privacidade/jurídico conforme aplicável. | Somente requisitos sem dependência da ONG podem seguir; todos os itens da tabela acima permanecem fora do contrato implementável. | [x] Concluída documentalmente: 11 decisões continuam pendentes e os requisitos bloqueados foram mapeados; respostas não recebidas. |
| **2.2** | Consolidar decisões técnicas expressamente autorizadas, registrar evidência/limites, revalidar compatibilidade do Boot 4.1.2 antes do I2 e manter autenticação/topologia/provider e validação OpenAPI com estado correto. | Tech Lead/arquitetura; mantenedores backend/CI/DB; AppSec e Infra conforme tema. | Baseline documental parcial para I2/I3; desenho final de auth/proxy permanece bloqueado pela topologia e AppSec. | [ ] Parcial: tecnologias aprovadas registradas; auth/topologia e Redocly ainda aguardam decisão própria. |
| **2.3** | Separar invariantes técnicas aprovadas de entidade/campos candidatos; cada campo pendente deve indicar finalidade/visibilidade/validação/retention como bloqueados e ficar fora do contrato implementável. | Tech Lead/API owner, ONG e privacy/AppSec para PII. | Apenas estrutura conceitual e invariantes técnicas podem orientar trabalho; nenhuma entidade/field de negócio libera migrations. | [ ] Parcial: modelo revisado e candidato excluído da implementação; decisões ONG impedem modelo final de domínio. |
| **2.4** | Separar operações públicas/admin; não atribuir protocolo de auth; usar Problem Details RFC 9457, explicitar códigos/validação genéricos e bloquear schemas/valores não aprovados; validar OpenAPI 3.0.3 com ferramenta versionada candidata. | API owner/Tech Lead, AppSec e mantenedor do CI; responsáveis ONG para domínio. | Contrato documental para validação/planejamento, com operações bloqueadas; nenhuma implementação autorizada por ele. | [x] Concluída documentalmente; `pnpm.cmd --package=@redocly/cli@2.72.0 dlx redocly lint --extends=spec specs/contracts/openapi.yaml` passou. Aprovação para uso no CI ainda pendente. |
| **2.5** | Para todo ID do inventário, registrar capability/requisito, endpoint ou N/A, persistência ou N/A, teste e status/bloqueio. | Tech Lead/QA e donos de capability; ONG para decisões funcionais. | Matriz completa delimita escopo; não autoriza por si só I2–I11. | [x] Concluída documentalmente em `docs/diagnostics/I1-INTERACTION-TRACEABILITY.md`; 42 IDs mapeados; validação de cobertura realizada. |

### Ordem recomendada para fechar I1

1. 2.1 está concluída documentalmente ao explicitar os onze bloqueios; respostas da ONG
   continuam necessárias antes de implementar requisitos dependentes.
2. 2.2 permanece parcial até decisão de autenticação/topologia e aprovação de TEC-07 para CI;
   confirmar Spring Boot 4.1.2 e runtime antes de I2.
3. 2.3 permanece parcial: campos e regras de negócio estão fora do modelo implementável; a
   finalização depende das decisões ONG correspondentes.
4. 2.4 e 2.5 estão concluídas documentalmente com OpenAPI válido e matriz completa, sem
   aprovar as operações bloqueadas.
5. A validação OpenSpec estrita e as revisões de links/consistência/security continuam como
   evidências requeridas antes de declarar o I1 encerrado.

Esta execução conclui 2.1, 2.4 e 2.5 apenas no escopo documental. 2.2 e 2.3 seguem parciais;
portanto, o I1 não está integralmente concluído e nenhuma implementação I2 ou funcional foi
iniciada.

## Sequência segura para integração do I0

O PR #1 e o workflow `Quality checks` (run 40626776841) foram registrados como integrados à
`main` no commit `8bb42b58deee54b02d3c0f592d783e148ee3e56c` em verificação anterior. As refs
locais desta sessão permanecem na branch de trabalho e não foram sincronizadas nem
modificadas; não houve push, merge ou alteração de configuração GitHub nesta execução. A
proteção da branch não é presumida.
