# Inventário de interface, jornadas e lacunas

**Fonte:** leitura estática dos componentes e páginas referenciados por
`src/app/routes.tsx`. “Funcional” descreve somente o comportamento local observado, não
persistência, envio externo ou prontidão de produção.

Para a conclusão documental I1 por ID, consulte a
[matriz de rastreabilidade individual](I1-INTERACTION-TRACEABILITY.md), que associa cada
interação ao requisito, endpoint candidato, persistência, teste e bloqueio. Endpoints
candidatos não são implementados nem contratos definitivos.

## Status usados

- **Parcial:** ação funciona apenas com dados/estado local ou sem uma parte necessária do
  fluxo real.
- **Simulado:** exibe efeito/resultado fictício sem enviar ou persistir no serviço.
- **Ausente:** requisito documentado ainda não aparece como fluxo executável no código.
- **Quebrado/inseguro:** comportamento enganoso, inconsistente ou com falha observável no
  código; não significa necessariamente que a página inteira deixa de carregar.
- **Funcional (local):** comportamento puramente visual/navegação/local observado no código.

As prioridades usam a legenda P0–P3 de `README.md`. Cada critério é uma futura prova de
aceite, não um teste executado nesta auditoria.

## Rotas

| Rota | Origem | Estado e observação |
|---|---|---|
| `/` | `src/app/routes.tsx` → `Home.tsx` | Renderiza landing estática; estatísticas são literais e não vêm de fonte verificável. |
| `/animais` | `routes.tsx` → `Animals.tsx` | Busca e espécie filtram somente `getAvailableAnimals()` estático. |
| `/animais/:id` | `routes.tsx` → `AnimalDetail.tsx` | Lê `mockAnimals`; detalhe inexistente tem retorno ao catálogo. |
| `/interesse/:id` | `routes.tsx` → `Interest.tsx` | Lê mock por ID e permite enviar formulário local, sem validar que animal ainda está disponível. |
| `/contato` | `routes.tsx` → `Contact.tsx` | Links externos abrem destinos; formulário apenas mostra simulação de sucesso. |
| `/admin` | `routes.tsx` → `Admin.tsx` | Rota aberta sem guard de rota/API; login somente estado do componente. |
| `*` | `routes.tsx` → `NotFound.tsx` | Página 404 com link à home. |

## Interações por área

