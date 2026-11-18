-- SAAL — Migração 003: status "Em tratamento" e colunas de ciclo de vida
--
-- Adiciona:
--   * status 'treatment' à CHECK da tabela animals (além de 'available' e 'adopted')
--   * adopted_at: data real da adoção confirmada (não é updated_at)
--   * archived_at: data em que o animal entrou no histórico (fotografias removidas)
--
-- Segurança e idempotência:
--   * A migração valida tabela, coluna e tipos antes de alterar qualquer coisa.
--   * Aborta com mensagem clara se houver status nulo/inválido ou tipo de coluna
--     incompatível, em vez de falhar no meio com erro genérico.
--   * A CHECK antiga é localizada pelo catálogo (pg_constraint/conkey), não apenas
--     pelo nome, e recriada sempre com o nome canônico animals_status_check.
--   * Reexecutar o script é seguro: as colunas usam IF NOT EXISTS e a CHECK é
--     recriada a partir do estado previamente validado.
--   * Nenhum registro existente é alterado, excluído ou tem data inventada.
--
-- Aplicar no painel do Supabase (SQL Editor) somente com aprovação do
-- responsável pelo projeto.

-- ============================================
-- Preflight: estrutura, tipos e dados existentes
-- ============================================

do $$
declare
  v_type text;
  v_invalid_statuses text;
begin
  if to_regclass('public.animals') is null then
    raise exception 'Migração 003 abortada: a tabela public.animals não existe. Aplique a migração 001 antes.'
      using errcode = 'undefined_table';
  end if;

  select c.data_type
    into v_type
    from information_schema.columns c
   where c.table_schema = 'public'
     and c.table_name = 'animals'
     and c.column_name = 'status';

  if v_type is null then
    raise exception 'Migração 003 abortada: a coluna public.animals.status não existe.'
      using errcode = 'undefined_column';
  end if;

  if v_type not in ('text', 'character varying') then
    raise exception 'Migração 003 abortada: public.animals.status tem tipo %, mas era esperado text.', v_type
      using errcode = 'datatype_mismatch';
  end if;

  if exists (
    select 1
      from public.animals
     where status is null
  ) then
    raise exception 'Migração 003 abortada: existem animais com status nulo. Corrija os registros antes de recriar a CHECK.'
      using errcode = 'check_violation';
  end if;

  select string_agg(distinct status, ', ' order by status)
    into v_invalid_statuses
    from public.animals
   where status not in ('available', 'adopted', 'treatment');

  if v_invalid_statuses is not null then
    raise exception 'Migração 003 abortada: existem status inválidos em public.animals (%). Corrija os registros antes de recriar a CHECK.', v_invalid_statuses
      using errcode = 'check_violation';
  end if;

  if exists (
    select 1
      from information_schema.columns c
     where c.table_schema = 'public'
       and c.table_name = 'animals'
       and c.column_name = 'adopted_at'
       and c.data_type <> 'timestamp with time zone'
  ) then
    raise exception 'Migração 003 abortada: public.animals.adopted_at existe com tipo incompatível; esperado timestamptz.'
      using errcode = 'datatype_mismatch';
  end if;

  if exists (
    select 1
      from information_schema.columns c
     where c.table_schema = 'public'
       and c.table_name = 'animals'
       and c.column_name = 'archived_at'
       and c.data_type <> 'timestamp with time zone'
  ) then
    raise exception 'Migração 003 abortada: public.animals.archived_at existe com tipo incompatível; esperado timestamptz.'
      using errcode = 'datatype_mismatch';
  end if;
end;
$$;

-- ============================================
-- CHECK de status
-- ============================================

-- Remove a constraint canônica, caso exista, antes de procurar variações.
alter table public.animals
  drop constraint if exists animals_status_check;

-- Remove qualquer outra CHECK que incida somente sobre a coluna status,
-- independentemente do nome usado em aplicações anteriores.
do $$
declare
  v_constraint_name text;
  v_status_attnum smallint;
begin
  select a.attnum
    into v_status_attnum
    from pg_attribute a
   where a.attrelid = 'public.animals'::regclass
     and a.attname = 'status'
     and not a.attisdropped;

  if v_status_attnum is null then
    raise exception 'Migração 003 abortada: não foi possível localizar a coluna status em public.animals.'
      using errcode = 'undefined_column';
  end if;

  for v_constraint_name in
    select con.conname
      from pg_constraint con
     where con.conrelid = 'public.animals'::regclass
       and con.contype = 'c'
       and con.conkey = array[v_status_attnum]::smallint[]
  loop
    execute format(
      'alter table public.animals drop constraint %I',
      v_constraint_name
    );
  end loop;
end;
$$;

alter table public.animals
  add constraint animals_status_check
  check (status in ('available', 'treatment', 'adopted')) not valid;

alter table public.animals
  validate constraint animals_status_check;

-- ============================================
-- Colunas de ciclo de vida
-- ============================================

alter table public.animals
  add column if not exists adopted_at timestamptz;

alter table public.animals
  add column if not exists archived_at timestamptz;

comment on column public.animals.adopted_at is
  'Data real da adoção confirmada. Nunca é recalculada a partir de updated_at.';

comment on column public.animals.archived_at is
  'Data em que o animal entrou no histórico (fotografias removidas após 30 dias).';
