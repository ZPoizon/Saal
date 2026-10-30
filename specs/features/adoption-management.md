# ADMG-001 — Gestão de manifestações de interesse

## 1. Identificador e nome

`ADMG-001` — Consultar manifestações de interesse (somente leitura).

## 2. Objetivo

Permitir que o único administrador consulte interesses recebidos, sem workflow de aprovação
nem histórico administrativo detalhado.

## 3. Atores

Administrador SAAL autenticado.

## 4. Pré-condições

Existem manifestações persistidas e o administrador está autorizado.

## 5. Regras de negócio

- A gestão é somente leitura; o painel não pode aceitar, recusar ou alterar estado.
- Não há workflow de status de solicitação nem transições aprovadas (ONG-04, parcial).
- A avaliação é manual pela ONG, com contato pelo WhatsApp.
- Campos aprovados para consulta: nome, WhatsApp, cidade, e-mail e referência ao animal.
- Filtro por animal, marcação de contato, exportação, resposta e histórico detalhado não
  existem no escopo aprovado.
- Finalidade, retenção, acesso e autorização: `PENDENTE DE DECISÃO` (ONG-05).

## 6. Fluxo principal

1. Administrador abre o painel.
2. Sistema lista manifestações persistidas.
3. Administrador consulta a referência ao animal e os dados aprovados do interessado.
4. Administrador usa os dados para contato manual pelo WhatsApp, fora do sistema.
5. O sistema não altera estado nem registra aprovação/recusa.

## 7. Fluxos alternativos

- Lista vazia: informar ausência de manifestações.
- Falha da API: manter estado anterior e informar erro.
- Dados pessoais expirados: comportamento pendente da política LGPD.
- Não há conflito de edição/transição porque a gestão é somente leitura.

## 8. Critérios de aceitação

- **Dado** administrador autorizado, **quando** abrir a seção, **então** verá manifestações
  persistidas em modo somente leitura.
- **Dado** uma manifestação, **quando** consultada, **então** serão exibidos somente os
  campos aprovados e nenhum estado de aprovação será sugerido.
- **Dado** tentativa de aceitar, recusar ou alterar estado, **quando** solicitada, **então** a
  operação não será oferecida e nada será persistido.
- **Dado** falha do serviço, **quando** consultar, **então** não haverá sucesso falso.
- **Dado** usuário não autorizado, **quando** consultar dados, **então** o acesso será negado.

## 9. Dados necessários

Manifestação (ID e timestamp técnico), referência ao animal, nome, WhatsApp, cidade e e-mail.
Não há status de aprovação nem histórico detalhado. Retenção e acesso pendentes (ONG-05).

## 10. Contratos de API relacionados

Planejado: `GET /admin/adoption-requests`, somente leitura. Não há endpoint de transição de
status no escopo aprovado.

## 11. Validações

ID existente; autorização administrativa; filtros e paginação futuros validados. Não há
status de solicitação nem transição a validar no escopo aprovado.

## 12. Requisitos de segurança

Autorização, menor privilégio, dados pessoais somente para finalidade legítima, logs mínimos
de segurança sem PII desnecessária, retenção/exclusão LGPD, transporte seguro e prevenção de
exportação indevida. Escopo/retenção dos logs pendentes (ONG-08).

## 13. Cenários de teste

- lista vazia/preenchida;
- leitura dos campos aprovados;
- ausência de ações de aprovação/recusa;
- tentativa de transição de status rejeitada ou inexistente;
- 401/403/404/500;
- persistência após recarregar;
- acesso e retenção de dados pessoais.

## 14. Definição de pronto

Consulta somente leitura, persistência/autorização/logs mínimos implementados, testes
automatizados, revisão LGPD, typecheck/build válidos e contrato sincronizado. Não há workflow
de aprovação no escopo.

## 15. Estado atual

**Protótipo parcial.** O painel não oferece transições de status; quando há dados fornecidos,
apresenta ações manuais de WhatsApp, telefone e e-mail. O contexto atual não cria nem armazena
solicitações e retorna uma lista vazia até integração com backend. Não há persistência,
filtros, resposta, exportação ou histórico.
