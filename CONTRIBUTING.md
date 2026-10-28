# Contribuindo

Este guia orienta o mantenedor principal, **ZPoizon**, e contribuidores do SAAL. Todo
trabalho deve respeitar `AGENTS.md`, as políticas em `docs/security/` e as especificações
aprovadas. O frontend atual é um protótipo: dados mockados e estado em memória não são
backend nem persistência real.

## Requisitos e configuração

- Git e Git LFS;
- Node.js `>=22.12 <23` e pnpm `10.34.3`, conforme `.mise.toml` e `package.json`;
- IntelliJ IDEA (ou editor compatível com TypeScript);
- Java e MySQL não são necessários para executar o frontend atual; o backend ainda não foi
  implementado.

Instale Git LFS (por exemplo, pelo instalador oficial em
<https://git-lfs.com/>). Para a toolchain Node/pnpm, a opção preferencial é instalar `mise` e
executar `mise install` na raiz, usando as versões de `.mise.toml`. Sem mise, instale Node 22
(mínimo 22.12) pelo distribuidor oficial e depois fixe o gerenciador:

```bash
npm install --global pnpm@10.34.3
node --version
pnpm --version
```

Confirme Node `>=22.12 <23` e pnpm `10.34.3` antes de instalar dependências.

Clone o repositório, configure o Git LFS e instale as dependências reproduzivelmente:

```bash
git -c core.autocrlf=false clone https://github.com/ZPoizon/Saal.git
cd Saal
git config --local core.autocrlf false
git lfs install
git lfs pull
pnpm install --frozen-lockfile
```

Desabilitar `core.autocrlf` apenas neste repositório mantém os arquivos de código em LF,
compatível com o check oxfmt usado no CI; não altere a configuração global do Git.

Abra a pasta raiz `Saal` no IntelliJ IDEA, selecione Node 22 como runtime do projeto e
configure pnpm como gerenciador de pacotes. Não é necessário compartilhar credenciais para
executar o protótipo. Não crie `.env` com segredos; valores `VITE_*` são incluídos no bundle
do navegador e, portanto, são públicos.

O repositório declara filtros Git LFS para imagens, mas alguns PNGs já versionados são blobs
Git comuns, não ponteiros LFS. Git LFS pode avisar sobre essa inconsistência durante clone ou
checkout e listá-los como modificados embora os arquivos tenham sido obtidos do repositório.
Não inclua esses PNGs no staging só para limpar o status e não execute migração LFS, reescrita
de histórico ou force push para corrigir o aviso. Informe o mantenedor antes de alterar esse
estado.

## Executar e verificar o frontend

```bash
pnpm dev
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check
pnpm audit --audit-level=moderate
pnpm secrets:check
pnpm build
```

O servidor local usa `vite.figma.config.ts` e normalmente fica em
`http://localhost:8443/`. Para visualizar o build, execute `pnpm preview` após `pnpm build`.
Não substitua essa configuração por `vite.config.ts` sem aprovação e análise das integrações
Figma. `pnpm format` altera arquivos; prefira `pnpm format:check` na validação.

## Especificações e OpenSpec

Antes de escolher uma tarefa, leia `AGENTS.md`, `specs/README.md`, a especificação e os ADRs
relacionados, além da arquitetura, padrões de desenvolvimento e políticas de segurança
aplicáveis. Confira o estado real da funcionalidade no código e no OpenSpec.

O repositório já contém `openspec/config.yaml` e changes. Instale o CLI OpenSpec conforme as
instruções do setup de desenvolvimento e confira `openspec --version` (versão validada neste
ambiente: `1.15.0`; o workflow atual instala o pacote sem fixar versão). **Não execute
`openspec init` nem substitua a configuração existente.** Valide uma change sem marcá-la
concluída:

```bash
openspec validate saal-functional-readiness --strict --json
```

Só trabalhe em tarefas autorizadas e com critérios de aceite claros. Não marque tarefas como
concluídas sem evidência. Decisões reservadas à ONG, incluindo ONG-01 a ONG-11 no registro
vigente, permanecem pendentes: não invente respostas nem implemente valores provisórios como
regras definitivas. Mudanças de arquitetura, autenticação, segurança ou banco exigem aprovação
prévia do mantenedor.

## Branches, commits e Pull Requests

- Nunca trabalhe diretamente na `main`; ela é mantida por ZPoizon.
- Cada tarefa independente usa sua própria branch, criada a partir de `origin/main`, por
  exemplo `docs/guia-contribuicao` ou `fix/descricao-curta`.
- Prompts ou etapas relacionados à mesma tarefa podem continuar na mesma branch. Não reutilize
  essa branch para uma tarefa independente.
- Faça commits pequenos e descritivos, apenas dos arquivos da tarefa. Revise
  `git status --short --branch` e `git diff --cached` antes de cada commit.
- Abra um Pull Request para cada tarefa. Descreva escopo, verificações executadas e limitações;
  solicite revisão antes do merge.
- O merge é responsabilidade do mantenedor após revisão; não faça merge automaticamente.

Exemplo de criação de uma branch de tarefa:

```bash
git fetch origin
git switch -c docs/descricao-curta origin/main
```

Atualize uma branch de tarefa sem sobrescrever trabalho local:

```bash
git status --short --branch
git fetch origin
git merge origin/main
```

Se houver alterações não commitadas, pare antes de sincronizar. Revise-as e preserve-as em um
commit da tarefa ou em uma worktree independente; não use `reset --hard`, `git clean` nem
stash indiscriminado. Resolva conflitos na branch da tarefa e repita as verificações antes de
abrir ou atualizar o Pull Request.

## Colaboração entre pessoas e agentes

ZPoizon é o mantenedor principal; o segundo desenvolvedor contribui por branches e Pull
Requests. Antes de delegar trabalho a outro desenvolvedor ou agente, delimite arquivos e
critérios de aceite. Não permita edições simultâneas dos mesmos arquivos ou da mesma worktree:
use branches/worktrees isoladas para tarefas independentes e integre por Pull Request. Apenas
o responsável pela branch deve preparar seus commits.

Agentes devem seguir `AGENTS.md` e as instruções de suas integrações, sem iniciar tarefas
OpenSpec não autorizadas, inventar decisões da ONG ou declarar checks aprovados sem evidência.
Segredos, dados pessoais e credenciais nunca devem ser copiados para prompts, exemplos,
arquivos versionados ou logs.

## Quando verificações falharem

Registre o comando, a versão do Node/pnpm, a mensagem e o job/etapa do CI. Reproduza a falha
com a mesma base e toolchain, corrija a causa na menor extensão possível e rode novamente as
verificações afetadas e as exigidas pela tarefa. Não ignore, desative ou declare aprovado um
check que falhou. Se o problema não puder ser resolvido, explique o bloqueio no Pull Request
e aguarde a revisão do mantenedor.
