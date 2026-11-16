# SAAL — Santuário de Animais Anjos da Luz

Aplicação web do SAAL em React 18, TypeScript, Vite e pnpm, com API Spring Boot e MySQL local
para desenvolver o painel administrativo.

## Abrir localmente

Requisitos: Node.js 22 (`>=22.12 <23`), pnpm 10.34.3 e Docker Desktop aberto.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Abra <http://localhost:8443/> e acesse `/admin`. Na primeira execução, `pnpm dev` cria
credenciais administrativas aleatórias para esta máquina e as mostra uma única vez no
terminal. Guarde a senha; ela também fica no arquivo local ignorado pelo Git
`backend/.env.dev`. O comando inicia MySQL e API em containers e encaminha `/api` para a API
local. Não há conta padrão, backend simulado nem dependência da API publicada.

Mantenha `backend/.env.dev`: ele contém as credenciais locais do banco e do administrador. Ao
pressionar `Ctrl+C`, a aplicação e os containers são encerrados sem apagar os dados do banco.
Se precisar parar os containers separadamente, use `pnpm dev:stop`.

O primeiro início pode demorar enquanto Docker baixa imagens e constrói a API. Se o Docker
Desktop não estiver aberto, inicie-o e rode `pnpm dev` novamente.

## Fotos de animais

O formulário administrativo aceita de 1 a 3 imagens escolhidas da galeria do dispositivo
(`accept="image/*"`, sem abrir a câmera automaticamente), com prévia, remoção, substituição e
reordenação. O limite técnico provisório é 5 MB por foto; a política definitiva de formatos,
tamanho, armazenamento e retenção continua pendente de decisão da ONG (ONG-06).

As fotos são persistidas pela própria API em `/api/v1/admin/photos` (esta é a URL padrão; não é
preciso configurar `VITE_PHOTO_UPLOAD_URL`). O endpoint recebe um campo `photos` por arquivo,
exige sessão administrativa e CSRF, e responde `{"urls":["/api/v1/photos/123"]}`. Antes do
envio, o navegador aplica a orientação EXIF, limita o maior lado a 1600 px, converte para JPEG e
remove metadados; o binário fica no MySQL e é servido por uma URL pública imutável. Se o upload
falhar, nenhuma prévia local é gravada como se fosse permanente.

## Publicar na Vercel

O frontend é publicado em um **único projeto Vercel** conectado a este repositório, com deploy
automático da branch `main`. Não há projeto adicional nem passo de build manual.

1. Envie a alteração aprovada para `main` (commit em `main` ou merge de Pull Request).
2. A Vercel executa `pnpm build` e publica `dist/`.
3. Acompanhe pelo painel da Vercel ou pelo comentário do bot no Pull Request.

`vercel.json` na raiz encaminha `/api/*` para a API remota (mesma origem, o que mantém o
cookie de sessão) e serve `index.html` para rotas como `/admin` e `/animais/1`. O destino
configurado é `https://saal-api.onrender.com`; o serviço do Render é criado pelo Blueprint
[`render.yaml`](render.yaml) e depende do MySQL no Aiven. O passo a passo de Aiven, Render e
Vercel está em [`backend/README.md`](backend/README.md#deploy-render-api--aiven-mysql--vercel-frontend).
Enquanto o serviço não estiver publicado, `/api` falha e o painel permanece bloqueado, com aviso
explícito, enquanto o restante do site continua funcionando. Os assets oficiais em `src/imports/`
são mantidos como blobs normais (fora do Git LFS) para que a Vercel receba as imagens reais.

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

`pnpm format:check` valida sem alterar arquivos; `pnpm format` aplica a formatação.
`pnpm preview` serve o `dist/` local após `pnpm build` (sem proxy `/api`). O workflow
[`quality.yml`](.github/workflows/quality.yml) configura esses checks no GitHub Actions; isso
não comprova que já tenham rodado nem que sejam obrigatórios para merge.

## Mapa do repositório

| Caminho | Finalidade |
|---|---|
| `src/` | Aplicação React/TypeScript, estilos e assets do frontend. |
| `backend/` | API Spring Boot, migrations Flyway, MySQL e configuração Docker local. |
| `docs/` | Arquitetura, desenvolvimento, segurança, qualidade, diagnóstico e histórico; ver [`docs/README.md`](docs/README.md). |
| `specs/` | Especificações SDD, contratos e ADRs vigentes. |
| `openspec/` | Changes, tarefas e validação OpenSpec. |
| `scripts/` | Inicialização do ambiente local e utilitários de verificação. |
| `.figma/` | Metadados e configuração do fluxo Figma Make. |
| `guidelines/` | Orientações adicionais do projeto. |

`vite.figma.config.ts` compõe `vite.config.ts` e processa metadados, aliases e assets do Figma
Make. Não o substitua por `vite.config.ts` sem revisar essas integrações.

## Especificações e arquitetura

- [Como trabalhar com as especificações](specs/README.md)
- [Guia para contribuir em branches e Pull Requests](CONTRIBUTING.md)
- [Arquitetura e estado atual](docs/architecture/ARCHITECTURE.md)
- [Plano de qualidade e matriz de testes](docs/quality/QUALITY_PLAN.md)
- [Política e checklist de segurança](docs/security/SECURITY_POLICY.md)
- [Change OpenSpec `saal-functional-readiness`](openspec/changes/saal-functional-readiness/)
- [Instruções permanentes para agentes](AGENTS.md)
- [Atribuições e licenças de assets](ATTRIBUTIONS.md)
