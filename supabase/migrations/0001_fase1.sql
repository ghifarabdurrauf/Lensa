-- =============================================================
-- Lensa · Fase 1
-- Jalankan sekali di Supabase: SQL Editor -> New query -> tempel -> Run
-- Aman dijalankan ulang (semua perintah memakai IF NOT EXISTS / OR REPLACE).
-- =============================================================

-- ---------- Profil ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale      text not null default 'id' check (locale in ('id','en','fr')),
  palette     text not null default 'sage' check (palette in ('sage','sand','stone')),
  theme_mode  text not null default 'auto' check (theme_mode in ('light','dark','auto')),
  created_at  timestamptz not null default now()
);

-- Profil dibuat otomatis saat pengguna pertama kali masuk
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Tabel inti: satu tabel untuk tiga jalur ----------
create table if not exists public.items (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type         text not null check (type in ('job','scholarship','university')),
  title        text not null check (length(trim(title)) > 0),
  organization text,
  country      text,
  city         text,
  url          text,
  deadline     date,
  opens_at     date,
  status       text not null,
  priority     text not null default 'medium' check (priority in ('high','medium','low')),
  favorite     boolean not null default false,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- status harus cocok dengan jalurnya
  constraint status_valid check (
    (type = 'job'         and status in ('saved','applied','test','interview','offer','rejected')) or
    (type = 'scholarship' and status in ('research','preparing','submitted','selection','accepted','rejected')) or
    (type = 'university'  and status in ('not_applied','preparing','submitted','loa_conditional','loa_unconditional','rejected'))
  )
);
create index if not exists items_user_type_idx on public.items (user_id, type);
create index if not exists items_user_deadline_idx on public.items (user_id, deadline);

-- ---------- Detail per jalur (1:1 dengan items) ----------
create table if not exists public.job_details (
  item_id         uuid primary key references public.items(id) on delete cascade,
  employment_type text check (employment_type in ('full_time','internship','contract','part_time')),
  work_mode       text check (work_mode in ('onsite','hybrid','remote')),
  source          text,
  salary          text
);

create table if not exists public.scholarship_details (
  item_id      uuid primary key references public.items(id) on delete cascade,
  coverage     text check (coverage in ('full','partial')),
  level        text check (level in ('s2','s3','exchange')),
  benefits     text,
  requirements text
);

create table if not exists public.university_details (
  item_id   uuid primary key references public.items(id) on delete cascade,
  program   text,
  intake    text,
  tuition   text,
  ielts_min numeric(2,1) check (ielts_min is null or (ielts_min >= 0 and ielts_min <= 9))
);

-- ---------- Riwayat status (diisi otomatis oleh trigger) ----------
create table if not exists public.status_history (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.items(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  from_status text,
  to_status   text not null,
  changed_at  timestamptz not null default now()
);
create index if not exists status_history_item_idx on public.status_history (item_id, changed_at);

create or replace function public.items_track_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.status_history (item_id, user_id, from_status, to_status)
    values (new.id, new.user_id, null, new.status);
  elsif tg_op = 'UPDATE' then
    new.updated_at := now();
    if new.status is distinct from old.status then
      insert into public.status_history (item_id, user_id, from_status, to_status)
      values (new.id, new.user_id, old.status, new.status);
    end if;
  end if;
  return new;
end $$;

drop trigger if exists items_before_update on public.items;
create trigger items_before_update before update on public.items
  for each row execute function public.items_track_changes();
drop trigger if exists items_after_insert on public.items;
create trigger items_after_insert after insert on public.items
  for each row execute function public.items_track_changes();

-- =============================================================
-- Row Level Security: setiap pengguna hanya melihat datanya sendiri
-- =============================================================
alter table public.profiles            enable row level security;
alter table public.items               enable row level security;
alter table public.job_details         enable row level security;
alter table public.scholarship_details enable row level security;
alter table public.university_details  enable row level security;
alter table public.status_history      enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "own items" on public.items;
create policy "own items" on public.items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own job details" on public.job_details;
create policy "own job details" on public.job_details for all
  using (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()))
  with check (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()));

drop policy if exists "own scholarship details" on public.scholarship_details;
create policy "own scholarship details" on public.scholarship_details for all
  using (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()))
  with check (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()));

drop policy if exists "own university details" on public.university_details;
create policy "own university details" on public.university_details for all
  using (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()))
  with check (exists (select 1 from public.items i where i.id = item_id and i.user_id = auth.uid()));

-- Riwayat hanya bisa dibaca; penulisan dilakukan trigger
drop policy if exists "read own history" on public.status_history;
create policy "read own history" on public.status_history
  for select using (user_id = auth.uid());
