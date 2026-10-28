# Spec Delta

## Purpose

Restringe dados e operações administrativas a administradores autenticados, com o mecanismo
de autenticação e encerramento de credencial que vier a ser aprovado em ADR.

**Decisão pendente:** sessão server-side versus token ainda não foi aprovada. O cenário abaixo
descreve resultado de segurança requerido, não seleciona um mecanismo nem aprova o placeholder
`bearerAuth` no OpenAPI atual.

## ADDED Requirements

### Requirement: Autenticação é verificada no servidor

Credenciais administrativas MUST ser validadas no backend e nunca embutidas ou comparadas
como segredo no código entregue ao navegador; credenciais inválidas recebem resposta genérica.

#### Scenario: Credencial válida
- **WHEN** administrador ativo apresenta credenciais válidas pelo serviço
- **THEN** o serviço estabelece o contexto autenticado pelo mecanismo aprovado sem retornar ou registrar a senha

#### Scenario: Credencial inválida
- **WHEN** a autenticação falha
- **THEN** o serviço nega acesso com resposta que não revela se usuário ou senha falhou

### Requirement: Operações administrativas exigem autorização no servidor

O serviço MUST validar autenticação, permissão e acesso ao recurso no servidor para cada
operação administrativa, independentemente do estado ou rota do navegador.

#### Scenario: Requisição administrativa sem credencial válida
- **WHEN** visitante não autenticado solicita uma leitura ou mutação administrativa
- **THEN** o serviço nega a operação sem expor dados protegidos

#### Scenario: Identidade autenticada sem permissão sobre o recurso
- **WHEN** administrador autenticado tenta acessar ou alterar recurso fora de sua autorização
- **THEN** o serviço nega a operação sem confiar no identificador ou papel enviado pelo cliente

### Requirement: Logout invalida a credencial

O logout MUST invalidar no servidor a credencial ou sessão pelo mecanismo aprovado e remover o
estado autenticado do cliente.

#### Scenario: Operação após logout
- **WHEN** administrador encerra a autenticação e reutiliza a credencial anterior
- **THEN** a operação administrativa é negada e uma nova autenticação é exigida

### Requirement: Registros administrativos são provisionados sob controle

O serviço MUST permitir acesso administrativo somente a identidades provisionadas conforme
papéis aprovados; cadastro público ou papel enviado pelo cliente MUST NOT conceder privilégio.

#### Scenario: Pessoa não provisionada tenta criar acesso
- **WHEN** uma pessoa sem identidade administrativa tenta obter privilégio por autoinscrição
- **THEN** o serviço não cria nem promove uma conta administrativa

### Requirement: Abuso de autenticação é limitado

O endpoint de autenticação MUST mitigar força bruta e enumeração sem expor credenciais ou
informações privadas em logs e respostas.

#### Scenario: Tentativas excessivas
- **WHEN** o cliente excede os limites de autenticação configurados
- **THEN** o serviço aplica a mitigação definida e registra evento sem segredo ou dado desnecessário
