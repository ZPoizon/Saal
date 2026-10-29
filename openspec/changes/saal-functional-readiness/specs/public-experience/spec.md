# Spec Delta

## Purpose

Define o comportamento funcional e acessível da navegação e das superfícies públicas
compartilhadas da SPA, sem transformar conteúdo editorial sem destino aprovado em operação.

## ADDED Requirements

### Requirement: Navegação pública tem destinos reais e semântica coerente

A aplicação MUST fornecer rotas e links navegáveis por teclado, com estado de navegação
identificável e destino previsível. Um elemento interativo MUST corresponder a uma ação;
controles interativos não MUST ser aninhados uns nos outros.

#### Scenario: Visitante ativa link de navegação
- **WHEN** visitante ativa um link de navegação por ponteiro ou teclado
- **THEN** a rota/destino aprovado é aberto, o item ativo é identificável e o foco pode ser acompanhado

#### Scenario: Visitante abre uma rota diretamente
- **WHEN** visitante carrega, atualiza ou retorna diretamente a uma rota interna
- **THEN** a aplicação apresenta a rota correta ou uma página 404 recuperável sem depender de histórico anterior

#### Scenario: Visitante ativa um card de animal
- **WHEN** visitante ativa o card ou sua ação principal
- **THEN** um único alvo semântico abre o detalhe correspondente sem controles interativos aninhados

### Requirement: Conteúdo e ações públicas não simulam serviço

Textos, estatísticas e ações apresentados como funcionais MUST ter fonte, destino e finalidade
aprovados. Superfícies sem ação definida MUST ser apresentadas sem affordance de botão/link.
Links para canais externos MUST usar destinos verificados e tratamento seguro de nova janela.

#### Scenario: Visitante vê estatística ou alegação institucional
- **WHEN** a página pública exibe números, horário, prazo ou afirmação institucional
- **THEN** o conteúdo tem fonte/responsável aprovada e atualização documentada, ou não é apresentado como fato atual

#### Scenario: Visitante aciona compartilhamento em browser incompatível
- **WHEN** o compartilhamento nativo não existe, é cancelado ou falha
- **THEN** a interface oferece alternativa acessível ou informa o resultado sem erro não tratado

#### Scenario: Conteúdo informativo não tem destino aprovado
- **WHEN** um bloco informativo não possui ação aprovada pela ONG
- **THEN** ele não aparenta ser um botão nem apresenta resultado de operação inexistente

### Requirement: Canais de contato usam destinos aprovados

A experiência pública MUST manter as três opções de contato existentes, priorizando WhatsApp e
telefone. O terceiro canal MUST NOT ser fixado até decisão da ONG; a pergunta original sobre
ele não está disponível no repositório. Links externos MUST usar destinos verificados e
tratamento seguro de nova janela.

#### Scenario: Visitante aciona WhatsApp ou telefone
- **WHEN** o visitante seleciona um dos canais prioritários aprovados
- **THEN** a interface abre o destino verificado correspondente sem simular operação interna

#### Scenario: Terceiro canal ainda não definido
- **WHEN** o terceiro canal de contato não possui decisão registrada
- **THEN** a interface não inventa destino nem apresenta o canal como funcional

### Requirement: Experiência pública preserva acessibilidade e adaptação de viewport

As páginas públicas e seus componentes interativos MUST ser operáveis por teclado, expor nome,
papel, estado e erros relevantes a tecnologias assistivas, manter foco visível e adaptar
conteúdo sem perda de ação em telas estreitas ou zoom.

#### Scenario: Visitante navega por teclado e tecnologia assistiva
- **WHEN** visitante percorre menu, filtro, cards, galeria, formulário ou diálogo sem ponteiro
- **THEN** ordem de foco, nome/estado e retorno de foco permitem concluir ou cancelar a ação

#### Scenario: Conteúdo renderizado em viewport pequeno ou ampliado
- **WHEN** a aplicação é exibida nas larguras aprovadas ou com zoom de 200%
- **THEN** conteúdo e ações permanecem acessíveis sem corte ou overflow de página inesperado

#### Scenario: Imagem ou recurso externo falha
- **WHEN** imagem, compartilhamento ou navegação externa não pode ser carregado
- **THEN** a interface mantém contexto, expõe estado compreensível e não comunica operação bem-sucedida

### Requirement: Metadados representam idioma e publicação aprovados

O documento HTML MUST declarar o idioma real da interface. Título, metadados e política de
indexação MUST corresponder ao ambiente e à publicação aprovados, sem expor protótipo como
serviço operacional.

#### Scenario: Aplicação apresenta idioma e título
- **WHEN** navegador ou tecnologia assistiva inspeciona um documento público
- **THEN** idioma e título correspondem ao conteúdo em português brasileiro e à marca aprovada

#### Scenario: Ambiente não destinado a indexação
- **WHEN** a aplicação é construída para ambiente não público ou ainda não aprovado
- **THEN** a indexação segue configuração explícita desse ambiente, sem assumir autorização de publicação
