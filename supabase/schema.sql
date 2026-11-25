-- ============================================================
-- IEA PORTAL v2 - SUPABASE SCHEMA
-- Upgrade dari xzam730.github.io/PORTAL-IEA
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. PROFILES (terhubung ke auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null check (char_length(full_name) between 3 and 20),
  birth_date date not null,
  whatsapp text,
  tiktok_url text,
  tiktok_username text,
  follower_count integer default 0,
  astronomy_knowledge text,
  join_reason text,
  screenshot_path text, -- path di Supabase Storage
  rank text default 'Novice Researcher',
  contribution_hours integer default 0,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. COMMUNITIES (2 komunitas tetap)
-- ============================================================
create table public.communities (
  id serial primary key,
  name text not null,
  slug text unique not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into public.communities (name, slug, description) values
('Komunitas 1', 'komunitas-1', 'Pendaftaran utama anggota baru IEA'),
('Komunitas 2', 'komunitas-2', 'Kolaborasi lanjutan & proyek bersama');

-- ============================================================
-- 3. GROUPS (IEA / IEA 2 / IEA 3 per komunitas)
-- ============================================================
create table public.groups (
  id serial primary key,
  community_id integer references public.communities(id) on delete cascade,
  name text not null,               -- 'IEA', 'IEA 2', 'IEA 3'
  slug text not null,               -- 'iea', 'iea-2', 'iea-3'
  min_followers integer not null,   -- 2000, 1000, 50
  description text,
  whatsapp_link text,               -- diatur admin
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  unique(community_id, slug)
);

insert into public.groups (community_id, name, slug, min_followers, description, sort_order) values
-- Komunitas 1
(1, 'IEA',   'iea',   2000, 'Grup tertinggi (2000+ followers)', 1),
(1, 'IEA 2', 'iea-2', 1000, 'Grup menengah (1000+ followers)', 2),
(1, 'IEA 3', 'iea-3', 50,   'Grup dasar (50+ followers)', 3),
-- Komunitas 2
(2, 'IEA',   'iea',   2000, 'Grup tertinggi (2000+ followers)', 1),
(2, 'IEA 2', 'iea-2', 1000, 'Grup menengah (1000+ followers)', 2),
(2, 'IEA 3', 'iea-3', 50,   'Grup dasar (50+ followers)', 3);

-- ============================================================
-- 4. MEMBERSHIPS (hasil pendaftaran)
-- ============================================================
create table public.memberships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  community_id integer references public.communities(id),
  group_id integer references public.groups(id),
  status text default 'approved' check (status in ('pending','approved','rejected')),
  follower_count_at_join integer,
  member_card_code text unique,     -- kode unik member card
  notes text,
  created_at timestamptz default now(),
  unique(user_id, community_id)
);

-- ============================================================
-- 5. REGISTRATION SETTINGS (gerbang buka/tutup + setting global)
-- ============================================================
create table public.registration_settings (
  id integer primary key default 1 check (id = 1), -- hanya 1 baris
  is_open boolean default true,                     -- gerbang pendaftaran
  updated_at timestamptz default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.registration_settings (id, is_open) values (1, true);

-- ============================================================
-- 6. HYPOTHESES / JURNAL (feed style lama)
-- ============================================================
create table public.hypotheses (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  category text default 'umum',
  image_url text,
  likes_count integer default 0,
  debates_count integer default 0,
  arguments_count integer default 0,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.hypothesis_likes (
  id uuid default uuid_generate_v4() primary key,
  hypothesis_id uuid references public.hypotheses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(hypothesis_id, user_id)
);

create table public.hypothesis_debates (
  id uuid default uuid_generate_v4() primary key,
  hypothesis_id uuid references public.hypotheses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  is_counter boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- 7. ADMIN AUDIT (opsional tapi bagus untuk keamanan)
-- ============================================================
create table public.admin_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.profiles(id),
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_memberships_user on public.memberships(user_id);
create index idx_memberships_group on public.memberships(group_id);
create index idx_hypotheses_created on public.hypotheses(created_at desc);
create index idx_profiles_tiktok on public.profiles(tiktok_username);

-- ============================================================
-- STORAGE BUCKET (jalankan di Supabase Dashboard atau via SQL)
-- ============================================================
-- Buat bucket "screenshots" (public = false)
-- Policy: user hanya bisa upload file miliknya sendiri

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.hypotheses enable row level security;
alter table public.hypothesis_likes enable row level security;
alter table public.hypothesis_debates enable row level security;
alter table public.groups enable row level security;
alter table public.communities enable row level security;
alter table public.registration_settings enable row level security;
alter table public.admin_logs enable row level security;

-- Profiles
create policy "Public profiles readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Memberships
create policy "Users see own memberships" on public.memberships for select using (auth.uid() = user_id);
create policy "Users create own membership" on public.memberships for insert with check (auth.uid() = user_id);
create policy "Admins see all memberships" on public.memberships for select using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Hypotheses
create policy "Published hypotheses readable" on public.hypotheses for select using (is_published = true);
create policy "Auth users create hypotheses" on public.hypotheses for insert with check (auth.uid() = author_id);
create policy "Authors update own" on public.hypotheses for update using (auth.uid() = author_id);

-- Groups & Communities (public read)
create policy "Anyone read communities" on public.communities for select using (true);
create policy "Anyone read groups" on public.groups for select using (true);

-- Registration settings (public bisa baca status gerbang)
create policy "Anyone read registration settings" on public.registration_settings for select using (true);
create policy "Only admin update registration settings" on public.registration_settings for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Admin only: update groups (link whatsapp)
create policy "Admin update groups" on public.groups for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Likes & Debates
create policy "Anyone read likes" on public.hypothesis_likes for select using (true);
create policy "Auth like" on public.hypothesis_likes for insert with check (auth.uid() = user_id);
create policy "Anyone read debates" on public.hypothesis_debates for select using (true);
create policy "Auth debate" on public.hypothesis_debates for insert with check (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: generate member card code
-- ============================================================
create or replace function public.generate_member_card_code()
returns text as $$
begin
  return 'IEA-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
end;
$$ language plpgsql;

-- Trigger: auto set member_card_code
create or replace function public.set_member_card_code()
returns trigger as $$
begin
  if new.member_card_code is null then
    new.member_card_code := public.generate_member_card_code();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_member_card
  before insert on public.memberships
  for each row execute function public.set_member_card_code();

-- ============================================================
-- 8. ADMIN CREDENTIALS (Username + Password)
-- Password disimpan dalam bentuk hash (bcrypt via pgcrypto atau extension)
-- ============================================================
create table public.admin_credentials (
  id integer primary key default 1 check (id = 1),
  username text not null unique,
  password_hash text not null,
  updated_at timestamptz default now()
);

-- Default admin (username: admin / password: iea2026admin)
-- Hash ini contoh, nanti diganti dengan hash asli saat setup
-- Gunakan: crypt('iea2026admin', gen_salt('bf'))
insert into public.admin_credentials (id, username, password_hash)
values (1, 'admin', crypt('iea2026admin', gen_salt('bf')))
on conflict (id) do nothing;

-- Function untuk verifikasi password admin
create or replace function public.verify_admin_login(p_username text, p_password text)
returns boolean as $$
declare
  stored_hash text;
begin
  select password_hash into stored_hash
  from public.admin_credentials
  where username = p_username;

  if stored_hash is null then
    return false;
  end if;

  return stored_hash = crypt(p_password, stored_hash);
end;
$$ language plpgsql security definer;

-- Function untuk ganti password admin
create or replace function public.change_admin_password(p_username text, p_old_password text, p_new_password text)
returns boolean as $$
declare
  valid boolean;
begin
  valid := public.verify_admin_login(p_username, p_old_password);
  if not valid then
    return false;
  end if;

  update public.admin_credentials
  set password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  where username = p_username;

  return true;
end;
$$ language plpgsql security definer;

-- RLS admin_credentials (hanya lewat function)
alter table public.admin_credentials enable row level security;
-- Tidak ada policy select/update langsung dari client
