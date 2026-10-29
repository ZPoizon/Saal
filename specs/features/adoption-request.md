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

- Campos aprovados para coleta: nome, WhatsApp, cidade e e-mail, além da referência ao animal
  (ONG-05, parcial).
- O campo de mensagem do protótipo não foi aprovado e não deve ser persistido.
- A avaliação é manual pela ONG; o contato é feito pelo WhatsApp. Não há workflow de status
  nem transições de aprovação/recusa (ONG-04, parcial).
- Obrigatoriedade individual, consentimento/base legal, finalidade, aviso de privacidade,
  duplicidade, retenção, acesso e prazo de resposta: `PENDENTE DE DECISÃO`.

## 6. Fluxo principal

1. Sistema mostra o animal selecionado.
2. Visitante informa nome, WhatsApp, cidade e e-mail.
3. Navegador valida formato dos campos conforme decisão de obrigatoriedade.
4. Visitante envia.
5. Sistema registra a manifestação e confirma o recebimento, sem afirmar aprovação da adoção.

## 7. Fluxos alternativos

- Animal inexistente: informar erro e permitir voltar ao catálogo.
- Campos HTML inválidos: impedir envio.
- Falha futura da API: manter dados preenchidos e mostrar erro; não implementado.
- Animal deixa de estar disponível: backend futuro deve rejeitar; código de erro pendente.

## 8. Critérios de aceitação

- **Dado** animal `AVAILABLE` e dados válidos, **quando** enviar, **então** uma manifestação
  será registrada uma única vez e a confirmação de recebimento será exibida.
- **Dado** campo aprovado inválido, **quando** enviar, **então** o navegador impedirá o envio
  e o servidor repetirá a validação.
- **Dado** falha do servidor, **quando** enviar, **então** não haverá confirmação falsa.
- **Dado** animal inexistente ou `ADOPTED`, **quando** abrir o formulário ou enviar,
  **então** haverá estado de erro e nenhum registro será criado.

## 9. Dados necessários

ID/referência do animal; nome, WhatsApp, cidade e e-mail do interessado; ID e timestamp
técnico da manifestação. Não há status de aprovação nem mensagem. Finalidade, retenção e
acesso continuam `PENDENTE DE DECISÃO` (ONG-05).

## 10. Contratos de API relacionados

Planejado: `POST /adoption-requests`. Não implementado.

## 11. Validações

Cliente: formato dos campos aprovados. Servidor futuro: todos os campos, limites de tamanho,
animal existente e `AVAILABLE` e normalização de WhatsApp. Obrigatoriedade e limites são
`PENDENTE DE DECISÃO`; a validação do servidor é autoritativa.

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
