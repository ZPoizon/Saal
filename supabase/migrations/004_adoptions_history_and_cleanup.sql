-- SAAL — Migração 004: histórico de adoções, RPCs transacionais, RLS e limpeza
--
-- Depende da migração 003 (status 'treatment', adopted_at, archived_at).
-- Aplicar no painel do Supabase (SQL Editor) somente com aprovação do
-- responsável pelo projeto. Esta migração NÃO remove fotos nem executa
-- limpeza: apenas cria a estrutura e as funções usadas pelo fluxo.
--
-- Princípios:
--   * Toda confirmação/reversão de adoção passa por RPC transacional.
--   * O gatilho bloqueia mudanças diretas de status feitas por SQL/PostgREST.
--   * O histórico preserva snapshots mesmo se o animal ou o interesse forem
--     excluídos (FKs ON DELETE SET NULL).
--   * Dados de adotantes nunca são legíveis pelo público.
--   * A limpeza de fotos é opt-in, registrada por adoção e só pode ser
--     concluída pelo service_role após confirmação física no Storage.
--   * Nenhum animal com adoção ativa pode ser excluído fisicamente.
--
-- Segurança e idempotência:
--   * Preflight valida tabelas, colunas e tipos antes de criar as estruturas.
--   * CHECKs são criadas com NOT VALID quando necessário, sem reescrever
--     registros existentes e sem falhar por dados legados.
--   * O índice único é criado somente depois de verificar duplicidade ativa.
--   * Reexecutar o script é seguro: tabela, índices, funções, gatilhos e
--     policies usam IF NOT EXISTS / DROP ... IF EXISTS / CREATE OR REPLACE.

-- ============================================
-- Preflight: dependências e tipos
-- ============================================

do $$
declare
  v_type text;
begin
  if to_regclass('public.animals') is null
     or to_regclass('public.interests') is null
     or to_regclass('public.admin_users') is null then
    raise exception 'Migração 004 abortada: aplique as migrações 001, 002 e 003 antes. Tabelas public.animals, public.interests e public.admin_users são obrigatórias.'
      using errcode = 'undefined_table';
  end if;

  select c.data_type
    into v_type
    from information_schema.columns c
   where c.table_schema = 'public'
     and c.table_name = 'animals'
     and c.column_name = 'status';

  if v_type is null or v_type not in ('text', 'character varying') then
    raise exception 'Migração 004 abortada: public.animals.status ausente ou com tipo incompatível.'
      using errcode = 'datatype_mismatch';
  end if;

  if not exists (
    select 1
      from information_schema.columns c
     where c.table_schema = 'public'
       and c.table_name = 'animals'
       and c.column_name = 'adopted_at'
       and c.data_type = 'timestamp with time zone'
  ) then
    raise exception 'Migração 004 abortada: public.animals.adopted_at (timestamptz) não existe. Aplique a migração 003 antes.'
      using errcode = 'undefined_column';
  end if;

  if not exists (
    select 1
      from information_schema.columns c
     where c.table_schema = 'public'
       and c.table_name = 'animals'
       and c.column_name = 'archived_at'
       and c.data_type = 'timestamp with time zone'
  ) then
    raise exception 'Migração 004 abortada: public.animals.archived_at (timestamptz) não existe. Aplique a migração 003 antes.'
      using errcode = 'undefined_column';
  end if;

  if not exists (
    select 1
      from information_schema.columns c
     where c.table_schema = 'public'
       and c.table_name = 'animals'
       and c.column_name = 'images'
       and c.data_type = 'ARRAY'
       and c.udt_name = '_text'
  ) then
    raise exception 'Migração 004 abortada: public.animals.images (text[]) não existe ou tem tipo incompatível.'
      using errcode = 'datatype_mismatch';
  end if;
end;
$$;

-- Se public.adoptions já existe (por exemplo, após uma execução parcial ou de
-- uma versão anterior), todas as colunas abaixo precisam existir com o tipo
-- esperado. Sem isso, o CREATE TABLE IF NOT EXISTS mascararia a divergência e
-- as funções falhariam só em tempo de execução.
do $$
declare
  v_column text;
  v_expected_type text;
  v_actual_type text;
