-- Idempotent migration: add `address` column to withdraw_requests to store manual payout addresses
-- Safe to paste into Supabase SQL editor; will no-op if column already exists

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'withdraw_requests' AND column_name = 'address'
  ) THEN
    ALTER TABLE public.withdraw_requests ADD COLUMN address text;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'migration 20250828_add_address_to_withdraw_requests: encountered: %', SQLERRM;
END$$;
