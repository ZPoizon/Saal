# Registro de decisões e aprovações — I1

**Change:** `saal-functional-readiness`
**Estado deste registro:** decisões técnicas expressamente autorizadas, respostas parciais da
ONG, recomendações condicionais e bloqueios pendentes. As respostas da ONG registradas em
2026-10-29 não aprovam automaticamente os temas que não foram respondidos.
**Última revisão:** 2026-10-29

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

## Respostas da responsável da ONG — 2026-10-29

**Proveniência:** respostas da responsável da ONG comunicadas pelo mantenedor. Esta é a
evidência disponível; não há ata nominal, assinatura ou documento externo versionado. O
registro abaixo limita cada aprovação ao texto efetivamente respondido e mantém pendente o que
a resposta não cobriu.

| Resposta | Conteúdo registrado | Decisões ONG relacionadas | Efeito no escopo |
|---|---|---|---|
| 1 | Apenas uma pessoa administrará o sistema. | ONG-01 | Parcial: elimina a necessidade de papéis diferenciados; identidade nominal, ciclo de vida e recuperação continuam pendentes. O mecanismo técnico de sessão/topologia foi aprovado separadamente em TEC-04/05. |
| 2 | Os animais terão os estados “Disponível para adoção” e “Adotado”; adotados permanecem cadastrados e identificados como adotados. | ONG-02, ONG-03, ONG-10 | Parcial: vocabulário de dois estados aprovado e retenção do adotado aprovada; publicação/visibilidade, transições e demais campos continuam pendentes. |
| 3 | Ao receber uma manifestação de interesse, a ONG entra em contato pelo WhatsApp e avalia manualmente a possibilidade de adoção. | ONG-04, ONG-07 | Parcial: avaliação manual e contato por WhatsApp aprovados; não há workflow de aprovação no sistema; destino do formulário de contato geral continua pendente. |
| 4 | O formulário do interessado deverá coletar nome, WhatsApp, cidade e e-mail. | ONG-05 | Parcial: campos de coleta aprovados; obrigatoriedade individual, finalidade, base legal, aviso, retenção, acesso e limites continuam pendentes. O campo de mensagem do protótipo não foi aprovado. |
| 5 | Cada animal deverá possuir no mínimo uma e no máximo três fotografias. | ONG-06 | Parcial: quantidade 1–3 aprovada; formatos, tamanho, storage, moderação, EXIF e retenção continuam pendentes. |
| 6 | Manter as três opções de contato consultadas, priorizando WhatsApp e telefone. | ONG-11, ONG-07 | Parcial: WhatsApp e telefone são prioritários; o terceiro canal não foi fixado porque a pergunta original não está disponível no repositório. O processamento do formulário de contato geral continua pendente. |
| 7 | A ONG não necessita de histórico administrativo detalhado. | ONG-08 | Parcial: histórico administrativo detalhado não é requisito; logs mínimos de segurança e sua retenção/acesso continuam obrigatórios e pendentes de detalhamento. |
| 8 | O SAAL será essencialmente um catálogo de animais com manifestação de interesse; a avaliação da adoção será manual, sem workflow complexo de aprovação. | ONG-04, escopo geral | Aprovado no escopo: catálogo + manifestação de interesse; sem workflow complexo. A gestão administrativa de solicitações fica limitada a consulta; não há transições de status aprovadas. |

### Síntese dos estados

- **Aprovadas integralmente:** nenhuma das onze decisões foi respondida em todos os seus
  elementos.
- **Parcialmente aprovadas:** ONG-01, ONG-02, ONG-03, ONG-04, ONG-05, ONG-06, ONG-08, ONG-10 e
  ONG-11.
- **Pendentes:** ONG-07 e ONG-09.
- **Fora do escopo aprovado para o primeiro incremento:** transições de status de solicitação,
  histórico administrativo detalhado, exclusão/arquivamento de animais, gestão de papéis e
  formulário de contato geral como serviço persistido. Esses itens só podem retornar com
  decisão e análise de impacto.

### Pendências que continuam bloqueando implementação

