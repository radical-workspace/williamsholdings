-- Idempotent migration: ensure `status` column and CHECK constraints exist
-- Run this in Supabase SQL editor as postgres or project owner

DO $$
BEGIN
  -- accounts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.accounts ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'accounts_status_check'
  ) THEN
    ALTER TABLE public.accounts
      ADD CONSTRAINT accounts_status_check CHECK (status IN ('active','inactive','suspended'));
  END IF;

  -- transactions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_status_check'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT transactions_status_check CHECK (status IN ('pending','completed','failed'));
  END IF;

  -- additional common tables
  FOR tbl IN ARRAY['deposit_intents','user_investments','withdrawal_requests'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'status'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN status TEXT NOT NULL DEFAULT %L', tbl, 'pending');
    END IF;
  END LOOP;
END$$;

-- Quick sanity selects for verification
SELECT table_name, column_name FROM information_schema.columns
WHERE table_schema='public' AND column_name='status' ORDER BY table_name;
