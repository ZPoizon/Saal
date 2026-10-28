# Rastreabilidade I1 por ID de interação

Cada ID de `INTERACTION_INVENTORY.md` aparece uma vez abaixo. Endpoints e modelos são
candidatos descritos no OpenAPI, não serviços implementados. `N/A` significa que a interação
é navegação/apresentação no cliente, não que esteja fora de teste. Status e PII ficam
bloqueados pelas decisões ONG indicadas no registro I1.

| ID | Requisito/capability OpenSpec | Endpoint candidato | Persistência futura | Teste previsto | Estado / bloqueio |
|---|---|---|---|---|---|
| NAV-01 | `public-experience`: navegação e semântica | N/A | N/A | Q-I7-03, Q-I7-04 | Navegação local observada; a11y/browser não verificados. |
| NAV-02 | `public-experience`: navegação e estado ativo | N/A | N/A | Q-I7-03 | Rota cliente; E2E futuro. |
| NAV-03 | `public-experience`: teclado/foco/viewport | N/A | N/A | Q-I7-04 | Menu existente parcial; verificação real pendente. |
| NAV-04 | `public-experience`; `admin-authentication`: operações admin protegidas | N/A; destino `/admin` não é API | N/A | Q-I7-03, Q-I4-02 | Segurança admin bloqueada por ONG-01 e TEC-04/05; link não concede autorização. |
| NAV-05 | `public-experience`: links/destinos verificáveis | N/A | N/A | Q-I7-03, verificação manual | Destinos externos e finalidade ONG-11 pendentes. |
| NAV-06 | `public-experience`: links externos seguros | N/A | N/A | Q-I7-03, verificação manual | Número/destino carece de verificação operacional ONG-11. |
| HOME-01 | `public-experience`: destinos reais | N/A | N/A | Q-I7-03 | Navegação interna; conteúdo/canais dependentes ONG-11. |
| HOME-02 | `admin-authentication`: autenticação e autorização | `POST /admin/session` (bloqueado) | Administrator/sessão, não definidos | Q-I4-01–Q-I4-05 | Protótipo inseguro; ONG-01 e TEC-04/05 bloqueiam auth real. |
| HOME-03 | `public-animal-catalog`: listagem e detalhe | `GET /animals`, `GET /animals/{animalId}` | Animal/AnimalImage candidatos | Q-I7-01, Q-I7-02 | Dados e elegibilidade/publicação ONG-02/10 pendentes. |
| HOME-04 | `public-experience`: conteúdo verificável | N/A; endpoint de métricas não aprovado | N/A | Q-I7-03 | Valores sem fonte; bloqueado ONG-11. |
| HOME-05 | `public-experience`: conteúdo sem ação simulada | N/A | N/A | Q-I7-03 | Destino de doação/voluntariado/divulgação bloqueado ONG-11. |
| CAT-01 | `public-animal-catalog`: busca combinada | `GET /animals?search=...` | Animal candidato | Q-I7-01 | Busca atual é local; campos/visibilidade ONG-02/10 pendentes. |
| CAT-02 | `public-animal-catalog`: filtro de espécie | `GET /animals?species=...` | Animal candidato | Q-I7-01 | Vocabulário/semântica ONG-10 pendente; enum do mock não é definitivo. |
| CAT-03 | `public-animal-catalog`: filtros/status | Sem endpoint aprovado | Animal candidato | Q-I7-01 | Status, ordenação e paginação fora do contrato até ONG-02/10 e aprovação de escopo. |
| CAT-04 | `public-animal-catalog`: estado vazio/recuperação | `GET /animals` | Animal candidato | Q-I7-01 | Loading/erro ainda não implementados; regras ONG-02/10 bloqueiam dado final. |
| CAT-05 | `public-animal-catalog`: detalhe semântico | `GET /animals/{animalId}` | Animal candidato | Q-I7-02, Q-I7-03 | Aninhamento de controles observado; persistência/status ONG-02/10 pendentes. |
| CAT-06 | `public-animal-catalog`: detalhe não encontrado/retorno | `GET /animals/{animalId}` | Animal candidato | Q-I7-02, Q-I7-03 | Retorno em acesso direto precisa browser test; endpoint futuro. |
| CAT-07 | `public-animal-catalog`: galeria acessível | Nenhum endpoint de upload no contrato | AnimalImage candidata | Q-I7-02, Q-I7-04 | Storage, metadados e limites bloqueados ONG-06. |
| CAT-08 | `public-animal-catalog`: compartilhamento/fallback | N/A | N/A | Q-I7-02, Q-I7-04 | API browser/fallback sem execução verificada. |
| CAT-09 | `public-animal-catalog`; `adoption-requests`: elegibilidade | `GET /animals/{animalId}`, `POST /adoption-requests` (bloqueado) | Animal/AdoptionRequest candidatos | Q-I7-02, Q-I8-01 | Elegibilidade/status bloqueados ONG-02; intake ONG-04/05/09. |
| INT-01 | `adoption-requests`: referência a animal elegível | `GET /animals/{animalId}`, `POST /adoption-requests` (bloqueado) | Animal/AdoptionRequest candidatos | Q-I8-01 | URL direta usa mock; ONG-02/04/05 bloqueiam regra e intake. |
| INT-02 | `adoption-requests`: dados mínimos/validação | `POST /adoption-requests` (bloqueado) | AdoptionRequest candidata | Q-I8-01, Q-I8-02 | Campos/PII/limites bloqueados ONG-05/09/10. |
| INT-03 | `adoption-requests`: confirmação após persistência | `POST /adoption-requests` (bloqueado) | AdoptionRequest candidata | Q-I8-02 | Estado atual volátil; campos, ciclo e duplicidade ONG-04/05/09 pendentes. |
| INT-04 | `public-experience`: navegação e recuperação | N/A | N/A | Q-I7-03 | Rotas locais; comportamento browser pendente. |
| CONTACT-01 | `public-experience`: canais externos verificados | N/A | N/A | Q-I7-03, verificação manual | Destinos e expectativa operacional ONG-11 pendentes. |
| CONTACT-02 | `contact-messages`: processamento real e dados mínimos | `POST /contact-messages` (bloqueado) | ContactMessage condicional | Q-I10-01 | Destino e PII ONG-05/07/09 pendentes. |
| CONTACT-03 | `contact-messages`: sucesso após aceite/falha recuperável | `POST /contact-messages` (bloqueado) | ContactMessage condicional/provedor não escolhido | Q-I10-01 | Sucesso atual é simulado; confirmação/destino ONG-07 e limites ONG-09 pendentes. |
| ADMIN-01 | `admin-authentication`: credencial genérica e sessão | `POST /admin/session` (bloqueado) | Administrator/sessão candidatos | Q-I4-01, Q-I4-04, Q-I4-05 | Login demo inseguro; ONG-01 e TEC-04/05 bloqueiam. |
| ADMIN-02 | `admin-authentication`: auth por operação/recurso | Operações `/admin/*` (bloqueadas) | Animal/AdoptionRequest candidatos | Q-I4-02 | `/admin` atual é público; papéis e permissões ONG-01 pendentes. |
| ADMIN-03 | `admin-authentication`: logout invalida no servidor | `DELETE /admin/session` (bloqueado) | Sessão futura | Q-I4-03, Q-I4-05 | Logout é estado local; mecanismo/topologia TEC-04/05 pendentes. |
| ADMIN-04 | `animal-management`: leitura admin separada | `GET /admin/animals` (bloqueado) | Animal candidato | Q-I5-01 | Dados locais separados; ONG-01/02/10 bloqueiam acesso/campos finais. |
| ADMIN-05 | `animal-management`: cadastro persistido | `POST /admin/animals` (bloqueado) | Animal candidato | Q-I5-01, Q-I5-03 | Sem POST/persistência; autorização ONG-01, domínio ONG-02/10 pendentes. |
| ADMIN-06 | `animal-management`: validação de domínio | `POST/PUT /admin/animals` (bloqueados) | Animal candidato | Q-I5-01, Q-I5-03 | Valores/limites e exposição ONG-02/10 pendentes. |
| ADMIN-07 | `animal-management`: upload verificado | Endpoint deliberadamente omitido até decisão | AnimalImage/storage candidato | Q-I6-01 | Upload/local Base64 não é persistência; ONG-06 bloqueia formato/storage/limites. |
| ADMIN-08 | `animal-management`: formulário/dialog acessível | N/A | N/A | Q-I5-03, Q-I7-04 | Foco/teclado não testados; estado atual é local. |
| ADMIN-09 | `animal-management`: atualização persistida | `PUT /admin/animals/{animalId}` (bloqueado) | Animal candidato | Q-I5-01, Q-I5-03 | Sem persistência/controle concorrente; ONG-01/02/10 pendentes. |
| ADMIN-10 | `animal-management`: ciclo de vida/referências | `DELETE /admin/animals/{animalId}` (bloqueado) | Animal/AnimalImage/AdoptionRequest candidatos | Q-I5-02 | Exclusão/archive bloqueados ONG-03. |
| ADMIN-11 | `animal-management`; `public-experience`: viewport/acessibilidade | `GET /admin/animals` (bloqueado) | Animal candidato | Q-I7-04 | Scroll horizontal observado; teste em viewport/teclado pendente. |
| ADMIN-12 | `adoption-management`: leitura autorizada e minimização | `GET /admin/adoption-requests` (bloqueado) | AdoptionRequest candidata | Q-I9-01 | Context local pode expor PII; ONG-01/05/08 bloqueiam. |
| ADMIN-13 | `adoption-management`: transições persistidas/auditáveis | `PATCH /admin/adoption-requests/{requestId}/status` (bloqueado) | AdoptionRequest/histórico candidatos | Q-I9-02 | Status/transições ONG-04, permissões ONG-01 e audit ONG-08 pendentes. |
| ADMIN-14 | `adoption-management`: filtros/exportação/resposta | Nenhum endpoint aprovado | AdoptionRequest candidata | Q-I9-01, Q-I9-02 | Escopo, PII e canal ONG-05/07/08 pendentes; não inferir funcionalidades. |
| NF-01 | `public-experience`: rota 404 recuperável | N/A | N/A | Q-I7-03, Q-I7-04 | Link local observado; foco/status no browser não verificados. |

## Cobertura e limites

Os casos Q-* estão definidos em [`../quality/TEST_MATRIX.md`](../quality/TEST_MATRIX.md);
as capacidades e requisitos citados estão em
[`../../openspec/changes/saal-functional-readiness/`](../../openspec/changes/saal-functional-readiness/).
Todos os endpoints da tabela são alvos documentais e marcados como bloqueados quando
dependem de decisão. N/A é testado como navegação/UX, não implica cobertura funcional
automatizada. Nenhum status afirma que teste futuro já foi executado.
