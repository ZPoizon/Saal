# Spec Delta

## Purpose

Permite que visitantes encontrem animais realmente disponíveis, consultem informações
consistentes e iniciem ações usando dados publicados pelo serviço SAAL.

## ADDED Requirements

### Requirement: Catálogo público apresenta animais disponíveis

O catálogo MUST apresentar somente animais elegíveis e publicados conforme o modelo de
status/visibilidade aprovado e combinar busca por nome sem distinção entre maiúsculas/minúsculas
com filtro de espécie. Os enums do protótipo são observados, não uma decisão final de domínio.

#### Scenario: Filtrar catálogo por nome e espécie
- **WHEN** o visitante informa parte de um nome e seleciona uma espécie
- **THEN** o catálogo exibe somente animais disponíveis que atendam aos dois filtros e atualiza a contagem

#### Scenario: Nenhum resultado
- **WHEN** os filtros não correspondem a animal disponível
- **THEN** o catálogo informa ausência de resultados e oferece limpar os filtros

### Requirement: Detalhe reflete o animal publicado

O detalhe MUST exibir somente dados públicos aprovados retornados pelo serviço, disponibilizar
a galeria ordenada e distinguir os estados de disponibilidade aprovados.

#### Scenario: Animal indisponível para adoção
- **WHEN** o estado aprovado do animal indicar que não pode receber manifestações de interesse
- **THEN** o sistema não oferece o fluxo de manifestação de interesse

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
