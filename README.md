# SAAL — Santuário de Animais Anjos da Luz

Aplicação web do SAAL em React 18, TypeScript, Vite e pnpm, conectada ao Supabase para banco de dados PostgreSQL, autenticação de administrador e armazenamento de fotografias.

## Apresentação

O SAAL é o sistema de adoção do Santuário de Animais Anjos da Luz, ONG localizada em Capão Bonito - SP, dedicada ao resgate, cuidado e adoção responsável de animais em situação de abandono.

O site público exibe o catálogo de animais disponíveis, informações sobre a ONG, campanhas, doações e formulário de manifestação de interesse em adoção. O painel administrativo permite cadastrar e editar animais, fotografias, interessados e configurações públicas da ONG.

### Funcionalidades principais

- Catálogo público de animais para adoção, com fotos e detalhes
- Formulário público de manifestação de interesse em adoção (contato via WhatsApp)
- Painel administrativo com três abas: Animais, Interessados e Configuração
- Cadastro, edição e exclusão de animais (apenas administrador)
- Alteração de status dos animais (disponível / adotado)
- Upload de 1 a 3 fotografias por animal, armazenadas no Supabase Storage
- Login de administrador com autenticação real via Supabase Auth
- Configurações públicas do site (contato, estatísticas, adoção, sobre, campanhas)
- Confirmação de adoção pelo administrador
- Responsividade para celulares, tablets e desktop

## Tecnologias

- **React 18** — interface do usuário
- **TypeScript** — tipagem estática
- **Vite** — ferramenta de build e servidor de desenvolvimento
- **pnpm** — gerenciador de dependências
- **Supabase Auth** — autenticação de administrador com sessão persistente
- **Supabase PostgreSQL** — banco de dados (animais, interesses, configurações)
- **Supabase Storage** — armazenamento de fotografias de animais
- **Tailwind CSS** — estilização

## Requisitos

- Node.js 22 (`>=22.12 <23`)
- pnpm 10 (`>=10 <11`)
- Conta e projeto no [Supabase](https://supabase.com)

Não é necessário instalar Docker, Java ou MySQL para iniciar o frontend.

## Instalação

```powershell
pnpm install --frozen-lockfile
```

## Configuração do Supabase

1. Crie um projeto no [Supabase](https://app.supabase.com).
2. Copie `.env.example` para `.env` na raiz do projeto.
3. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores do seu projeto Supabase (Settings > API).
4. No painel do Supabase, vá ao **SQL Editor** > **New query** e aplique o arquivo `supabase/migrations/001_initial_schema.sql`.
5. No **Storage**, crie um bucket público chamado `animal-photos`.
6. Em **Authentication** > **Users**, crie um usuário administrador com e-mail e senha.
7. No **Table Editor**, insira esse usuário na tabela `admin_users` com o mesmo `id` do Authentication, `role = 'admin'` e o `display_name` desejado.
8. Em **Settings** > **API**, adicione `http://localhost:8443` às URLs de CORS/redirect (para desenvolvimento local).
9. Em **Authentication** > **URL Configuration**, adicione `http://localhost:8443` e `http://localhost:8443/auth/callback` às Redirect URLs.

### Formatos de foto aceitos

O formulário aceita arquivos de imagem (JPG, PNG, WebP) de até 5 MB cada, com limite de 3 fotos por animal. As fotos são normalizadas pelo navegador (orientação EXIF, conversão para JPEG, máximo 1600 px no maior lado) antes do envio ao Supabase Storage.

### Observação sobre dados

Dados reais, contas de usuário e fotografias armazenadas no Supabase **não** são incluídos ao clonar o repositório GitHub. Cada instalação deve criar seu próprio projeto Supabase e cadastrar seus próprios administradores.

## Executar localmente

```powershell
pnpm dev
```

O frontend inicia em `http://localhost:8443/` (configurado em `vite.figma.config.ts`). Acesse `/admin` para o painel administrativo.

O comando `pnpm dev` inicia apenas o servidor de desenvolvimento do Vite. Não são necessários Docker, Java ou MySQL.

## Testes

```powershell
pnpm typecheck   # Verificação de tipos TypeScript
pnpm lint        # Análise estática com oxlint
pnpm test        # Testes automatizados com vitest
pnpm build       # Build de produção com Vite
pnpm format:check # Verificação de formatação sem alterar arquivos
```

## Estrutura do repositório

| Caminho | Finalidade |
|---|---|
| `src/app/pages/` | Páginas da aplicação (início, catálogo, detalhe, interesse, contato, admin) |
| `src/app/components/` | Componentes React reutilizáveis (cards, formulários, modais) |
| `src/app/components/admin/` | Componentes específicos do painel administrativo |
| `src/app/contexts/` | Contextos React (autenticação, configurações do site, interessados) |
| `src/app/services/` | Serviços de integração com Supabase (animais, interesses, configurações, fotos, auth) |
| `src/app/data/` | Modelos de dados, validações e utilitários |
| `src/app/lib/` | Cliente Supabase e configurações de biblioteca |
| `src/app/types/` | Tipos TypeScript do schema do Supabase |
| `supabase/migrations/` | Migrations SQL do banco de dados |
| `backend/` | API Spring Boot legacy (não é mais necessária para o frontend) |
| `docs/` | Arquitetura, desenvolvimento, segurança e qualidade |
| `specs/` | Especificações SDD, contratos e ADRs |
| `.figma/` | Metadados e configuração do fluxo Figma Make |

`vite.figma.config.ts` compõe `vite.config.ts` e processa metadados, aliases e assets do Figma Make.

## Publicação

O frontend pode ser publicado na [Vercel](https://vercel.com), conectado a este repositório, com deploy automático da branch `main`.

É necessário configurar as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel da Vercel para que a integração com o Supabase funcione em produção.

Não afirme que a produção está funcionando sem verificar o deploy na Vercel.

## Especificações e arquitetura

- [Como trabalhar com as especificações](specs/README.md)
- [Guia para contribuir em branches e Pull Requests](CONTRIBUTING.md)
- [Arquitetura e estado atual](docs/architecture/ARCHITECTURE.md)
- [Plano de qualidade e matriz de testes](docs/quality/QUALITY_PLAN.md)
- [Política e checklist de segurança](docs/security/SECURITY_POLICY.md)
- [Instruções permanentes para agentes](AGENTS.md)
- [Atribuições e licenças de assets](ATTRIBUTIONS.md)

**Importante:** não coloque senhas, chaves de API secretas, tokens ou dados pessoais no repositório. O arquivo `.env` é ignorado pelo Git (`*.env` no `.gitignore`) e deve conter somente valores locais de cada instalação.
