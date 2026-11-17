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
- Os quatro campos são obrigatórios. Nome tem 3–120 caracteres; cidade, 2–120; WhatsApp,
  até 32 caracteres e 10–15 dígitos; e-mail, até 160 caracteres.
- O campo de mensagem do protótipo não foi aprovado e não deve ser persistido.
- A avaliação é manual pela ONG; o contato é feito pelo WhatsApp. Não há workflow de status
  nem transições de aprovação/recusa (ONG-04, parcial).
- Consentimento/base legal, finalidade, aviso de privacidade, duplicidade entre envios,
  retenção, acesso e prazo de resposta: `PENDENTE DE DECISÃO`.

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

Implementado: `POST /animals/{animalId}/interests`; a resposta pública contém somente recibo
mínimo, sem PII. Animal ausente retorna 404 e animal não disponível retorna 409.

## 11. Validações

Cliente e servidor validam todos os campos e limites acima; o servidor verifica
autoritativamente se o animal existe e está `AVAILABLE`. Limites antiabuso: até cinco
registros por IP em dez minutos, com bloqueio por quinze minutos; o controle é em memória e
por instância.

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

**Implementado no worktree.** Formulário React valida e envia os quatro campos à API Spring;
há estados de carregamento, confirmação somente após resposta positiva, tratamento genérico
de erro e trava contra cliques duplicados. Flyway V2 persiste a manifestação associada ao
animal. Não há login do visitante, workflow, mensagens automáticas ou exposição pública de
PII. Finalidade, base legal, aviso de privacidade e retenção continuam pendentes; não operar
com dados reais até sua definição.