| Decisão | O que ainda falta decidir |
|---|---|
| ONG-01 | Identidade nominal ou conta compartilhada, lifecycle e recuperação de acesso. A conta única por configuração e a sessão same-site são decisões técnicas limitadas em TEC-04/05, não resolvem a política de identidade da ONG. |
| ONG-02 | Publicação/visibilidade, existência de rascunho, regra de retorno de “Adotado” para “Disponível” e visibilidade pública de animais adotados. |
| ONG-03 | Exclusão/arquivamento de animais não adotados, retenção de imagens e referências. |
| ONG-04 | Se alguma informação de estado da manifestação será persistida; duplicidade, retirada e prazo de resposta. Não há workflow de aprovação. |
| ONG-05 | Obrigatoriedade, finalidade/base legal, aviso de privacidade, retenção, exclusão/anonimização, acesso e limites de validação. |
| ONG-06 | Formatos, tamanho/dimensões, storage, acesso, moderação, EXIF e retenção. |
| ONG-07 | Destino, persistência/encaminhamento, campos, confirmação e retenção do formulário de contato geral. |
| ONG-08 | Escopo, acesso e retenção de logs mínimos de segurança, sem histórico administrativo detalhado. |
| ONG-09 | Limites de abuso, rate limit, idempotência, CAPTCHA e tratamento de repetição. |
| ONG-10 | Campos do animal além de estado e quantidade de fotos, vocabulário, visibilidade, limites e informação médica. |
| ONG-11 | Terceiro canal de contato, conteúdo institucional, métricas, horários e destinos externos. |

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
| Autenticação | Sessão server-side, SPA/API same-site via proxy, CSRF, CORS estrito, cookie seguro e sessão ociosa de 15 minutos | Aprovado pelo responsável técnico em 2026-10-29 para implementação de instância única; detalhes, limites e restrições em ADR-006. Não resolve identidade nominal, recuperação, hosting nem operação de produção. |
| Limite de login | 10 falhas por IP em 10 minutos; bloqueio temporário de 15 minutos | Aprovado pelo responsável técnico em 2026-10-29 somente para autenticação administrativa; não define limites de formulários públicos (ONG-09). |
| Validação OpenAPI | Redocly CLI 2.72.0 selecionado como alternativa candidata para validação documental | Compatibilidade verificada contra o contrato OpenAPI 3.0.3 nesta tarefa; seleção de ferramenta/versão para CI fica proposta até aprovação do API owner/mantenedor de CI. |

As autorizações de 2026-10-28 continuam limitadas a documentação e planejamento. As decisões
específicas de autenticação aprovadas em 2026-10-29 autorizam somente a implementação descrita
em `ADR-006`; não autorizam migrations, cadastro de contas, configuração de hosting ou deploy.

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
- **Decisão aprovada:** sessão server-side via `HttpSession`, com identificador regenerado no
  login, expiração após 15 minutos de inatividade e invalidação no logout. Provisionar somente
  um administrador por username e hash BCrypt fornecidos fora do repositório; não há cadastro
  público nem papéis diferenciados.
- **Justificativa:** permite invalidação efetiva no logout e reduz exposição de credenciais
  a JavaScript; o risco de CSRF é tratado explicitamente quando cookies são enviados
  automaticamente.
- **Riscos/limites:** sessão fica em memória de uma única instância; reinício invalida sessões
  e múltiplas réplicas não são suportadas. Recuperação/rotação de credencial e hosting de
  produção não foram aprovados. `SameSite` não substitui proteção CSRF.
- **Responsável pela aprovação:** responsável técnico que solicitou a implementação.
- **Status:** aprovada com escopo limitado em 2026-10-29; consultar `ADR-006`.
- **Evidência:** autorização explícita na solicitação de autenticação. O `bearerAuth`/JWT e
  `AuthResult.accessToken` antigos eram placeholders e não constituem decisão.
- **Impacto:** ADR-002, OpenAPI, autorização server-side, configuração operacional e tarefas
  I4 (5.1–5.5). Identidade nominal e ciclo de vida continuam pendentes por ONG-01.
- **Escopo desbloqueado:** implementação técnica da autenticação do único administrador; não
  autoriza CRUD administrativo, persistência de contas ou deploy.

### TEC-05 — Topologia, origens, cookies, CSRF e CORS

