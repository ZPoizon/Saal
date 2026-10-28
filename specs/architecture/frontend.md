# Arquitetura do frontend

## Estado atual

- React 18, TypeScript estrito, Vite 6 e React Router 7.
- Entrada: `src/main.tsx`.
- Rotas: `src/app/routes.tsx`.
- Páginas: `src/app/pages/`.
- Componentes: `src/app/components/`.
- Tema/estilos: `src/styles/`.
- Modelo e fixtures: `src/app/data/animals.ts`.
- Solicitações em memória: `src/app/contexts/InterestContext.tsx`.

Não reorganizar fisicamente a estrutura apenas por preferência; mudanças devem acompanhar
uma feature e preservar a interface.

## Organização alvo incremental

Quando a API for implementada, introduzir sem grande refatoração:

```text
src/
  app/
    services/       # cliente HTTP e adaptadores
    types/          # DTOs compartilhados no frontend
    hooks/          # estado assíncrono reutilizável, se necessário
```

Componentes não devem chamar `fetch` diretamente. Serviços convertem DTOs e erros; páginas
orquestram carregamento; componentes visuais recebem props.

## Configuração

- `VITE_API_URL`: URL pública base da API futura.
- Variáveis `VITE_*` ficam expostas no bundle; nunca armazenar segredos.
- Ambiente local pode usar `.env.local`, ignorado pelo Git.

## Qualidade

- Typecheck: `pnpm typecheck`.
- Build: `pnpm build`.
- Formatação: `pnpm format`.
- Testes Vitest e lint Oxlint são configurados pelo I0; a cobertura atual é limitada e não
  representa testes de componentes, API, browser ou acessibilidade.

## Restrições

- Preservar identidade visual e comportamento responsivo.
- Tratar loading, vazio e erro quando dados passarem a ser remotos.
- Evitar duplicar modelos do OpenAPI manualmente sem estratégia definida.
