-- Ejecutar después de 09_commercial.sql.
begin;

create table if not exists public.cold_call_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 160),
  phone text not null check (length(btrim(phone)) between 1 and 40 and phone ~ '[0-9]'),
  agency text check (length(agency) <= 160),
  email text check (length(email) <= 254),
  property_url text check (length(property_url) <= 2048 and property_url ~* '^https?://'),
  created_at timestamptz not null default now()
);

create table if not exists public.cold_call_interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.cold_call_contacts(id),
  channel text not null check (channel in ('call', 'email', 'whatsapp', 'other')),
  outcome text not null check (outcome in (
    'no_answer', 'call_back', 'travelling', 'asked_email', 'asked_whatsapp',
    'interested', 'not_interested', 'followed_up', 'other'
  )),
  note text check (length(note) <= 2000),
  next_action text not null check (next_action in ('call', 'email', 'whatsapp', 'other', 'none')),
  follow_up_date date,
  follow_up_time time,
  created_at timestamptz not null default now(),
  check (follow_up_time is null or follow_up_date is not null),
  check (next_action <> 'none' or follow_up_date is null)
);

create index if not exists cold_call_interactions_contact_created_idx
  on public.cold_call_interactions (contact_id, created_at desc, id desc);

alter table public.cold_call_contacts enable row level security;
alter table public.cold_call_interactions enable row level security;

drop policy if exists cold_call_contacts_admin on public.cold_call_contacts;
create policy cold_call_contacts_admin on public.cold_call_contacts
  for all to authenticated using ((select public.com_is_admin())) with check ((select public.com_is_admin()));

drop policy if exists cold_call_interactions_admin on public.cold_call_interactions;
create policy cold_call_interactions_admin on public.cold_call_interactions
  for all to authenticated using ((select public.com_is_admin())) with check ((select public.com_is_admin()));

revoke all on public.cold_call_contacts, public.cold_call_interactions from public, anon, authenticated;
grant select, insert, update on public.cold_call_contacts to authenticated;
grant select, insert on public.cold_call_interactions to authenticated;

commit;
