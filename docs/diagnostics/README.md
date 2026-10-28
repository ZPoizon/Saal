# Diagnóstico de prontidão funcional do SAAL

**Data da auditoria estática:** 27/10/2026
**Escopo:** avaliação anterior à implementação funcional. Nenhum comportamento, dependência,
backend ou dado foi alterado nesta etapa.

**Atualização I1 (28/10/2026):** este é um retrato histórico anterior ao I0/às decisões
técnicas atuais. Para CI/qualidade consulte `../quality/QUALITY_PLAN.md`; para decisões
aprovadas, condicionais e bloqueios ONG consulte
`../../specs/decisions/I1-approval-register.md`. O contrato OpenAPI atual não contém
`bearerAuth` nem token aprovado.

## Resumo executivo

O SAAL é uma SPA navegável de protótipo, não um sistema de adoção pronto para produção.
React 18, TypeScript, Vite e React Router estão presentes e o frontend contém fluxos visuais
para catálogo, detalhe, interesse, contato e administração. O código observado usa dados
estáticos, `useState` e `InterestContext` apenas em memória. Não há API, serviço HTTP,
backend Java, banco de dados, migration, autenticação real ou integração de contato.

**As especificações atuais e os ADRs são mais confiáveis que afirmações históricas de
“100% funcional” ou “pronto para produção”.** Os documentos `CHECKUP_REPORT.md`,
`VERIFICACAO_COMPLETA.md`, `DOCUMENTACAO_PROJETO.md` e trechos de
`REQUISITOS_FUNCIONAIS.md` afirmam recursos e verificações que o código não sustenta
(persistência, filtros, sessão, operações de banco, envio de formulários e produção). Eles
devem ser claramente marcados como históricos/protótipo ou substituídos após revisão, não
reutilizados como evidência de funcionamento.

### Prioridades

| Prioridade | Risco/escopo | Evidência | Bloqueio para aceite |
|---|---|---|---|
| **P0 — antes de uso real/produção** | Credenciais demonstrativas estão hardcoded e são comparadas no navegador; `/admin` não tem proteção de servidor. CRUD/solicitações e formulários não persistem. Confirmações de contato/interesse podem anunciar sucesso sem entrega. | `src/app/pages/Admin.tsx`, `src/app/contexts/InterestContext.tsx`, `src/app/pages/Interest.tsx`, `src/app/pages/Contact.tsx`; `specs/features/admin-authentication.md` | Backend, banco e autorização reais; remover credenciais demonstrativas antes de expor como sistema operacional; confirmar sucesso só após operação real; testes de acesso e regressão. |
| **P1 — núcleo funcional** | CRUD admin não alimenta catálogo público; status/animal não são revalidados no interesse; envio público perde dados; endpoints, erros e estados remotos não existem; upload local/URL não é política segura; dados pessoais sem política operacional concluída. | `Admin.tsx`, `AnimalForm.tsx`, `Interest.tsx`, `Contact.tsx`, contratos atuais e pendências SDD | Fonte única persistida; validação/autorização no backend; erros recuperáveis; decisões de disponibilidade, retenção e upload. |
| **P2 — UX, acessibilidade e operação** | Botão de ação dentro do link do card; Web Share sem fallback/tratamento; galeria sem estado acessível; modal sem semântica/foco/teclado implementados no código da feature; navegação “Voltar” depende de histórico; sem testes, CI de qualidade, lint ou auditoria automática. | `AnimalCard.tsx`, `AnimalDetail.tsx`, `AnimalForm.tsx`, `Interest.tsx`, workflow e scripts | Verificação WCAG 2.2 AA, teclado/leitor de tela, viewport manual/automatizado e testes de comportamento em cada incremento. |
| **P2 — publicação/metadados e ambiente local** | HTML produzido tem `lang="en"` e título “Figma Make App”, embora a interface esteja em português; `robots` é `noindex, nofollow`; servidor dev/preview vincula `0.0.0.0`. | `vite.figma.config.ts`, `.figma/make/site.json`, `dist/index.html` da última validação disponível | Definir metadados/SEO e indexação para o domínio aprovado; restringir dev/preview a rede confiável e não confundir com servidor de produção. |
| **P3 — decisões/produto futuro** | Paginação/ordenação, política de exclusão, transições e significado de aceite/recusa, recuperação de senha, provedor de imagem/e-mail, consentimento/retenção e implantação não estão decididos. Tiles de doação/voluntariado/divulgação são textos sem ação. | `specs/README.md`, features e ADRs; `HelpBanner.tsx` | Decisão explícita da ONG por funcionalidade; não simular serviços nem aumentar escopo comercial sem requisito. |

