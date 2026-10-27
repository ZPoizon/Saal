# Arquitetura de dados planejada

## Estado

**Não implementado.** MySQL 8 é a tecnologia aprovada para a integração futura.

## Princípios

- migrations versionadas; alterações manuais em produção não são fonte de verdade;
- UTF-8 completo (`utf8mb4`) e timestamps UTC;
- chaves e índices definidos conforme consultas reais;
- dados pessoais limitados ao necessário e sujeitos a retenção LGPD;
- exclusões e auditoria devem respeitar regras ainda a decidir.

## Agregados iniciais

- `animals` e `animal_images`;
- `adoption_requests`;
- `administrators`;
- mensagens de contato poderão ser persistidas, mas isso é `PENDENTE DE DECISÃO`.

O modelo conceitual está em `../contracts/data-model.md`.

## Integridade prevista

- imagem pertence a um animal;
- solicitação referencia um animal existente;
- status usam valores controlados;
- e-mail de administrador deve ser único;
- credencial guarda apenas hash.

## Pendências

- política de exclusão/arquivamento de animais;
- retenção e anonimização de solicitações;
- status e histórico completo do processo de adoção;
- armazenamento de imagens;
- backups, restauração, criptografia e acesso operacional.
