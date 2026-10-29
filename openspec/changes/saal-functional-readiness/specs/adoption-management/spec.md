# Spec Delta

## Purpose

Permite que o único administrador autorizado consulte as manifestações de interesse
persistidas, em modo somente leitura, sem expor dados pessoais a visitantes. Não há transições
de status, workflow de aprovação nem histórico administrativo detalhado.

## ADDED Requirements

### Requirement: Manifestações persistidas são listadas com acesso autorizado

O serviço MUST listar manifestações persistidas somente para o administrador autenticado e
autorizado, oferecendo estados vazios e falhas recuperáveis na interface.

#### Scenario: Administrador consulta manifestações
- **WHEN** o administrador autorizado abre a gestão de manifestações
- **THEN** a interface apresenta dados persistidos e contagem consistente, sem sugerir aprovação ou recusa

#### Scenario: Lista vazia ou falha
- **WHEN** a lista está vazia ou o serviço falha
- **THEN** a interface diferencia ausência de registros de falha e permite recuperação apropriada

#### Scenario: Usuário sem autorização consulta manifestações
- **WHEN** identidade sem autorização chama a consulta administrativa
- **THEN** o serviço nega a requisição sem incluir dados pessoais

### Requirement: Gestão de manifestações é somente leitura

O serviço MUST NOT expor transições de status, aprovação, recusa ou qualquer workflow de
solicitação. A avaliação da adoção é manual e externa ao sistema; a ONG contata o interessado
pelo WhatsApp.

#### Scenario: Cliente tenta alterar estado da manifestação
- **WHEN** uma requisição tenta aprovar, recusar ou alterar o estado de uma manifestação
- **THEN** o serviço não oferece a operação e não persiste mudança de estado

### Requirement: Acesso preserva privacidade e logs mínimos

A consulta MUST limitar dados ao necessário e MUST NOT manter histórico administrativo
detalhado. Logs mínimos de segurança continuam necessários, mas seu escopo, acesso e retenção
dependem de ONG-08; logs MUST NOT copiar senha, token ou conteúdo pessoal desnecessário.

#### Scenario: Consulta a manifestação
- **WHEN** o administrador autorizado consulta uma manifestação
- **THEN** os dados exibidos se limitam aos campos aprovados e nenhum histórico detalhado é criado
