# ADRQ-001 — Solicitação de adoção

## 1. Identificador e nome

`ADRQ-001` — Registrar interesse em adotar.

## 2. Objetivo

Coletar dados de contato de uma pessoa interessada em um animal disponível.

## 3. Atores

Visitante interessado; equipe SAAL como destinatária futura.

## 4. Pré-condições

- Animal existe.
- Animal está disponível.
- Visitante acessou `/interesse/{id}`.

## 5. Regras de negócio

- Nome, e-mail e telefone são obrigatórios; mensagem é opcional.
- Nova solicitação recebe status `pending` no protótipo.
- O processo divulgado prevê contato, entrevista/visita e eventual aprovação.
- Consentimento LGPD, duplicidade, prazo de resposta e elegibilidade:
  `PENDENTE DE DECISÃO`.

## 6. Fluxo principal

1. Sistema mostra o animal selecionado.
2. Visitante informa nome, e-mail, telefone e mensagem opcional.
3. Navegador valida obrigatoriedade e formato de e-mail.
4. Visitante envia.
5. Sistema registra e confirma o interesse.

## 7. Fluxos alternativos

- Animal inexistente: informar erro e permitir voltar ao catálogo.
- Campos HTML inválidos: impedir envio.
- Falha futura da API: manter dados preenchidos e mostrar erro; não implementado.
- Animal deixa de estar disponível: backend futuro deve rejeitar; código de erro pendente.

## 8. Critérios de aceitação

- **Dado** animal disponível e dados válidos, **quando** enviar, **então** uma solicitação
  pendente será criada uma única vez e a confirmação será exibida.
- **Dado** campo obrigatório vazio ou e-mail inválido, **quando** enviar, **então** o
  navegador impedirá o envio.
- **Dado** falha do servidor, **quando** enviar, **então** não haverá confirmação falsa.
- **Dado** animal inexistente, **quando** abrir o formulário, **então** haverá estado de erro.

## 9. Dados necessários

ID/nome/imagem do animal; nome, e-mail, telefone e mensagem do interessado; ID, status e
data da solicitação.

## 10. Contratos de API relacionados

Planejado: `POST /adoption-requests`. Não implementado.

## 11. Validações

Cliente: required e formato de e-mail. Servidor futuro: todos os campos, limites de tamanho,
animal existente/disponível e normalização de telefone. Limites são `PENDENTE DE DECISÃO`.

## 12. Requisitos de segurança

HTTPS, minimização de dados, consentimento/privacidade, rate limiting, proteção anti-spam,
logs sem conteúdo pessoal e autorização para leitura administrativa.

## 13. Cenários de teste

- envio válido;
- obrigatórios ausentes;
- e-mail inválido;
- animal inexistente/não disponível;
- falha e repetição de API;
- preservação dos dados após erro;
- prevenção de confirmação antes da persistência.

## 14. Definição de pronto

Persistência real confirmada, erros tratados, critérios e segurança validados, testes
automatizados, typecheck/build válidos e documentação LGPD aprovada.

## 15. Estado atual

**Protótipo.** O envio espera 1,5 s e grava apenas no Context em memória; recarregar perde
os dados. Não há consentimento, anti-spam, API ou notificação.
