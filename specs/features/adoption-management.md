# ADMG-001 — Gestão de solicitações de adoção

## 1. Identificador e nome

`ADMG-001` — Consultar e atualizar solicitações de adoção.

## 2. Objetivo

Permitir que a equipe SAAL acompanhe interesses recebidos.

## 3. Atores

Administrador SAAL autenticado.

## 4. Pré-condições

Existem solicitações persistidas e o administrador está autorizado.

## 5. Regras de negócio

- Estados existentes no protótipo: pendente, aceita e rejeitada.
- O painel pode aceitar ou recusar uma solicitação pendente.
- Filtro por animal, marcação de contato, exportação e resposta ainda não existem.
- Transições permitidas, reversão, histórico, significado de “aceita” e conclusão da adoção:
  `PENDENTE DE DECISÃO`.

## 6. Fluxo principal

1. Administrador abre o painel.
2. Sistema lista solicitações e quantidade pendente.
3. Administrador consulta dados do animal e interessado.
4. Administrador aceita ou recusa uma solicitação pendente.
5. Sistema persiste e apresenta o novo status.

## 7. Fluxos alternativos

- Lista vazia: informar ausência de solicitações.
- Solicitação já alterada por outro administrador: conflito a tratar.
- Falha da API: manter estado anterior e informar erro.
- Dados pessoais expirados: comportamento pendente da política LGPD.

## 8. Critérios de aceitação

- **Dado** administrador autorizado, **quando** abrir a seção, **então** verá solicitações
  persistidas e contagem pendente.
- **Dado** solicitação pendente, **quando** aceitar ou recusar, **então** o novo status será
  validado e persistido.
- **Dado** falha ou conflito, **quando** atualizar status, **então** não haverá sucesso falso.
- **Dado** usuário não autorizado, **quando** consultar dados, **então** o acesso será negado.

## 9. Dados necessários

Solicitação, resumo do animal, contato do interessado, status, timestamps e histórico futuro.

## 10. Contratos de API relacionados

Planejados: `GET /adoption-requests` e
`PATCH /adoption-requests/{requestId}/status`.

## 11. Validações

ID existente; status conhecido; transição permitida; filtros e paginação futuros validados.

## 12. Requisitos de segurança

Autorização, menor privilégio, dados pessoais somente para finalidade legítima, auditoria,
retenção/exclusão LGPD, transporte seguro e prevenção de exportação indevida.

## 13. Cenários de teste

- lista vazia/preenchida;
- aceitar/recusar;
- atualização duplicada e conflito;
- 401/403/404/500;
- contagem pendente;
- persistência após recarregar;
- acesso e retenção de dados pessoais.

## 14. Definição de pronto

Fluxo de negócio decidido, persistência/autorização/auditoria implementadas, testes
automatizados, revisão LGPD, typecheck/build válidos e contrato sincronizado.

## 15. Estado atual

**Protótipo parcial.** Solicitações criadas na sessão aparecem no painel e podem mudar de
status em memória. Não há backend, filtro, resposta, exportação, histórico ou persistência.
