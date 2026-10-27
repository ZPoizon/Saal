# ADR-003: MySQL 8

- **Status:** Aceito como arquitetura futura; não implementado
- **Contexto:** Animais, solicitações e administradores exigem persistência relacional e
  integridade transacional.
- **Decisão:** Usar MySQL 8, acessado exclusivamente pelo backend Spring Boot.
- **Consequências:** Serão necessárias migrations, backups, índices, gestão de credenciais e
  política LGPD. O frontend não conhece credenciais do banco.
- **Pendente de decisão:** provedor, alta disponibilidade, ferramenta de migration, retenção
  e estratégia de exclusão/arquivamento.
