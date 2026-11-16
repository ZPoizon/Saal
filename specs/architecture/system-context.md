# Contexto do sistema

## Escopo atual

O SAAL é uma SPA pública e administrativa para apresentar animais resgatados e demonstrar
fluxos de interesse em adoção. O frontend React roda no navegador e hoje usa:

- dados estáticos em `src/app/data/animals.ts`;
- estado React compartilhado, com catálogo administrativo salvo no `localStorage` do
  navegador atual, indicadores da ONG também no armazenamento local e solicitações mantidas
  em memória;
- links externos para WhatsApp, Instagram, e-mail e imagens;
- Web Share API quando suportada.

Nenhuma operação atual é persistida ou protegida por servidor. O armazenamento local do
catálogo e dos indicadores existe somente para demonstração e não sincroniza dados entre
navegadores ou dispositivos.

## Arquitetura alvo

```text
Visitante/Administrador
          |
          v
Frontend React + TypeScript + Vite
          |
          | HTTPS / REST / JSON
          v
Backend Java + Spring Boot (planejado)
          |
          | JDBC/JPA
          v
MySQL 8 (planejado)
```

O navegador nunca deve acessar o MySQL diretamente. Senhas, chaves privadas e regras de
autorização pertencem ao backend.

## Atores

- Visitante: consulta animais e envia solicitação de adoção.
- Administrador SAAL: gerencia animais e solicitações.
- Serviços externos: hospedagem de imagens/e-mail, ainda `PENDENTE DE DECISÃO`.

## Limites e integrações

- Contrato planejado em `../contracts/openapi.yaml`.
- Frontend e backend devem poder ser publicados separadamente.
- CORS deve permitir somente origens aprovadas.
- Disponibilidade, domínio, provedor de e-mail, storage e observabilidade: `PENDENTE DE DECISÃO`.
