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
- Upload: formatos, tamanho, storage, EXIF, moderação e retenção `PENDENTE DE DECISÃO`
  (ONG-06). URL/Base64 do protótipo não são solução de persistência.
- Exclusão/arquivamento de animais não adotados está fora do primeiro incremento
  (`PENDENTE DE DECISÃO`, ONG-03). Animais adotados permanecem cadastrados.

## 6. Fluxo principal

1. Administrador abre o painel.
2. Visualiza tabela e estatísticas derivadas.
3. Cria ou edita um animal pelo modal.
4. Sistema valida e salva.
5. Lista e estatísticas refletem a mudança.

## 7. Fluxos alternativos

- Cancelar formulário não altera dados.
- Exclusão/arquivamento não está disponível no primeiro incremento; a interface não deve
  simular remoção.
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
- **Dado** tentativa de exclusão/arquivamento, **quando** solicitada antes de ONG-03,
  **então** nada será removido e nenhum sucesso será comunicado.
- **Dado** falha da API, **quando** uma mutação ocorrer, **então** a interface não indicará
  sucesso nem perderá silenciosamente os dados.

## 9. Dados necessários

`Animal`, 1–3 imagens e timestamps técnicos. Não há histórico administrativo detalhado;
campos de domínio e metadados de imagem continuam pendentes (ONG-06/ONG-10).

## 10. Contratos de API relacionados

Planejados: `GET/POST /admin/animals`, `GET/PUT /admin/animals/{animalId}`. Operação de
exclusão/arquivamento fica fora do primeiro incremento até ONG-03.

## 11. Validações

Estado limitado a `AVAILABLE`/`ADOPTED`; 1–3 fotos. Campos obrigatórios, vocabulário,
limites textuais, formato/tamanho de imagem e sanitização continuam pendentes; valores exatos
não podem ser inferidos do protótipo.

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
- tentativa de exclusão/arquivamento não destrutiva;
- upload inválido quando a capability for aprovada;
- API 401/403/404/409/500;
- persistência após recarregar.

## 14. Definição de pronto

Criação/edição persistem no backend, autorização e logs mínimos validados, testes de
unidade/integração/UI, typecheck/build válidos, sem regressão visual e spec/OpenAPI
sincronizados. Exclusão/arquivamento permanece fora do primeiro incremento.

## 15. Estado atual

**Protótipo.** CRUD altera apenas `useState` dentro de `Admin.tsx`; não afeta o catálogo
público e é perdido ao recarregar. Upload Base64 não é enviado a storage.
