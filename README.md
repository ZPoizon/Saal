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

Sem backend em execução, o site abre normalmente: catálogo e listas aparecem vazios e `/admin`
permanece bloqueado até a API responder. Nenhum dado é inventado ou gravado.

## Backend local (opcional)

Necessário apenas para testar cadastro, login e persistência. Em outro terminal, siga
[`backend/README.md`](backend/README.md) para subir MySQL e a API (porta 8080). Depois inicie o
frontend apontando o proxy `/api` para ela:

```powershell
$env:SAAL_API_PROXY_TARGET = "http://localhost:8080"
pnpm dev
```

Também é possível criar um `.env` na raiz com:

```dotenv
SAAL_API_PROXY_TARGET=http://localhost:8080
```

Sem essa variável o Vite não registra proxy algum, então `pnpm dev` nunca depende de um
backend ligado. `.env` é ignorado pelo Git; nunca coloque segredos em variáveis `VITE_*`, que
vão para o bundle do navegador.

## Fotos de animais

O formulário administrativo aceita de 1 a 3 imagens escolhidas da galeria do dispositivo
(`accept="image/*"`, sem abrir a câmera automaticamente), com prévia, remoção, substituição e
reordenação. O limite técnico provisório é 5 MB por foto; a política definitiva de formatos,
tamanho, armazenamento e retenção continua pendente de decisão da ONG (ONG-06).

Para persistir fotos novas é necessário configurar `VITE_PHOTO_UPLOAD_URL` com um endpoint
multipart same-origin, por exemplo `/api/v1/admin/photos`. O endpoint deve receber um campo
`photos` por arquivo, validar a sessão administrativa e o CSRF, e responder
`{"urls":["https://...", "/..."]}` com uma URL persistente por foto. Sem essa configuração, a
prévia local funciona, mas o salvamento de fotos escolhidas é bloqueado com mensagem explícita
— nenhum `blob:` é gravado como se fosse permanente e nenhum binário fica em filesystem
efêmero. A orientação EXIF é respeitada na prévia pelos navegadores modernos; o arquivo
persistido depende do serviço de armazenamento configurado.

## Publicar na Vercel

O frontend é publicado em um **único projeto Vercel** conectado a este repositório, com deploy
automático da branch `main`. Não há projeto adicional nem passo de build manual.

1. Envie a alteração aprovada para `main` (commit em `main` ou merge de Pull Request).
2. A Vercel executa `pnpm build` e publica `dist/`.
3. Acompanhe pelo painel da Vercel ou pelo comentário do bot no Pull Request.

`vercel.json` na raiz encaminha `/api/*` para a API remota (mesma origem, o que mantém o
cookie de sessão) e serve `index.html` para rotas como `/admin` e `/animais/1`. O destino
configurado é `https://saal-api.onrender.com`, que **ainda não está publicado** (responde 404);
até lá `/api` falha e o painel permanece bloqueado, com aviso explícito, enquanto o restante do
site continua funcionando. Os assets oficiais em `src/imports/` são mantidos como blobs
normais (fora do Git LFS) para que a Vercel receba as imagens reais.

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