| ID / arquivo e componente | Localização / ação | Esperado | Observado no código | Dependências para fim a fim | Estado / prioridade | Critério de aceite futuro |
|---|---|---|---|---|---|---|
| NAV-01 — `Header.tsx` | Logo SAAL | Abrir home | `Link` para `/`; carregamento da imagem depende de asset | Router e asset publicado | Funcional (local), P2 | Mouse e teclado abrem `/`; imagem carrega e tem nome alternativo. |
| NAV-02 — `Header.tsx` | Menu desktop: Início, Animais, Contato e CTA | Abrir rota correta e indicar rota ativa | `NavLink` ativo nas três rotas; CTA navega ao catálogo | Router | Funcional (local), P2 | Cada link chega à rota esperada e o estado atual é programaticamente identificável. |
| NAV-03 — `Header.tsx` | Menu mobile e botão hambúrguer | Abrir/fechar navegação e escolher link | Estado React abre/fecha; `aria-label`/`aria-expanded` presentes no botão; links fecham o menu. Não há indicação programática de relação `controls` | Breakpoint Tailwind e teclado/dispositivo | Parcial, P2 | Em 320–375 px, teclado e toque abrem, percorrem e fecham o menu; foco permanece visível e expansão é anunciada. |
| NAV-04 — `Footer.tsx` | Links rápidos e rota admin | Navegar às rotas locais | Links para home, catálogo, contato e `/admin` sem controle de acesso adicional | Router e backend de autorização futuro | Parcial, P0 para admin / P2 demais | Links locais funcionam; `/admin` e API negam acesso real sem sessão válida. |
| NAV-05 — `Footer.tsx`, `Contact.tsx` | Telefone, e-mail, WhatsApp, Instagram, localização | Abrir contato externo correto | `tel:`, `mailto:` e destinos HTTPS são links; localização é texto, não mapa | Aplicativo/dispositivo externo | Funcional para links locais, P3 localização | Links têm destino válido; localização só se torna ação caso requisito aprovado. |
| NAV-06 — `WhatsAppButton.tsx` | Botão flutuante em layout público | Abrir conversa de WhatsApp com mensagem | Link `wa.me` em nova aba, `rel=noopener noreferrer` e nome acessível | WhatsApp/rede externa | Funcional externo não validado, P2 | Teclado, touch e link abrem número correto; comportamento externo testado manualmente. |
| HOME-01 — `Home.tsx` | “Quero Adotar Agora”, CTAs e links de catálogo/contato | Levar à página alvo | Links SPA para catálogo/contato | Router | Funcional (local), P2 | Cada CTA abre a rota declarada e não causa reload indevido. |
| HOME-02 — `Home.tsx` | “Área Administrativa” | Entrada administrativa protegida | Abre `/admin` público; proteção apenas alegada em docs antigas | Autenticação e autorização backend | Inseguro, P0 | Acesso sem sessão não lê dados nem executa endpoint; login real libera somente permissões concedidas. |
| HOME-03 — `Home.tsx` | Três cards de animais disponíveis | Acessar detalhe | Cards vêm do primeiro conjunto de mocks disponíveis | Catálogo/API futura | Parcial, P1 | Cards exibem dados publicados e abrem o detalhe persistido correto. |
| HOME-04 — `Home.tsx` | Estatísticas 350+, 280+, 15, 1.2k+ | Apresentar indicadores corretos | Valores hardcoded sem fonte ou atualização | Fonte de dados comprovada ou decisão para publicar estatísticas | Simulado, P1 | Cada valor publicado possui fonte autorizada, definição e atualização verificável; caso contrário, é retirado/rotulado. |
| HOME-05 — `HelpBanner.tsx` | Cards “Faça uma Doação”, “Seja Voluntário”, “Divulgue” | Levar a instrução/canal correspondente | Divs com hover/animação, sem link, botão ou ação | Decisão de canal e requisitos da ONG | Ausente, P3 | Só apresentar affordance acionável quando destino for aprovado; cada ação abre destino real. |
| CAT-01 — `Animals.tsx` | Campo “Buscar por nome” | Filtrar texto ignorando maiúsculas | Estado local aplica busca na lista de mocks e atualiza contador | Dados remotos e serviço de catálogo | Parcial, P1 | Com API, mesma busca atualiza resultados/contador, preserva entrada e reporta erro recuperável. |
| CAT-02 — `Animals.tsx` | Seletor de espécie | Filtrar cachorro/gato/todos | Estado local funciona; evento converte valor via `as any` | Dados remotos; eliminar cast incompatível em implementação | Parcial, P1 | Enum é validado sem `any`; combina AND com busca e mostra somente resultados elegíveis. |
| CAT-03 — `Animals.tsx` / `specs/features/animal-catalog.md` | Filtro de status, ordenação e paginação | Consultar/ordenar mais estados | Filtro por status descrito em `REQUISITOS_FUNCIONAIS.md`, mas ausente. Catálogo atual filtra apenas disponibilidade. Paginação/ordenação pendentes na feature spec | Decisão de regras de listagem e volume | Ausente/pendente, P2–P3 | Não implementar status, ordenação ou paginação antes de aprovar escopo; catálogo aprovado cobre os casos documentados. |
| CAT-04 — `Animals.tsx` | Contador e estado sem resultados | Exibir contagem e forma de recuperação | Contagem local; vazio com ação “Limpar filtros” | Dados reais e tratamento de erros futuro | Parcial, P2 | Vazio difere de erro/loading e limpar filtros restaura resultados sem reload. |
| CAT-05 — `AnimalCard.tsx` | Card, título/foto e “Quero Conhecer” | Abrir detalhe de modo semântico | Todo card é um `<Link>` que contém outro `<button>` sem handler. Elementos interativos aninhados invalidam a semântica HTML; o botão não tem ação própria e clique é capturado pela âncora | Dado de catálogo e refatoração sem mudar design | Quebrado em semântica, P1 | Um único alvo de interação válido por card; ativação por Enter/clique abre o detalhe; sem botão interativo aninhado. |
| CAT-06 — `AnimalDetail.tsx` | Botão “Voltar” | Retornar sem sair do site | `navigate(-1)` depende do histórico; acesso direto pode não voltar ao catálogo | Histórico de navegação/router | Parcial, P2 | Acesso direto ou sem entrada interna oferece retorno previsível ao catálogo; histórico interno permanece natural. |
| CAT-07 — `AnimalDetail.tsx` | Miniaturas da galeria | Trocar foto e anunciar estado atual | Botões alteram índice local; sem `aria-label`, `aria-pressed`/estado selecionado anunciado ou fallback para erro de imagem | URLs/armazenamento de fotos e acessibilidade | Parcial, P2 | Todas as fotos alcançáveis por teclado; leitor de tela reconhece cada imagem e qual está selecionada; falha tem fallback. |
| CAT-08 — `AnimalDetail.tsx` | Compartilhar | Compartilhar URL ou fornecer alternativa | Chama `navigator.share` somente se existir. Sem fallback quando indisponível e rejeição da Promise não tratada | API de compartilhamento/clipboard do navegador | Quebrado em browsers sem API, P2 | Suporte nativo, cancelamento e falha são tratados; navegador incompatível recebe alternativa anunciada. |
| CAT-09 — `AnimalDetail.tsx` | CTA de interesse e estados treatment/adopted | Permitir apenas interesse elegível | CTA aparece somente para `available`; treatment informa status; para adopted não há decisão explicitada; validação no detalhe usa mock | Fonte de status única e regra final adotados | Parcial, P1 | CTA só é exibida se resposta atual autorizar; status desatualizado é rejeitado no servidor sem falso sucesso. |
| INT-01 — `Interest.tsx` | Acesso `/interesse/:id` e preview | Mostrar animal correto e permitir somente animal elegível | ID procurado em mock; se animal existe e não está available, formulário ainda pode ser preenchido/enviado via URL direta | GET de animal e validação de disponibilidade no POST | Quebrado em regra, P1 | IDs ausentes/indisponíveis mostram estado sem formulário; o servidor repete a validação no envio. |
| INT-02 — `Interest.tsx` | Nome, e-mail, telefone, mensagem | Coletar dados com validação acessível | `required`/`type=email`; telefone sem formato/limite explícito; sem regra de privacidade exibida; mensagem opcional | Política LGPD, validação server-side e limites aprovados | Parcial, P1 | Erros associados aos campos; validação cliente/servidor; aviso/finalidade aprovados; não coletar excedentes. |
| INT-03 — `Interest.tsx`, `InterestContext.tsx` | Enviar interesse | Registrar uma única solicitação e confirmar | Espera artificial de 1,5 s, insere Context React e mostra sucesso; nenhum POST; recarregar limpa; sucesso sempre local; id `Date.now()` | Backend, MySQL, regras de duplicidade/idempotência e UX de erro | Simulado, P0 | Uma solicitação válida fica persistida após novo login/reload; só confirma retorno do servidor; falha mantém campos sem duplicata. |
| INT-04 — `Interest.tsx` | “Voltar”, “Ver Outros Animais”, “Voltar ao Início” | Continuar jornada após formulário | Links de sucesso funcionam; botão inicial depende de `navigate(-1)` | Router/histórico | Parcial, P2 | Rotas seguintes são corretas; entrada direta nunca causa retorno inesperado ao browser/site externo. |
| CONTACT-01 — `Contact.tsx` | Links de telefone, e-mail, Instagram e contato | Iniciar contato pelo canal existente | Tel/WhatsApp/e-mail/Instagram são links; dados exibidos não passaram por auditoria operacional | Aplicativos e destinos externos | Funcional parcial, P2 | Todos os destinos corretos e testados; expectativas e prazos exibidos são confirmados pela ONG. |
| CONTACT-02 — `Contact.tsx` | Campos nome, e-mail, assunto, mensagem | Validar e enviar mensagem | Inputs HTML `required` e `type=email`; envio é local | Decisão entre e-mail, fila ou persistência; proteção de abuso; política PII | Simulado, P0 | Serviço recebe/encaminha mensagem e apenas então confirma; validação, limites, privacidade e antiabuso testados. |
| CONTACT-03 — `Contact.tsx` | Sucesso por 3 s e limpeza do formulário | Manter resultado até próximo passo seguro | `setSubmitted(true)`, timer limpa após 3 s; não há envio nem estado de erro/loading | Serviço real e retorno de aceitação | Enganoso, P0 | Sem falso sucesso; sucesso permanece perceptível até ação/navegação; erro mantém campos e informa recuperação. |
| ADMIN-01 — `Admin.tsx` | Usuário/senha e botão “Entrar” | Autenticar e estabelecer sessão segura | Compara literal `admin`/`saal2026` no browser; sucesso é `useState`; falha com `alert`; inputs não obrigatórios | Backend auth, política de senha/sessão, rate limit, CSRF quando aplicável | Inseguro, P0 | Nenhum segredo client-side; servidor autentica, limita abuso e retorna erro genérico; sessão está protegida e logout verificável. |
| ADMIN-02 — `Admin.tsx` / `routes.tsx` | Rota privada e link admin | Proteger dashboard e APIs | `/admin` acessível sem loader/guard; qualquer autorização visual seria contornável | Backend, role/recurso, guard de UX sem autoridade | Inseguro, P0 | Anônimo não obtém dados nem operação; cada endpoint lê/escreve com autorização própria. |
| ADMIN-03 — `Admin.tsx` | “Sair” | Encerrar a sessão de forma efetiva | Define `isLoggedIn=false` somente no componente | Revogação/invalidação backend e limpeza de cliente | Parcial inseguro, P0 | Sessão/token anterior deixa de funcionar no servidor; pós-logout não há retorno ao painel por histórico/cache. |
| ADMIN-04 — `Admin.tsx` | Cards de contagem e tabela de animais | Refletir estado de origem única | Contagem em estado local inicializado em mocks; não sincroniza catálogo público, requests de API ou reload | API persistida e DTOs | Simulado, P1 | Contagens e linhas correspondem a dados persistidos e filtros/estados vazios/erros são distintos. |
| ADMIN-05 — `Admin.tsx` | “Cadastrar Novo Animal” abre `AnimalForm` | Abrir formulário com cancelamento e validação | Abre/fecha via estado React; adicionar cria objeto local com `Date.now()` e `!` non-null assertions | API CRUD, validação server-side, ID servidor | Parcial, P1 | Salvar cria um único registro persistido; cancelar não grava; falhas não limpam dados e são anunciadas. |
| ADMIN-06 — `AnimalForm.tsx` | Campos do animal, seletores/status, personalidade e info médica | Validar domínios e manter dados editáveis | `required` em alguns campos; status/species/size/sex usam casts; `Partial<Animal>` e parsing de tags; limites de idade/texto não definidos | Domínio/modelo e validações server-side | Parcial, P1 | Enums e limites aprovados; erros acessíveis; novo estado aparece no catálogo após confirmação. |
| ADMIN-07 — `AnimalForm.tsx` | URL da imagem, arquivo, preview | Gerenciar fotos com segurança | URL é aceita diretamente; `accept=image/*` filtra só seletor; FileReader converte Base64 local; sem tamanho, assinatura, erro, remoção ou storage | Limites/formats aprovados, validação server-side e serviço de storage | Inseguro/simulado, P1 | Tipo/conteúdo/limites verificados; falhas recuperáveis; imagem persistida via storage aprovado, nunca Base64 volátil como prova. |
| ADMIN-08 — `AnimalForm.tsx` | Modal: fechar X, cancelar, salvar | Dialog acessível e sem perdas acidentais | Fecha X/cancelar; modal é `<div>`, sem `role=dialog`, `aria-modal`, gestão de foco, Escape ou fechamento por backdrop. Escrolling interno limitado a `70vh` | Semântica/teclado/foco e decisões de confirmação | Parcial, P2 | Foco entra/retorna, Escape/cancel funcionam, fundo não recebe foco, nome/erro anunciados, conteúdo cabe em tela baixa. |
| ADMIN-09 — `Admin.tsx` | Editar por linha | Atualizar o cadastro público persistido | Faz merge em array de estado local, não altera mock compartilhado nem backend | API PUT, controle concorrente/versão (decidir) | Simulado, P1 | Edição aparece após reload para admin e visitante; conflito é informado sem sobrescrever dados alheios. |
| ADMIN-10 — `Admin.tsx` | Excluir, confirmar/cancelar por linha | Remover ou arquivar cadastro sem acidente | Confirmação em dois cliques e cancelamento local; filtra o array; a regra física/arquivo está pendente | Permissão servidor, política arquivar/excluir, integridade de solicitações | Parcial/simulado, P1 | Ação e eventual impacto em referências são confirmados; operação autorizada persistida; cancelamento não altera dados. |
| ADMIN-11 — `Admin.tsx` | Tabela horizontal no mobile | Consultar e acionar cada linha em tela pequena | Wrapper `overflow-x-auto`; sem alternativas específicas para ações ou anúncio do scroll | Comportamento de viewport e teclado | Parcial, P2 | Navegação não perde controles; área de rolagem identificada e acessível; ações têm nome e alvo adequado. |
| ADMIN-12 — `Admin.tsx`, `InterestContext.tsx` | Lista vazia/preenchida, contagem pendente | Receber solicitações reais com acesso mínimo | Context global volátil na mesma sessão; interface lista PII e status; zero em novo carregamento | API autorizada, modelo, política LGPD e testes de acesso | Parcial/simulado, P0 | Anônimo recebe 401/403; admin autorizado vê somente dados necessários; vazio, falha e carregamento são distintos. |
| ADMIN-13 — `Admin.tsx` | “Aceitar” e “Recusar” | Atualizar fluxo da adoção e histórico | Troca status local `pending`→accepted/rejected sem confirmação, transição aprovada ou persistência | Decisão sobre semântica/transições, API auth, auditoria, concorrência | Simulado, P1 | Transições aprovadas persistem; duplicidade/conflito/erro não geram falso sucesso; histórico/auditoria conforme política. |
| ADMIN-14 — `Admin.tsx` | Busca/filtro de solicitações, marcar contato, exportação, resposta | Apoiar tarefas explícitas da equipe | Não há controles/handlers; apenas lista, status e resumo; funcionalidade permanece parcial nos requisitos | Decisão de escopo, PII/export, serviço/e-mail | Ausente/pendente, P3 | Implementar apenas após aprovar cada requisito e política de dados; dados/export são limitados e auditáveis. |
| NF-01 — `NotFound.tsx` | “Voltar para o Início” | Recuperar rota inválida | `Link` para `/` | Router | Funcional (local), P2 | Rota desconhecida tem status/estado navegável, foco no conteúdo e destino funcional. |

