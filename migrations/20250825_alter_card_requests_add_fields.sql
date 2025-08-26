-- Migration: add card_type and purchase_amount to card_requests
-- Run in Supabase DB

alter table if exists public.card_requests
  add column if not exists card_type text,
  add column if not exists purchase_amount numeric;

create index if not exists idx_card_requests_card_type on public.card_requests(card_type);
