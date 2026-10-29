# Modelo de dados — fronteira entre decisões e propostas

**Estado:** revisão documental I1 atualizada em 2026-10-29 com as respostas da responsável da
ONG. Não é schema, migration nem autorização para coletar ou persistir dados. O estado atual
continua sendo frontend de protótipo com mocks e memória.

## Decisões técnicas aprovadas

- MySQL 8 é o banco futuro, acessado exclusivamente pela API Java/Spring Boot.
- Spring Data JPA e Bean Validation são as tecnologias escolhidas; DTOs devem ser separados
  das entidades persistidas.
- Usar migrations versionadas Flyway e testes futuros com Testcontainers/MySQL 8.
- Aplicar validação autoritativa no servidor, menor privilégio, minimização de dados,
  integridade relacional e respostas sem informação sensível.

Esses itens aprovam tecnologias e princípios, não entidades concretas, nomes/tipos/constraints
de colunas nem semântica de negócio. Não há migrações ou banco implementados.

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
- **AdoptionRequest:** a manifestação de interesse coleta nome, WhatsApp, cidade e e-mail e
  referencia o animal. O campo de mensagem do protótipo não foi aprovado. A avaliação é manual
  e não há workflow de aprovação nem transições de status aprovadas.
- **Administrator:** apenas uma pessoa administra o sistema; não há papéis diferenciados.
  Identidade, provisionamento, revogação, recuperação e sessão continuam pendentes.
- **ContactMessage:** permanece condicional e fora do primeiro incremento. A ONG aprovou três
  opções de contato, priorizando WhatsApp e telefone; o terceiro canal não foi fixado. Os canais
  são links, não persistência de mensagem.
- **Histórico administrativo:** não é requisito detalhado. Logs mínimos de segurança continuam
  necessários, com escopo e retenção pendentes.

## Inventário conceitual — aprovado versus bloqueado

As capacidades OpenSpec justificam estudar os conceitos Animal, AnimalImage, AdoptionRequest e
Administrator. ContactMessage só existe como alternativa condicional. A tabela separa o que já
pode orientar o contrato do que permanece **fora do modelo implementável**.

| Conceito/campo candidato | Estado da decisão | Obrigatoriedade, visibilidade, validação, retenção e relação |
|---|---|---|
| Animal: `id` | Técnico, formato pendente | Formato, origem, visibilidade e constraint não aprovados; não é regra de negócio. |
| Animal: `status` | Aprovado em parte (ONG-02) | Exatamente `AVAILABLE` e `ADOPTED`; publicação/visibilidade e eventual retorno a disponível pendentes. |
| Animal: `name`, `species`, `age`, `size`, `sex`, `description`, `personality` | Pendente (ONG-10) | Sem semântica, limite, obrigatoriedade ou DTO público/admin aprovados; `DOG/CAT`, porte/sexo e idade continuam provisórios. |
| Animal: `medicalInfo` | Pendente (ONG-05/ONG-10) | Finalidade, sensibilidade e visibilidade não aprovadas; excluído de DTO público por padrão. |
| Animal: `createdAt`, `updatedAt` | Técnico, finalidade pendente | Timestamp de servidor é requisito técnico a detalhar; retenção e acesso pendentes. |
| AnimalImage: quantidade | Aprovado (ONG-06) | Mínimo 1 e máximo 3 fotografias por animal. |
| AnimalImage: `id`, `animalId`, `url`, `position`, metadados | Pendente (ONG-03/ONG-06) | Relação, formato, limites, visibilidade, storage, ordenação, metadados, EXIF e retenção bloqueados; não persistir URL/preview local como upload validado. |
| AdoptionRequest: `id`, `animalId` | Referência técnica; ciclo pendente (ONG-02/ONG-04) | Formato/FK e validade no momento do envio ainda precisam de definição técnica. |
| AdoptionRequest: `name`, `whatsapp`, `city`, `email` | Aprovado para coleta (ONG-05) | Campos aprovados; obrigatoriedade, finalidade/base legal, aviso, validação/limites, visibilidade, acesso e retenção pendentes. |
| AdoptionRequest: `message` | Não aprovado (ONG-05) | Não deve ser persistido como requisito; o protótipo contém o campo, mas ele não foi confirmado. |
| AdoptionRequest: `status` (`PENDING/ACCEPTED/REJECTED`) | Não aprovado (ONG-04) | Não há workflow de aprovação nem transições aprovadas; a avaliação é manual e externa ao sistema. |
| AdoptionRequest: `createdAt` | Técnico, finalidade pendente (ONG-08) | Timestamp autoritativo/finalidade/retenção pendentes; não confiar em timestamp do cliente. |
| Administrator: identificador/login, `passwordHash`, ativo, timestamps | Parcial (ONG-01) | Um único administrador, sem papéis; identidade, provisionamento, campos, lifecycle, sessão e logs mínimos pendentes. |
| ContactMessage: nome, e-mail, assunto, mensagem, timestamps | Pendente/fora do MVP (ONG-05/ONG-07/ONG-09) | Entidade condicional; finalidade, destino, campos, aceite, acesso, retenção e limites não aprovados. |

## Bloqueios e limites do contrato

1. Nenhum campo de PII ou dado potencialmente médico pode ser coletado ou exposto além do que
   foi aprovado. Nome, WhatsApp, cidade e e-mail são aprovados para coleta, mas finalidade,
   retenção e acesso continuam pendentes.
2. Separar conceitualmente consultas públicas e administrativas; a lista de campos públicos
   não pode ser inferida do mock. A consulta administrativa exige autorização server-side,
   mesmo com um único administrador.
3. Não fixar enums de animal além de `AVAILABLE`/`ADOPTED`, nem regras de publicação,
   transições de solicitação, delete/archive, duplicidade, retenção ou constraints de domínio
   até registrar as decisões correspondentes.
4. Vínculos conceituais Animal–AnimalImage e Animal–AdoptionRequest não autorizam FK/schema de
   produção, pois formato, storage, ciclo de vida e exclusão ainda estão pendentes.
5. Validação de transporte/estrutura pode ser definida sem valores de negócio; limites
   numéricos de texto, arquivo, paginação e taxa dependem de aprovação/risco operacional.
6. Não há entidade de histórico administrativo detalhado no escopo aprovado. Logs mínimos de
   segurança devem evitar payloads e PII integral.

## Evidência e próximos desbloqueios

As pendências por decisão estão em
[`I1-approval-register.md`](../decisions/I1-approval-register.md) e a separação de
operações/status em [`openapi.yaml`](openapi.yaml). O modelo de negócio ainda não pode ser
finalizado: ONG-07 e ONG-09 seguem pendentes e as demais decisões têm elementos em aberto. O
próximo incremento pode preparar build, health check, autenticação, validação e migrations sem
inventar schema ou dados; a criação de tabelas de domínio continua condicionada às decisões
restantes.
