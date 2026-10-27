# SAAL - Santuário de Animais Anjos da Luz

Site oficial da ONG de proteção animal SAAL, localizada em Capão Bonito - SP.

> **Estado atual:** protótipo frontend. Catálogo e páginas públicas usam dados mockados.
> Login, CRUD administrativo, solicitações de adoção e formulário de contato não possuem
> backend nem persistência. Consulte [`specs/`](specs/README.md) antes de evoluir o sistema.

## Desenvolvimento local

### Requisitos

- Node.js 22 (definido em `.mise.toml`)
- pnpm 10.34.3
- IntelliJ IDEA com os plugins JavaScript and TypeScript habilitados

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Comandos de qualidade:

```bash
pnpm typecheck
pnpm build
pnpm format
pnpm preview
```

Não há comando de teste ou lint configurado neste momento. `pnpm format` formata arquivos,
mas não substitui lint nem testes.

### IntelliJ IDEA

1. Use **File → Open** e selecione a raiz que contém `package.json`.
2. Em **Settings → Languages & Frameworks → Node.js**, selecione Node 22.
3. Selecione `pnpm` como package manager.
4. Execute `pnpm install --frozen-lockfile` no terminal integrado.
5. Em **Run → Edit Configurations**, crie uma configuração **npm** usando o package manager
   pnpm e o script `dev`.
6. Para validar produção, crie configurações para os scripts `typecheck` e `build`.

## Spec-Driven Development

- Processo, estados e rastreabilidade: [`specs/README.md`](specs/README.md)
- Arquitetura atual e planejada: [`specs/architecture/`](specs/architecture)
- Funcionalidades: [`specs/features/`](specs/features)
- Contrato REST planejado: [`specs/contracts/openapi.yaml`](specs/contracts/openapi.yaml)
- Decisões arquiteturais: [`specs/decisions/`](specs/decisions)
- Regras para assistentes: [`AGENTS.md`](AGENTS.md)

## Build e publicação

`pnpm build` gera os arquivos estáticos em `dist/`. Publique o conteúdo dessa pasta em um
host com fallback de SPA para `index.html`. A variável `VITE_API_URL` será necessária quando
a integração REST for implementada; variáveis `VITE_*` são públicas no bundle e nunca devem
conter segredos.

O backend Spring Boot e o MySQL serão serviços separados. Eles não existem neste repositório
e não são necessários para executar o protótipo atual.

## Exportação para GitHub

```bash
git status
git add .
git commit -m "Prepare SAAL for spec-driven development"
git remote add github https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u github main
```

Se o remoto `github` já existir, use `git remote set-url github <URL>`. Revise `git diff
--staged` antes do commit e nunca envie arquivos `.env`.

## 🎨 Sobre o Projeto

Site moderno, responsivo e emocional focado em facilitar a adoção de animais resgatados. O design transmite amor, confiança e acolhimento.

## 🌟 Funcionalidades

- **Home**: Landing page com hero banner, estatísticas, animais em destaque e processo de adoção
- **Catálogo de Animais**: Grid com filtros por espécie, status e busca por nome
- **Detalhes do Animal**: Galeria de fotos, informações completas, personalidade e botão de interesse
- **Formulário de Interesse**: Sistema de manifestação de interesse com validação
- **Contato**: Informações de contato e formulário de mensagem
- **Painel Admin**: Dashboard com login, CRUD de animais e lista de interessados
- **WhatsApp Flutuante**: Botão de contato direto via WhatsApp

## 🎨 Design

### Paleta de Cores
- Verde Principal: `#2E7D6B`
- Verde Suave: `#6FAE9C`
- Dourado Destaque: `#E4B04A`
- Bege Claro: `#F5EFE6`
- Branco: `#FFFFFF`

### Tipografia
- Família: Poppins
- Pesos: Regular (400), Medium (500), SemiBold (600), Bold (700)

## 📱 Responsividade

- Mobile First
- Layout adaptável para tablet e desktop
- Componentes otimizados para todos os dispositivos

## 🔐 Acesso Admin demonstrativo

**Demo**:
- Usuário: `admin`
- Senha: `saal2026`

Essas credenciais estão no frontend e não oferecem segurança real. Não usar em produção.

## 📞 Contato SAAL

- **Telefone/WhatsApp**: (15) 99692-7636
- **Email**: contato@saal.com.br
- **Instagram**: @saal_santuario
- **Localização**: Capão Bonito - SP

## 🛠️ Tecnologias

- React 18
- React Router 7
- Tailwind CSS v4
- Motion (Framer Motion)
- Lucide React (ícones)
- TypeScript

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── data/           # Dados mockados
│   └── routes.tsx      # Configuração de rotas
├── imports/            # Assets importados (logo)
└── styles/             # Estilos globais e tema
```

## 🚀 Como Contribuir

1. Adote um animal
2. Faça doações
3. Seja voluntário
4. Divulgue o trabalho da SAAL

---

**SAAL** - Resgatando, cuidando e encontrando lares amorosos para animais que precisam de uma segunda chance.

© 2026 SAAL - Santuário de Animais Anjos da Luz. Todos os direitos reservados.
