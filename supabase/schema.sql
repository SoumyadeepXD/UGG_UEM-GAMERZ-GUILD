-- ==============================================================================
-- UGG (UEMK Gamerz Guild) Production Database Schema & Security Policies
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create Tournaments Table
create table if not exists public.tournaments (
  id text primary key,
  title text not null,
  game text not null,
  poster_url text not null,
  date text not null,
  time text default '6:00 PM IST',
  prize_pool text default 'Trophies & Glory',
  format text default 'Open Bracket',
  platform text default 'Cross-Platform',
  entry_fee text default 'Free',
  description text default '',
  form_url text not null,
  status text not null default 'active' check (status in ('active', 'upcoming', 'completed')),
  registered_teams integer default 0,
  max_teams integer default 32,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for public queries on status & created_at
create index if not exists idx_tournaments_status_created 
  on public.tournaments (status, created_at desc);

-- 2. Create Admin Audit Logs Table (Immutable append-only record)
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

-- 3. Automatic updated_at Trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tournaments_updated_at on public.tournaments;
create trigger set_tournaments_updated_at
  before update on public.tournaments
  for each row execute function public.handle_updated_at();

-- 4. Enable Row Level Security (RLS) on all tables
alter table public.tournaments enable row level security;
alter table public.admin_audit_logs enable row level security;

-- 5. RLS Policies for Tournaments:
-- Public can ONLY SELECT published tournaments (active, upcoming, completed)
drop policy if exists "Public visitors can view published tournaments" on public.tournaments;
create policy "Public visitors can view published tournaments"
  on public.tournaments
  for select
  using (status in ('active', 'upcoming', 'completed'));

-- Admin write policy: Only authenticated admins (checked via JWT app_metadata.role) can insert, update, or delete
drop policy if exists "Admins can manage tournaments" on public.tournaments;
drop policy if exists "Coordinators can manage tournaments" on public.tournaments;
create policy "Admins can manage tournaments"
  on public.tournaments
  for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 6. RLS Policies for Admin Audit Logs:
-- Public CANNOT view audit logs.
-- Only authenticated admins can view audit logs
drop policy if exists "Admins can view audit logs" on public.admin_audit_logs;
drop policy if exists "Coordinators can view audit logs" on public.admin_audit_logs;
create policy "Admins can view audit logs"
  on public.admin_audit_logs
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins can insert audit logs
drop policy if exists "Admins can insert audit logs" on public.admin_audit_logs;
drop policy if exists "Service role can insert audit logs" on public.admin_audit_logs;
create policy "Admins can insert audit logs"
  on public.admin_audit_logs
  for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 7. Object Storage Setup for Tournament Posters
-- Creates public 'posters' bucket with 4MB size limit and image-only MIME restriction
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'posters',
  'posters',
  true,
  4194304, -- 4 MB in bytes (Vercel payload constraint)
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 4194304,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- Storage RLS: Public Read for Posters
drop policy if exists "Public visitors can view tournament posters" on storage.objects;
create policy "Public visitors can view tournament posters"
  on storage.objects for select
  using (bucket_id = 'posters');
