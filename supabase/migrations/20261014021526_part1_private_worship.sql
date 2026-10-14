-- Part 1: private per-account worship and organization records.
-- No GPS coordinates or chat messages are stored.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '' check (char_length(name) <= 80),
  calculation_method text not null default 'ISNA' check (calculation_method in ('ISNA', 'MWL', 'Umm al-Qura', 'Egyptian', 'Karachi', 'Dubai')),
  notifications boolean not null default false,
  locale text not null default 'en' check (locale in ('en', 'ar')),
  mosque_overrides jsonb not null default '{}'::jsonb check (jsonb_typeof(mosque_overrides) = 'object'),
  onboarded boolean not null default false
);
create table public.prayer_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), date date not null,
  prayer text not null check (prayer in ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')),
  status text not null check (status in ('prayed', 'missed', 'late')),
  unique (user_id, date, prayer)
);
create table public.quran_bookmarks (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), surah integer not null check (surah between 1 and 114),
  ayah integer not null check (ayah between 1 and 286), unique (user_id, surah, ayah)
);
create table public.reading_progress (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), surah integer not null check (surah between 1 and 114),
  ayah integer not null check (ayah between 1 and 286), updated_at timestamptz not null default now()
);
create table public.habits (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), title text not null check (char_length(btrim(title)) between 1 and 120),
  completed_dates date[] not null default '{}'
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), title text not null check (char_length(btrim(title)) between 1 and 120),
  completed boolean not null default false, completed_at timestamptz,
  check (completed = (completed_at is not null))
);
create table public.dhikr_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), phrase text not null check (char_length(phrase) between 1 and 120),
  count integer not null default 0 check (count >= 0), date date not null, checklist text[] not null default '{}',
  unique (user_id, date, phrase)
);
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), prayer text not null check (prayer in ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')),
  started_at timestamptz not null, ended_at timestamptz not null, duration_seconds integer not null check (duration_seconds >= 0),
  confirmation text not null check (confirmation in ('manual', 'qr', 'nfc')),
  reflection text not null default '' check (char_length(reflection) <= 1000),
  check (ended_at >= started_at),
  check (duration_seconds = floor(extract(epoch from (ended_at - started_at))))
);
-- Policies restrict both existing row access and new ownership on INSERT/UPDATE.
do $$
declare t text; owner_column text;
begin
  foreach t in array array['profiles', 'prayer_logs', 'quran_bookmarks', 'reading_progress', 'habits', 'tasks', 'dhikr_sessions', 'focus_sessions'] loop
    owner_column := case when t = 'profiles' then 'id' else 'user_id' end;
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy own_select on public.%I for select to authenticated using ((select auth.uid()) = %I)', t, owner_column);
    execute format('create policy own_insert on public.%I for insert to authenticated with check ((select auth.uid()) = %I)', t, owner_column);
    execute format('create policy own_update on public.%I for update to authenticated using ((select auth.uid()) = %I) with check ((select auth.uid()) = %I)', t, owner_column, owner_column);
    execute format('create policy own_delete on public.%I for delete to authenticated using ((select auth.uid()) = %I)', t, owner_column);
    if t <> 'profiles' then
      execute format('create index %I on public.%I (user_id, created_at desc)', t || '_owner_created_idx', t);
    end if;
  end loop;
end $$;
-- Storage is private. Users can only access files inside <auth.uid()>/.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-assets', 'user-assets', false, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;
create policy nurah_assets_select on storage.objects for select to authenticated
  using (bucket_id = 'user-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy nurah_assets_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'user-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy nurah_assets_update on storage.objects for update to authenticated
  using (bucket_id = 'user-assets' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'user-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy nurah_assets_delete on storage.objects for delete to authenticated
  using (bucket_id = 'user-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