begin
  if to_regclass('public.adoptions') is null then
    return;
  end if;

  for v_column, v_expected_type in
    select expected.column_name, expected.data_type
      from (values
        ('id', 'uuid'),
        ('animal_id', 'uuid'),
        ('animal_name', 'text'),
        ('interest_id', 'uuid'),
        ('origin', 'text'),
        ('adopter_name', 'text'),
        ('adopter_phone', 'text'),
        ('adopter_email', 'text'),
        ('adoption_date', 'timestamp with time zone'),
        ('notes', 'text'),
        ('confirmed_by', 'uuid'),
        ('confirmed_at', 'timestamp with time zone'),
        ('reversed_at', 'timestamp with time zone'),
        ('reversed_by', 'uuid'),
        ('reversal_reason', 'text'),
        ('cleanup_status', 'text'),
        ('cleanup_error', 'text'),
        ('cleanup_attempted_at', 'timestamp with time zone'),
        ('cleanup_completed_at', 'timestamp with time zone'),
        ('created_at', 'timestamp with time zone')
      ) as expected(column_name, data_type)
  loop
    select c.data_type
      into v_actual_type
      from information_schema.columns c
     where c.table_schema = 'public'
       and c.table_name = 'adoptions'
       and c.column_name = v_column;

    if v_actual_type is null then
      raise exception 'Migração 004 abortada: public.adoptions.% não existe na tabela já criada. Ajuste o esquema antes de reaplicar.', v_column
        using errcode = 'undefined_column';
    end if;

    if v_actual_type <> v_expected_type then
      raise exception 'Migração 004 abortada: public.adoptions.% tem tipo %, mas era esperado %.', v_column, v_actual_type, v_expected_type
        using errcode = 'datatype_mismatch';
    end if;
  end loop;
end;
$$;

-- ============================================
-- Autorização administrativa
-- ============================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
  );
$$;

create or replace function public.is_admin_or_service()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin() or auth.role() = 'service_role';
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin_or_service() from public;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_admin_or_service() to authenticated, service_role;

-- ============================================
-- Histórico de adoções
-- ============================================

create table if not exists public.adoptions (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references public.animals(id) on delete set null,
  animal_name text not null,
  interest_id uuid references public.interests(id) on delete set null,
  origin text not null,
  adopter_name text not null,
  adopter_phone text,
  adopter_email text,
  adoption_date timestamptz not null,
  notes text,
  confirmed_by uuid references public.admin_users(id) on delete set null,
  confirmed_at timestamptz not null default now(),
  reversed_at timestamptz,
  reversed_by uuid references public.admin_users(id) on delete set null,
  reversal_reason text,
  cleanup_status text not null default 'pending',
  cleanup_error text,
  cleanup_attempted_at timestamptz,
  cleanup_completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- CHECKs idempotentes. NOT VALID preserva registros legados: novas linhas são
-- verificadas, mas a migração não reescreve nem invalida o histórico existente.
do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_origin_check'
  ) then
    alter table public.adoptions
      add constraint adoptions_origin_check
      check (origin in ('site', 'external')) not valid;
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_animal_name_check'
  ) then
    alter table public.adoptions
      add constraint adoptions_animal_name_check
      check (char_length(btrim(animal_name)) > 0) not valid;
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_adopter_name_check'
  ) then
    alter table public.adoptions
      add constraint adoptions_adopter_name_check
      check (
        char_length(btrim(adopter_name)) > 0
        and char_length(adopter_name) <= 120
      ) not valid;
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_adopter_phone_check'
  ) then
    alter table public.adoptions
      add constraint adoptions_adopter_phone_check
      check (adopter_phone is null or char_length(adopter_phone) <= 160)
      not valid;
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_adopter_email_check'
  ) then
    alter table public.adoptions
      add constraint adoptions_adopter_email_check
      check (adopter_email is null or char_length(adopter_email) <= 160)
      not valid;
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_cleanup_status_check'
  ) then
    alter table public.adoptions
      add constraint adoptions_cleanup_status_check
      check (
        cleanup_status in ('pending', 'scheduled', 'completed', 'failed', 'cancelled')
      ) not valid;
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_reversal_consistency'
  ) then
    alter table public.adoptions
      add constraint adoptions_reversal_consistency
      check (
        (reversed_at is null and reversed_by is null and reversal_reason is null)
        or
        (reversed_at is not null and reversal_reason is not null)
      ) not valid;
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_cleanup_completion'
  ) then
    alter table public.adoptions
      add constraint adoptions_cleanup_completion
      check (
        cleanup_status <> 'completed' or cleanup_completed_at is not null
      ) not valid;
  end if;
