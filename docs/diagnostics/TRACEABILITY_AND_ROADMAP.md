# Rastreabilidade, contratos, dados e plano incremental

Esta matriz registra estado no código lido; endpoints e persistência são do OpenAPI/modelo
**planejados**, não serviços ativos. Testes mencionados são requisitos futuros, não foram
executados nesta auditoria.

O detalhamento I1 de todos os IDs do inventário, incluindo requisitos, endpoint ou N/A,
persistência, teste e bloqueio, está em
[`I1-INTERACTION-TRACEABILITY.md`](I1-INTERACTION-TRACEABILITY.md).

## Matriz requisito → componente → endpoint → persistência → teste → status

| Requisito/fluxo | Componente/código atual | Endpoint alvo no OpenAPI atual | Persistência alvo | Teste de aceite necessário | Status atual |
|---|---|---|---|---|---|
| Navegação SPA, URLs e 404 | `routes.tsx`, `RootLayout.tsx`, `Header.tsx`, `Footer.tsx`, `NotFound.tsx` | N/A | N/A | E2E: cada link/rota, rota inválida, refresh e deep link | Parcialmente executável localmente; nenhum teste automatizado |
| Navegação, links, conteúdo e acessibilidade compartilhados | `Header.tsx`, `Footer.tsx`, `HelpBanner.tsx`, `AnimalCard.tsx`, `AnimalDetail.tsx`, `NotFound.tsx`, `index.html` | N/A; depende das APIs de catálogo/contato | N/A | Testes de interação por ID; teclado/foco/semântica, share, destinos, estatísticas verificadas, viewport/zoom e metadata | Parcial/inconsistente; coberto por nova capability `public-experience` |
| Home/indicadores | `Home.tsx` | **Não há endpoint de estatísticas** | Fonte autorizada a decidir; hoje literais | Teste de origem/definição do indicador ou retirada/rotulagem das cifras | Estático/simulado |
| Catálogo público | `Animals.tsx`, `AnimalCard.tsx`, `data/animals.ts` | `GET /animals?status&species&search` | `animals`, `animal_images` futuros | API: só available; busca/filter combinados; vazio/erro/paginação se aprovada | Mock; sem API |
| Detalhe / galeria / status | `AnimalDetail.tsx` | `GET /animals/{animalId}` | `animals`, `animal_images` | Contrato e UI: existente, 404, status, galeria e falha de foto | Mock |
| Compartilhar detalhe | `AnimalDetail.tsx` | N/A | N/A | UI: nativo, não suportado, rejeição e alternativa acessível | Parcial; falha sem fallback |
| Manifestar interesse | `Interest.tsx`, `InterestContext.tsx` | `POST /adoption-requests` | `adoption_requests` + FK animal (não implementado) | API/UI: campo inválido, animal indisponível, persistência/reload, timeout/retry duplicado | Simulado em estado volátil |
| Autenticar/logout | `Admin.tsx` | `POST /auth/login`; **logout não consta** | `administrators` com hash e estado futuro | API: login válido/inválido, rate limit, sessão expirada/revogada, logout | Protótipo inseguro; endpoint não existe |
| Leitura admin por recurso | `Admin.tsx`, `/admin` em `routes.tsx` | `GET /animals` é público; não existe operação admin específica | `animals` | Testes de 401/403, role e permissão do recurso em todos métodos | Ausente; rota pública |
| Criar/editar animal | `Admin.tsx`, `AnimalForm.tsx` | `POST /animals`, `PUT /animals/{animalId}` | `animals`, `animal_images` | CRUD com autorização, validação, concorrência, falha e efeito público | Só array local separado |
| Remoção animal | `Admin.tsx` | `DELETE /animals/{animalId}` (delete/archive pendente) | `animals`, relações/solicitações | Testar política aprovada, integridade referencial, confirmação/cancelamento | Só remove do array |
| Upload imagem | `AnimalForm.tsx` | **Nenhum endpoint de imagem** | `animal_images` com localização/meta; storage pendente | Tipo real, MIME/spoof, limite, dimensões, malware quando aplicável, acesso e falha storage | Base64/URL local |
| Lista admin de solicitações | `Admin.tsx`, `InterestContext.tsx` | `GET /adoption-requests` + filtro status/animalId | `adoption_requests` | 401/403; PII; filtros; vazio/erro; paginação se aprovada | Parcial local |
| Atualizar status da solicitação | `Admin.tsx`, `InterestContext.tsx` | `PATCH /adoption-requests/{requestId}/status` | `adoption_requests`; histórico pendente | Matriz de transições, idempotência/conflito, auditoria e contagem | Só Context local; regras pendentes |
| Contato por formulário | `Contact.tsx` | `POST /contact-messages` (`202`) | Persistência/e-mail pendente | Aceitação real, erro, retry, rate limit e minimização/log sem PII | Sucesso falso sem envio |
| Links de contato externos | `Contact.tsx`, `Footer.tsx`, `WhatsAppButton.tsx` | N/A | N/A | Verificação manual dos destinos e abertura segura | Links codificados; destinos externos não verificados |
| Segurança de entrada/saída | Forms atuais; React escaping padrão | Validação/error models OpenAPI incompletos | Validação de fronteira backend futura | Testes de payload inválido, XSS e erros sem detalhe | HTML client-side apenas |
| Responsividade e acessibilidade | Tailwind nas páginas/componentes; nenhum test runner | N/A | N/A | E2E/axe + teclado/leitor/viewport para WCAG 2.2 AA | Não verificado em runtime |
| Idioma, SEO e indexação | `index.html`, `.figma/make/site.json`, plugin Vite Figma | Metadados específicos por rota ausentes | N/A | Validar `lang=pt-BR`, title/description, canonical/OG e política de indexação no domínio publicado | HTML emitido observado com lang `en`, title “Figma Make App” e `noindex,nofollow` |
| Ambiente local e deploy | `vite.figma.config.ts`, `.env.example`, README | API em host futuro | MySQL futuro; backup e retenção pendentes | CI, migration/restore rehearsal, headers/CORS e smoke test pós-deploy | Sem backend/infra de produção; dev/preview usa `0.0.0.0` |

