-- Migration: create withdraw_requests, deposit_requests, payout_methods and ensure outbound_emails
-- Run this in your Supabase DB

create table if not exists public.withdraw_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  currency text default 'USD',
  payout_method_id uuid,
  note text,
  status text default 'pending',
  admin_note text,
  processed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_withdraw_requests_user_id on public.withdraw_requests (user_id);

create table if not exists public.deposit_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  currency text default 'USD',
  source text,
  note text,
  status text default 'pending',
  admin_note text,
  processed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_deposit_requests_user_id on public.deposit_requests (user_id);

-- payout_methods migration retained in separate file if needed

create table if not exists public.outbound_emails (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  subject text,
  body text,
  status text default 'queued',
  created_at timestamptz default now()
);

create index if not exists idx_outbound_emails_user_id on public.outbound_emails (user_id);
