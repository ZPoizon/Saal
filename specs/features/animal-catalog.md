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

- O catálogo público MUST exibir somente animais com estado `AVAILABLE` (“Disponível para
  adoção”). Os estados aprovados são `AVAILABLE` e `ADOPTED`; adotados permanecem cadastrados,
  mas não são oferecidos para adoção (ONG-02/ONG-03, parciais).
- A busca por nome ignora diferença entre maiúsculas e minúsculas.
- O filtro de espécie existente no protótipo aceita todos, cachorro ou gato; o vocabulário
  definitivo depende de ONG-10.
- Busca e espécie são aplicadas em conjunto.
- Publicação/rascunho, visibilidade pública de adotados, paginação e ordenação:
  `PENDENTE DE DECISÃO`.

## 6. Fluxo principal

1. Visitante abre `/animais`.
2. Sistema lista os animais disponíveis em cards responsivos.
3. Visitante pesquisa por nome e/ou escolhe uma espécie.
4. Sistema atualiza resultados e contador imediatamente.
5. Visitante abre o detalhe de um animal.

## 7. Fluxos alternativos

- Sem resultados: exibir estado vazio e permitir limpar filtros.
- Falha futura da API: exibir erro recuperável; apresentação ainda não implementada.

## 8. Critérios de aceitação

- **Dado** um conjunto com animais de diferentes status, **quando** o catálogo abrir,
  **então** somente os disponíveis serão exibidos.
- **Dado** um nome parcial, **quando** o visitante pesquisar, **então** a busca ignorará caixa.
- **Dado** busca e espécie, **quando** ambos forem definidos, **então** só resultados que
  atendam aos dois critérios serão exibidos.
- **Dado** nenhum resultado, **quando** os filtros forem aplicados, **então** o estado vazio
  e a ação de limpar filtros serão exibidos.

## 9. Dados necessários

Decisão aprovada: `Animal.status` (`AVAILABLE`/`ADOPTED`) e 1–3 fotografias. Nome, espécie,
idade, sexo, porte, descrição, imagem principal e demais campos públicos continuam
`PENDENTE DE DECISÃO` (ONG-10); não inferir o DTO público do protótipo.

## 10. Contratos de API relacionados

Planejado: `GET /animals?species=&search=`. O servidor MUST filtrar `AVAILABLE`
independentemente de parâmetro do cliente. Não implementado.

## 11. Validações

Normalizar busca sem alterar o texto digitado; aceitar apenas espécies conhecidas quando o
vocabulário for aprovado por ONG-10. O cliente não pode solicitar estados diferentes de
`AVAILABLE` no catálogo público.

## 12. Requisitos de segurança

Endpoint futuro é público e somente leitura; limitar parâmetros e volume de resposta.

## 13. Cenários de teste

- lista apenas disponíveis;
- busca com caixa e texto parcial;
- filtro por cachorro/gato;
- combinação de filtros;
- estado vazio e limpeza;
- abertura do detalhe correto.

## 14. Definição de pronto

Critérios automatizados e manuais aprovados, estados loading/erro/vazio tratados após API,
typecheck/build válidos e spec atualizada sem regressão visual.

## 15. Estado atual

**Protótipo.** Interface e filtros funcionam com dados estáticos. Não há API, loading,
erro remoto, paginação nem persistência.
