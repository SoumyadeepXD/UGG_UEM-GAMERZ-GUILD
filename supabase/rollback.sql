-- UGG rollback. Supabase blocks direct SQL deletes on storage tables.
-- Remove the 'posters' bucket in the dashboard (Storage -> posters -> empty, then delete).

drop policy if exists "Public visitors can view tournament posters" on storage.objects;

drop policy if exists "Admins can view audit logs" on public.admin_audit_logs;
drop policy if exists "Admins can insert audit logs" on public.admin_audit_logs;
drop policy if exists "Coordinators can view audit logs" on public.admin_audit_logs;
drop policy if exists "Service role can insert audit logs" on public.admin_audit_logs;

drop policy if exists "Public visitors can view published tournaments" on public.tournaments;
drop policy if exists "Admins can manage tournaments" on public.tournaments;
drop policy if exists "Coordinators can manage tournaments" on public.tournaments;

drop trigger if exists set_tournaments_updated_at on public.tournaments;
drop function if exists public.handle_updated_at() cascade;

drop table if exists public.admin_audit_logs cascade;
drop table if exists public.tournaments cascade;