-- SAAL — Migração 002: guarda no banco contra manifestações de interesse
-- para animais que não estão disponíveis (inclui adotados).
--
-- Motivação: a verificação de status feita no cliente (submitAnimalInterest)
-- é apenas de conveniência; um chamador direto à tabela `interests` poderia
-- registrar interesse em um animal adotado. Este trigger garante a regra na
-- própria base, sem alterar políticas de RLS nem permissões existentes.
--
-- Compatibilidade: atua apenas em INSERT; solicitações já cadastradas não
-- são tocadas (não há trigger de UPDATE/DELETE).
--
-- Mensagens: o frontend mapeia a violação de CHECK (SQLSTATE 23514) do
-- insert para HTTP 409 e exibe "Este animal não está mais disponível para
-- receber manifestações." (src/app/pages/Interest.tsx).
--
-- Aplicar no painel do Supabase (SQL Editor) somente com aprovação do
-- responsável pelo projeto.

create or replace function public.reject_interest_for_unavailable_animal()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  animal_status text;
begin
  select status into animal_status
    from public.animals
    where id = new.animal_id;

  if animal_status is null then
    raise exception 'Animal % não encontrado.', new.animal_id
      using errcode = 'foreign_key_violation';
  end if;

  if animal_status <> 'available' then
    raise exception 'Este animal não está disponível para novas manifestações de interesse.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_interests_animal_available on public.interests;

create trigger guard_interests_animal_available
  before insert on public.interests
  for each row
  execute function public.reject_interest_for_unavailable_animal();
