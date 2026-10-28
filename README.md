# SAAL — Santuário de Animais Anjos da Luz

Frontend web do SAAL, construído com React 18, TypeScript, Vite e pnpm.

> **Estado atual:** protótipo frontend. O catálogo usa dados locais/mockados e algumas
> interações mantêm estado apenas em memória. Este repositório não contém backend nem
> persistência real; login, solicitações e formulários não devem ser tratados como serviços
> operacionais. A arquitetura futura e os limites das decisões estão descritos em
> [`specs/`](specs/README.md).

## Requisitos

- Node.js 22 (mínimo 22.12; configuração em `.mise.toml`)
- pnpm 10.34.3

## Desenvolvimento local

```bash
pnpm install --frozen-lockfile
pnpm dev
```

O Vite utiliza `vite.figma.config.ts` e inicia, por padrão, em
`http://localhost:8443/`.

## Verificações

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check
pnpm audit --audit-level=moderate
pnpm secrets:check
pnpm build
```

`pnpm format:check` verifica arquivos de código alterados sem modificá-los. `pnpm format`
aplica formatação e altera arquivos. O workflow
[`quality.yml`](.github/workflows/quality.yml) configura esses checks no GitHub Actions;
isso não comprova que estejam configurados como obrigatórios para merge. O conjunto atual de
testes é pequeno e não demonstra integração com backend, persistência, E2E ou acessibilidade.

Após `pnpm build`, `pnpm preview` serve o artefato local de produção.

## Mapa do repositório

| Caminho | Finalidade |
|---|---|
| `src/` | Aplicação React/TypeScript, estilos e assets usados pelo frontend. |
| `docs/` | Guias de arquitetura, desenvolvimento, segurança, qualidade, diagnósticos e histórico; consulte [`docs/README.md`](docs/README.md). |
| `specs/` | Especificações SDD, contratos e ADRs vigentes. |
| `openspec/` | Changes, tarefas e validação OpenSpec; a change ativa não deve ser arquivada sem autorização. |
| `.github/` | CI e integração/instruções para GitHub Copilot. |
| `.figma/` | Metadados e configuração gerados/consumidos pelo fluxo Figma Make. |
| `.kilo/`, `.kilocode/`, `.opencode/` | Instruções e comandos para integrações de agentes correspondentes. |
| `guidelines/` | Arquivo de orientações do fluxo Figma Make. |
| `scripts/` | Utilitários de verificação do projeto. |
| `backend/` | Reservado para implementação futura autorizada; ainda não existe. |

`vite.figma.config.ts` compõe a configuração raiz `vite.config.ts` e processa metadados,
aliases e assets do Figma Make. Não remova nem substitua essa configuração sem revisar suas
integrações.

## Especificações e arquitetura

- [Como trabalhar com as especificações](specs/README.md)
- [Guia para contribuir em branches e Pull Requests](CONTRIBUTING.md)
- [Arquitetura e estado atual](docs/architecture/ARCHITECTURE.md)
- [Plano de qualidade e matriz de testes](docs/quality/QUALITY_PLAN.md)
- [Política e checklist de segurança](docs/security/SECURITY_POLICY.md)
- [Change OpenSpec `saal-functional-readiness`](openspec/changes/saal-functional-readiness/)
- [Instruções permanentes para agentes](AGENTS.md)
- [Atribuições e licenças de assets](ATTRIBUTIONS.md)

Cloudflare Pages é uma preferência de hospedagem futura para o frontend, não uma implantação
configurada neste repositório. A API REST e o MySQL 8 planejados ainda não foram
implementados. Variáveis `VITE_*` são públicas no bundle e nunca devem conter segredos.

## Publicação

Revise o escopo e o estado local antes de preparar qualquer commit ou push:

```bash
git status --short --branch
git diff
```

Não publique arquivos `.env` com credenciais nem assuma que um build local equivale a deploy
ou prontidão para produção.
