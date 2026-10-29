# Spec Delta

## Purpose

Recebe manifestações de interesse em animais `AVAILABLE` sem tratar validação visual ou estado
de navegador como registro entregue à ONG. A manifestação não implica aprovação da adoção: a
ONG contata o interessado pelo WhatsApp e avalia manualmente, sem workflow de status.

## ADDED Requirements

### Requirement: Solicitação referencia animal disponível

O serviço MUST validar no servidor a existência e o estado `AVAILABLE` do animal no momento da
criação da manifestação.

#### Scenario: Animal disponível
- **WHEN** visitante envia manifestação válida para animal `AVAILABLE`
- **THEN** o serviço registra a manifestação associada ao animal e retorna confirmação após persistência

#### Scenario: Animal inexistente ou adotado
- **WHEN** visitante envia manifestação para animal inexistente ou com estado `ADOPTED`
- **THEN** o serviço rejeita a manifestação e não a registra

### Requirement: Dados da manifestação são validados e minimizados

Os campos aprovados para coleta são nome, WhatsApp, cidade e e-mail, além da referência ao
animal. O campo de mensagem do protótipo MUST NOT ser persistido como requisito. Obrigatoriedade
individual, finalidade/base legal, aviso, limites, retenção e acesso continuam pendentes por
ONG-05; a política antiabuso depende de ONG-09.

#### Scenario: Campo aprovado inválido
- **WHEN** um dado aprovado está ausente quando obrigatório ou em formato inválido
- **THEN** o serviço retorna erros de campo recuperáveis e não persiste a manifestação

#### Scenario: Campo de mensagem não aprovado
- **WHEN** o cliente envia mensagem livre não prevista no contrato
- **THEN** o serviço não a persiste como requisito nem a usa para decisão de adoção

### Requirement: Confirmação reflete persistência

A interface MUST exibir confirmação de envio somente após confirmação de persistência pelo
serviço e MUST preservar os campos em caso de falha. A confirmação MUST NOT afirmar que a
adoção foi aprovada.

#### Scenario: Serviço indisponível
- **WHEN** o envio falha ou não recebe confirmação do serviço
- **THEN** não aparece mensagem de manifestação recebida e os campos são preservados para tentativa posterior

### Requirement: Dados pessoais da manifestação têm acesso restrito

Dados de contato MUST ser acessíveis somente ao administrador autorizado e tratados de acordo
com finalidade, retenção e solicitações de titulares decididas pela ONG.

#### Scenario: Visitante tenta consultar dados de manifestação
- **WHEN** visitante não autorizado solicita a lista ou detalhes de manifestações
- **THEN** o serviço nega a consulta sem expor dados pessoais
