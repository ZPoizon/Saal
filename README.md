# SAAL — Santuário de Animais Anjos da Luz

Frontend web do SAAL em React 18, TypeScript, Vite e pnpm. A API Spring Boot, as migrations
Flyway e o MySQL ficam em `backend/` e são **opcionais** para trabalhar na interface.

## Abrir localmente

Requisitos: Node.js 22 (`>=22.12 <23`, ver `.mise.toml`) e pnpm 10.34.3.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Abra <http://localhost:8443/>. **Não é necessário** Docker, MySQL ou Java.

Por padrão, `pnpm dev` encaminha `/api` para a API publicada em
`https://saal-api.onrender.com`. Se a API estiver hibernando ou indisponível, o site continua
abrindo: catálogo e listas aparecem vazios e `/admin` permanece bloqueado com aviso explícito.
Nenhum dado é inventado ou gravado no navegador.

## Backend local (opcional)

Necessário apenas para testar cadastro, login e persistência sem depender da API publicada. Em
outro terminal, siga [`backend/README.md`](backend/README.md) para subir MySQL e a API (porta
8080) e então aponte o proxy para ela:

```powershell
$env:SAAL_API_PROXY_TARGET = "http://localhost:8080"
pnpm dev
```

Também é possível criar um `.env` na raiz com:

```dotenv
SAAL_API_PROXY_TARGET=http://localhost:8080
```

Sem essa variável, o Vite usa a API pública do Render; `pnpm dev` nunca depende de um backend
ligado na sua máquina. `.env` é ignorado pelo Git; nunca coloque segredos em variáveis
`VITE_*`, que vão para o bundle do navegador.

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
| `backend/` | API Spring Boot, migrations Flyway e Docker do MySQL (execução opcional). |
| `docs/` | Arquitetura, desenvolvimento, segurança, qualidade, diagnóstico e histórico; ver [`docs/README.md`](docs/README.md). |
| `specs/` | Especificações SDD, contratos e ADRs vigentes. |
| `openspec/` | Changes, tarefas e validação OpenSpec. |
| `scripts/` | Utilitários de verificação do projeto. |
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
