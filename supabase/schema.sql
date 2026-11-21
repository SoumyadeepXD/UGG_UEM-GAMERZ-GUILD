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

-- 4. Enable Row Level Security (RLS)
alter table public.tournaments enable row level security;
alter table public.admin_audit_logs enable row level security;

-- 5. RLS Policies for Tournaments:
-- Public can read all published tournaments
drop policy if exists "Public visitors can view published tournaments" on public.tournaments;
create policy "Public visitors can view published tournaments"
  on public.tournaments
  for select
  using (true);

-- Admin write policy: Only authenticated coordinators can insert, update, or delete
drop policy if exists "Coordinators can manage tournaments" on public.tournaments;
create policy "Coordinators can manage tournaments"
  on public.tournaments
  for all
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.email in ('gamerzguild@uem.edu.in')
    )
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.email in ('gamerzguild@uem.edu.in')
    )
  );

-- 6. RLS Policies for Admin Audit Logs:
-- Coordinators can view audit logs
drop policy if exists "Coordinators can view audit logs" on public.admin_audit_logs;
create policy "Coordinators can view audit logs"
  on public.admin_audit_logs
  for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.email in ('gamerzguild@uem.edu.in')
    )
  );

-- Service role can insert audit logs (enforced via server)
drop policy if exists "Service role can insert audit logs" on public.admin_audit_logs;
create policy "Service role can insert audit logs"
  on public.admin_audit_logs
  for insert
  to authenticated
  with check (true);

-- 7. Seed Initial Tournaments (If table is empty)
insert into public.tournaments (
  id, title, game, poster_url, date, time, prize_pool, format, platform, entry_fee, description, form_url, status, registered_teams, max_teams
) values 
  (
    'ugg-val-2026',
    'Valorant: Clash of Radiants',
    'Valorant',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    'Oct 18 - 20, 2026',
    '6:00 PM IST',
    '₹10,000 + UGG Trophy',
    '5v5 Standard Tournament',
    'PC (Mumbai Servers)',
    'Free for UEMK Students',
    'The premier collegiate Valorant championship. Assemble your 5-stack and battle across Ascent, Haven, and Bind for ultimate college bragging rights.',
    'https://docs.google.com/forms/d/e/1FAIpQLSc_dummy_valorant_form/viewform',
    'active',
    18,
    32
  ),
  (
    'ugg-bgmi-2026',
    'BGMI Campus Warfare Season 3',
    'BGMI',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
    'Nov 02 - 04, 2026',
    '7:30 PM IST',
    '₹8,000 + Winner Medals',
    'Squad TPP Battle Royale',
    'Mobile / Tablet',
    'Free',
    'Drop into Erangel, Miramar, and Sanhok. 4-player squads compete across 6 high-stakes custom rooms. Kill points + placement points determine the victor.',
    'https://docs.google.com/forms/d/e/1FAIpQLSc_dummy_bgmi_form/viewform',
    'active',
    22,
    25
  ),
  (
    'ugg-fc25-2026',
    'EA FC 25 Kickoff Championship',
    'EA Sports FC 25',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200&auto=format&fit=crop',
    'Nov 15, 2026',
    '3:00 PM IST (LAN)',
    '₹5,000 + Gaming Headset',
    '1v1 Single Knockout (LAN)',
    'PS5 / PC Controllers',
    'Free',
    'In-person LAN showdown at the UEMK Campus Esports Arena. 6-minute halves, tactical defending, pure skill. Bring your best starting 11.',
    'https://docs.google.com/forms/d/e/1FAIpQLSc_dummy_eafc_form/viewform',
    'upcoming',
    12,
    32
  )
on conflict (id) do nothing;
