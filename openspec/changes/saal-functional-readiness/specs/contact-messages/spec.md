# Spec Delta

## Purpose

Registra o formulário de contato geral como **fora do primeiro incremento**. A ONG aprovou
manter três opções de contato, priorizando WhatsApp e telefone; o terceiro canal permanece
pendente porque a pergunta original não está disponível no repositório. Nenhuma mensagem pode
ser confirmada ficticiamente.

## ADDED Requirements

### Requirement: Formulário de contato geral está fora do primeiro incremento

O formulário de contato geral MUST NOT ser implementado até que a ONG aprove destino,
persistência/encaminhamento, campos, confirmação, prazo, acesso e retenção (ONG-07), além de
finalidade/base legal (ONG-05) e política antiabuso (ONG-09). Os canais públicos de WhatsApp e
telefone são links externos e não dependem deste endpoint.

#### Scenario: Visitante procura contato geral
- **WHEN** a ONG ainda não aprovou o tratamento do formulário geral
- **THEN** a interface oferece somente os canais de contato aprovados e não simula envio ou recebimento

#### Scenario: Mensagem válida aceita no futuro
- **WHEN** o formulário for aprovado e o serviço confirmar o recebimento
- **THEN** a interface confirma que a mensagem foi recebida pelo serviço, sem prometer entrega não verificada

#### Scenario: Falha de serviço
- **WHEN** o serviço não aceita a mensagem
- **THEN** a interface não informa sucesso e mantém os dados para nova tentativa

### Requirement: Abuso de formulário público é mitigado

Quando o formulário for aprovado, o serviço MUST aplicar limites de entrada e medidas
proporcionais contra abuso, sem registrar conteúdo pessoal desnecessário. Limites concretos
dependem de ONG-09.

#### Scenario: Entrada excessiva ou abuso
- **WHEN** envio excede os limites aprovados ou a política de taxa
- **THEN** o serviço rejeita o envio de forma segura e não registra conteúdo sensível em logs