## Jornada pública observada e alvo de aceite

1. **Descobrir:** home → CTA ou card → catálogo. Hoje o catálogo usa oito objetos mockados,
   pesquisa apenas nome e espécie e oculta todos os não disponíveis. Os contadores da home
   não são calculados nem vinculados a dados.
2. **Conhecer:** card → detalhes → galeria, status e eventual interesse. Dados vêm do mock
   estático; o botão de card é um controle aninhado; compartilhar não trata browsers sem
   `navigator.share` nem rejeição.
3. **Manifestar interesse:** detalhe disponível → formulário → confirmação visual. Hoje o
   POST não existe: um timer insere dados pessoais no Context volátil. URL direta permite
   abrir interesse de animal não disponível. Não há aviso/retensão definida, spam control,
   API error nem notificação comprovada.
4. **Contato geral:** link externo ou formulário. Formulário não sai do browser; a tela
   declara “Mensagem enviada” antes de qualquer sistema destinatário.
5. **Acompanhar adoção:** painel tenta listar e alterar status de manifestações originadas
   no mesmo Context e na mesma sessão. Isso não sobrevive refresh e não equivale a gestão de
   solicitações recebidas.

## Jornada administrativa observada e alvo de aceite

1. Abrir `/admin` ou CTA público mostra login em qualquer sessão; credencial demo é texto
   fonte e comparação ocorre no navegador. Não há mecanismo de recuperação ou sessão
   persistente; logout é reset de estado.
