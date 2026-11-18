-- SAAL — Migração 005: snapshots textuais do animal no histórico de adoções
--
-- Depende das migrações 003 e 004. Aplicar no painel do Supabase (SQL Editor)
-- somente com aprovação do responsável pelo projeto.
--
-- Objetivo:
--   * preservar, em cada adoção, os dados textuais do animal no momento da
--     confirmação, para que o histórico continue legível mesmo depois de o
--     cadastro do animal ser editado ou excluído e das fotos serem removidas;
--   * incluir a personalidade do animal no snapshot, ao lado de espécie, sexo,
--     porte, idade, descrição e informações de saúde;
--   * manter compatibilidade: adoções antigas sem snapshot usam o cadastro
--     atual como fallback na interface e o backfill só preenche campos nulos.
--
-- Segurança e idempotência:
--   * valida a existência de public.adoptions e o tipo de animal_personality;
--   * o backfill nunca sobrescreve snapshot já gravado;
--   * a personalidade é normalizada a partir do jsonb do cadastro, sem aceitar
--     tipos inesperados;
--   * as RPCs são recriadas com CREATE OR REPLACE e mantêm as validações.
--
-- Esta migração NÃO remove fotos nem executa limpeza.

-- ============================================
-- Preflight
-- ============================================

do $$
declare
  v_type text;
  v_udt text;
  v_column text;
  v_expected_type text;
begin
  if to_regclass('public.adoptions') is null then
    raise exception 'Migração 005 abortada: public.adoptions não existe. Aplique a migração 004 antes.'
      using errcode = 'undefined_table';
  end if;

  if to_regclass('public.animals') is null then
    raise exception 'Migração 005 abortada: public.animals não existe. Aplique a migração 001 antes.'
      using errcode = 'undefined_table';
  end if;

  select c.data_type
    into v_type
    from information_schema.columns c
   where c.table_schema = 'public'
     and c.table_name = 'animals'
     and c.column_name = 'personality';

  if v_type is distinct from 'jsonb' then
    raise exception 'Migração 005 abortada: public.animals.personality precisa existir como jsonb. Tipo atual: %.', coalesce(v_type, 'ausente')
      using errcode = 'datatype_mismatch';
  end if;

  -- Colunas de snapshot que já podem existir de uma execução anterior: se
  -- estiverem presentes, precisam ter o tipo esperado para o backfill.
  for v_column, v_expected_type in
    select expected.column_name, expected.data_type
      from (values
        ('animal_species', 'text'),
        ('animal_sex', 'text'),
        ('animal_size', 'text'),
        ('animal_age', 'text'),
        ('animal_description', 'text'),
        ('animal_medical_info', 'text')
      ) as expected(column_name, data_type)
  loop
    select c.data_type
      into v_type
      from information_schema.columns c
     where c.table_schema = 'public'
       and c.table_name = 'adoptions'
       and c.column_name = v_column;

    if v_type is not null and v_type <> v_expected_type then
      raise exception 'Migração 005 abortada: public.adoptions.% tem tipo %, mas era esperado %.', v_column, v_type, v_expected_type
        using errcode = 'datatype_mismatch';
    end if;
  end loop;

  select c.data_type, c.udt_name
    into v_type, v_udt
    from information_schema.columns c
   where c.table_schema = 'public'
     and c.table_name = 'adoptions'
     and c.column_name = 'animal_personality';

  if v_type is not null and (v_type <> 'ARRAY' or v_udt <> '_text') then
    raise exception 'Migração 005 abortada: public.adoptions.animal_personality existe com tipo incompatível; esperado text[].'
      using errcode = 'datatype_mismatch';
  end if;
end;
$$;

-- ============================================
-- Colunas de snapshot
-- ============================================

alter table public.adoptions
  add column if not exists animal_species text;

alter table public.adoptions
  add column if not exists animal_sex text;

alter table public.adoptions
  add column if not exists animal_size text;

alter table public.adoptions
  add column if not exists animal_age text;

alter table public.adoptions
  add column if not exists animal_description text;

alter table public.adoptions
  add column if not exists animal_medical_info text;

alter table public.adoptions
  add column if not exists animal_personality text[];

