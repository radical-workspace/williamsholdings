-- Idempotent migration: add reference, proof, and payment_info to deposit_requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deposit_requests' AND column_name='reference') THEN
    ALTER TABLE deposit_requests ADD COLUMN reference text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deposit_requests' AND column_name='proof') THEN
    ALTER TABLE deposit_requests ADD COLUMN proof text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deposit_requests' AND column_name='payment_info') THEN
    ALTER TABLE deposit_requests ADD COLUMN payment_info jsonb;
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- Table doesn't exist yet, skip. This migration will be applied after table creation.
  RAISE NOTICE 'deposit_requests table not found; skipping deposit fields migration';
END$$;
