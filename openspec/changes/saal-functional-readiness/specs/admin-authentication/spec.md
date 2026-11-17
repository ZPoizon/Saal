# Spec Delta

## Purpose

Restringe dados e operações administrativas ao único administrador autenticado. O mecanismo
inicial foi aprovado em `specs/decisions/ADR-006-admin-authentication.md`: username e hash
configurados fora do repositório, sessão server-side e acesso same-site via proxy. Não há
papéis diferenciados. Identidade nominal, recuperação, hosting e operação de produção
continuam pendentes.

## ADDED Requirements

### Requirement: Autenticação é verificada no servidor

Credenciais administrativas MUST ser validadas no backend e nunca embutidas ou comparadas
como segredo no código entregue ao navegador; credenciais inválidas recebem resposta genérica.

#### Scenario: Credencial válida
- **WHEN** o administrador ativo apresenta credenciais válidas pelo serviço
- **THEN** o serviço estabelece o contexto autenticado pelo mecanismo aprovado sem retornar ou registrar a senha

#### Scenario: Credencial inválida
- **WHEN** a autenticação falha
- **THEN** o serviço nega acesso com resposta que não revela se usuário ou senha falhou

### Requirement: Operações administrativas exigem autorização no servidor

O serviço MUST validar autenticação e autorização no servidor para cada operação
administrativa, independentemente do estado ou rota do navegador. Como há um único
administrador, não existe matriz de papéis nem permissão enviada pelo cliente.

#### Scenario: Requisição administrativa sem credencial válida
- **WHEN** visitante não autenticado solicita uma leitura ou mutação administrativa
- **THEN** o serviço nega a operação sem expor dados protegidos

#### Scenario: Identidade autenticada sem autorização administrativa
- **WHEN** uma identidade não provisionada como administrador tenta operação administrativa
- **THEN** o serviço nega a operação sem confiar em identificador ou papel enviado pelo cliente

### Requirement: Logout invalida a credencial

O logout MUST invalidar no servidor a credencial ou sessão pelo mecanismo aprovado e remover o
estado autenticado do cliente.

#### Scenario: Operação após logout
- **WHEN** o administrador encerra a autenticação e reutiliza a credencial anterior
- **THEN** a operação administrativa é negada e uma nova autenticação é exigida

### Requirement: Acesso administrativo é provisionado sob controle

O serviço MUST permitir acesso administrativo somente ao único username e hash provisionados
por configuração protegida fora do repositório. Cadastro público ou papel enviado pelo cliente
MUST NOT conceder privilégio. Identidade nominal, rotação e recuperação de acesso continuam
pendentes por ONG-01.

#### Scenario: Pessoa não provisionada tenta criar acesso
- **WHEN** uma pessoa sem identidade administrativa tenta obter privilégio por autoinscrição
- **THEN** o serviço não cria nem promove uma conta administrativa

### Requirement: Abuso de autenticação é limitado

O endpoint de autenticação MUST mitigar força bruta e enumeração sem expor credenciais ou
informações privadas em logs e respostas. Para login, o limite técnico aprovado é 10 falhas
por IP em 10 minutos, seguido de bloqueio por 15 minutos. Os limites de formulários públicos
continuam pendentes por ONG-09.

#### Scenario: Tentativas excessivas
- **WHEN** o cliente excede os limites de autenticação configurados
- **THEN** o serviço aplica a mitigação definida e registra evento sem segredo ou dado desnecessário

### Requirement: Sessão baseada em cookie é protegida contra CSRF

Operações mutáveis autenticadas por cookie MUST exigir token CSRF válido. O cookie da sessão
MUST ser `HttpOnly`, `Secure` por padrão e `SameSite=Lax`; CORS MUST aceitar somente origens
HTTP(S) exatas configuradas. O browser MUST acessar a API pelo mesmo site via proxy.

#### Scenario: Requisição mutável sem token CSRF
- **WHEN** o cliente omite ou apresenta token CSRF inválido
- **THEN** o serviço rejeita a operação sem executar a ação

#### Scenario: Sessão expira por inatividade
- **WHEN** a sessão permanece sem atividade por 15 minutos
- **THEN** o backend invalida a sessão e exige nova autenticação