end;
$$;

-- Antes de criar o índice único, falha com mensagem explícita se o banco já
-- contiver mais de uma adoção ativa para o mesmo animal.
do $$
declare
  v_duplicate_animal uuid;
begin
  select animal_id
    into v_duplicate_animal
    from public.adoptions
   where animal_id is not null
     and reversed_at is null
   group by animal_id
  having count(*) > 1
   limit 1;

  if v_duplicate_animal is not null then
    raise exception 'Migração 004 abortada: o animal % possui mais de uma adoção ativa. Reverta ou ajuste os registros antes de criar o índice único.', v_duplicate_animal
      using errcode = 'unique_violation';
  end if;
end;
$$;

create unique index if not exists adoptions_one_active_per_animal
  on public.adoptions (animal_id)
  where reversed_at is null and animal_id is not null;

create index if not exists idx_adoptions_animal_id
  on public.adoptions (animal_id, confirmed_at desc);

create index if not exists idx_adoptions_active_cleanup
  on public.adoptions (cleanup_status, adoption_date)
  where reversed_at is null;

comment on table public.adoptions is
  'Histórico imutável de adoções confirmadas, com snapshots do animal e do adotante.';
comment on column public.adoptions.adoption_date is
  'Data real informada na confirmação. É a base da janela de 30 dias; nunca usa updated_at.';
comment on column public.adoptions.cleanup_status is
  'Resultado da limpeza das fotos. completed só é gravado pelo service_role após confirmação do Storage e ausência de URLs pendentes.';

alter table public.adoptions enable row level security;

drop policy if exists "adoptions_select_admin" on public.adoptions;

create policy "adoptions_select_admin"
  on public.adoptions for select
  to authenticated
  using (public.is_admin());

-- Nenhuma policy de INSERT/UPDATE/DELETE: as mutações passam apenas pelas
-- funções security definer abaixo (ou pelo service_role, que ignora RLS).

-- Privilégios explícitos: o cliente autenticado só lê (e a RLS limita a
-- administradores); escrita direta fica reservada ao service_role/RPCs.
revoke all on table public.adoptions from anon, authenticated;

grant select on table public.adoptions to authenticated;
grant all on table public.adoptions to service_role;

-- ============================================
-- Gatilho: status de adoção só muda pelas RPCs
-- ============================================

create or replace function public.guard_animal_adoption_state()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  adoption_flow text := current_setting('saal.adoption_flow', true);
begin
  if adoption_flow = 'on' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status = 'adopted' then
      raise exception 'Novos animais não podem ser cadastrados como adotados. Use a confirmação de adoção.'
        using errcode = 'check_violation';
    end if;

    if new.adopted_at is not null or new.archived_at is not null then
      raise exception 'As datas de adoção e arquivamento são controladas pelo fluxo de adoção.'
        using errcode = 'check_violation';
    end if;

    return new;
  end if;

  if new.status = 'adopted' and old.status is distinct from 'adopted' then
    raise exception 'Confirme a adoção pelo fluxo dedicado.'
      using errcode = 'check_violation';
  end if;

  if old.status = 'adopted' and new.status is distinct from 'adopted' then
    raise exception 'Reverta a adoção informando o motivo antes de alterar o status.'
      using errcode = 'check_violation';
  end if;

  if old.status = 'adopted' and new.adopted_at is distinct from old.adopted_at then
    raise exception 'A data da adoção não pode ser alterada por edição direta.'
      using errcode = 'check_violation';
  end if;

  if old.status is distinct from 'adopted' and new.adopted_at is distinct from old.adopted_at then
    raise exception 'A data de adoção só é gravada pela confirmação ou regularização.'
      using errcode = 'check_violation';
  end if;

  if old.status is distinct from 'adopted' and new.archived_at is distinct from old.archived_at then
    raise exception 'O arquivamento é controlado pela limpeza das fotos.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_animals_adoption_state on public.animals;

