-- SAAL — Migração 001: Schema inicial do banco de dados
-- Aplicar no painel do Supabase: SQL Editor > New query

-- ============================================
-- Tabelas
-- ============================================

create table if not exists public.admin_users (
  id uuid references auth.users not null primary key,
  email text not null,
  role text not null default 'admin' check (role = 'admin'),
  display_name text not null default 'Administração SAAL',
  created_at timestamptz not null default now()
);

create table if not exists public.animals (
  id uuid default gen_random_uuid() primary key,
  name text not null check (char_length(name) > 0),
  species text not null check (species in ('dog', 'cat')),
  age text not null,
  size text not null check (size in ('pequeno', 'médio', 'grande')),
  sex text not null check (sex in ('macho', 'fêmea')),
  status text not null check (status in ('available', 'adopted')) default 'available',
  description text not null default '',
  personality jsonb not null default '[]' check (jsonb_typeof(personality) = 'array'),
  medical_info text not null default '',
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.admin_users(id)
);

create table if not exists public.animal_photos (
  id uuid default gen_random_uuid() primary key,
  animal_id uuid not null references public.animals(id) on delete cascade,
  url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.interests (
  id uuid default gen_random_uuid() primary key,
  animal_id uuid not null references public.animals(id) on delete cascade,
  animal_name text not null,
  full_name text not null,
  whatsapp text not null,
  city text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid default gen_random_uuid() primary key,
  key text not null unique,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.admin_users(id)
);

-- ============================================
-- Índices
-- ============================================

create index if not exists idx_animals_status on public.animals(status);
create index if not exists idx_animals_created_by on public.animals(created_by);
create index if not exists idx_animal_photos_animal_id on public.animal_photos(animal_id);
create index if not exists idx_interests_animal_id on public.interests(animal_id);
create index if not exists idx_interests_created_at on public.interests(created_at desc);
create index if not exists idx_site_settings_key on public.site_settings(key);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Animais: leitura pública, escrita só para admin
alter table public.animals enable row level security;

create policy "animals_select_public"
  on public.animals for select
  to anon, authenticated
  using (true);

create policy "animals_insert_admin"
  on public.animals for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "animals_update_admin"
  on public.animals for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "animals_delete_admin"
  on public.animals for delete
  to authenticated
  using (auth.uid() = created_by);

-- Animal photos: leitura pública, escrita só para admin
alter table public.animal_photos enable row level security;

create policy "animal_photos_select_public"
  on public.animal_photos for select
  to anon, authenticated
  using (true);

create policy "animal_photos_insert_admin"
  on public.animal_photos for insert
  to authenticated
  with check (true);

create policy "animal_photos_delete_admin"
  on public.animal_photos for delete
  to authenticated
  using (true);

-- Interesses: inserção pública, leitura só para admin
alter table public.interests enable row level security;

create policy "interests_insert_public"
  on public.interests for insert
  to anon, authenticated
  with check (true);

create policy "interests_select_admin"
  on public.interests for select
  to authenticated
  using (true);

-- Site settings: leitura pública, escrita só para admin
alter table public.site_settings enable row level security;

create policy "site_settings_select_public"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "site_settings_insert_admin"
  on public.site_settings for insert
  to authenticated
  with check (true);

create policy "site_settings_update_admin"
  on public.site_settings for update
  to authenticated
  using (true);

create policy "site_settings_delete_admin"
  on public.site_settings for delete
  to authenticated
  using (true);

-- Admin users: leitura pública (para display_name), escrita só para admin
alter table public.admin_users enable row level security;

create policy "admin_users_select_public"
  on public.admin_users for select
  to anon, authenticated
  using (true);

create policy "admin_users_insert_admin"
  on public.admin_users for insert
  to authenticated
  with check (auth.uid() = id);

create policy "admin_users_update_admin"
  on public.admin_users for update
  to authenticated
  using (auth.uid() = id);

-- ============================================
-- Função de atualização automática de updated_at
-- ============================================

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_animals_updated_at
  before update on public.animals
  for each row
  execute function public.update_updated_at_column();

create trigger trigger_site_settings_updated_at
  before update on public.site_settings
  for each row
  execute function public.update_updated_at_column();

-- ============================================
-- Comentários
-- ============================================

comment on table public.animals is 'Catálogo de animais para adoção';
comment on table public.animal_photos is 'Fotos dos animais armazenadas no Supabase Storage';
comment on table public.interests is 'Manifestações de interesse em adoção';
comment on table public.site_settings is 'Configurações públicas do site da ONG';
comment on table public.admin_users is 'Usuários administradores autenticados via Supabase Auth';