2. Dashboard inicializa animais com mocks separados do catálogo. Create/edit/delete e
   contagens alteram somente esse array React.
3. Formulário permite URL livre ou FileReader/Base64; não envia/valida em storage.
4. Solicitações exibidas são as entradas da mesma instância do Context; aceitar/recusar
   altera memória, sem filtro, auditoria, notificação, persistência ou política de estado.

O aceite fim a fim exige navegador → API autenticada/autorizada → regras e dados MySQL
persistidos → resposta confirmada → interface em estado consistente, com testes de erros,
acesso e recarga.

## Acessibilidade e responsividade: revisão estática

### Observações concretas

- Elementos nativos `<a>`, `<button>`, `<input>` e `<select>` oferecem semântica e teclado
  básicos; forms principais associam label/input. Isto **não** demonstra WCAG AA.
- `AnimalCard` contém `<button>` dentro de `<Link>`, padrão inválido de interatividade
  aninhada.
- Botão mobile declara `aria-label` e `aria-expanded`, mas não associa menu por `aria-controls`;
  não se observou Escape/foco ao abrir/fechar.
- Galeria não anuncia índice/seleção de miniatura; share é um botão que pode não fazer nada.
- Modal `AnimalForm` não declara semântica de dialog, modalidade ou controle de foco/teclado;
  os campos de URL/arquivo precisam de label/nome acessível inequívoco.
