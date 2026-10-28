# Spec Delta

## Purpose

Recebe manifestações de interesse em animais disponíveis sem tratar validação visual ou
estado de navegador como registro entregue à ONG.

## ADDED Requirements

### Requirement: Solicitação referencia animal disponível

O serviço MUST validar no servidor a existência e disponibilidade do animal no momento da
criação da solicitação.

#### Scenario: Animal elegível
- **WHEN** visitante envia solicitação válida para animal elegível segundo as regras aprovadas
- **THEN** o serviço registra a solicitação com o estado inicial aprovado associada ao animal e retorna confirmação após persistência

#### Scenario: Animal inexistente ou indisponível
- **WHEN** visitante envia solicitação para animal inexistente ou indisponível
- **THEN** o serviço rejeita a solicitação e não a registra

### Requirement: Dados da solicitação são validados e minimizados

Os campos mínimos aprovados para contato e referência ao animal MUST ser validados no
servidor; mensagem opcional e dados pessoais MUST ser limitados à finalidade aprovada. A
spec não obriga coleta conjunta de e-mail e telefone enquanto essa decisão estiver pendente.

#### Scenario: Campo obrigatório inválido
- **WHEN** os dados aprovados como obrigatórios estão ausentes ou em formato inválido
- **THEN** o serviço retorna erros de campo recuperáveis e não persiste a solicitação

### Requirement: Confirmação reflete persistência

A interface MUST exibir confirmação de envio somente após confirmação de persistência pelo
serviço e MUST preservar os campos em caso de falha.

#### Scenario: Serviço indisponível
- **WHEN** o envio falha ou não recebe confirmação do serviço
- **THEN** não aparece mensagem de solicitação recebida e os campos são preservados para tentativa posterior

### Requirement: Dados pessoais da manifestação têm acesso restrito

Dados de contato MUST ser acessíveis somente a administradores autorizados e tratados de
acordo com finalidade, retenção e solicitações de titulares decididas pela ONG.

#### Scenario: Visitante tenta consultar dados de solicitação
- **WHEN** visitante não autorizado solicita a lista ou detalhes de solicitações
- **THEN** o serviço nega a consulta sem expor dados pessoais
