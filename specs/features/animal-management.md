# ANM-001 — Gestão administrativa de animais

## 1. Identificador e nome

`ANM-001` — Criar, listar, editar e remover animais.

## 2. Objetivo

Permitir que administradores mantenham o catálogo.

## 3. Atores

Administrador SAAL autenticado.

## 4. Pré-condições

No alvo, administrador autenticado e autorizado. No protótipo, login demonstrativo local.

## 5. Regras de negócio

- Campos obrigatórios atuais: nome, espécie, idade, porte, sexo, status e descrição.
- Status: disponível, em tratamento ou adotado.
- Personalidade é separada por vírgulas; informação médica é opcional.
- Imagem aceita URL ou arquivo convertido para Base64 apenas no protótipo.
- Exclusão física versus arquivamento e limites de upload: `PENDENTE DE DECISÃO`.

## 6. Fluxo principal

1. Administrador abre o painel.
2. Visualiza tabela e estatísticas derivadas.
3. Cria ou edita um animal pelo modal.
4. Sistema valida e salva.
5. Lista e estatísticas refletem a mudança.

## 7. Fluxos alternativos

- Cancelar formulário não altera dados.
- Exclusão exige confirmação em duas ações.
- Falha futura da API deve manter estado consistente e informar erro.
- Conflito de edição concorrente: `PENDENTE DE DECISÃO`.

## 8. Critérios de aceitação

- **Dado** administrador autorizado e dados válidos, **quando** cadastrar, **então** o animal
  será persistido e retornado pela API.
- **Dado** animal existente, **quando** editar e salvar, **então** somente os novos dados
  válidos serão persistidos.
- **Dado** intenção de excluir, **quando** cancelar a confirmação, **então** nada será alterado.
- **Dado** falha da API, **quando** uma mutação ocorrer, **então** a interface não indicará
  sucesso nem perderá silenciosamente os dados.

## 9. Dados necessários

`Animal`, imagens, timestamps e, futuramente, metadados de auditoria.

## 10. Contratos de API relacionados

Planejados: `GET/POST /animals`, `GET/PUT/DELETE /animals/{animalId}`.

## 11. Validações

Campos obrigatórios e enums; URL/arquivo, tipo e tamanho de imagem; limites textuais e
sanitização no servidor. Valores exatos pendentes.

## 12. Requisitos de segurança

Autenticação real, autorização, proteção de upload, auditoria, CSRF conforme mecanismo de
sessão, validação server-side e ausência de segredos no navegador.

## 13. Cenários de teste

- criar/editar/cancelar/excluir;
- campos inválidos;
- todos os status;
- upload inválido;
- API 401/403/404/409/500;
- atualização das estatísticas;
- persistência após recarregar.

## 14. Definição de pronto

CRUD persiste no backend, autorização e auditoria validadas, testes de unidade/integração/UI,
typecheck/build válidos, sem regressão visual e spec/OpenAPI sincronizados.

## 15. Estado atual

**Protótipo.** CRUD altera apenas `useState` dentro de `Admin.tsx`; não afeta o catálogo
público e é perdido ao recarregar. Upload Base64 não é enviado a storage.