create trigger guard_animals_adoption_state
  before insert or update on public.animals
  for each row
  execute function public.guard_animal_adoption_state();

-- ============================================
-- Gatilho: não excluir animal com adoção ativa
-- ============================================

create or replace function public.guard_animal_delete_with_active_adoption()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.adoptions
    where animal_id = old.id
      and reversed_at is null
  ) then
    raise exception 'Não é possível excluir um animal com adoção ativa. Reverta a adoção antes de excluir o cadastro.'
      using errcode = 'foreign_key_violation';
  end if;

  return old;
end;
$$;

drop trigger if exists guard_animals_active_adoption_delete on public.animals;

create trigger guard_animals_active_adoption_delete
  before delete on public.animals
  for each row
  execute function public.guard_animal_delete_with_active_adoption();

-- ============================================
-- RPC: confirmar adoção
-- ============================================

create or replace function public.confirm_adoption(
  p_animal_id uuid,
  p_interest_id uuid,
  p_origin text,
  p_adopter_name text,
  p_adopter_phone text,
  p_adopter_email text,
  p_adoption_date timestamptz,
  p_notes text
)
returns public.adoptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_animal public.animals;
  v_interest_animal uuid;
  v_adoption public.adoptions;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem confirmar adoções.'
      using errcode = 'insufficient_privilege';
  end if;

  if p_origin is null or p_origin not in ('site', 'external') then
    raise exception 'Origem da adoção inválida.'
      using errcode = 'check_violation';
  end if;

  if p_adopter_name is null or char_length(btrim(p_adopter_name)) = 0 then
    raise exception 'Informe o nome do adotante.'
      using errcode = 'check_violation';
  end if;

  if p_adoption_date is null then
    raise exception 'Informe a data real da adoção.'
      using errcode = 'check_violation';
  end if;

  if p_adoption_date > now() then
    raise exception 'A data da adoção não pode estar no futuro.'
      using errcode = 'check_violation';
  end if;

  if p_origin = 'site' and p_interest_id is null then
    raise exception 'Uma adoção de origem no site precisa estar vinculada a uma manifestação.'
      using errcode = 'check_violation';
  end if;

  perform set_config('saal.adoption_flow', 'on', true);

  select * into v_animal
    from public.animals
    where id = p_animal_id
    for update;

  if not found then
    raise exception 'Animal não encontrado.'
      using errcode = 'no_data_found';
  end if;

  if v_animal.status not in ('available', 'treatment') then
    raise exception 'Este animal não está disponível para confirmação de adoção.'
      using errcode = 'check_violation';
  end if;

  if exists (
    select 1
    from public.adoptions
    where animal_id = p_animal_id and reversed_at is null
  ) then
    raise exception 'Este animal já possui uma adoção ativa.'
      using errcode = 'unique_violation';
  end if;

  if p_interest_id is not null then
    select animal_id into v_interest_animal
      from public.interests
      where id = p_interest_id;

    if not found then
      raise exception 'Manifestação de interesse não encontrada.'
        using errcode = 'no_data_found';
    end if;

    if v_interest_animal is distinct from p_animal_id then
      raise exception 'A manifestação não pertence a este animal.'
        using errcode = 'check_violation';
    end if;
  end if;

  insert into public.adoptions (
    animal_id,
    animal_name,
    interest_id,
    origin,
    adopter_name,
    adopter_phone,
    adopter_email,
    adoption_date,
    notes,
    confirmed_by
  ) values (
    v_animal.id,
    v_animal.name,
    p_interest_id,
    p_origin,
    btrim(p_adopter_name),
    nullif(btrim(coalesce(p_adopter_phone, '')), ''),
    nullif(btrim(coalesce(p_adopter_email, '')), ''),
    p_adoption_date,
    nullif(btrim(coalesce(p_notes, '')), ''),
    auth.uid()
  )
  returning * into v_adoption;

  update public.animals
    set status = 'adopted',
        adopted_at = p_adoption_date,
        archived_at = null
    where id = p_animal_id;

  return v_adoption;