-- CHECKs idempotentes e NOT VALID: não quebram registros legados.
do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_animal_species_check'
  ) then
    alter table public.adoptions
      add constraint adoptions_animal_species_check
      check (animal_species is null or animal_species in ('dog', 'cat'))
      not valid;
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_animal_sex_check'
  ) then
    alter table public.adoptions
      add constraint adoptions_animal_sex_check
      check (animal_sex is null or animal_sex in ('macho', 'fêmea'))
      not valid;
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_animal_size_check'
  ) then
    alter table public.adoptions
      add constraint adoptions_animal_size_check
      check (animal_size is null or animal_size in ('pequeno', 'médio', 'grande'))
      not valid;
  end if;

  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.adoptions'::regclass
       and conname = 'adoptions_animal_personality_shape'
  ) then
    alter table public.adoptions
      add constraint adoptions_animal_personality_shape
      check (
        animal_personality is null
        or array_position(animal_personality, null::text) is null
      ) not valid;
  end if;
end;
$$;

comment on column public.adoptions.animal_species is
  'Snapshot da espécie na confirmação. Preserva o histórico independentemente do cadastro.';
comment on column public.adoptions.animal_sex is
  'Snapshot do sexo na confirmação.';
comment on column public.adoptions.animal_size is
  'Snapshot do porte na confirmação.';
comment on column public.adoptions.animal_age is
  'Snapshot da idade registrada na confirmação.';
comment on column public.adoptions.animal_description is
  'Snapshot da descrição do animal na confirmação.';
comment on column public.adoptions.animal_medical_info is
  'Snapshot das informações de saúde do animal na confirmação.';
comment on column public.adoptions.animal_personality is
  'Snapshot da personalidade do animal na confirmação, em texto, independente do cadastro atual.';

-- ============================================
-- Normalização da personalidade (jsonb -> text[])
-- ============================================

-- A coluna animals.personality é jsonb (array de strings). Esta função converte
-- o valor para text[], remove espaços, descarta itens vazios e devolve '{}'
-- quando o valor não é um array. É usada apenas no backfill e nas RPCs.
create or replace function public.normalize_animal_personality(p_personality jsonb)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    array_agg(btrim(entry.value) order by entry.position)
      filter (where btrim(entry.value) <> ''),
    '{}'::text[]
  )
  from jsonb_array_elements_text(
    case
      when p_personality is null or jsonb_typeof(p_personality) <> 'array'
        then '[]'::jsonb
      else p_personality
    end
  ) with ordinality as entry(value, position);
$$;

revoke all on function public.normalize_animal_personality(jsonb) from public;

-- ============================================
-- Backfill de adoções já existentes
-- ============================================

-- Preenche apenas o que ainda está vazio. Adoções cujo animal já foi excluído
-- permanecem sem snapshot, mas continuam legíveis pelo nome e dados do adotante.
update public.adoptions as a
set
  animal_species = coalesce(a.animal_species, an.species),
  animal_sex = coalesce(a.animal_sex, an.sex),
  animal_size = coalesce(a.animal_size, an.size),
  animal_age = coalesce(a.animal_age, an.age),
  animal_description = coalesce(a.animal_description, an.description),
  animal_medical_info = coalesce(a.animal_medical_info, an.medical_info),
  animal_personality = coalesce(
    a.animal_personality,
    public.normalize_animal_personality(an.personality)
  )
from public.animals as an
where an.id = a.animal_id
  and (
    a.animal_species is null
    or a.animal_sex is null
    or a.animal_size is null
    or a.animal_age is null
    or a.animal_description is null
    or a.animal_medical_info is null
    or a.animal_personality is null
  );

-- ============================================
-- RPC: confirmar adoção (com snapshots)
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
    animal_species,
    animal_sex,
    animal_size,
    animal_age,
    animal_description,
    animal_medical_info,
    animal_personality,
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
    v_animal.species,
    v_animal.sex,
    v_animal.size,
    v_animal.age,
    v_animal.description,
    v_animal.medical_info,
    public.normalize_animal_personality(v_animal.personality),
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
-- RPC: regularizar adoção legada (com snapshots)
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
    animal_species,
    animal_sex,
    animal_size,
    animal_age,
    animal_description,
    animal_medical_info,
    animal_personality,
    interest_id,
    origin,
    adopter_name,
    adoption_date,
    notes,
    confirmed_by
  ) values (
    v_animal.id,
    v_animal.name,
    v_animal.species,
    v_animal.sex,
    v_animal.size,
    v_animal.age,
    v_animal.description,
    v_animal.medical_info,
    public.normalize_animal_personality(v_animal.personality),
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
-- RPC: candidatos da limpeza (janela baseada em adopted_at)
-- ============================================

-- Mantém a versão revisada na migração 004 para usar a data canônica da adoção
-- (`animals.adopted_at`), e não updated_at nem campos editáveis. O limite é
-- inclusivo: 30 dias completos já são elegíveis.
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
