-- Migration: create payout_methods table
-- Run this in your Supabase DB

create table if not exists public.payout_methods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  method_code text not null,
  label text,
  address text,
  bank_name text,
  account_name text,
  network text,
  created_at timestamptz default now()
);

create index if not exists idx_payout_methods_user_id on public.payout_methods (user_id);