## Arquitetura frontend e dependências verificadas

- Entry `src/main.tsx` monta React StrictMode; `App.tsx` fornece Router e Context. As rotas
  são declarativas e não exibem loaders/guards. Não há pasta de services, consumidor `fetch`
  ou client HTTP; testes encontraram apenas dado de `animals.ts` e `InterestContext`.
- `Animal` é tipado, mas `Animals.tsx` usa `as any` no filtro e `AnimalForm.tsx` usa casts para
  enums. `Admin.tsx` usa `Partial<Animal>` e non-null assertions ao criar. O `tsconfig.json`
  é `strict`, mas os casts reduzem a segurança de fronteira; corrigir com validação/type
  guards no incremento correspondente.
- `components/ui/` contém componentes de scaffold, mas nenhuma importação direta desses
  módulos foi encontrada fora da própria biblioteca; a interface ativa usa elementos e
  classes diretamente. Esses arquivos não constituem prova de uso ou de acessibilidade.
- `package.json` tem 57 dependências de produção e lista ferramentas TypeScript/Vite/Tailwind.
  Uma varredura estática dos 70 `.ts`/`.tsx` não substitui análise de import condicional,
  CSS, configuração Vite, grafo transitivo e bundle. Remoção/upgrade exige inventário de
  import completo, `pnpm why`, auditoria de licença/segurança e build.
- O código de produto não tem hook de data-fetching, reducer/store persistente ou testes
  unitários. `InterestContext` não usa `localStorage`; os timers não atestam entrega.
- `vite.figma.config.ts` combina configuração de desenvolvimento/exportação Figma; host e
  preview `0.0.0.0` expõem servidor às interfaces da máquina na rede local. Não usar como
  equivalente a implantação reforçada de produção.

## Modelo de domínio alvo (conceitual)

Alinhado a `specs/contracts/data-model.md`; não é migration nem decisão final de tipos/índices.

| Agregado/entidade | Campos/dados conhecidos | Relações e controles |
|---|---|---|
| **Animal** | id, nome, espécie `DOG/CAT`, idade, porte, sexo, status `AVAILABLE/TREATMENT/ADOPTED`, descrição, personalidade, informações médicas, timestamps | Estado público controlado; formato de idade, remoção/arquivo, publicação e status precisam definição operacional. Status do mock não é lifecycle aprovado. |
| **AnimalImage** | id, animalId, URL/localização, posição, metadados técnicos | FK do animal; tamanho/tipo/limites e storage provider pendentes; imagem não confiável, não armazenar credencial ou Base64 do browser como mecanismo de produção. |
| **AdoptionRequest** | id, animalId, applicantName, e-mail, telefone, mensagem opcional, status `PENDING/ACCEPTED/REJECTED`, createdAt | FK para animal; dados pessoais minimizados e acesso administrativo controlado; consentimento/base legal, retenção, idempotência e histórico pendentes. |
| **Administrator** | id, identificador/e-mail, passwordHash, ativo, permissões, timestamps/último acesso | Credenciais apenas como hash no backend. Perfis, cadastro, bootstrap inicial e recuperação pendentes. |
| **ContactMessage (condicional)** | nome, e-mail, assunto, mensagem e timestamps somente se persistir | Decidir armazenamento versus encaminhamento a e-mail, retenção e descarte antes de construir o endpoint. |

Princípios: banco somente pelo Spring Boot; migrations versionadas, transacionais e
reversíveis quando viável; consultas parametrizadas/ORM; DTOs separados de entidades;
integridade referencial; dados pessoais não indexados/retidos além do necessário. Tipo de ID,
índices e tabela de histórico dependem de consultas e regras confirmadas.

## Lacunas e inconsistências documentais/API