- **Assunto:** relação de origem/site do frontend e API e defesas de browser.
- **Decisão aprovada:** servir frontend e API no mesmo site via proxy; usar CSRF com token em
  header, allowlist explícita de origens CORS, cookie `HttpOnly`, `SameSite=Lax` e `Secure`
  habilitado por padrão. O proxy Vite `/api` é apenas configuração de desenvolvimento.
- **Justificativa:** reduz complexidade de cookies/CORS e dependência de cookies cross-site,
  preservando controles explícitos de origem e CSRF.
- **Riscos/limites:** domínio, proxy de produção, TLS, origens finais e infraestrutura não
  foram escolhidos. Não confiar em `X-Forwarded-For` sem proxy confiável configurado; CORS não
  autentica chamadas diretas à API. Sites distintos/cookies third-party não estão aprovados.
- **Responsável pela aprovação:** responsável técnico que solicitou a implementação.
- **Status:** aprovada para desenho/implementação em 2026-10-29; produção permanece pendente.
- **Evidência:** autorização explícita na solicitação de autenticação.
- **Impacto:** ADR-006, OpenAPI, configurações de cookie/CSRF/CORS e testes I4.
- **Escopo desbloqueado:** topologia same-site via proxy para browser; não aprova hosting,
  domínio, proxy de produção ou operação com múltiplas réplicas.

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

### TEC-12 — Limite de tentativas de autenticação

- **Assunto:** mitigação de força bruta no login administrativo.
- **Decisão aprovada:** após 10 falhas do mesmo IP em uma janela móvel de 10 minutos, bloquear
  novas tentativas por 15 minutos e informar `Retry-After`.
- **Limites:** aplica-se somente ao login administrativo; quotas de submissões públicas e
  demais medidas antiabuso continuam pendentes por ONG-09. O contador reside no processo e
  usa `remoteAddr`; implantação atrás de proxy requer desenho confiável de endereço do cliente.
- **Status:** aprovada pelo responsável técnico em 2026-10-29 para esta etapa.
- **Evidência:** autorização explícita na solicitação de autenticação.
- **Impacto:** `ADR-006`, `LoginAttemptLimiter` e testes de integração; não define política de
  CAPTCHA, duplicidade ou rate limiting para formulários públicos.

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
- **Status:** parcialmente aprovada.
- **Decisão registrada:** apenas uma pessoa administrará o sistema; não são necessários papéis
  diferenciados. A aprovação não define se a conta será nominal ou compartilhada, nem como
  será provisionada, revogada ou recuperada.
- **Evidência da aprovação:** resposta 1 da responsável da ONG, 2026-10-29, comunicada pelo
  mantenedor; proveniência registrada na seção “Respostas da responsável da ONG”.
- **Pendente:** identidade, provisionamento, revogação, recuperação de acesso, mecanismo de
  sessão e topologia. A autorização server-side continua obrigatória mesmo com um único
  administrador.
- **Impacto:** requisito/capability `admin-authentication`, entidade Administrator,
  autorização server-side por operação, OpenAPI admin, logs mínimos de segurança e tarefas
  2.1/2.3/2.4; gate obrigatório antes de I4.
- **Escopo desbloqueado:** especificar um único ator administrativo sem matriz de papéis;
  identidade e sessão ainda dependem de decisão própria.

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
- **Status:** parcialmente aprovada.
- **Decisão registrada:** os animais terão exatamente dois estados: “Disponível para adoção”
  (`AVAILABLE`) e “Adotado” (`ADOPTED`). Animais adotados permanecem cadastrados e
  identificados como adotados. O estado `TREATMENT` do protótipo não foi aprovado.
- **Evidência da aprovação:** resposta 2 da responsável da ONG, 2026-10-29, comunicada pelo
  mantenedor.
- **Pendente:** publicação/visibilidade, existência de rascunho, visibilidade pública de
  animais adotados e eventual retorno de “Adotado” para “Disponível”.
- **Impacto:** Animal, campos públicos, filtros, OpenAPI catálogo/admin, critérios de
  elegibilidade e tarefas 2.1/2.3/2.4; I5/I7/I8 podem usar os dois estados, mas publicação e
  campos continuam bloqueados por ONG-10.
- **Escopo desbloqueado:** usar somente `AVAILABLE` e `ADOPTED` no modelo/contrato e impedir
  manifestação de interesse para `ADOPTED`; não inicia CRUD nem catálogo implementado.

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
- **Status:** parcialmente aprovada.
- **Decisão registrada:** animais adotados permanecem cadastrados e identificados; a adoção
  não autoriza remover o registro.
