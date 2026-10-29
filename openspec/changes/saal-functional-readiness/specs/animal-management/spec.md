# Spec Delta

## Purpose

Permite que o único administrador autorizado mantenha um catálogo único e persistente de
animais, coerente entre as telas públicas e administrativas. Não há papéis diferenciados nem
histórico administrativo detalhado.

## ADDED Requirements

### Requirement: Cadastro e edição de animais são persistidos

O serviço MUST validar os campos e valores permitidos e persistir operações autorizadas de
criação e atualização. Os únicos estados aprovados são `AVAILABLE` (“Disponível para adoção”) e
`ADOPTED` (“Adotado”); os demais campos e limites dependem de ONG-10.

#### Scenario: Cadastrar animal válido
- **WHEN** o administrador autorizado envia dados válidos de animal, incluindo 1–3 fotos
- **THEN** o serviço persiste o animal e retorna seu identificador e dados aceitos

#### Scenario: Atualizar animal existente
- **WHEN** o administrador autorizado altera dados de animal existente
- **THEN** a leitura administrativa reflete os dados persistidos e a consulta pública reflete o animal quando seu estado for `AVAILABLE`

#### Scenario: Entrada inválida
- **WHEN** campos obrigatórios, estados ou limites de entrada forem inválidos
- **THEN** o serviço rejeita a operação com erro recuperável sem persistência parcial

### Requirement: Mudanças de status afetam a disponibilidade pública

Uma mudança autorizada entre `AVAILABLE` e `ADOPTED` MUST ser refletida pelo catálogo, sem
exigir edição independente ou alteração apenas em memória.

#### Scenario: Animal é marcado como adotado
- **WHEN** o administrador autorizado altera o estado para `ADOPTED`
- **THEN** o catálogo deixa de oferecer o animal como disponível, o detalhe o identifica como adotado quando acessível e o cadastro permanece retido

#### Scenario: Animal retorna a disponível
- **WHEN** uma decisão aprovada permitir alterar o estado de `ADOPTED` para `AVAILABLE`
- **THEN** o catálogo volta a oferecer o animal conforme as regras aprovadas

### Requirement: Cada animal possui de uma a três fotografias

O serviço MUST exigir no mínimo uma e no máximo três fotografias por animal. Formatos,
tamanho, storage, URL publicável, metadados/EXIF, moderação e retenção continuam pendentes por
ONG-06 e MUST NOT ser inferidos do protótipo.

#### Scenario: Quantidade de fotos inválida
- **WHEN** o cadastro ou a edição contém zero fotos ou mais de três fotos
- **THEN** o serviço rejeita a operação sem persistir o animal

#### Scenario: Imagem válida é selecionada antes da capability de upload
- **WHEN** a interface permite preview local enquanto serviço/storage ainda não está disponível
- **THEN** a interface identifica o preview como local e não o apresenta como foto salva

### Requirement: Remoção de animal está fora do primeiro incremento

Exclusão e arquivamento de animais não adotados dependem de decisão de ciclo de vida (ONG-03)
e MUST NOT ser implementados no primeiro incremento. Animais adotados MUST permanecer
cadastrados e identificados.

#### Scenario: Administrador tenta remover animal
- **WHEN** uma operação de exclusão ou arquivamento for solicitada antes da decisão de ONG-03
- **THEN** o sistema não executa remoção destrutiva nem comunica sucesso

### Requirement: Falhas de mutação não simulam sucesso

Uma falha de serviço MUST preservar o cadastro anterior e ser comunicada sem indicar sucesso
ou descartar silenciosamente as alterações digitadas.

#### Scenario: Falha ao salvar
- **WHEN** o serviço rejeita ou não conclui uma mutação
- **THEN** a interface mantém os dados editados e apresenta ação recuperável sem atualizar a lista como salva

### Requirement: Formulário administrativo é operável por teclado

Formulário em diálogo MUST expor os campos aprovados e o estado, conter foco durante a
interação e restaurá-lo ao controle de origem quando fechado; erro de validação MUST ser
associado ao campo pertinente.

#### Scenario: Administrador abre e fecha o formulário
- **WHEN** o administrador abre o formulário e fecha por ação disponível ou teclado
- **THEN** foco entra no diálogo, não escapa para o conteúdo de fundo e retorna ao acionador após fechar

#### Scenario: Servidor rejeita campo
- **WHEN** o servidor rejeita entrada do formulário
- **THEN** erro específico é anunciado e associado ao campo sem perder os demais valores
