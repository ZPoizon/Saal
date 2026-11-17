# Spec Delta

## Purpose

Permite que visitantes encontrem animais disponíveis para adoção, consultem informações
consistentes e iniciem manifestação de interesse usando dados publicados pelo serviço SAAL.
Animais adotados permanecem cadastrados e identificados, mas não são oferecidos para adoção.

## ADDED Requirements

### Requirement: Catálogo público apresenta somente animais disponíveis

O catálogo MUST apresentar somente animais com estado `AVAILABLE` (“Disponível para adoção”).
Os estados aprovados são `AVAILABLE` e `ADOPTED`; não há rascunho nem publicação aprovados. O
catálogo MUST manter a busca por nome sem distinção entre maiúsculas/minúsculas e o filtro de
espécie existente no protótipo, condicionado à definição do vocabulário por ONG-10.

#### Scenario: Filtrar catálogo por nome e espécie
- **WHEN** o visitante informa parte de um nome e seleciona uma espécie
- **THEN** o catálogo exibe somente animais `AVAILABLE` que atendam aos dois filtros e atualiza a contagem

#### Scenario: Nenhum resultado
- **WHEN** os filtros não correspondem a animal `AVAILABLE`
- **THEN** o catálogo informa ausência de resultados e oferece limpar os filtros

#### Scenario: Animal adotado não aparece como disponível
- **WHEN** o animal possui estado `ADOPTED`
- **THEN** o catálogo não o apresenta como disponível para adoção

### Requirement: Detalhe reflete o animal publicado

O detalhe MUST exibir somente dados públicos aprovados retornados pelo serviço, disponibilizar
a galeria de 1–3 fotos e distinguir os dois estados aprovados.

#### Scenario: Animal adotado
- **WHEN** o detalhe de um animal `ADOPTED` for acessível conforme a decisão de visibilidade pública (ONG-02)
- **THEN** o detalhe identifica o animal como adotado e não oferece o fluxo de manifestação de interesse

#### Scenario: Identificador não encontrado
- **WHEN** o serviço não encontrar o identificador solicitado
- **THEN** o detalhe apresenta estado de não encontrado e uma navegação de retorno segura ao catálogo

### Requirement: Ações de detalhe são acessíveis

Controles de galeria e compartilhamento MUST ter nomes acessíveis e resposta adequada a
teclado; a ausência de suporte de compartilhamento não pode deixar uma ação sem resultado.

#### Scenario: Navegar pela galeria por teclado
- **WHEN** uma pessoa usa teclado para selecionar uma miniatura
- **THEN** a imagem principal e a indicação acessível da seleção são atualizadas

#### Scenario: Compartilhamento indisponível
- **WHEN** o navegador não suportar compartilhamento nativo ou a operação falhar
- **THEN** a interface oferece alternativa de compartilhamento/cópia ou mensagem recuperável sem erro não tratado
