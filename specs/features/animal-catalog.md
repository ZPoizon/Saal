# CAT-001 — Catálogo de animais

## 1. Identificador e nome

`CAT-001` — Consultar catálogo público de animais.

## 2. Objetivo

Permitir que visitantes encontrem animais disponíveis para adoção.

## 3. Atores

Visitante.

## 4. Pré-condições

- A aplicação está acessível.
- Existem dados de animais carregados.

## 5. Regras de negócio

- O catálogo público MUST exibir animais com estado `available` primeiro, `treatment` depois
  e `adopted` por último, claramente identificados. Adotados permanecem cadastrados e não são
  oferecidos para adoção (ONG-02/ONG-03, parciais). `treatment` foi acrescentado pelo fluxo de
  ciclo de vida (`ADLC-001`/ADR-009).
- A busca por nome ignora diferença entre maiúsculas e minúsculas.
- O filtro de espécie existente no protótipo aceita todos, cachorro ou gato; o vocabulário
  definitivo depende de ONG-10.
- Filtro de situação com as opções “Todos”, “Disponíveis” e “Adotados”, aplicado em conjunto
  com busca e espécie.
- Publicação/rascunho e paginação: `PENDENTE DE DECISÃO`. A visibilidade pública de
  adotados foi decidida pelo responsável do projeto (solicitação de 2026-11-17): adotados
  aparecem no catálogo identificados como “Adotado”, sem ação de adoção. Após 30 dias da data
  real de adoção, o animal deixa de aparecer mesmo que a limpeza das fotos ainda não tenha
  sido executada; adotados legados sem data continuam visíveis (ADR-009).

## 6. Fluxo principal

1. Visitante abre `/animais`.
2. Sistema lista os animais disponíveis em cards responsivos.
3. Visitante pesquisa por nome e/ou escolhe uma espécie.
4. Sistema atualiza resultados e contador imediatamente.
5. Visitante abre o detalhe de um animal.

## 7. Fluxos alternativos

- Sem resultados: exibir estado vazio e permitir limpar filtros.
- Falha da API: exibir erro recuperável e permitir nova tentativa.

## 8. Critérios de aceitação

- **Dado** um conjunto com animais de diferentes status, **quando** o catálogo abrir,
  **então** os disponíveis serão exibidos primeiro, os em tratamento depois e os adotados por
  último, identificados; adotados com mais de 30 dias não aparecerão.
- **Dado** um nome parcial, **quando** o visitante pesquisar, **então** a busca ignorará caixa.
- **Dado** busca, espécie e situação, **quando** todos forem definidos, **então** só resultados
  que atendam aos três critérios serão exibidos.
- **Dado** nenhum resultado, **quando** os filtros forem aplicados, **então** o estado vazio
  e a ação de limpar filtros serão exibidos.
- **Dado** um animal adotado, **quando** o catálogo exibir o card, **então** nenhuma ação de
  adoção será oferecida e o detalhe informará que o animal já encontrou um lar.

## 9. Dados necessários

Decisão aprovada: `Animal.status` (`AVAILABLE`/`ADOPTED`) e 1–3 fotografias. Nome, espécie,
idade, sexo, porte, descrição, imagem principal e demais campos públicos continuam
`PENDENTE DE DECISÃO` (ONG-10); não inferir o DTO público do protótipo.

## 10. Contratos de API relacionados

Implementado: `GET /animals?species=&search=`. O servidor filtra `AVAILABLE`
independentemente do cliente e a listagem usa dados remotos.

## 11. Validações

Normalizar busca sem alterar o texto digitado; aceitar apenas espécies conhecidas quando o
vocabulário for aprovado por ONG-10. O cliente não pode solicitar estados diferentes de
`AVAILABLE` no catálogo público.

## 12. Requisitos de segurança

Endpoint futuro é público e somente leitura; limitar parâmetros e volume de resposta.

## 13. Cenários de teste

- lista disponíveis primeiro e adotados depois, identificados;
- busca com caixa e texto parcial;
- filtro por cachorro/gato;
- filtro de situação (todos/disponíveis/adotados);
- combinação de filtros;
- estado vazio e limpeza;
- abertura do detalhe correto, inclusive de adotado.

## 14. Definição de pronto

Critérios automatizados e manuais aprovados, estados loading/erro/vazio tratados após API,
typecheck/build válidos e spec atualizada sem regressão visual.

## 15. Estado atual

**Implementado no worktree.** A listagem consulta o Supabase e exibe estados de
carregamento, erro recuperável e vazio. O catálogo exibe disponíveis primeiro e adotados
depois, com filtro de situação; não há paginação.
