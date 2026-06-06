-- HomeLog Database Schema
-- Run this in Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Properties table
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  address text not null,
  city text not null,
  size_m2 integer,
  build_year integer,
  home_score integer default 700,
  energy_score integer default 60,
  created_at timestamptz default now()
);

-- Maintenance records
create table public.maintenance_records (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  title text not null,
  date date not null,
  cost numeric,
  category text not null default 'maintenance',
  notes text,
  photo_url text,
  source text not null default 'manual', -- manual | scan | email | bank
  created_at timestamptz default now()
);

-- Devices
create table public.devices (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  name text not null,
  brand text,
  installed_year text,
  warranty_until text,
  status text not null default 'good', -- good | warn | fault
  icon text default '🔧',
  created_at timestamptz default now()
);

-- Documents
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  name text not null,
  type text not null,
  date text,
  file_url text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.properties enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.devices enable row level security;
alter table public.documents enable row level security;

-- Policies: users can only see their own data
create policy "Users can manage own properties"
  on public.properties for all
  using (auth.uid() = user_id);

create policy "Users can manage maintenance via property"
  on public.maintenance_records for all
  using (
    exists (
      select 1 from public.properties
      where id = property_id and user_id = auth.uid()
    )
  );

create policy "Users can manage devices via property"
  on public.devices for all
  using (
    exists (
      select 1 from public.properties
      where id = property_id and user_id = auth.uid()
    )
  );

create policy "Users can manage documents via property"
  on public.documents for all
  using (
    exists (
      select 1 from public.properties
      where id = property_id and user_id = auth.uid()
    )
  );

-- Storage bucket for document photos
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false);

create policy "Users can upload own documents"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own documents"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
