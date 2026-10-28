# ADR-003: MySQL 8

- **Status:** Aceito como arquitetura futura; não implementado
- **Contexto:** Animais, solicitações e administradores exigem persistência relacional e
  integridade transacional.
- **Decisão:** Usar MySQL 8, acessado exclusivamente pelo backend Spring Boot.
- **Decisão técnica complementar (2026-10-28):** a equipe responsável escolheu Flyway para
  migrations versionadas, com testes de integração JUnit 5/Spring Boot Test e Testcontainers
  usando MySQL 8. Isso
  aprova as ferramentas-alvo, não aprova entidades, campos, regras de retenção nem migrations
  de produto.
- **Consequências:** serão necessárias migrations versionadas, backups/restore, índices,
  gestão de credenciais e política de dados aprovada pela ONG. O frontend não conhece
  credenciais do banco. A identidade usada em migration deve ter privilégios diferentes da
  conta runtime; DDL MySQL não será presumido reversível ou transacional.
- **Hospedagem preferencial, ainda não aprovada para produção:** Aiven MySQL Free para
  prototipagem/validação, condicionado à disponibilidade e aos limites da oferta. A página
  oficial atual descreve plano gratuito de nó único, 1 CPU, 1 GB RAM e até 1 GB de storage,
  sem alta disponibilidade, desligado após inatividade e não recomendado para workloads de
  produção. A documentação geral da Aiven permite alterar provedor/região/configuração de
  serviços free. Confirmar recursos efetivamente oferecidos na criação e política de
  backup/restore; não usar esse plano como garantia de continuidade ou proteção de dados.
- **Ainda pendente:** hosting definitivo, alta disponibilidade, limite de conexões,
  conectividade e allowlist entre Render e Aiven, TLS/validação de certificado, estratégia
  operacional de execução de migrations, backup/restore, retenção e exclusão/arquivamento.

Evidência: decisão expressa do responsável técnico registrada em 2026-10-28; identidade
nominal não informada. A aprovação das ferramentas não autoriza criar migration nesta etapa.
Referências:

- [Aiven — Free MySQL](https://aiven.io/free-mysql-database)
- [Aiven — Service pricing and free tier](https://docs.aiven.io/docs/platform/concepts/service-pricing)
- [Aiven — MySQL documentation](https://aiven.io/docs/products/mysql)
