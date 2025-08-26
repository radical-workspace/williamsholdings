-- Migration: create card_requests and outbound_emails tables
-- Run this in Supabase SQL editor or via psql using the service role

create table if not exists card_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text,
  card_type text,
  purchase_amount numeric,
  status text not null default 'pending', -- pending, approved, rejected
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists outbound_emails (
  id uuid default gen_random_uuid() primary key,
  to_email text not null,
  subject text not null,
  body text not null,
  metadata jsonb default '{}',
  sent boolean default false,
  created_at timestamptz default now()
);

-- Index for quicker admin queries
create index if not exists idx_card_requests_status on card_requests(status);