- `REQUISITOS_FUNCIONAIS.md` declara filtro de catálogo por status, mas `Animals.tsx` só
  busca nome/espécie e `getAvailableAnimals()` já exclui não disponíveis.
- `CHECKUP_REPORT.md` e `VERIFICACAO_COMPLETA.md` declaram “100%”, testes de dispositivos,
  banco, persistência e upload; o código mostra mocks, estado em memória, upload Base64 local
  e timers de sucesso. Trate como documentação legada não verificada.
- `DOCUMENTACAO_PROJETO.md` inclui afirmação “Produção Ready” junto de credenciais client-side
  e operações de banco que não existem. Contradição crítica que precisa receber aviso antes
  de usar como runbook/status.
- O contrato OpenAPI revisado não declara `bearerAuth` nem token como mecanismo aprovado.
  Operações administrativas estão sob `/admin/*` e marcadas como bloqueadas enquanto
  protocolo, topologia, contas e permissões não forem decididos. Consulte
  [`specs/contracts/openapi.yaml`](../../specs/contracts/openapi.yaml) e
  [`specs/decisions/I1-approval-register.md`](../../specs/decisions/I1-approval-register.md).
- OpenAPI não prevê logout, sessão corrente/refresh, endpoint de upload, limites/paginação,
  request idempotency, concorrência/histórico nem contrato de contato confirmado; status de
  exclusão e transição ainda pendentes.
- Requisitos legados incluem “CRUD remove do banco” e “envio” sem evidência; specs de feature
  são mais atuais e explicitam protótipo. Atualizar documentação legada depois de aprovada a
  mudança, preservando histórico.
- `.github/workflows/copilot-setup-steps.yml` somente instala/verifica OpenSpec. Não é pipeline
  de testes/deploy. `package.json` não declara teste ou lint; não presumir proteções de branch.

## Decisões necessárias antes dos respectivos incrementos

1. Auth: cookie de sessão server-side ou token, domínio/origens de produção, expiração,
   revogação, papéis, ciclo de criação de administradores e recuperação. **Recomendação para
   ADR:** sessão server-side com cookies `HttpOnly`, `Secure`, `SameSite` e CSRF explícito
   quando compatível com topologia same-site; avaliar separadamente se a implantação cruzar
   sites. Não é decisão já aprovada.
2. Adoção/privacidade: processo de status e significado de aceitar/recusar, acesso de equipe,
   transparência/base legal/aviso LGPD, retenção, anonimização/eliminação, exportação, regra
   de contatos duplicados/retry e prazo de resposta.
3. Animais/mídia: arquivar versus excluir, referências/histórico, elegibilidade e publicação,
   formatos/tamanho/dimensões de imagem, storage e responsabilidades de moderação.
4. Contato/integrations: persistir mensagem ou encaminhar a e-mail; provedor, expiração,
   resposta e tratamento de bounce; domínio, CORS e ambientes.
5. Engenharia/operação: versão Java/Spring, Maven/Gradle, migration tool, hospedagem, secrets,
   monitoramento, backup/restore, RPO/RTO, teste e lint frontend, testes backend e política
   de vulnerabilidades/blocking CI. Não atrasar scaffold documental por preferência de
   framework; não liberar dados reais até decisões que os governam.

## Incrementos de implementação e critérios de aceite

Os grupos abaixo foram revisados em `openspec/changes/saal-functional-readiness/tasks.md`:
I0 qualidade/CI; I1 decisões de domínio e contratos; I2 backend; I3 MySQL/migrations; I4
identidade/autorização; I5 administração de animais; I6 imagens; I7 catálogo/experiência
pública; I8 intake; I9 gestão de solicitações; I10 contato; I11 integração/AppSec/UX. Cada
incremento atualiza capability, OpenAPI/ADR aplicável e testes. Esta matriz é baseline
diagnóstica, não substitui os critérios detalhados no OpenSpec.

Os critérios completos, dependências, aceite e verificações de reversibilidade estão na
seção numerada I0–I11 de `openspec/changes/saal-functional-readiness/tasks.md` e em
[`ARCHITECTURE_REVIEW.md`](ARCHITECTURE_REVIEW.md). A sequência substitui a ordem I0–I8
descrita na versão inicial deste diagnóstico; a matriz acima continua sendo a rastreabilidade
do estado observado no código, não um plano de execução independente.

### Critérios transversais para todos os incrementos

- typecheck, testes afetados, lint/build configurados no I0 e política de segurança aprovados
  no CI; nenhum status de teste inventado.
- Sem backend fictício, success-shaped fallback, dado de usuário sem autorização ou alteração
  visual não exigida; loading/empty/error/success são distinguíveis.
- Revisão de segurança focada em entrada, XSS/injeção, CSRF, permissão por recurso, rate,
  secrets, logs e LGPD segundo checklist aplicável.
- Evidência de comportamento a partir de código em execução/testes; documentação atualizada e
  riscos residuais declarados.