- **Evidência da aprovação:** resposta 2 da responsável da ONG, 2026-10-29, comunicada pelo
  mantenedor.
- **Pendente:** exclusão/arquivamento de animais não adotados, retenção de imagens e efeito
  sobre referências. Exclusão/arquivamento fica fora do primeiro incremento.
- **Impacto:** constraints e lifecycle de Animal/AnimalImage/AdoptionRequest, endpoint,
  autorização e logs mínimos; tarefas 2.1/2.3/2.4, I3 e I5.
- **Escopo desbloqueado:** registrar que `ADOPTED` é retido; não autoriza delete/archive nem
  migration destrutiva.

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
- **Status:** parcialmente aprovada.
- **Decisão registrada:** a avaliação da adoção é manual e feita pelos responsáveis da ONG;
  não haverá workflow complexo de aprovação nem múltiplos estados de solicitação. O contato
  inicial ocorre pelo WhatsApp informado no formulário.
- **Evidência da aprovação:** respostas 3 e 8 da responsável da ONG, 2026-10-29, comunicadas
  pelo mantenedor.
- **Pendente:** se alguma informação de estado da manifestação será persistida, duplicidade,
  retirada e prazo de resposta. Os estados `PENDING/ACCEPTED/REJECTED` do protótipo não foram
  aprovados.
- **Impacto:** AdoptionRequest, API de intake, consulta administrativa somente leitura,
  histórico (não detalhado) e tarefas 2.1/2.3/2.4, I8 e I9. Transições de status ficam fora
  do escopo.
- **Escopo desbloqueado:** modelar a manifestação como registro recebido, sem máquina de
  estados de aprovação; intake e consulta seguem bloqueados por PII/antiabuso e seus
  incrementos.

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
- **Status:** parcialmente aprovada.
- **Decisão registrada:** o formulário do interessado coletará nome, WhatsApp, cidade e
  e-mail. O campo de mensagem do protótipo não foi aprovado e não deve ser persistido como
  requisito.
- **Evidência da aprovação:** resposta 4 da responsável da ONG, 2026-10-29, comunicada pelo
  mantenedor.
- **Pendente:** obrigatoriedade individual, finalidade/base legal, aviso de privacidade,
  retenção, exclusão/anonimização, acesso, limites de validação e tratamento de titulares.
  A coleta aprovada não dispensa esses controles.
- **Impacto:** campos PII, schemas/request/response, permissões, logs, retenção e solicitações
  de titulares; tarefas 2.1/2.3/2.4, I8–I10 e I11.
- **Escopo desbloqueado:** usar somente os quatro campos aprovados no modelo/contrato de
  intake; habilitar coleta real continua condicionado a privacidade, retenção e antiabuso.

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
- **Status:** parcialmente aprovada.
- **Decisão registrada:** cada animal deve possuir no mínimo uma e no máximo três fotografias.
- **Evidência da aprovação:** resposta 5 da responsável da ONG, 2026-10-29, comunicada pelo
  mantenedor.
- **Pendente:** formatos, tamanho/dimensões, storage, acesso, metadados/EXIF, moderação,
  retenção e custo aceitável.
- **Impacto:** AnimalImage, fronteira de upload OpenAPI, storage, CORS se aplicável, retenção
  e UI; tarefas 2.1/2.3/2.4 e I6.
- **Escopo desbloqueado:** validar quantidade 1–3 no modelo/contrato; storage/upload continuam
  aguardando I5/I6 e validação de segurança.

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
- **Evidência da aprovação:** nenhuma. As respostas 3 e 6 tratam do contato da ONG com o
  interessado e dos canais públicos, não do processamento do formulário de contato geral.
- **Pendente:** destino, persistência/encaminhamento, campos, texto de confirmação, prazo e
  retenção. O formulário de contato geral fica fora do primeiro incremento.
- **Impacto:** ContactMessage condicional, POST e resposta OpenAPI, configuração de provider,
  logs e retenção; tarefas 2.1/2.3/2.4 e I10.
