# ADR-009: Ciclo de vida da adoção e retenção de fotos no Supabase

- **Status:** Aceito para implementação no worktree; aplicação remota e limpeza definitiva
  pendentes de aprovação.
- **Data:** 2026-11-18.
- **Evidência:** pedido do mantenedor para implementar localmente o ciclo completo de adoção,
  histórico, reversão e exclusão real das fotos após 30 dias, sem publicar nem apagar dados
  reais. Complementa o escopo da feature `ADLC-001`.

## Contexto

O catálogo passou a usar o cliente Supabase diretamente (`src/app/services/supabase-*`), com
autenticação administrativa, Storage para fotos e RLS. O modelo inicial do backend Spring/MySQL
descrito nos ADR-001 a ADR-007 continua no repositório, mas não é o caminho usado por esta
funcionalidade. As migrações `001`/`002` já estão no histórico; a `003` adiciona o estado
`treatment` e as datas de ciclo de vida; era necessário acrescentar histórico de adoções,
transições atômicas, RLS restritiva e limpeza de fotos.

Os requisitos que orientaram a decisão:

- adoção só por confirmação, com data real e sem duplicidade;
- histórico que sobreviva à exclusão de animal/interesse;
- fotos removidas somente após 30 dias, pela API oficial do Storage;
- legado sem data nunca apagado automaticamente;
- dados do adotante inacessíveis ao público;
- limpeza real só após aprovação.

## Decisões

1. **Migrações incrementais `004` e `005`.** Não editamos `001`/`002` já versionadas. A `003`
   é idempotente e faz preflight do esquema antes de recriar a CHECK de status e as colunas de
   ciclo de vida. A `004` cria `public.adoptions`, o gatilho de proteção, as RPCs, os índices e
   as policies. A `005` acrescenta snapshots textuais do animal ao histórico, incluindo a
   personalidade, e atualiza as RPCs de confirmação e regularização para gravá-los.
2. **Histórico com snapshots.** `adoptions` guarda `animal_name`, `animal_species`,
   `animal_sex`, `animal_size`, `animal_age`, `animal_description`, `animal_medical_info`,
   `animal_personality` e os dados do adotante como texto. As FKs usam `ON DELETE SET NULL`,
   então excluir o animal ou a manifestação não apaga nem invalida o histórico. O backfill da
   `005` só preenche campos nulos e nunca sobrescreve snapshot existente. A interface do
   histórico é somente textual, sem fotos, miniaturas ou identificadores do Storage.
3. **RPCs transacionais.** `confirm_adoption`, `reverse_adoption`,
   `regularize_legacy_adoption`, `list_adoption_cleanup_candidates` e
   `record_adoption_cleanup` são `security definer`, com `search_path = ''` e verificação
   explícita de `admin_users` (ou `service_role`). `record_adoption_cleanup` é exclusiva do
   `service_role`. O cliente não escreve diretamente em `adoptions`.
4. **Gatilho de proteção.** `guard_animals_adoption_state` bloqueia INSERT com status
   `adopted`, mudança direta para `adopted`, saída de `adopted` sem reversão e alteração de
   `adopted_at`/`archived_at` fora do fluxo. As RPCs ligam a variável de sessão
   `saal.adoption_flow='on'` dentro da transação para executar a mudança legítima.
5. **Duplicidade.** Índice único parcial em `adoptions(animal_id)` para adoções ativas, além da
   checagem com `FOR UPDATE` na RPC.
6. **Janela de 30 dias.** Calculada sempre de `adoption_date`/`adopted_at`, nunca de
   `updated_at`. A policy pública de `animals` e o filtro do cliente escondem o animal quando
   `now() >= adopted_at + interval '30 days'`. O limite é inclusivo: 30 dias completos já
   expiram.
7. **Legado.** Animal `adopted` com `adopted_at` nulo permanece visível, não entra na lista de
   candidatos e não inicia contagem. A regularização exige uma data real informada pelo
   administrador.
8. **RLS.** `adoptions` só tem policy de SELECT para administradores. `animals` tem leitura
   pública condicionada à visibilidade e leitura administrativa por `is_admin()`; exclusão de
   animal com adoção ativa é bloqueada por gatilho. `site_settings` mantém leitura pública e
   escrita administrativa. `interests` perde leitura pública e mantém apenas o INSERT público.
   `admin_users` não tem leitura pública nem policy de escrita para o cliente, impedindo
   auto-promoção. O login continua funcionando porque `is_admin()` é `security definer` e lê
   `admin_users` sem RLS.
9. **Limpeza pela API oficial.** O caminho é validado contra o bucket `animal-photos` e o
   padrão `animals/<uuid>.<ext>`, com origem no projeto Supabase configurado. A propriedade é
   a união de `animals.images` e `animal_photos`; caminhos compartilhados, externos ou
   inválidos são sinalizados e não apagados. Quando `storage.remove` não devolve o objeto, a
   Edge Function confirma a ausência com `storage.list`.
10. **Confirmação antes de remover referências.** `record_adoption_cleanup` é exclusiva do
    `service_role`, aceita apenas `completed`/`failed` e revalida no banco: adoção ativa, animal
    `adopted`, `adopted_at` conhecido, janela de 30 dias vencida, URLs removidas como
    subconjunto de `animals.images` e ausência de fotos pendentes para `completed`. Falha
    parcial mantém o restante para nova tentativa; `completed` só é gravado após confirmação.
