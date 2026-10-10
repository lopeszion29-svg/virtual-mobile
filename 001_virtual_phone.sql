-- Virtual Phone OS: run this migration in the Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.phone_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{"wallpaper":"aurora","theme":"dark","accent":"#a78bfa","installed":["notes","calculator","calendar","gallery","tasks","contacts","settings","browser","clock","files"],"favorites":["browser","notes","camera","settings"],"notes":[],"tasks":[],"contacts":[],"events":[],"notifications":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Profile rows are private to their owner.
alter table public.profiles enable row level security;
drop policy if exists "profile_select_own" on public.profiles;
create policy "profile_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profile_insert_own" on public.profiles;
create policy "profile_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "profile_update_own" on public.profiles;
create policy "profile_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- One JSON document per user is used for the synchronized virtual-phone state.
-- All writes and reads are restricted to the authenticated owner.
alter table public.phone_profiles enable row level security;
drop policy if exists "phone_profile_select_own" on public.phone_profiles;
create policy "phone_profile_select_own" on public.phone_profiles for select to authenticated using (auth.uid() = user_id);
drop policy if exists "phone_profile_insert_own" on public.phone_profiles;
create policy "phone_profile_insert_own" on public.phone_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "phone_profile_update_own" on public.phone_profiles;
create policy "phone_profile_update_own" on public.phone_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Keep the profile row synchronized with Auth user metadata after signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, username)
  values (new.id, new.raw_user_meta_data ->> 'full_name', nullif(new.raw_user_meta_data ->> 'username',''))
  on conflict (id) do update set full_name = excluded.full_name, username = coalesce(excluded.username, public.profiles.username), updated_at = now();
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute procedure public.handle_new_user();

-- Enable Realtime broadcasts for cross-device updates.
do $$ begin
  alter publication supabase_realtime add table public.phone_profiles;
exception when duplicate_object then null;
when undefined_object then null;
end $$;

-- Private file storage. Object paths must begin with the authenticated user's UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-files', 'user-files', false, 15728640, array['image/jpeg','image/png','image/webp','image/gif','application/pdf','text/plain','audio/mpeg','audio/wav','audio/mp4','application/zip','application/octet-stream'])
on conflict (id) do update set public = false, file_size_limit = 15728640;

drop policy if exists "user_files_select_own" on storage.objects;
create policy "user_files_select_own" on storage.objects for select to authenticated using (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "user_files_insert_own" on storage.objects;
create policy "user_files_insert_own" on storage.objects for insert to authenticated with check (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "user_files_update_own" on storage.objects;
create policy "user_files_update_own" on storage.objects for update to authenticated using (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "user_files_delete_own" on storage.objects;
create policy "user_files_delete_own" on storage.objects for delete to authenticated using (bucket_id = 'user-files' and (storage.foldername(name))[1] = auth.uid()::text);