- **Escopo desbloqueado:** manter os canais públicos como links; nenhum envio ou provider é
  autorizado.

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
- **Status:** parcialmente aprovada.
- **Decisão registrada:** a ONG não necessita de histórico administrativo detalhado. Não será
  exigida trilha de negócio por mutação, transição ou leitura de PII.
- **Evidência da aprovação:** resposta 7 da responsável da ONG, 2026-10-29, comunicada pelo
  mantenedor.
- **Pendente:** escopo, acesso e retenção de logs mínimos de segurança. Esses logs continuam
  necessários independentemente da simplificação do histórico administrativo.
- **Impacto:** logs de segurança, policy de acesso, testes e contratos de operações admin;
  tarefas 2.1/2.3/2.4, I5/I9/I11. Entidades de histórico detalhado ficam fora do escopo.
- **Escopo desbloqueado:** remover requisito de histórico administrativo detalhado; manter
  somente logging mínimo de segurança a detalhar.

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
- **Evidência da aprovação:** nenhuma; a resposta 8 não define limites, política de
  duplicidade ou tratamento antiabuso.
- **Impacto:** limites/429, payloads, idempotência e observabilidade no OpenAPI; configurações
  de ambiente e dados; tarefas 2.1/2.4, I4, I8 e I10.
- **Escopo desbloqueado:** controles básicos de segurança continuam obrigatórios; valores,
  política e UX antiabuso permanecem pendentes.

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
- **Status:** parcialmente aprovada.
- **Decisão registrada:** o vocabulário de estado fica limitado a “Disponível para adoção” e
  “Adotado”; cada animal tem 1–3 fotografias.
- **Evidência da aprovação:** respostas 2 e 5 da responsável da ONG, 2026-10-29, comunicadas
  pelo mantenedor.
- **Pendente:** demais campos do animal, vocabulário de espécie/sexo/porte, idade,
  descrição, personalidade, informação médica, visibilidade, limites e DTOs público/admin.
- **Impacto:** data model, DTOs públicos/admin, filtros, validação e OpenAPI; tarefas
  2.1/2.3/2.4 e I5/I7.
- **Escopo desbloqueado:** incluir somente estado e quantidade de fotos aprovados; campos
  controversos ou sem finalidade permanecem excluídos/bloqueados.

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
- **Status:** parcialmente aprovada.
- **Decisão registrada:** manter as três opções de contato consultadas, priorizando WhatsApp
  e telefone. A resposta não nomeia o terceiro canal e a pergunta original não está
  disponível no repositório; o terceiro canal não será fixado por inferência.
- **Evidência da aprovação:** resposta 6 da responsável da ONG, 2026-10-29, comunicada pelo
  mantenedor.
- **Pendente:** terceiro canal, conteúdo institucional, métricas, horários, alegações e
  destinos externos. Não criar fluxos de doação, voluntariado ou serviços adicionais.
- **Impacto:** capability `public-experience`, conteúdo, links e critérios de teste; tarefas
  2.1/2.5 e I7. Não cria requisito comercial novo.
- **Escopo desbloqueado:** manter WhatsApp e telefone como canais prioritários e preservar
  espaço para o terceiro canal sem definir seu destino.

## Bloqueios explícitos de requisitos de negócio

As respostas da responsável da ONG foram recebidas em 2026-10-29 e registradas acima. Elas
**não encerram** todas as decisões: os itens abaixo mostram o que já pode entrar no contrato e
o que continua bloqueado. Valores observados no protótipo não se tornam regras definitivas por
terem sido mantidos na interface. Os requisitos de segurança/resultado geral das capabilities
continuam sendo metas, não autorização para escolher valores.

