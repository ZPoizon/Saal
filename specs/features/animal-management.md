# ANM-001 — Gestão administrativa de animais

## 1. Identificador e nome

`ANM-001` — Criar, listar e editar animais.

## 2. Objetivo

Permitir que o único administrador mantenha o catálogo.

## 3. Atores

Administrador SAAL autenticado.

## 4. Pré-condições

No alvo, administrador autenticado e autorizado. No protótipo, login demonstrativo local.

## 5. Regras de negócio

- Estados aprovados: `AVAILABLE` (“Disponível para adoção”) e `ADOPTED` (“Adotado”). O estado
  `TREATMENT` do protótipo não foi aprovado.
- Cada animal MUST ter 1–3 fotografias.
- Campos obrigatórios, vocabulário de espécie/sexo/porte, idade, personalidade, informação
  médica, limites e visibilidade pública continuam `PENDENTE DE DECISÃO` (ONG-10).
- Upload: a política definitiva de formatos adicionais, tamanho, moderação e retenção continua
  `PENDENTE DE DECISÃO` (ONG-06). Como decisão técnica provisória (ADR-007), o cliente aceita
  1–3 imagens JPG/PNG/WebP de até 5 MB, aplica orientação EXIF, limita o maior lado a 1600 px,
  converte para JPEG e remove metadados; a API valida os magic bytes e grava o binário em
  `stored_photo`, servido por URL pública imutável. URL/Base64 avulsos não são persistência.
- Exclusão/arquivamento de animais não adotados continua `PENDENTE DE DECISÃO` (ONG-03) no
  modo com API. No protótipo local (ADR-008), a exclusão com confirmação foi habilitada por
  decisão do responsável. Animais adotados permanecem cadastrados.
- O formulário cria e edita apenas `available` e `treatment`. O estado `adopted` nunca é
  escolhido diretamente: ele é gravado pela confirmação de adoção, e a saída exige reversão
  com motivo. Ver `adoption-lifecycle.md` e `ADR-009`.

## 6. Fluxo principal

1. Administrador abre o painel.
2. Visualiza tabela e estatísticas derivadas.
3. Cria ou edita um animal pelo modal.
4. Sistema valida e salva.
5. Lista e estatísticas refletem a mudança.

## 7. Fluxos alternativos

- Cancelar formulário não altera dados.
- No protótipo local (ADR-008), excluir pede confirmação (`window.confirm`); cancelar ou
  falhar não remove dados. No modo com API, exclusão/arquivamento permanece indisponível
  até ONG-03; a interface não deve simular remoção.
- Falha futura da API deve manter estado consistente e informar erro.
- Conflito de edição concorrente: `PENDENTE DE DECISÃO`.

## 8. Critérios de aceitação

- **Dado** administrador autorizado, dados válidos e 1–3 fotos, **quando** cadastrar,
  **então** o animal será persistido e retornado pela API.
- **Dado** animal existente, **quando** editar e salvar, **então** somente os novos dados
  válidos serão persistidos.
- **Dado** zero fotos ou mais de três, **quando** salvar, **então** a operação será rejeitada.
- **Dado** animal `ADOPTED`, **quando** consultado, **então** permanecerá cadastrado e
  identificado como adotado.
- **Dado** exclusão no protótipo local, **quando** confirmada, **então** o animal sai do
  catálogo e das listas; **quando** cancelada ou de id inexistente, **então** nada é
  removido e a falha é informada. No modo com API, a exclusão permanece bloqueada até
  ONG-03.
- **Dado** falha da API, **quando** uma mutação ocorrer, **então** a interface não indicará
  sucesso nem perderá silenciosamente os dados.

## 9. Dados necessários

`Animal`, 1–3 imagens e timestamps técnicos. Não há histórico administrativo detalhado;
campos de domínio e metadados de imagem continuam pendentes (ONG-06/ONG-10).

## 10. Contratos de API relacionados

Implementados: `GET/POST /admin/animals`, `GET/PUT /admin/animals/{animalId}`,
`POST /admin/photos` e `GET /photos/{photoId}`. No modo com API, exclusão/arquivamento fica
fora do escopo até ONG-03 (a API local expõe `deleteAnimal` apenas no protótipo, sem
equivalente HTTP).

## 11. Validações

Estado limitado a `AVAILABLE`/`ADOPTED`; 1–3 fotos. O cliente valida tipo `image/*`, limite
técnico provisório de 5 MB por foto e quantidade antes do envio. Campos obrigatórios,
vocabulário, limites textuais, política definitiva de formato/tamanho, armazenamento e
sanitização continuam pendentes; valores exatos não podem ser inferidos do protótipo.

## 12. Requisitos de segurança

Autenticação real, autorização server-side, proteção de upload, logs mínimos de segurança,
CSRF conforme mecanismo de sessão, validação server-side e ausência de segredos no navegador.
Não há histórico administrativo detalhado; escopo/retenção dos logs pendentes (ONG-08).

## 13. Cenários de teste

- criar/editar/cancelar;
- campos inválidos;
- estados `AVAILABLE`/`ADOPTED`;
- zero, uma e três fotos; rejeição de mais de três;
- animal adotado permanece cadastrado;
- exclusão local com confirmação, cancelamento e id inexistente (404) — modo protótipo;
- tentativa de exclusão/arquivamento não destrutiva (modo com API, até ONG-03);
- upload inválido quando a capability for aprovada;
- API 401/403/404/409/500;
- persistência após recarregar.

## 14. Definição de pronto

Criação/edição persistem no backend, autorização e logs mínimos validados, testes de
unidade/integração/UI, typecheck/build válidos, sem regressão visual e spec/OpenAPI
sincronizados. No modo com API, exclusão/arquivamento permanece fora do primeiro incremento.

## 15. Estado atual

**Protótipo local (ADR-008): CRUD e exclusão com confirmação no navegador.** No modo local,
os serviços de frontend leem/escrevem no `localStorage` (seed de dados de exemplo) e a
exclusão de animais está habilitada por decisão do responsável, com confirmação na UI e
erro 404 para id inexistente; manifestações de interesse anteriores mantêm o nome do animal
removido. No modo com API, o CRUD persiste via API Spring/Flyway e a exclusão definitiva
não existe na API (DELETE retorna 405) nem na interface, enquanto ONG-03 estiver pendente.
A interface permite escolher de 1 a 3 imagens da galeria, validar tipo/tamanho
provisórios, pré-visualizar, remover, substituir e reordenar. No modo local as fotos
normalizadas são embutidas como `data:` URL; no modo com API o envio usa
`/api/v1/admin/photos` (com CSRF e sessão administrativa) e persiste o binário no MySQL, e
a leitura pública ocorre em `/api/v1/photos/{id}`. A política definitiva de imagem e
retenção continua pendente (ONG-06); a decisão técnica provisória está no ADR-007.
