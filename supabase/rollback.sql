-- ==============================================================================
-- UGG (UEMK Gamerz Guild) Database Rollback Script
-- Drops all tables, indexes, functions, triggers, and RLS policies created by schema.sql
-- Run in Supabase SQL Editor if a complete database reset is required.
-- ==============================================================================

-- 1. Drop Storage Policies & Buckets
drop policy if exists "Public visitors can view tournament posters" on storage.objects;
delete from storage.objects where bucket_id = 'posters';
delete from storage.buckets where id = 'posters';

-- 2. Drop RLS Policies on admin_audit_logs
drop policy if exists "Admins can view audit logs" on public.admin_audit_logs;
drop policy if exists "Coordinators can view audit logs" on public.admin_audit_logs;
drop policy if exists "Admins can insert audit logs" on public.admin_audit_logs;
drop policy if exists "Service role can insert audit logs" on public.admin_audit_logs;

-- 3. Drop RLS Policies on tournaments
drop policy if exists "Public visitors can view published tournaments" on public.tournaments;
drop policy if exists "Admins can manage tournaments" on public.tournaments;
drop policy if exists "Coordinators can manage tournaments" on public.tournaments;

-- 4. Drop Triggers and Functions
drop trigger if exists set_tournaments_updated_at on public.tournaments;
drop function if exists public.handle_updated_at cascade;

-- 5. Drop Tables
drop table if exists public.admin_audit_logs cascade;
drop table if exists public.tournaments cascade;
