# Modelo de dados — fronteira entre decisões e propostas

**Estado:** decisões de negócio registradas em 2026-10-29. O schema executável está em
`backend/src/main/resources/db/migration/V1__create_animal_catalog.sql` e
`V2__create_animal_interest.sql`; isso não resolve finalidade, base legal, acesso ou retenção
dos dados pessoais.

> **Nota de escopo (2026-11-18):** a aplicação deste worktree usa Supabase para autenticação,
> banco e Storage. A feature `ADLC-001` (`specs/features/adoption-lifecycle.md`) e o `ADR-009`
> acrescentam o estado `treatment`, o histórico de adoções e a retenção de fotos por 30 dias,
> substituindo, para esse caminho, as afirmações abaixo sobre "exatamente dois estados" e sobre
> o storage no MySQL. As migrações `003`/`004`/`005` ainda não foram aplicadas remotamente.

## Decisões técnicas aprovadas e implementação atual

- MySQL 8 é acessado exclusivamente pela API Java/Spring Boot; o backend está no worktree.
- Spring Data JPA e Bean Validation são as tecnologias escolhidas; DTOs devem ser separados
  das entidades persistidas.
- Migrations versionadas Flyway V1/V2 e testes com Testcontainers/MySQL 8 estão implementados.
- Aplicar validação autoritativa no servidor, menor privilégio, minimização de dados,
  integridade relacional e respostas sem informação sensível.

Esses itens aprovam tecnologias e princípios. A migration V2 materializa somente os campos
explicitamente pedidos para uma manifestação, vinculada por FK ao animal e sem workflow.

## Decisões de negócio aprovadas ou parciais

**Proveniência:** respostas da responsável da ONG comunicadas pelo mantenedor, 2026-10-29.
Detalhes e pendências estão em [`I1-approval-register.md`](../decisions/I1-approval-register.md)
e no escopo registrado em
[`ADR-005-escopo-catalogo-e-interesse.md`](../decisions/ADR-005-escopo-catalogo-e-interesse.md).

- **Animal:** possui exatamente dois estados, `AVAILABLE` (“Disponível para adoção”) e
  `ADOPTED` (“Adotado”). Animais adotados permanecem cadastrados e identificados como
  adotados. O estado `TREATMENT` do protótipo não foi aprovado.
- **AnimalImage:** cada animal possui no mínimo uma e no máximo três fotografias. Formatos,
  tamanho, storage, EXIF, moderação e retenção continuam pendentes.
- **AdoptionRequest:** a manifestação coleta nome completo, WhatsApp, cidade e e-mail, com
  referência ao animal e timestamp do servidor. O campo de mensagem do protótipo não foi
  aprovado. A avaliação é manual e não há workflow de aprovação nem transições de status.
- **Administrator:** apenas uma pessoa administra o sistema; não há papéis diferenciados.
  Identidade, provisionamento, revogação, recuperação e sessão continuam pendentes.
- **ContactMessage:** permanece condicional e fora do primeiro incremento. A ONG aprovou três
  opções de contato, priorizando WhatsApp e telefone; o terceiro canal não foi fixado. Os canais
  são links, não persistência de mensagem.
- **Histórico administrativo:** não é requisito detalhado. Logs mínimos de segurança continuam
  necessários, com escopo e retenção pendentes.

## Inventário conceitual — aprovado versus bloqueado

As capacidades OpenSpec justificam os conceitos Animal, AnimalImage e AdoptionRequest.
ContactMessage só existe como alternativa condicional. A tabela separa campos aprovados de
decisões de privacidade/negócio ainda pendentes.

