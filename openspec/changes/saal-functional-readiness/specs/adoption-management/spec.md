# Spec Delta

## Purpose

Permite que a equipe autorizada consulte e acompanhe solicitações de adoção persistidas,
sem expor dados pessoais a visitantes ou apresentar alterações voláteis como definitivas.

## ADDED Requirements

### Requirement: Solicitações persistidas são listadas com acesso autorizado

O serviço MUST listar solicitações persistidas somente para administradores autenticados e
autorizados, oferecendo estados vazios e falhas recuperáveis na interface.

#### Scenario: Administrador consulta solicitações
- **WHEN** administrador autorizado abre a gestão de solicitações
- **THEN** a interface apresenta dados persistidos e contagem consistente de pendências

#### Scenario: Lista vazia ou falha
- **WHEN** a lista está vazia ou o serviço falha
- **THEN** a interface diferencia ausência de registros de falha e permite recuperação apropriada

#### Scenario: Usuário sem autorização consulta solicitações
- **WHEN** identidade sem permissão chama a consulta administrativa
- **THEN** o serviço nega a requisição sem incluir dados pessoais

### Requirement: Transições de solicitação são validadas e persistidas

O serviço MUST permitir somente transições de status aprovadas, verificar autorização no
recurso e retornar o estado persistido; estados e transições finais dependem de decisão da ONG.

#### Scenario: Administrador atualiza uma transição aprovada
- **WHEN** administrador autorizado envia transição permitida para solicitação existente
- **THEN** o serviço persiste o novo estado e a interface exibe o resultado confirmado

#### Scenario: Transição inválida, concorrente ou serviço indisponível
- **WHEN** a transição não é permitida, a solicitação mudou ou o serviço falha
- **THEN** a operação é rejeitada sem sucesso falso e a interface informa o estado recuperável

### Requirement: Ações administrativas preservam privacidade e auditoria

A consulta e alteração de solicitações MUST limitar dados ao necessário e manter registro de
auditoria sem senha, token ou conteúdo pessoal desnecessário.

#### Scenario: Alterar estado de solicitação
- **WHEN** uma mudança de estado é persistida
- **THEN** a alteração pode ser auditada sem copiar dados pessoais sensíveis para logs
