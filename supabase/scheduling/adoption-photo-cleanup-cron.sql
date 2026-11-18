-- SAAL — Agendamento diário da limpeza automática de fotos (30 dias)
--
-- Este arquivo NÃO é aplicado automaticamente. Ele é um passo de configuração
-- único no Supabase, executado manualmente com aprovação do responsável.
--
-- Pré-requisitos:
--   1. Migrações 003, 004 e 005 aplicadas.
--   2. Edge Function publicada:
--        supabase functions deploy cleanup-adopted-photos --no-verify-jwt
--   3. Segredo do servidor definido:
--        supabase secrets set ADOPTION_CLEANUP_SECRET=<segredo-aleatorio-longo>
--   4. Extensões pg_cron e pg_net habilitadas no projeto (Dashboard >
--      Database > Extensions).
--   5. Segredos no Vault com os nomes abaixo:
--        adoption_cleanup_url    = https://<projeto>.supabase.co/functions/v1/cleanup-adopted-photos
--        adoption_cleanup_secret = <o mesmo valor de ADOPTION_CLEANUP_SECRET>
--
-- O agendamento roda sem navegador, sem sessão administrativa e sem login.
-- Uma execução por dia é suficiente; a função é idempotente e pode ser
-- repetida com segurança.

-- ============================================
-- Extensões (idempotente)
-- ============================================

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- ============================================
-- Agendamento diário (03:17 UTC)
-- ============================================

-- Remove agendamento anterior com o mesmo nome para permitir reexecução.
select cron.unschedule(jobid)
from cron.job
where jobname = 'adoption-photo-cleanup';

select cron.schedule(
  'adoption-photo-cleanup',
  '17 3 * * *',
  $job$
  select net.http_post(
    url := (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'adoption_cleanup_url'
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cleanup-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'adoption_cleanup_secret'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $job$
);

-- Conferência: lista o agendamento criado e as últimas execuções.
-- select jobid, jobname, schedule, active from cron.job where jobname = 'adoption-photo-cleanup';
-- select * from cron.job_run_details order by start_time desc limit 10;