| Conceito/campo candidato | Estado da decisão | Obrigatoriedade, visibilidade, validação, retenção e relação |
|---|---|---|
| Animal: `id` | Técnico, formato pendente | Formato, origem, visibilidade e constraint não aprovados; não é regra de negócio. |
| Animal: `status` | Aprovado em parte (ONG-02) | Exatamente `AVAILABLE` e `ADOPTED`; publicação/visibilidade e eventual retorno a disponível pendentes. |
| Animal: `name`, `species`, `age`, `size`, `sex`, `description`, `personality` | Pendente (ONG-10) | Sem semântica, limite, obrigatoriedade ou DTO público/admin aprovados; `DOG/CAT`, porte/sexo e idade continuam provisórios. |
| Animal: `medicalInfo` | Pendente (ONG-05/ONG-10) | Finalidade, sensibilidade e visibilidade não aprovadas; excluído de DTO público por padrão. |
| Animal: `createdAt`, `updatedAt` | Técnico, finalidade pendente | Timestamp de servidor é requisito técnico a detalhar; retenção e acesso pendentes. |
| AnimalImage: quantidade | Aprovado (ONG-06) | Mínimo 1 e máximo 3 fotografias por animal. |
| AnimalImage: `id`, `animalId`, `url`, `position`, metadados | Pendente (ONG-03/ONG-06) | Relação, formato, limites, visibilidade, storage, ordenação, metadados, EXIF e retenção bloqueados; não persistir URL/preview local como upload validado. |
| AdoptionRequest: `id`, `animalId` | Referência técnica implementada | V2 usa ID BIGINT e FK para `animal`; o servidor verifica `AVAILABLE` no envio. |
| AdoptionRequest: `fullName`, `whatsapp`, `city`, `email` | Aprovado para coleta (ONG-05) | Campos obrigatórios no código; finalidade/base legal, aviso, acesso e retenção pendentes. |
| AdoptionRequest: `message` | Não aprovado (ONG-05) | Não deve ser persistido como requisito; o protótipo contém o campo, mas ele não foi confirmado. |
| AdoptionRequest: `status` (`PENDING/ACCEPTED/REJECTED`) | Não aprovado (ONG-04) | Não há workflow de aprovação nem transições aprovadas; a avaliação é manual e externa ao sistema. |
| AdoptionRequest: `createdAt` | Técnico, finalidade pendente (ONG-08) | Timestamp autoritativo/finalidade/retenção pendentes; não confiar em timestamp do cliente. |
| Administrator: identificador/login, `passwordHash`, ativo, timestamps | Parcial (ONG-01) | Um único administrador, sem papéis; identidade, provisionamento, campos, lifecycle, sessão e logs mínimos pendentes. |
| ContactMessage: nome, e-mail, assunto, mensagem, timestamps | Pendente/fora do MVP (ONG-05/ONG-07/ONG-09) | Entidade condicional; finalidade, destino, campos, aceite, acesso, retenção e limites não aprovados. |

## Bloqueios e limites do contrato

1. Nenhum campo de PII ou dado potencialmente médico pode ser coletado ou exposto além do que
   foi aprovado. Nome, WhatsApp, cidade e e-mail são aprovados para coleta, mas finalidade,
   retenção e acesso continuam pendentes.
2. Separar consultas públicas e administrativas; a projeção pública omite informação médica
   e PII. A consulta administrativa exige autorização server-side.
3. Não fixar enums de animal além de `AVAILABLE`/`ADOPTED`, nem regras de publicação,
   transições de solicitação, delete/archive, duplicidade, retenção ou constraints de domínio
   até registrar as decisões correspondentes.
4. V2 cria FK técnica de `animal_interest.animal_id` para `animal.id`, sem exclusão em cascata.
   Isso não constitui aprovação de deploy ou política de retenção.
5. Os limites de texto do intake estão definidos no contrato; limites de arquivos, paginação
   e ajuste operacional da taxa continuam pendentes.
6. Não há entidade de histórico administrativo detalhado no escopo aprovado. Logs mínimos de
   segurança devem evitar payloads e PII integral.

## Evidência e próximos desbloqueios

As pendências por decisão estão em
[`I1-approval-register.md`](../decisions/I1-approval-register.md) e a separação de
operações/status em [`openapi.yaml`](openapi.yaml). Finalidade, base legal e retenção dos
dados pessoais seguem pendentes, e a migration deve ser validada com MySQL real antes de
operação.
