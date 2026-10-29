# ADR-005 — Escopo simplificado de catálogo e manifestação de interesse

**Status:** Aceito para o escopo de negócio do primeiro incremento.
**Data:** 2026-10-29
**Evidência:** respostas da responsável da ONG comunicadas pelo mantenedor, registradas em
[`I1-approval-register.md`](I1-approval-register.md).

## Contexto

O protótipo atual mistura catálogo, formulário de interesse, painel administrativo com CRUD,
transições de status de solicitação, formulário de contato e conteúdo institucional. A ONG
respondeu que o SAAL será essencialmente um catálogo de animais com manifestação de interesse;
a avaliação da adoção será manual, sem workflow complexo. Também informou que apenas uma pessoa
administrará o sistema e que não precisa de histórico administrativo detalhado.

## Decisão

1. O escopo funcional aprovado é **catálogo de animais + manifestação de interesse**.
2. Animais têm exatamente dois estados: **Disponível para adoção** (`AVAILABLE`) e **Adotado**
   (`ADOPTED`). Adotados permanecem cadastrados e identificados.
3. Cada animal tem **1 a 3 fotografias**.
4. A manifestação de interesse coleta **nome, WhatsApp, cidade e e-mail**.
5. A ONG contata o interessado pelo **WhatsApp** e avalia a adoção **manualmente**.
6. Não há workflow de aprovação nem transições de status de solicitação no sistema.
7. A gestão administrativa de manifestações é **somente leitura**; não há histórico
   administrativo detalhado.
8. Um único administrador opera o sistema; não há papéis diferenciados.
9. WhatsApp e telefone são os canais de contato prioritários. O terceiro canal permanece
   pendente porque a pergunta original não está disponível no repositório.
10. Exclusão/arquivamento de animais, formulário de contato geral, métricas institucionais e
    conteúdo sem fonte ficam fora do primeiro incremento.

## Consequências

- O contrato OpenAPI não deve expor transições de status de solicitação.
- O painel administrativo de solicitações não deve oferecer aceitar/recusar como fluxo
  aprovado.
- O intake não deve persistir o campo de mensagem do protótipo.
- A quantidade de fotos pode ser validada no modelo e no contrato; formato, tamanho, storage,
  EXIF e retenção continuam pendentes.
- Autenticação, autorização server-side, validação, proteção de PII, rate limiting básico e
  logs mínimos de segurança continuam obrigatórios.
- Nenhuma migration, backend ou alteração de UI é autorizada por este ADR.

## Pendências que este ADR não resolve

- Identidade/provisionamento/sessão do administrador (ONG-01, TEC-04/05).
- Publicação/visibilidade e eventual retorno de `ADOPTED` para `AVAILABLE` (ONG-02).
- Exclusão/arquivamento de animais não adotados (ONG-03).
- Obrigatoriedade, finalidade, base legal, aviso, retenção e acesso dos dados pessoais
  (ONG-05).
- Formatos, limites, storage e moderação de imagens (ONG-06).
- Destino e processamento do formulário de contato geral (ONG-07).
- Escopo e retenção de logs mínimos de segurança (ONG-08).
- Limites e política antiabuso (ONG-09).
- Demais campos do animal e sua visibilidade (ONG-10).
- Terceiro canal de contato, métricas e conteúdo institucional (ONG-11).

## Alternativas consideradas

- **Manter o workflow de solicitação do protótipo:** rejeitado pela resposta 8, que dispensa
  workflow complexo e define avaliação manual.
- **Manter histórico administrativo detalhado:** rejeitado pela resposta 7.
- **Excluir animais adotados:** rejeitado pela resposta 2, que determina que permaneçam
  cadastrados e identificados.
- **Manter o formulário de contato geral no primeiro incremento:** adiado por falta de decisão
  sobre destino, retenção e finalidade; os canais públicos de WhatsApp e telefone permanecem.
