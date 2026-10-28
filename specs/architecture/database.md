# Arquitetura de dados planejada

## Estado

**Não implementado.** MySQL 8 é a tecnologia aprovada para a integração futura.

Flyway foi selecionado para migrations versionadas e Testcontainers/MySQL 8 para testes de
integração. A aprovação das ferramentas não define modelo de negócio, nem cria ou autoriza
migrations; veja `../decisions/I1-approval-register.md`.

## Princípios

- migrations Flyway versionadas; alterações manuais em produção não são fonte de verdade;
- UTF-8 completo (`utf8mb4`) e timestamps UTC;
- chaves e índices definidos conforme consultas reais;
- dados pessoais limitados ao necessário e sujeitos a retenção LGPD;
- exclusões e auditoria devem respeitar regras ainda a decidir.

## Agregados iniciais

- Animal/AnimalImage, AdoptionRequest e Administrator são apenas conceitos candidatos; campos,
  relações/constraints, visibilidade e regras dependem das decisões ONG e não são schema
  aprovado.
- ContactMessage só existe como opção condicional; persistência/entrega depende da ONG.

O modelo conceitual está em `../contracts/data-model.md`.

## Integridade prevista

As relações Animal–AnimalImage e AdoptionRequest–Animal são candidatas do modelo, não
constraints aprovadas. Restrições de estado e unicidade, campos de administrador e ciclo de
vida permanecem pendentes; não criar schema com base nos valores do mock.

## Pendências

- política de exclusão/arquivamento de animais;
- retenção e anonimização de solicitações;
- status e histórico completo do processo de adoção;
- armazenamento de imagens;
- backups, restauração, criptografia e acesso operacional.