end;
$$;

-- ============================================
-- RPC: reverter adoção
-- ============================================

create or replace function public.reverse_adoption(
  p_adoption_id uuid,
  p_reason text,
  p_target_status text
)
returns public.adoptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_adoption public.adoptions;
  v_animal public.animals;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem reverter adoções.'
      using errcode = 'insufficient_privilege';
  end if;

  if p_target_status is null or p_target_status not in ('available', 'treatment') then
    raise exception 'Status de destino inválido para a reversão.'
      using errcode = 'check_violation';
  end if;

  if p_reason is null or char_length(btrim(p_reason)) < 5 then
    raise exception 'Informe o motivo da reversão.'
      using errcode = 'check_violation';
  end if;

  perform set_config('saal.adoption_flow', 'on', true);

  select * into v_adoption
    from public.adoptions
    where id = p_adoption_id
    for update;

  if not found then
    raise exception 'Adoção não encontrada.'
      using errcode = 'no_data_found';
  end if;

  if v_adoption.reversed_at is not null then
    raise exception 'Esta adoção já foi revertida.'
      using errcode = 'check_violation';
  end if;

  if v_adoption.animal_id is null then
    raise exception 'O animal desta adoção foi excluído; a reversão exige um animal existente.'
      using errcode = 'check_violation';
  end if;

  select * into v_animal
    from public.animals
    where id = v_adoption.animal_id
    for update;

  if not found then
    raise exception 'Animal não encontrado.'
      using errcode = 'no_data_found';
  end if;

  if v_animal.status <> 'adopted' then
    raise exception 'O animal não está marcado como adotado.'
      using errcode = 'check_violation';
  end if;

  update public.adoptions
    set reversed_at = now(),
        reversed_by = auth.uid(),
        reversal_reason = btrim(p_reason),
        cleanup_status = case
          when cleanup_status = 'completed' then 'completed'
          else 'cancelled'
        end,
        cleanup_error = null
    where id = p_adoption_id
    returning * into v_adoption;

  update public.animals
    set status = p_target_status,
        adopted_at = null,
        archived_at = null
    where id = v_adoption.animal_id;

  return v_adoption;
end;
$$;

-- ============================================
-- RPC: regularizar adoção legada
-- ============================================

create or replace function public.regularize_legacy_adoption(
  p_animal_id uuid,
  p_adoption_date timestamptz,
  p_adopter_name text,
  p_notes text
)
returns public.adoptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_animal public.animals;
  v_adoption public.adoptions;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem regularizar adoções.'
      using errcode = 'insufficient_privilege';
  end if;

  if p_adoption_date is null or p_adoption_date > now() then
    raise exception 'Informe uma data real de adoção que não esteja no futuro.'
      using errcode = 'check_violation';
  end if;

  if p_adopter_name is null or char_length(btrim(p_adopter_name)) = 0 then
    raise exception 'Informe o nome do adotante.'
      using errcode = 'check_violation';
  end if;

  perform set_config('saal.adoption_flow', 'on', true);

  select * into v_animal
    from public.animals
    where id = p_animal_id
    for update;

  if not found then
    raise exception 'Animal não encontrado.'
      using errcode = 'no_data_found';
  end if;

  if v_animal.status <> 'adopted' then
    raise exception 'A regularização vale apenas para animais já marcados como adotados.'
      using errcode = 'check_violation';
  end if;

  if v_animal.adopted_at is not null then
    raise exception 'Este animal já possui data de adoção registrada.'
      using errcode = 'check_violation';
  end if;

  if exists (
    select 1
    from public.adoptions
    where animal_id = p_animal_id and reversed_at is null
  ) then
    raise exception 'Este animal já possui uma adoção ativa.'
      using errcode = 'unique_violation';
  end if;

  insert into public.adoptions (
    animal_id,
    animal_name,
    interest_id,
    origin,
    adopter_name,
    adoption_date,
    notes,
    confirmed_by
  ) values (
    v_animal.id,
    v_animal.name,
    null,
    'external',
    btrim(p_adopter_name),
    p_adoption_date,
    nullif(btrim(coalesce(p_notes, '')), ''),
    auth.uid()
  )
  returning * into v_adoption;

  update public.animals
    set adopted_at = p_adoption_date
    where id = p_animal_id;

  return v_adoption;
