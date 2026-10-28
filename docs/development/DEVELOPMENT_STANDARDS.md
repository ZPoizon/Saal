# Padrões de desenvolvimento

## Processo

1. Antes de alterar código, ler `AGENTS.md`, `specs/README.md`, a feature e ADRs relacionados,
   `docs/architecture/ARCHITECTURE.md` e as políticas de segurança aplicáveis.
2. Confirmar o estado real no código e na especificação: implementado, parcial, protótipo ou
   não implementado. Identificar ameaças, dados envolvidos e impacto visual/funcional.
3. Resolver pendências que bloqueiem a mudança sem inventar decisões de arquitetura ou
   segurança. Seguir OpenSpec/SDD e critérios de aceitação.
4. Fazer a menor alteração coerente; preservar React, TypeScript, Vite, navegação e identidade
   visual. Separar interface, regras de negócio e acesso futuro à API.
5. Atualizar especificação, contrato OpenAPI e/ou ADR quando alterar comportamento ou
   arquitetura. Não criar backend fictício nem substituir integração real por mock sem deixar
   explícito.
6. Após a alteração, executar validações aplicáveis, revisar regressões e completar
   `docs/security/SECURITY_CHECKLIST.md`. Informar resultados e riscos residuais.

## Código e dependências

- Usar TypeScript estrito e tipos explícitos nas fronteiras; não usar `any` sem justificativa
  técnica específica documentada e escopo mínimo.
- Preferir nomes claros, funções coesas e padrões já adotados. Evitar duplicação, camadas e
  abstrações sem reutilização ou necessidade demonstrável.
- Validar dados externos nas fronteiras; erros devem ser tratados sem expor informação
  interna ao usuário.
- Não adicionar dependência sem justificar necessidade, manutenção, licença e impacto de
  segurança. Manter lockfile consistente.
- Não introduzir segredos no código. Configurações `VITE_*` são públicas; `.env.example`
  nunca recebe credenciais reais.
- Não fazer alterações destrutivas em banco, arquivos de usuário ou dados sem autorização
  explícita.
- Preservar acessibilidade, responsividade e componentes/tokens visuais existentes.

## Verificações disponíveis neste repositório

Comandos declarados em `package.json`:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check
pnpm audit --audit-level=moderate
pnpm secrets:check
pnpm build
pnpm format
```

O I0 configura Vitest para testes unitários, Oxlint para lint, oxfmt em modo check para
arquivos de código alterados, `pnpm audit` para vulnerabilidades de dependências e
Secretlint com o preset recomendado para segredos nos arquivos do workspace. `pnpm format`
modifica arquivos; não é lint nem teste. O workflow `.github/workflows/quality.yml` executa
os checks em pull requests e pushes para `main`; `.github/workflows/copilot-setup-steps.yml`
continua restrito ao setup do OpenSpec para o Copilot.

O check de formatação considera arquivos de código alterados para evitar que o baseline
histórico (mais de 70 arquivos `src/` não formatados pelo oxfmt) seja reescrito em massa
neste incremento. Novos/alterados arquivos suportados pelo oxfmt são verificados. O
scanner Secretlint analisa o conteúdo atual do workspace, não todo o histórico Git; segredos
detectados devem ser tratados/rotacionados conforme política, não apenas apagados do arquivo.
Execute verificações pertinentes e relate somente resultados observados. Não afirme que o
workflow executou no GitHub ou que checks são obrigatórios para merge sem evidência de
configuração da branch.

Versões de testes/lint/scanner são fixadas no `pnpm-lock.yaml`; ações do workflow são
referenciadas por commit SHA. A toolchain de aplicação segue `.mise.toml` e `package.json`;
as ferramentas do CI devem ser compatíveis com Node 22 (mínimo 22.12).

### Seleções e evidências do I0

| Controle | Escolha | Razão/limite |
|---|---|---|
| Runtime/package manager | Node `22` (mínimo `22.12`) e pnpm `10.34.3` | Alinha `.mise.toml`, `packageManager` e engines; CI fixa a linha Node 22. |
| Testes | Vitest `4.1.12` | Compatível com Vite 6 e Node 22; os primeiros testes cobrem helpers existentes com a fixture sintética de animais do protótipo, sem criar comportamento de produto. |
| Lint | Oxlint `1.90.0` | Linter TypeScript/JavaScript leve; não adiciona configuração/plug-ins React não usados. A baseline emite três warnings de imports não usados em `Admin.tsx` e `AnimalForm.tsx`; não foram removidos neste incremento. |
| Formatação | oxfmt existente (`0.2.0`), modo `--check` | `format:check` usa comparação Git e verifica somente arquivos suportados alterados; a baseline completa contém mais de 70 arquivos `src/` que oxfmt marcaria, portanto não se reformatou a aplicação em massa. |
| Segredos | Secretlint `13.1.0` + preset recommend `13.1.0` | Licença MIT; varre arquivos visíveis e ocultos do workspace respeitando `.gitignore`, mascara resultados e não requer token. Não examina histórico Git nem arquivos locais ignorados. |
| Dependências | `pnpm audit --audit-level=moderate` | Bloqueia moderadas, altas e críticas; findings lower-severity continuam reportáveis. |
| GitHub Actions | checkout, setup-node e pnpm/action-setup fixados por SHA | Evita referências de action mutáveis; workflow usa somente `contents: read` e não recebe segredos explícitos. |

O primeiro audit I0 revelou advisories high/critical em Vite, React Router, Vitest e
dependências transitivas (incluindo `tar`). Para que o novo gate fosse verde sem exceção,
Vite foi atualizado para `6.4.5`, React Router para `7.18.5`, Vitest para `4.1.12` e
resoluções transitivas vulneráveis foram fixadas em versões corrigidas no bloco `pnpm.overrides`.
As verificações de tipos, testes e build passaram após essas atualizações; a interface e os
fluxos não foram alterados.

As verificações locais finais foram executadas em Node `22.23.4` (runtime oficial, checksum
validado) e pnpm `10.34.3`. A execução do workflow no GitHub e as regras de proteção da branch
não foram observadas: a API de proteção da branch exigiu autenticação (HTTP 401). Assim,
nenhum bloqueio de merge é alegado. O teste temporário falho e o arquivo sintético de segredo
foram removidos após confirmar que os comandos retornam falha e mascaram o valor.

## Plano de controles automatizados

Controles configurados no I0:

1. **Pipeline base:** PRs executam instalação reproduzível com `pnpm install
   --frozen-lockfile`, typecheck, testes, lint, formatação em modo check, auditoria de
   dependências (bloqueando moderadas ou superiores), varredura de segredos e build.
2. **Qualidade:** usar Vitest e Oxlint para a aplicação; adicionar testes de regressão
   relevantes em cada mudança de comportamento.
3. **Dependências e segredos:** `pnpm audit` bloqueia vulnerabilidades high/critical; o
   Secretlint verifica o workspace atual. Alertas de histórico Git e tratamento/rotação de
   credenciais continuam exigindo resposta operacional.
4. **Segurança de API futura:** criar testes de integração para
   autenticação, autorização por papel/recurso, CSRF quando aplicável, validação, rate limit,
   uploads, erros e logs; incluir análise estática e migrations em CI.
5. **Bloqueio de merge:** workflow sozinho não protege a branch. Configurar checks críticos
   como obrigatórios e proteção/regras da branch `main` nas configurações do GitHub e
   verificar na plataforma; isso não foi confirmado neste incremento.

As dependências de teste/lint/scanner foram adicionadas apenas para os critérios I0. A
configuração não implementa backend nem altera comportamento funcional do frontend.
