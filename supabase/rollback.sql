-- ==============================================================================
-- UGG (UEMK Gamerz Guild) Database Rollback Script
-- CAUTION: Running this script permanently drops tables, policies, and storage
-- ==============================================================================

-- 1. Drop Storage Policies
drop policy if exists "Public visitors can view tournament posters" on storage.objects;
drop policy if exists "Coordinators can upload tournament posters" on storage.objects;
drop policy if exists "Coordinators can manage tournament posters" on storage.objects;

-- 2. Delete Storage Bucket
delete from storage.buckets where id = 'posters';

-- 3. Drop Table Policies
drop policy if exists "Public visitors can view published tournaments" on public.tournaments;
drop policy if exists "Coordinators can manage tournaments" on public.tournaments;
drop policy if exists "Coordinators can view audit logs" on public.admin_audit_logs;
drop policy if exists "Service role can insert audit logs" on public.admin_audit_logs;

-- 4. Drop Triggers and Functions
drop trigger if exists set_tournaments_updated_at on public.tournaments;
drop function if exists public.handle_updated_at();

-- 5. Drop Tables
drop table if exists public.admin_audit_logs cascade;
drop table if exists public.tournaments cascade;