| Decisão | Requisitos OpenSpec afetados | Aprovado ou parcialmente aprovado | Excluído do contrato implementável até nova aprovação |
|---|---|---|---|
| ONG-01 | `admin-authentication`: provisionamento e permissões; `animal-management` e `adoption-management`: acesso administrativo | Um único administrador; sem papéis diferenciados. | Identidade nominal, lifecycle e recuperação; a abordagem técnica inicial não aprova a política de contas da ONG. |
| ONG-02 | `public-animal-catalog`: estados e publicação; `animal-management`: status; `adoption-requests`: animal elegível | Estados `AVAILABLE` e `ADOPTED`; adotados permanecem cadastrados e identificados. | Publicação/visibilidade, rascunho, retorno a disponível e visibilidade pública de adotados. |
| ONG-03 | `animal-management`: remoção/ciclo de vida e referências | Adotados não são removidos pela adoção. | Delete físico/lógico, archive, retenção de imagens e efeito em referências de animais não adotados. |
| ONG-04 | `adoption-requests`: intake; `adoption-management`: consulta | Avaliação manual, contato por WhatsApp e ausência de workflow complexo. | Estados de solicitação, transições, aceite/recusa no sistema, retirada, entrevista e conclusão. |
| ONG-05 | `adoption-requests`: campos; `contact-messages`: campos/destino; `adoption-management`: PII e direitos | Coleta de nome, WhatsApp, cidade e e-mail. | Obrigatoriedade, finalidade/base legal/aviso, retenção, exclusão/anonimização, acesso e limites. |
| ONG-06 | `animal-management`: upload e publicação de imagem | Quantidade de 1 a 3 fotografias por animal. | Formatos, tamanho/dimensões, storage, moderação, EXIF, retenção e URLs publicáveis. |
| ONG-07 | `contact-messages`: processamento, aceite e falha | Canais públicos de WhatsApp e telefone priorizados; formulário de contato geral fora do primeiro incremento. | Persistência ou e-mail, destinatário, texto de confirmação, prazo de resposta e retenção. |
| ONG-08 | `adoption-management`: privacidade; `animal-management`: logs | Sem histórico administrativo detalhado. | Escopo, acesso e retenção de logs mínimos de segurança; não registrar payloads/PII integral. |
| ONG-09 | `admin-authentication`: abuso de login; `adoption-requests` e `contact-messages`: abuso público | Controles básicos de segurança continuam obrigatórios. | Quotas numéricas, política de duplicidade/retry, CAPTCHA/mitigação e efeitos de bloqueio. |
| ONG-10 | `animal-management`: campos/validação; `public-animal-catalog`: DTO público e filtros | Estado com dois valores e quantidade de fotos. | Demais campos, vocabulário, idade, sexo, porte, limites e visibilidade de descrição, personalidade e dados médicos. |
| ONG-11 | `public-experience`: conteúdo, links e ações; home/indicadores observados | WhatsApp e telefone prioritários; manter três opções de contato. | Terceiro canal, estatísticas, alegações atuais, horários, destinos externos e ações de doação/voluntariado. |

## Checklist de aprovação e gates do I1

As caixas refletem a evidência documental desta revisão. Um item de negócio pode continuar
bloqueado se a decisão não foi tomada; o bloqueio e os requisitos afetados permanecem fora do
contrato implementável.

| Tarefa OpenSpec | Gate e evidência exigida | Responsável(is) | O que fica desbloqueado após aprovação/registro | Estado |
|---|---|---|---|---|
| **2.1** | Registrar ONG-01–ONG-11 como aprovados ou explicitamente bloqueados, com funções responsáveis, evidência disponível, impacto e requisitos excluídos. Nenhuma resposta da ONG foi inventada. | Representantes da ONG por domínio e responsável de privacidade/jurídico conforme aplicável. | Somente requisitos efetivamente respondidos podem seguir; os itens pendentes permanecem fora do contrato implementável. | [x] Concluída documentalmente em 2026-10-29: respostas registradas com proveniência; 9 decisões parciais e 2 pendentes; nenhuma aprovação integral. |
| **2.2** | Consolidar decisões técnicas expressamente autorizadas, registrar evidência/limites, revalidar compatibilidade do Boot 4.1.2 antes do I2 e manter autenticação/topologia/provider e validação OpenAPI com estado correto. | Tech Lead/arquitetura; mantenedores backend/CI/DB; AppSec e Infra conforme tema. | Baseline documental parcial para I2/I3; desenho final de auth/proxy permanece bloqueado pela topologia e AppSec. | [ ] Parcial: tecnologias aprovadas registradas; auth/topologia e Redocly ainda aguardam decisão própria. |
| **2.3** | Separar invariantes técnicas aprovadas de entidade/campos candidatos; cada campo pendente deve indicar finalidade/visibilidade/validação/retention como bloqueados e ficar fora do contrato implementável. | Tech Lead/API owner, ONG e privacy/AppSec para PII. | Apenas estrutura conceitual e invariantes técnicas podem orientar trabalho; nenhuma entidade/field de negócio libera migrations. | [x] Concluída documentalmente: modelo atualizado com dois estados, 1–3 fotos, quatro campos de intake e um administrador; campos pendentes continuam fora do contrato. |
| **2.4** | Separar operações públicas/admin; não atribuir protocolo de auth; usar Problem Details RFC 9457, explicitar códigos/validação genéricos e bloquear schemas/valores não aprovados; validar OpenAPI 3.0.3 com ferramenta versionada candidata. | API owner/Tech Lead, AppSec e mantenedor do CI; responsáveis ONG para domínio. | Contrato documental para validação/planejamento, com operações bloqueadas; nenhuma implementação autorizada por ele. | [x] Concluída documentalmente; contrato reconciliado com o escopo simplificado e validado com Redocly CLI 2.72.0. Aprovação para uso no CI ainda pendente. |
| **2.5** | Para todo ID do inventário, registrar capability/requisito, endpoint ou N/A, persistência ou N/A, teste e status/bloqueio. | Tech Lead/QA e donos de capability; ONG para decisões funcionais. | Matriz completa delimita escopo; não autoriza por si só I2–I11. | [x] Concluída documentalmente em `docs/diagnostics/I1-INTERACTION-TRACEABILITY.md`; 42 IDs mapeados e revisados para o escopo simplificado. |

