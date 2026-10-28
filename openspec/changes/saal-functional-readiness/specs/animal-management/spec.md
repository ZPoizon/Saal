# Spec Delta

## Purpose

Permite que administradores autorizados mantenham um catálogo único e persistente de
animais, coerente entre as telas públicas e administrativas.

## ADDED Requirements

### Requirement: Cadastro e edição de animais são persistidos

O serviço MUST validar os campos e valores permitidos e persistir operações autorizadas de
criação e atualização; a visibilidade pública resultante MUST seguir as regras aprovadas de
publicação e status.

#### Scenario: Cadastrar animal válido
- **WHEN** administrador autorizado envia dados válidos de animal
- **THEN** o serviço persiste o animal e retorna seu identificador e dados aceitos

#### Scenario: Atualizar animal existente
- **WHEN** administrador autorizado altera dados de animal existente
- **THEN** a leitura administrativa reflete os dados persistidos e a consulta pública os reflete somente se o animal for elegível e publicado

#### Scenario: Entrada inválida
- **WHEN** campos obrigatórios, enums ou limites de entrada forem inválidos
- **THEN** o serviço rejeita a operação com erro recuperável sem persistência parcial

### Requirement: Mudanças de status afetam a disponibilidade pública conforme as regras aprovadas

Uma mudança autorizada de status MUST ser refletida pelo catálogo conforme a relação aprovada
entre status e elegibilidade, sem exigir uma edição independente ou alteração apenas em memória.

#### Scenario: Animal deixa de estar disponível
- **WHEN** administrador autorizado altera seu status de modo que as regras aprovadas o tornam inelegível
- **THEN** o catálogo público não oferece o animal como disponível e o detalhe apresenta o status atual

### Requirement: Remoção respeita política de ciclo de vida

O serviço MUST permitir remoção somente por operação administrativa autorizada e aplicar a
política decidida de exclusão ou arquivamento sem apagar dados destrutivamente por padrão.

#### Scenario: Remover ou arquivar cadastro
- **WHEN** administrador autorizado confirma remoção conforme a política aprovada
- **THEN** o serviço aplica a operação definida, atualiza a visão pública e preserva as referências exigidas

### Requirement: Upload de imagens valida conteúdo

Quando a capability de upload aprovada estiver disponível, o serviço MUST limitar e verificar
conteúdo de imagens por formatos e tamanhos aprovados, impedindo que um nome de arquivo ou
MIME declarado seja a única validação. Preview local MUST NOT ser comunicado como persistência.

#### Scenario: Arquivo não permitido
- **WHEN** o envio contém formato ou conteúdo inválido, ou excede o limite aprovado
- **THEN** o serviço rejeita o arquivo sem publicá-lo e informa erro sem detalhe interno

#### Scenario: Imagem válida é selecionada antes da capability de upload
- **WHEN** a interface permite preview local enquanto serviço/storage ainda não está disponível
- **THEN** a interface identifica o preview como local e não o apresenta como foto salva

### Requirement: Falhas de mutação não simulam sucesso

Uma falha de serviço MUST preservar o cadastro anterior e ser comunicada sem indicar sucesso
ou descartar silenciosamente as alterações digitadas.

#### Scenario: Falha ao salvar
- **WHEN** o serviço rejeita ou não conclui uma mutação
- **THEN** a interface mantém os dados editados e apresenta ação recuperável sem atualizar a lista como salva

### Requirement: Formulário administrativo é operável por teclado

Formulário em diálogo MUST expor nome, papel e estado, conter foco durante a interação e
restaurá-lo ao controle de origem quando fechado; erro de validação MUST ser associado ao
campo pertinente.

#### Scenario: Administrador abre e fecha o formulário
- **WHEN** administrador abre o formulário e fecha por ação disponível ou teclado
- **THEN** foco entra no diálogo, não escapa para o conteúdo de fundo e retorna ao acionador após fechar

#### Scenario: Servidor rejeita campo
- **WHEN** servidor rejeita entrada do formulário
- **THEN** erro específico é anunciado e associado ao campo sem perder os demais valores
