-- ═══════════════════════════════════════════════════════
-- ReplugCV Database Schema
-- Run this in Supabase SQL Editor (https://swznduxagrqmskflltts.supabase.co)
-- ═══════════════════════════════════════════════════════

-- Profiles (extends Supabase Auth users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  plan_type text default 'free' check (plan_type in ('free', 'pro', 'admin')),
  resumes_downloaded int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Templates
create table templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  blocks_config jsonb not null default '[]',
  is_premium boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Resumes
create table resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null default 'Untitled Resume',
  template_id uuid references templates(id),
  parent_id uuid references resumes(id) on delete set null,
  is_base boolean default false,
  status text default 'draft' check (status in ('draft', 'completed')),
  job_title text,
  job_company text,
  job_description text,
  ats_score int,
  data jsonb not null default '{}',
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Resume Blocks (individual sections of a resume)
create table resume_blocks (
  id uuid default gen_random_uuid() primary key,
  resume_id uuid references resumes(id) on delete cascade not null,
  type text not null check (type in (
    'header', 'summary', 'experience', 'education',
    'skills', 'contact', 'projects', 'certifications',
    'languages', 'awards', 'publications', 'interests',
    'volunteer', 'custom'
  )),
  title text,
  sort_order int default 0,
  content jsonb not null default '{}',
  is_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Uploaded PDFs (for analysis)
create table uploads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  resume_id uuid references resumes(id) on delete set null,
  file_url text not null,
  file_name text,
  extracted_text text,
  analysis jsonb,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table resumes enable row level security;
alter table resume_blocks enable row level security;
alter table uploads enable row level security;
alter table templates enable row level security;

-- Profiles: users can read/update their own
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Resumes: users can CRUD their own
create policy "Users can read own resumes" on resumes for select using (auth.uid() = user_id);
create policy "Users can create resumes" on resumes for insert with check (auth.uid() = user_id);
create policy "Users can update own resumes" on resumes for update using (auth.uid() = user_id);
create policy "Users can delete own resumes" on resumes for delete using (auth.uid() = user_id);

-- Resume Blocks: users can CRUD blocks of their own resumes
create policy "Users can read own blocks" on resume_blocks for select
  using (exists (select 1 from resumes where resumes.id = resume_blocks.resume_id and resumes.user_id = auth.uid()));
create policy "Users can create blocks" on resume_blocks for insert
  with check (exists (select 1 from resumes where resumes.id = resume_blocks.resume_id and resumes.user_id = auth.uid()));
create policy "Users can update own blocks" on resume_blocks for update
  using (exists (select 1 from resumes where resumes.id = resume_blocks.resume_id and resumes.user_id = auth.uid()));
create policy "Users can delete own blocks" on resume_blocks for delete
  using (exists (select 1 from resumes where resumes.id = resume_blocks.resume_id and resumes.user_id = auth.uid()));

-- Uploads: users can CRUD their own
create policy "Users can read own uploads" on uploads for select using (auth.uid() = user_id);
create policy "Users can create uploads" on uploads for insert with check (auth.uid() = user_id);
create policy "Users can delete own uploads" on uploads for delete using (auth.uid() = user_id);

-- Templates: everyone can read
create policy "Anyone can read templates" on templates for select using (true);

-- ═══════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════

create index idx_resumes_user_id on resumes(user_id);
create index idx_resumes_parent_id on resumes(parent_id);
create index idx_resume_blocks_resume_id on resume_blocks(resume_id);
create index idx_uploads_user_id on uploads(user_id);