end;
$$;

-- ============================================
-- RPC: candidatos e registro da limpeza
-- ============================================

create or replace function public.list_adoption_cleanup_candidates(
  p_now timestamptz default now()
)
returns table (
  adoption_id uuid,
  animal_id uuid,
  animal_name text,
  adopted_at timestamptz,
  deadline_at timestamptz,
  image_urls text[],
  cleanup_status text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.id,
    a.animal_id,
    a.animal_name,
    an.adopted_at,
    an.adopted_at + interval '30 days',
    coalesce(an.images, '{}'::text[]),
    a.cleanup_status
  from public.adoptions a
  join public.animals an on an.id = a.animal_id
  where a.reversed_at is null
    and a.cleanup_status <> 'completed'
    and an.status = 'adopted'
    and an.adopted_at is not null
    and p_now >= an.adopted_at + interval '30 days'
    and public.is_admin_or_service();
$$;

comment on function public.list_adoption_cleanup_candidates(timestamptz) is
  'Lista adoções ativas com 30 dias completos desde animals.adopted_at. Apenas admin ou service_role.';

-- Registro do resultado da limpeza.
--
-- Esta função é o único caminho para marcar uma adoção como limpa. Ela NÃO
-- confia nos parâmetros do chamador: exige service_role, trava a adoção, valida
-- o estado atual do animal, a janela de 30 dias e a propriedade das URLs e só
-- aceita completed quando nenhuma fotografia continua referenciada.
create or replace function public.record_adoption_cleanup(
  p_adoption_id uuid,
  p_status text,
  p_removed_urls text[],
  p_error text
)
returns public.adoptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_adoption public.adoptions;
  v_animal public.animals;
  v_removed text[] := coalesce(p_removed_urls, '{}'::text[]);
  v_remaining text[];
  v_error text;
begin
  -- Somente o service_role (Edge Function agendada) registra a limpeza. A
  -- checagem por auth.role() não depende de headers/parâmetros do cliente.
  if auth.role() is distinct from 'service_role' then
    raise exception 'Somente o serviço de limpeza pode registrar o resultado da limpeza.'
      using errcode = 'insufficient_privilege';
  end if;

  if p_adoption_id is null then
    raise exception 'Informe a adoção da limpeza.'
      using errcode = 'null_value_not_allowed';
  end if;

  if p_status is null or p_status not in ('completed', 'failed') then
    raise exception 'Status de limpeza inválido: apenas completed ou failed são aceitos.'
      using errcode = 'check_violation';
  end if;

  if exists (
    select 1
    from unnest(v_removed) as removed_url
    where removed_url is null or btrim(removed_url) = ''
  ) then
    raise exception 'A lista de URLs removidas contém valores vazios.'
      using errcode = 'check_violation';
  end if;

  -- Trava a adoção primeiro e o animal depois, na mesma ordem usada por
  -- reverse_adoption, evitando corrida entre limpeza e reversão.
  select * into v_adoption
    from public.adoptions
    where id = p_adoption_id
    for update;

  if not found then
    raise exception 'Adoção não encontrada.'
      using errcode = 'no_data_found';
  end if;

  if v_adoption.reversed_at is not null then
    raise exception 'A adoção foi revertida; a limpeza não pode ser registrada.'
      using errcode = 'check_violation';
  end if;

  if v_adoption.animal_id is null then
    raise exception 'O animal desta adoção não existe mais; não há fotos a limpar.'
      using errcode = 'check_violation';
  end if;

  select * into v_animal
    from public.animals
    where id = v_adoption.animal_id
    for update;

  if not found then
    raise exception 'Animal não encontrado; a limpeza não pode alterar o catálogo.'
      using errcode = 'no_data_found';
  end if;

  if v_animal.status <> 'adopted' then
    raise exception 'O animal não está mais adotado; a limpeza não pode ser concluída.'
      using errcode = 'check_violation';
  end if;

  if v_animal.adopted_at is null then
    raise exception 'A data real da adoção não está registrada; regularize antes de limpar as fotos.'
      using errcode = 'check_violation';
  end if;

  if now() < v_animal.adopted_at + interval '30 days' then
    raise exception 'A janela de 30 dias ainda não venceu; nenhuma foto pode ser confirmada como removida.'
      using errcode = 'check_violation';
  end if;

  -- O chamador só pode remover URLs que realmente pertencem ao animal no
  -- momento da operação. Isso impede que parâmetros do cliente apaguem
  -- referências arbitrárias ou de outros animais.
  if not (v_removed <@ v_animal.images) then
    raise exception 'A lista de URLs removidas inclui endereços que não pertencem ao animal.'
      using errcode = 'check_violation';
  end if;

  v_remaining := array(
    select image_url
    from unnest(v_animal.images) as image_url
    where image_url <> all (v_removed)
  );

  if p_status = 'completed' and array_length(v_remaining, 1) is not null then
    raise exception 'Não é possível concluir a limpeza: ainda há fotografias referenciadas pelo animal.'
      using errcode = 'check_violation';
  end if;

  v_error := case
    when p_status = 'completed' then null
    else left(
      coalesce(
        nullif(btrim(coalesce(p_error, '')), ''),
        'Falha não especificada durante a limpeza das fotos.'
      ),
      500
    )
  end;

  update public.adoptions
    set cleanup_status = p_status,
        cleanup_error = v_error,
        cleanup_attempted_at = now(),
        cleanup_completed_at = case
          when p_status = 'completed' then now()
          else cleanup_completed_at
        end
    where id = p_adoption_id
    returning * into v_adoption;

  update public.animals
    set images = v_remaining,
        archived_at = case
          when p_status = 'completed' then coalesce(archived_at, now())
          else archived_at
        end
    where id = v_animal.id;

  return v_adoption;
end;
$$;

comment on function public.record_adoption_cleanup(uuid, text, text[], text) is
  'Registra a limpeza. Exclusivo do service_role; valida adoção ativa, animal adotado, janela de 30 dias, propriedade das URLs e ausência de fotos pendentes antes de concluir.';

-- ============================================
-- Permissões das RPCs
-- ============================================

revoke all on function public.confirm_adoption(uuid, uuid, text, text, text, text, timestamptz, text) from public;
revoke all on function public.reverse_adoption(uuid, text, text) from public;
revoke all on function public.regularize_legacy_adoption(uuid, timestamptz, text, text) from public;
revoke all on function public.list_adoption_cleanup_candidates(timestamptz) from public;
revoke all on function public.record_adoption_cleanup(uuid, text, text[], text) from public;

grant execute on function public.confirm_adoption(uuid, uuid, text, text, text, text, timestamptz, text) to authenticated, service_role;
grant execute on function public.reverse_adoption(uuid, text, text) to authenticated, service_role;
grant execute on function public.regularize_legacy_adoption(uuid, timestamptz, text, text) to authenticated, service_role;
grant execute on function public.list_adoption_cleanup_candidates(timestamptz) to authenticated, service_role;

-- O registro da limpeza é exclusivo do servidor. Nem o administrador
-- autenticado no navegador recebe EXECUTE.
revoke all on function public.record_adoption_cleanup(uuid, text, text[], text) from anon, authenticated;
grant execute on function public.record_adoption_cleanup(uuid, text, text[], text) to service_role;

-- ============================================
-- RLS: substitui as políticas amplas da migração 001
-- ============================================

-- animals: leitura pública apenas enquanto o animal deve aparecer no catálogo.
drop policy if exists "animals_select_public" on public.animals;
drop policy if exists "animals_select_admin" on public.animals;
drop policy if exists "animals_insert_admin" on public.animals;
drop policy if exists "animals_update_admin" on public.animals;
drop policy if exists "animals_delete_admin" on public.animals;

create policy "animals_select_public"
  on public.animals for select
  to anon, authenticated
  using (
    status <> 'adopted'
    or adopted_at is null
    or adopted_at + interval '30 days' > now()
  );

create policy "animals_select_admin"
  on public.animals for select
  to authenticated
  using (public.is_admin());

create policy "animals_insert_admin"
  on public.animals for insert
  to authenticated
  with check (public.is_admin());

create policy "animals_update_admin"
  on public.animals for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "animals_delete_admin"
  on public.animals for delete
  to authenticated
  using (public.is_admin());

-- animal_photos: metadados públicos, escrita apenas para admin.
drop policy if exists "animal_photos_select_public" on public.animal_photos;
drop policy if exists "animal_photos_insert_admin" on public.animal_photos;
drop policy if exists "animal_photos_update_admin" on public.animal_photos;
drop policy if exists "animal_photos_delete_admin" on public.animal_photos;

create policy "animal_photos_select_public"
  on public.animal_photos for select
  to anon, authenticated
  using (true);

create policy "animal_photos_insert_admin"
  on public.animal_photos for insert
  to authenticated
  with check (public.is_admin());

create policy "animal_photos_update_admin"
  on public.animal_photos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "animal_photos_delete_admin"
  on public.animal_photos for delete
  to authenticated
  using (public.is_admin());

-- interests: envio público; leitura e gestão apenas para admin.
drop policy if exists "interests_insert_public" on public.interests;
drop policy if exists "interests_select_admin" on public.interests;
drop policy if exists "interests_update_admin" on public.interests;
drop policy if exists "interests_delete_admin" on public.interests;

create policy "interests_insert_public"
  on public.interests for insert
  to anon, authenticated
  with check (true);

create policy "interests_select_admin"
  on public.interests for select
  to authenticated
  using (public.is_admin());

create policy "interests_update_admin"
  on public.interests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "interests_delete_admin"
  on public.interests for delete
  to authenticated
  using (public.is_admin());

-- site_settings: leitura pública; escrita apenas para admin.
drop policy if exists "site_settings_select_public" on public.site_settings;
drop policy if exists "site_settings_insert_admin" on public.site_settings;
drop policy if exists "site_settings_update_admin" on public.site_settings;
drop policy if exists "site_settings_delete_admin" on public.site_settings;

create policy "site_settings_select_public"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "site_settings_insert_admin"
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

create policy "site_settings_update_admin"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "site_settings_delete_admin"
  on public.site_settings for delete
  to authenticated
  using (public.is_admin());

-- admin_users: nenhuma leitura pública e nenhuma auto-promoção pelo cliente.
-- O login continua funcionando: is_admin() é security definer e consulta
-- admin_users sem RLS, então o próprio administrador autenticado consegue ler
-- seu registro de perfil.
drop policy if exists "admin_users_select_public" on public.admin_users;
drop policy if exists "admin_users_insert_admin" on public.admin_users;
drop policy if exists "admin_users_update_admin" on public.admin_users;
drop policy if exists "admin_users_select_admin" on public.admin_users;
drop policy if exists "admin_users_delete_admin" on public.admin_users;

create policy "admin_users_select_admin"
  on public.admin_users for select
  to authenticated
  using (public.is_admin());

-- Sem policies de INSERT/UPDATE/DELETE para authenticated: novos
-- administradores só podem ser criados pelo service_role/console do Supabase.
