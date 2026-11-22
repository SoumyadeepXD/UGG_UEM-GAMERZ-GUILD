-- ==============================================================================
-- UGG schema v2 (security-reviewed). Run on the DEV project first.
-- ==============================================================================

create table if not exists public.tournaments (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,80}$'),
  title text not null check (char_length(title) between 3 and 100),
  game text not null check (char_length(game) between 2 and 50),
  poster_url text not null check (poster_url ~ '^https://' and char_length(poster_url) <= 2000),
  date text not null check (char_length(date) between 3 and 60),
  time text default '6:00 PM IST' check (char_length(time) <= 40),
  prize_pool text default 'Trophies & Glory' check (char_length(prize_pool) <= 60),
  format text default 'Open Bracket' check (char_length(format) <= 60),
  platform text default 'Cross-Platform' check (char_length(platform) <= 50),
  entry_fee text default 'Free' check (char_length(entry_fee) <= 40),
  description text default '' check (char_length(description) <= 1000),
  form_url text not null check (form_url ~ '^https://' and char_length(form_url) <= 2000),
  status text not null default 'active' check (status in ('active', 'upcoming', 'completed')),
  registered_teams integer default 0 check (registered_teams >= 0),
  max_teams integer default 32 check (max_teams > 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_tournaments_status_created
  on public.tournaments (status, created_at desc);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null,
  actor_email text not null,
  action text not null,
  resource_id text,
  details jsonb default '{}'::jsonb,
  ip_address text default '127.0.0.1',
  user_agent text default 'Unknown',
  created_at timestamptz default now() not null
);

create index if not exists idx_audit_logs_actor
  on public.admin_audit_logs (actor_email, created_at desc);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tournaments_updated_at on public.tournaments;
create trigger set_tournaments_updated_at
  before update on public.tournaments
  for each row execute function public.handle_updated_at();

-- Row Level Security
alter table public.tournaments enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Table privileges (defense in depth on top of RLS)
revoke all on public.tournaments from anon;
grant select on public.tournaments to anon;

revoke all on public.admin_audit_logs from anon, authenticated;
grant select on public.admin_audit_logs to authenticated;

-- Tournaments: public read, admin-only writes (role from JWT app_metadata)
drop policy if exists "Public visitors can view published tournaments" on public.tournaments;
create policy "Public visitors can view published tournaments"
  on public.tournaments
  for select
  using (status in ('active', 'upcoming', 'completed'));

drop policy if exists "Admins can manage tournaments" on public.tournaments;
create policy "Admins can manage tournaments"
  on public.tournaments
  for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Audit logs: admins can read; nobody can write via the API.
-- The server writes with the service-role key, which bypasses RLS.
drop policy if exists "Admins can view audit logs" on public.admin_audit_logs;
create policy "Admins can view audit logs"
  on public.admin_audit_logs
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can insert audit logs" on public.admin_audit_logs;

-- Storage: public 'posters' bucket, 4 MB, images only. Uploads go through the server (service role).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'posters', 'posters', true, 4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 4194304,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

drop policy if exists "Public visitors can view tournament posters" on storage.objects;
create policy "Public visitors can view tournament posters"
  on storage.objects for select
  using (bucket_id = 'posters');

-- ==============================================================================
-- Site Content: single-row configuration document for the global website
-- ==============================================================================
create table if not exists public.site_content (
  id text primary key check (id = 'main'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now() not null,
  updated_by text
);

create or replace function public.handle_site_content_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
  before update on public.site_content
  for each row execute function public.handle_site_content_updated_at();

alter table public.site_content enable row level security;

revoke all on public.site_content from anon;
grant select on public.site_content to anon;
grant select on public.site_content to authenticated;
grant all on public.site_content to service_role;

drop policy if exists "Public visitors can view site content" on public.site_content;
create policy "Public visitors can view site content"
  on public.site_content
  for select
  using (true);

drop policy if exists "Admins can update site content" on public.site_content;
create policy "Admins can update site content"
  on public.site_content
  for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
