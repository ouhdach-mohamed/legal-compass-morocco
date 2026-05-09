
-- Roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins can view roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Languages
create table public.languages (
  code text primary key,
  name text not null,
  rtl boolean not null default false,
  is_default boolean not null default false
);
alter table public.languages enable row level security;
create policy "Public read languages" on public.languages for select using (true);

insert into public.languages (code, name, rtl, is_default) values
  ('ar', 'العربية', true, true),
  ('fr', 'Français', false, false),
  ('en', 'English', false, false);

-- Categories
create table public.legal_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.legal_categories enable row level security;
create policy "Public read categories" on public.legal_categories for select using (true);
create policy "Admins manage categories" on public.legal_categories for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Procedures
create table public.legal_procedures (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.legal_categories(id) on delete set null,
  slug text not null unique,
  title jsonb not null default '{}'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.legal_procedures enable row level security;
create policy "Public read procedures" on public.legal_procedures for select using (is_active = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage procedures" on public.legal_procedures for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Steps
create table public.procedure_steps (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references public.legal_procedures(id) on delete cascade,
  step_order int not null default 1,
  content jsonb not null default '{}'::jsonb
);
alter table public.procedure_steps enable row level security;
create policy "Public read steps" on public.procedure_steps for select using (true);
create policy "Admins manage steps" on public.procedure_steps for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Keywords
create table public.keywords (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references public.legal_procedures(id) on delete cascade,
  language_code text not null references public.languages(code),
  keyword text not null,
  weight int not null default 1
);
create index keywords_lang_idx on public.keywords (language_code);
create index keywords_proc_idx on public.keywords (procedure_id);
alter table public.keywords enable row level security;
create policy "Public read keywords" on public.keywords for select using (true);
create policy "Admins manage keywords" on public.keywords for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Unanswered questions
create table public.unanswered_questions (
  id uuid primary key default gen_random_uuid(),
  language_code text not null,
  raw_text text not null,
  normalized_text text not null,
  status text not null default 'pending',
  resolved_procedure_id uuid references public.legal_procedures(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.unanswered_questions enable row level security;
create policy "Anyone can submit" on public.unanswered_questions for insert to anon, authenticated with check (true);
create policy "Admins read unanswered" on public.unanswered_questions for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update unanswered" on public.unanswered_questions for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete unanswered" on public.unanswered_questions for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger procedures_updated
  before update on public.legal_procedures
  for each row execute function public.set_updated_at();
