-- Enable only after installing 09_commercial.sql and configuring the server.
-- In Supabase enable pg_cron + pg_net, then create two Vault secrets:
-- arko_commercial_jobs_url = https://YOUR-DOMAIN/api/commercial?action=jobs
-- arko_commercial_jobs_secret = same value as Vercel COMMERCIAL_JOB_SECRET
-- Do not put the actual secret in Git or in a public table.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
do $$ begin
 if not exists(select 1 from vault.decrypted_secrets where name='arko_commercial_jobs_url') or
    not exists(select 1 from vault.decrypted_secrets where name='arko_commercial_jobs_secret') then
  raise exception 'Create the two arko_commercial_jobs Vault secrets first.';
 end if;
end $$;
select cron.schedule('arko-commercial-jobs','*/5 * * * *',$job$
 select net.http_get(
  url:=(select decrypted_secret from vault.decrypted_secrets where name='arko_commercial_jobs_url' limit 1),
  headers:=jsonb_build_object('Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='arko_commercial_jobs_secret' limit 1)),
  timeout_milliseconds:=55000
 );
$job$);