O primeiro incremento recomendado é **qualidade e CI mínimo (I0)**: baseline reproduzível de
typecheck/build e seleção justificada de teste, lint, formato em modo check e scanners, com
falha deliberada provando que o pipeline reporta falhas. Depois vêm aprovações humanas e
alinhamento do modelo/contrato (I1), serviço separado, banco/migrations e autorização antes
de operações. Flyway e sessão server-side são recomendações, não decisões aprovadas. A
revisão detalhada, pendências, riscos e critérios estão em
[`ARCHITECTURE_REVIEW.md`](ARCHITECTURE_REVIEW.md); o OpenSpec executável está em
[`tasks.md`](../../openspec/changes/saal-functional-readiness/tasks.md).

## Escopo e método

Foram inspecionados o código de `src/main.tsx`, rotas, as sete páginas, componentes próprios
de navegação/catálogo/admin, estado de solicitações, modelo/dados e estilos; o manifesto,
configuração Vite/TypeScript, ambientes e workflow; as seis especificações de feature,
arquitetura, três ADRs, modelo conceitual e contrato OpenAPI; políticas `AGENTS.md`,
segurança e desenvolvimento; e documentação histórica e requisitos.

Foram enumerados também os componentes exportados em `src/app/components/ui/`; não foi
encontrado import dessa biblioteca pelo código de páginas/componentes do app, então eles
foram tratados como scaffolding inativo, não como controles realmente acessíveis/operacionais
da experiência entregue. Os estados/hooks usados pelo produto são `useState` e um único
`InterestContext`; não foram encontrados serviços HTTP nem persistência do navegador.

A matriz detalhada, com origem, localização, expectativa, comportamento observado,
dependências, status, prioridade e critérios verificáveis, está em
[`INTERACTION_INVENTORY.md`](INTERACTION_INVENTORY.md). A matriz requisito → componente →
endpoint → persistência → teste → estado e o plano com decisões pendentes estão em
[`TRACEABILITY_AND_ROADMAP.md`](TRACEABILITY_AND_ROADMAP.md).

## Arquitetura alvo

Manter a arquitetura já aprovada pelos ADRs: frontend SPA React 18 + TypeScript + Vite,
consumindo REST/JSON por HTTPS; backend separado Java + Spring Boot; MySQL 8 acessado apenas
pelo backend. Separar controladores, regras de aplicação/domínio, repositórios e DTOs; não
expor entidades JPA. No frontend, isolar HTTP em serviços/adaptadores e conservar
componentes visuais sem responsabilidade de autorização.

O OpenAPI em `specs/contracts/openapi.yaml` é alvo documental, não serviço ativo. A versão
revisada separa rotas `/admin/*`, deixa o security scheme ausente enquanto a sessão/topologia
não forem aprovadas e marca operações dependentes como bloqueadas. A preferência por sessão
server-side não fecha cookies, CSRF, origens ou protocolo.

## Limitações e estado do workspace

- Auditoria **estática de código e documentos**. Não foi feita sessão de navegador,
  inspeção visual real, teclado/leitor de tela, teste em dispositivos, medição Lighthouse,
  pen-test, análise de infraestrutura ou validação de endpoints; não existem endpoints.
- A configuração define `pnpm typecheck`, `pnpm build` e formatação, mas não testes, lint,
  auditoria de dependências nem CI de produto. O workflow observado só prepara/verifica
  OpenSpec para o agente Copilot. As alegações históricas de dispositivos, tempos e testes
  não vieram acompanhadas de artefatos reprodutíveis.
- A configuração Figma atual produz `lang="en"`, título default “Figma Make App” e
  `noindex, nofollow`, apesar da interface em português; não é configuração SEO aprovada
  para publicação indexável. O servidor de dev e preview usa `host: 0.0.0.0`, portanto fica
  disponível em todas as interfaces da máquina quando iniciado; validar firewall/rede de
  desenvolvimento. Isso não configura um deploy seguro de produção.
- O manifesto contém dependências que não aparecem como imports diretos do app e vários
  pacotes vinculados a componentes UI exportados sem import no produto. Não foi feita análise
  de árvore do bundle, licença ou vulnerabilidade; não remover dependências sem confirmar
  uso transitivo, configurações e impacto.
- OpenSpec CLI 1.15.0 está instalado no ambiente; o schema configurado é `spec-driven` e
  não havia capacidades OpenSpec no store. A proposta cria change e capacidades novas sem
  substituir `specs/features/`.
- A inspeção encontrou quatro assets PNG modificados no worktree em relação ao Git; os
  arquivos presentes têm cabeçalho PNG e comprimentos maiores que zero. Essas alterações
  foram preservadas e não são atribuídas a esta auditoria nem validadas visualmente.
- A análise da interface trata os nomes de componentes e arquivos como evidência; estados
  de navegador/tecnologia assistiva ainda dependem de validação manual e automatizada.

Esta auditoria não certifica segurança, conformidade LGPD, WCAG, performance ou prontidão
para deploy. Use-a como baseline para a proposta OpenSpec e para decisão da ONG.
