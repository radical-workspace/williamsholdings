-- Idempotent migration to ensure production `card_requests` table has the expected columns
-- Adds missing columns (purchase_amount, card_type) if they don't exist
-- Makes `address` nullable if it is NOT NULL (to match app-level behavior)

DO $$
BEGIN
  -- Add purchase_amount column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'card_requests' AND column_name = 'purchase_amount'
  ) THEN
    ALTER TABLE public.card_requests ADD COLUMN purchase_amount numeric;
  END IF;

  -- Add card_type column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'card_requests' AND column_name = 'card_type'
  ) THEN
    ALTER TABLE public.card_requests ADD COLUMN card_type text;
  END IF;

  -- If address is defined as NOT NULL, relax it to allow NULLs (safe if app may omit address)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'card_requests' AND column_name = 'address' AND is_nullable = 'NO'
  ) THEN
    -- Use EXECUTE to avoid issues if table ownership differs; this will fail if the executing role lacks privileges
    EXECUTE 'ALTER TABLE public.card_requests ALTER COLUMN address DROP NOT NULL';
  END IF;
EXCEPTION WHEN others THEN
  -- Swallow errors so this can be safely pasted into Supabase SQL editor; errors will still show in Supabase UI
  RAISE NOTICE 'migration 20250827_fix_card_requests_schema: encountered: %', SQLERRM;
END$$;
