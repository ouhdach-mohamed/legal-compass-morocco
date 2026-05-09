
create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end; $$;

revoke execute on function public.has_role(uuid, app_role) from public, anon, authenticated;
grant execute on function public.has_role(uuid, app_role) to authenticator, service_role;

drop policy if exists "Anyone can submit" on public.unanswered_questions;
create policy "Anyone can submit non-empty"
  on public.unanswered_questions for insert
  to anon, authenticated
  with check (length(trim(raw_text)) > 0 and length(raw_text) <= 2000);