### Ordem recomendada para fechar I1

1. 2.1 foi atualizada com as respostas da ONG; as pendências remanescentes continuam
   bloqueando os requisitos dependentes.
2. 2.2 permanece parcial até decisão de autenticação/topologia e aprovação de TEC-07 para CI;
   confirmar Spring Boot 4.1.2 e runtime antes de I2.
3. 2.3 foi atualizada no escopo documental: modelo distingue aprovado de pendente; schema e
   migrations continuam bloqueados até o incremento próprio.
4. 2.4 e 2.5 estão concluídas documentalmente com OpenAPI válido e matriz completa, sem
   aprovar as operações bloqueadas.
5. A validação OpenSpec estrita e as revisões de links/consistência/security continuam como
   evidências requeridas antes de declarar o I1 encerrado.

Esta execução conclui 2.1, 2.3, 2.4 e 2.5 apenas no escopo documental. 2.2 segue parcial;
portanto, o I1 não está integralmente concluído e nenhuma implementação I2 ou funcional foi
iniciada.

## Análise de impacto da simplificação

As respostas permitem reduzir escopo sem remover segurança ou proteção de dados:

- **Gestão de solicitações:** passa de transições de status para consulta somente leitura das
  manifestações recebidas. Os botões de aceitar/recusar do protótipo continuam existindo, mas
  não representam fluxo aprovado e não devem ser conectados a API sem nova decisão.
- **Histórico administrativo:** deixa de ser requisito. Logs mínimos de segurança continuam
  necessários; não há autorização para registrar payloads ou PII em excesso.
- **Exclusão/arquivamento de animais:** fica fora do primeiro incremento. Animais adotados são
  retidos; nenhuma operação destrutiva é autorizada.
- **Formulário de contato geral:** fica fora do primeiro incremento. Os canais públicos de
  WhatsApp e telefone são preservados; o terceiro canal permanece indefinido.
- **Papéis administrativos:** não há matriz de papéis; permanece um único administrador. A
  autenticação e a autorização server-side continuam obrigatórias.
- **Intake:** o campo de mensagem do protótipo não foi aprovado; a coleta futura fica limitada
  a nome, WhatsApp, cidade e e-mail, sujeita a privacidade, retenção e antiabuso.

## Sequência segura para integração do I0

Em conferência ao GitHub em 2026-10-28, o PR #1 consta mesclado à `main` no commit
`8bb42b58deee54b02d3c0f592d783e148ee3e56c`; a ref `main` contém o workflow de qualidade.
O run 40626776841 terminou com sucesso no commit do PR. A ref local `origin/main` desta
cópia permanece em `e34e586f06b7e054c88dfce33a228218bc2956ca` e está desatualizada; não foi
sincronizada nesta tarefa. A listagem de branches informa `protected=false` para `main`;
regrasets não foram inspecionados. Não alterar configuração administrativa sem autorização.
