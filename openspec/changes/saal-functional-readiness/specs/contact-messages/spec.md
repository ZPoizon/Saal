# Spec Delta

## Purpose

Permite que pessoas entrem em contato com a ONG por um fluxo verificável, sem confirmar
ficticiamente mensagens que não foram aceitas ou entregues.

## ADDED Requirements

### Requirement: Mensagem de contato é processada pelo serviço

O envio MUST validar no servidor os campos mínimos aprovados e só confirmar aceite depois da
resposta real do serviço; entrega, persistência, campos coletados e encaminhamento dependem
da decisão operacional registrada pela ONG.

#### Scenario: Mensagem válida aceita
- **WHEN** visitante envia os campos aprovados e o serviço confirma o recebimento
- **THEN** a interface confirma que a mensagem foi recebida pelo serviço

#### Scenario: Falha de serviço
- **WHEN** serviço não aceita a mensagem
- **THEN** a interface não informa sucesso e mantém os dados para nova tentativa

### Requirement: Abuso de formulário público é mitigado

O serviço MUST aplicar limites de entrada e medidas proporcionais contra abuso no endpoint
público de contato, sem registrar conteúdo pessoal desnecessário.

#### Scenario: Entrada excessiva ou abuso
- **WHEN** envio excede os limites aprovados ou a política de taxa
- **THEN** o serviço rejeita o envio de forma segura e não registra conteúdo sensível em logs
