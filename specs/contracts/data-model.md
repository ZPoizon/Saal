# Modelo de dados

Este modelo separa o protótipo atual do alvo persistente. Campos não confirmados estão
marcados como decisão pendente.

## Animal

| Campo | Tipo | Obrigatório | Estado/observação |
|---|---|---:|---|
| id | string | sim | Atual usa timestamp textual; formato futuro pendente |
| name | string | sim | Implementado |
| species | `DOG` ou `CAT` | sim | Implementado como `dog`/`cat` |
| age | string | sim | Texto livre atual; normalização pendente |
| size | `SMALL`, `MEDIUM`, `LARGE` | sim | Implementado em PT-BR |
| sex | `MALE`, `FEMALE` | sim | Implementado em PT-BR |
| status | `AVAILABLE`, `TREATMENT`, `ADOPTED` | sim | Implementado |
| description | string | sim | Implementado |
| personality | string[] | não | Implementado |
| medicalInfo | string | não | Implementado |
| images | AnimalImage[] | não | URLs/Base64 no protótipo |
| createdAt/updatedAt | datetime | futuro | Não implementado |

## AnimalImage

`id`, `animalId`, `url`, `position` e metadados técnicos. Limites, formatos, acessibilidade
e storage são `PENDENTE DE DECISÃO`.

## AdoptionRequest

| Campo | Tipo | Obrigatório | Estado/observação |
|---|---|---:|---|
| id | string | sim | Gerado no cliente atual |
| animalId | string | sim | Implementado |
| applicantName | string | sim | Implementado |
| email | string | sim | Implementado |
| phone | string | sim | Implementado |
| message | string | não | Implementado |
| status | `PENDING`, `ACCEPTED`, `REJECTED` | sim | Protótipo atual |
| createdAt | datetime | sim | Gerado no cliente atual |

O significado operacional de aceitar/rejeitar, histórico, contato, entrevista e conclusão da
adoção permanece `PENDENTE DE DECISÃO`.

## Administrator

Modelo futuro: `id`, identificador de login/e-mail, `passwordHash`, estado, permissões,
`createdAt`, `updatedAt` e `lastLoginAt`. Campos exatos e perfis são `PENDENTE DE DECISÃO`.
As credenciais demonstrativas atuais não são dados válidos de produção.

## ContactMessage

O formulário atual contém nome, e-mail, assunto e mensagem, mas apenas simula sucesso.
Persistência versus envio direto por e-mail e política de retenção são `PENDENTE DE DECISÃO`.
