# Proposal

## Why

O repositório contém uma SPA exportada do Figma, sem API, banco ou persistência, mas a
documentação histórica descreve fluxos simulados como operacionais e prontos para produção.
Esta mudança registra o diagnóstico verificável e estabelece uma sequência de implementação
aprovável, segura e testável antes de transformar o protótipo em um serviço real de adoção. As
respostas da responsável da ONG recebidas em 2026-10-29 definem o escopo de negócio como
catálogo + manifestação de interesse, com avaliação manual e sem workflow complexo.

## What Changes

- Documentar inventário das rotas e interações, fluxos, lacunas, riscos de UX/acessibilidade,
  limitações da auditoria estática, prioridades e rastreabilidade código–API–dados–testes.
- Definir incrementos executáveis, critérios verificáveis, dependências, contratos e modelo
  de dados alvo, sem criar funcionalidades ou infraestrutura nesta etapa.
- Especificar navegação/experiência pública compartilhada e criar capacidades OpenSpec para
  catálogo, identidade administrativa, gestão de animais, manifestações de interesse, gestão
  somente leitura e contato condicional.
- Manter decisões já aceitas (React + TypeScript + Vite; API REST Java + Spring Boot; MySQL
  8) e explicitar decisões ainda pendentes, sem inventar comportamentos de negócio.
- Refletir o escopo aprovado em 2026-10-29: dois estados (`AVAILABLE`/`ADOPTED`), 1–3 fotos,
  intake com nome/WhatsApp/cidade/e-mail, um único administrador, avaliação manual e gestão de
  manifestações somente leitura. Exclusão/arquivamento, formulário de contato geral, métricas
  e conteúdo institucional ficam fora do primeiro incremento.
- Reordenar entregas como CI → contratos/domínio aprovados → serviço → migrations → auth →
  operações admin → jornadas públicas, com critérios e testes de saída por incremento.
- Não alterar código funcional, credenciais demonstrativas, assets, dependências ou dados.

## Capabilities

### New Capabilities

- `public-animal-catalog`: consulta pública do catálogo e dos detalhes dos animais.
- `admin-authentication`: autenticação e encerramento de sessão administrativos reais.
- `animal-management`: manutenção administrativa persistente de animais e 1–3 imagens, com
  dois estados.
- `adoption-requests`: recebimento confiável de manifestações de interesse com os campos
  aprovados, sem workflow de status.
- `adoption-management`: consulta autorizada e somente leitura das manifestações.
- `contact-messages`: formulário geral condicional, fora do primeiro incremento.
- `public-experience`: navegação pública compartilhada, links, conteúdo verificável,
  metadados e requisitos comuns de acessibilidade/responsividade.

### Modified Capabilities

Nenhuma. `openspec/specs/` não contém capacidades existentes; as especificações legadas em
`specs/features/` serão preservadas e referenciadas, não substituídas.

## Impact

- Documentação em `docs/diagnostics/` e artefatos desta mudança em
  `openspec/changes/saal-functional-readiness/`.
- A implementação futura afetará o frontend React atual, um backend separado Spring Boot,
  MySQL 8, o contrato `specs/contracts/openapi.yaml`, CI e configuração operacional.
- Nenhum endpoint, banco, autenticação ou serviço externo passa a existir com esta proposta.
- Aprovação de regras pendentes e de cada incremento é pré-condição para implementação.
- Java 21/Spring Boot 4.1.2 condicional, Maven Wrapper, Spring Security, JPA, Bean Validation,
  Flyway, testes backend, Docker, GitHub Actions e RFC 9457 foram escolhas técnicas
  expressamente autorizadas em 2026-10-28. Sessão server-side same-site foi aprovada para a
  implementação inicial em 2026-10-29; Cloudflare Pages é hosting preferencial e Render/Aiven
  são opções de teste/demonstração, não aprovações de produção. ONG-07, ONG-09 e vários detalhes de ONG-01–ONG-06,
  ONG-08, ONG-10 e ONG-11 continuam pendentes.
- Em 2026-10-29, o responsável técnico aprovou sessão server-side, proxy same-site, CSRF,
  CORS allowlist, cookie e sessão ociosa de 15 minutos, credencial única configurada
  externamente e limite de tentativas de login; ADR-006 registra o escopo e as limitações.
- O contrato fixa somente os elementos aprovados em 2026-10-29: estados, quantidade de fotos,
  campos de intake e ausência de transições de status; security scheme, demais campos e
  limites continuam pendentes. Redocly CLI 2.72.0 foi validada como candidata versionada e
  aguarda aprovação para adoção no CI.
- O terceiro canal de contato permanece desconhecido porque a pergunta original não está
  disponível no repositório; não deve ser inferido.