11. **Execução automática no servidor.** A limpeza não tem interface manual. O `Supabase Cron`
    (pg_cron + pg_net) chama diariamente a Edge Function `cleanup-adopted-photos` com um segredo
    de servidor (`ADOPTION_CLEANUP_SECRET`) e sem navegador ou sessão administrativa. A função
    usa `service_role`, valida o segredo e responde `503` se ele não estiver configurado. Nenhuma
    variável pública habilita exclusão e o navegador não recebe credenciais de Storage.
12. **Lógica compartilhada e testável.** As regras de janela, propriedade, plano e execução
    idempotente ficam em `supabase/functions/_shared/adoption-photo-cleanup.ts`, usadas pela Edge
    Function e pelos testes Vitest com dependências injetadas. A remoção real continua exclusiva
    da API oficial do Storage.

## Revisão de segurança das migrações (2026-11-18)

- `003`: preflight de tabela, coluna e tipos; aborta se houver status nulo/inválido; descobre a
  CHECK antiga por `pg_constraint`/`conkey`; recria com `NOT VALID` e valida em seguida.
- `004`: valida dependências e tipos; cria CHECKs `NOT VALID` de forma idempotente; verifica
  duplicidade de adoção ativa antes do índice único; bloqueia exclusão de animal com adoção
  ativa; restringe `record_adoption_cleanup` ao `service_role` e revalida todo o estado no banco.
- `005`: adiciona `animal_personality text[]`, normaliza o `jsonb` do cadastro sem inventar
  dados, preenche apenas snapshots nulos e mantém as RPCs compatíveis com registros legados.
- Nenhuma migração executa `DELETE`, `TRUNCATE` ou `DROP TABLE`. A única remoção de dados é a
  subtração explícita de URLs confirmadas pelo serviço de limpeza, dentro da RPC auditada.

## Consequências

- O histórico é preservado, mas cresce indefinidamente; a retenção de PII do adotante ainda
  precisa de decisão da ONG.
- A limpeza depende de policies de Storage não versionadas; se a exclusão for negada, a adoção
  fica `failed` e nenhuma referência é removida.
- A automação só é efetiva depois de publicar a Edge Function, configurar o segredo e aplicar o
  agendamento no Supabase; sem isso, o comportamento continua sendo a ocultação pública por
  data, sem exclusão de arquivos.
- A reversão após limpeza concluída não restaura arquivos apagados. O animal volta ao catálogo
  sem as fotos antigas.
- O gatilho pode surpreender integrações antigas que alterem status diretamente; elas devem
  passar a usar as RPCs ou o fluxo administrativo.
- O modo local descrito no ADR-008 não cobre o histórico de adoções; esta implementação usa o
  Supabase configurado no `.env`.

## Aplicação e recuperação

1. Fazer backup/verificar PITR do projeto Supabase e revisar os scripts com aprovação.
2. Aplicar na ordem `003` → `004` → `005` no SQL Editor. Cada script é idempotente e aborta
   com mensagem clara se o esquema ou os dados não forem compatíveis.
3. Confirmar o bucket `animal-photos`, leitura pública e permissão de exclusão para o
   `service_role`.
4. Validar login administrativo, `is_admin()` e as policies com um usuário de teste.
5. Publicar a Edge Function:
   `supabase functions deploy cleanup-adopted-photos --no-verify-jwt`.
6. Definir `ADOPTION_CLEANUP_SECRET` nos secrets da função e os valores
   `adoption_cleanup_url`/`adoption_cleanup_secret` no Vault.
7. Habilitar `pg_cron`/`pg_net` e aplicar
   `supabase/scheduling/adoption-photo-cleanup-cron.sql` para criar o job diário.
8. Testar com um animal e arquivos descartáveis antes de liberar a rotina sobre dados reais.

Recuperação:

- Falha de limpeza: corrigir a causa e repetir; o registro `failed` permanece e a próxima
  execução diária tenta novamente.
- Exclusão indevida de referência: restaurar a URL em `animals.images` pelo painel/SQL e
  revisar o histórico da adoção.
- Necessidade de corrigir status legado fora do fluxo: executar em transação
  `select set_config('saal.adoption_flow', 'on', true);` seguido do `update`, registrando o
  motivo. Isso é uma operação administrativa excepcional, não um caminho de aplicação.

## Pendências de aprovação

- Aplicar as migrações no projeto Supabase remoto.
- Publicar a Edge Function e configurar o segredo de servidor.
- Criar o job diário no Supabase (`adoption-photo-cleanup-cron.sql`).
- Aprovar a política de retenção dos dados pessoais do adotante.
- Revisar as policies do Storage e a configuração de backup do bucket.
- Aprovar a primeira execução real sobre fotografias reais.

## Alternativas rejeitadas

- **Alterar status direto na tabela:** não garante histórico, data real nem atomicidade.
- **Apagar objetos com `DELETE` em `storage.objects`:** não remove o arquivo e ignora a API
  oficial; rejeitado por risco de corrupção e inconsistência.
- **Recalcular a janela por `updated_at`:** qualquer edição reiniciaria a contagem e permitiria
  apagar fotos cedo demais.
- **Apagar fotos de legado sem data:** inventaria uma data e destruiria arquivos sem base
  verificável.
- **Limpeza manual no painel administrativo:** exige clique e conhecimento técnico da ONG,
  permite esquecimento e expõe risco de exclusão acidental; rejeitada em favor do agendamento no
  servidor.
- **Limpeza acionada por navegador (`setInterval`, `useEffect`, login):** não roda sem alguém
  acessando o SAAL e exige poderes de exclusão no cliente.
