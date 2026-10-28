# Modelo de dados — fronteira entre decisões e propostas

**Estado:** revisão documental I1. Não é schema, migration nem autorização para coletar ou
persistir dados. O estado atual continua sendo frontend de protótipo com mocks e memória.

## Decisões técnicas aprovadas

- MySQL 8 é o banco futuro, acessado exclusivamente pela API Java/Spring Boot.
- Spring Data JPA e Bean Validation são as tecnologias escolhidas; DTOs devem ser separados
  das entidades persistidas.
- Usar migrations versionadas Flyway e testes futuros com Testcontainers/MySQL 8.
- Aplicar validação autoritativa no servidor, menor privilégio, minimização de dados,
  integridade relacional e respostas sem informação sensível.

Esses itens aprovam tecnologias e princípios, não entidades concretas, nomes/tipos/constraints
de colunas nem semântica de negócio. Não há migrações ou banco implementados.

## Inventário conceitual bloqueado

As capacidades OpenSpec justificam estudar os conceitos Animal, AnimalImage,
AdoptionRequest e Administrator. ContactMessage só existe como alternativa condicional. Os
campos listados abaixo são observações do protótipo ou alternativas documentadas; todos
permanecem **fora do modelo implementável** até aprovação da ONG e revisão do contrato.

| Conceito/campo candidato observado | Origem/status | Decisão bloqueadora | Obrigatoriedade, visibilidade, validação, retenção e relação |
|---|---|---|---|
| Animal: `id` | ID gerado localmente no mock | ONG-02/ONG-10 e decisão técnica do formato | Formato, origem, visibilidade, constraint e retenção não aprovados. |
| Animal: `name`, `species`, `age`, `size`, `sex`, `description`, `personality` | Campos/enums do protótipo | ONG-02/ONG-10 | Sem semântica, limite, obrigatoriedade ou DTO público/admin aprovados; `DOG/CAT`, porte/sexo e idade são provisórios. |
| Animal: `status` | `AVAILABLE/TREATMENT/ADOPTED` observados no mock | ONG-02 | Significado, transições, elegibilidade e relação com publicação não aprovados; não implementar enum do mock como domínio. |
| Animal: `medicalInfo` | Campo do protótipo | ONG-05/ONG-10 | Finalidade, sensibilidade e visibilidade não aprovadas; excluído de qualquer DTO público por padrão e do contrato implementável. |
| Animal: `createdAt`, `updatedAt` | Campos futuros sugeridos | ONG-08 e política de auditoria | Origem autoritativa, finalidade e retenção ainda precisam de definição; timestamp de servidor é apenas requisito técnico a detalhar. |
| AnimalImage: `id`, `animalId`, `url`, `position`, metadados | URLs/Base64 locais e modelo conceitual | ONG-03/ONG-06 | Relação, formato, limites, visibilidade, storage, ordenação, metadados, EXIF e retenção bloqueados; não persistir URL/preview local como upload validado. |
| AdoptionRequest: `id`, `animalId` | ID gerado no cliente e referência no mock | ONG-02/ONG-04 | Formato/FK, validade no momento do envio e ciclo de vida não aprovados. |
| AdoptionRequest: `applicantName`, `email`, `phone`, `message` | Formulário/mock | ONG-05 | PII, finalidade, necessidade, obrigatoriedade, validação/limites, visibilidade, base legal e retenção pendentes; não presumir coleta conjunta de e-mail e telefone. |
| AdoptionRequest: `status` (`PENDING/ACCEPTED/REJECTED`) | Enum observado no protótipo | ONG-04 | Estado inicial, significado, transições, histórico e efeitos de comunicação não aprovados. |
| AdoptionRequest: `createdAt` | Criado no cliente no protótipo | ONG-08 | Timestamp autoritativo/finalidade/retenção pendentes; não confiar em timestamp do cliente. |
| Administrator: identificador/login, `passwordHash`, ativo/permissões, timestamps | Esboço de modelo futuro; credenciais atuais são demo insegura | ONG-01 e TEC-04/05 | Identidades, campos, provisionamento, perfis, acesso, lifecycle e auditoria bloqueados. Hash adaptativo e autenticação server-side são controles futuros, não registro de conta. |
| ContactMessage: nome, e-mail, assunto, mensagem, timestamps | Formulário local simulado | ONG-05/ONG-07/ONG-09 | Entidade condicional; finalidade, destino, campos, aceite, acesso, retenção e limites não aprovados. |

## Bloqueios e limites do contrato

1. Nenhum campo de PII ou dado potencialmente médico pode ser coletado ou exposto como
   contrato definitivo.
2. Separar conceitualmente consultas públicas e administrativas; a lista de campos públicos
   não pode ser inferida do mock. A consulta administrativa exige autorização server-side,
   mas identidade e permissões estão pendentes.
3. Não fixar enums, regras de elegibilidade/publicação, transições, archive/delete,
   duplicidade, retenção ou constraints de domínio até registrar as decisões correspondentes.
4. Vínculos conceituais Animal–AnimalImage e Animal–AdoptionRequest não autorizam FK/schema
   de produção, pois ciclo de vida e exclusão ainda estão pendentes.
5. Validação de transporte/estrutura pode ser definida sem valores de negócio; limites
   numéricos de texto, arquivo, paginação e taxa dependem de aprovação/risco operacional.

## Evidência e próximos desbloqueios

As pendências por decisão estão em
[`I1-approval-register.md`](../decisions/I1-approval-register.md) e a separação de
operações/status em [`openapi.yaml`](openapi.yaml). O modelo de negócio somente poderá ser
finalizado após as respostas ONG-01–ONG-10 e revisão técnica dos campos e relações. Enquanto
isso, atividades de infraestrutura sem entidades — como build/bootstrap do serviço e health
check autorizados pelo I2 — não devem inventar schema ou dados.