- Tela principal não possui skip link próprio nem foco programático identificado no `<main>`;
  o plugin pode gerar bypass link, mas `.figma/make/site.json` precisa ser validado na
  implantação.
- `index.html` declara `color-scheme: light dark`; a UI usa cores hardcoded e não tem
  alternância real de tema. Testar contraste/controles nativos sob preferências do sistema.
- A configuração Figma atual gera `<html lang="en">`, título “Figma Make App” e
  `noindex, nofollow` (confirmado no HTML emitido); a página é PT-BR. Não há title/meta
  específicos por rota. Corrigir para publicação exige decisão de domínio/SEO e teste com
  fallback SPA.
- O plugin de site desativa skip/bypass links (`addBypassLinks: false`); o `<main>` global não
  possui id/foco para skip link. Não foi observado um link de salto no layout atual.
- Nenhum teste automatizado de axe, leitor de tela, foco, preferência `prefers-reduced-motion`
  ou zoom foi encontrado.

### Critérios que todo incremento deve provar

- Validar manualmente em 320×568, 375×667, 390×844, 768×1024, 1024×768, 1440×900 e
  1920×1080; usar tamanhos representativos e repetir em zoom 200% e altura reduzida.
- Nenhum overflow horizontal de página, texto/controle cortado, overlay que impeça enviar/
  fechar; tabela pode ter scroll delimitado e identificado.
- Header, cards, formulário, galeria, tabela administrativa e dialog utilizáveis por toque,
  mouse e teclado; foco visível e ordem previsível.
- Alvo mínimo, espaçamento, contraste, reflow, identificação de erro, labels/nome acessível,
  anúncio de loading/sucesso/erro, redução de movimento e semântica verificados segundo WCAG
  2.2 AA nos critérios aplicáveis.
- Registrar dispositivo/navegador e evidência; a matriz acima é plano, não execução de
  testes de viewport.
