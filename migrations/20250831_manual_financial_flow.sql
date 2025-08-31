-- Idempotent migration: manual deposits/withdrawals, ledger, RLS, triggers
DO $$
BEGIN
  -- Create ledger_entries table (immutable audit ledger)
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ledger_entries') THEN
    CREATE TABLE public.ledger_entries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      type text NOT NULL CHECK (type IN ('credit','debit')),
      amount numeric NOT NULL CHECK (amount >= 0),
      currency text NOT NULL DEFAULT 'USD',
      reference text,
      metadata jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    COMMENT ON TABLE public.ledger_entries IS 'Immutable audit ledger entries for all balance changes';
  END IF;

  -- Prevent updates or deletes from ledger_entries (immutable)
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'ledger_entries_protect') THEN
    CREATE OR REPLACE FUNCTION public.ledger_entries_protect()
      RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      RAISE EXCEPTION 'ledger_entries is immutable';
      RETURN NULL;
    END; $fn$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ledger_entries_no_update_delete') THEN
    CREATE TRIGGER ledger_entries_no_update_delete
      BEFORE UPDATE OR DELETE ON public.ledger_entries
      FOR EACH ROW EXECUTE FUNCTION public.ledger_entries_protect();
  END IF;

  -- Bank receiving details (for USD bank transfers)
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bank_receiving_details') THEN
    CREATE TABLE public.bank_receiving_details (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      account_name text NOT NULL,
      account_number text NOT NULL,
      routing_number text,
      swift_code text,
      bank_name text,
      bank_address text,
      instructions text,
      currency text NOT NULL DEFAULT 'USD',
      created_at timestamptz NOT NULL DEFAULT now()
    );
    -- Insert a default WilliamsHoldings receiving details placeholder if table empty
    INSERT INTO public.bank_receiving_details (name, account_name, account_number, routing_number, bank_name, instructions, currency)
    SELECT 'WilliamsHoldings Banking', 'WilliamsHoldings US Account', '000123456789', '026009593', 'Example Bank', 'Please include your customer id in the transfer reference', 'USD'
    WHERE NOT EXISTS (SELECT 1 FROM public.bank_receiving_details);
  END IF;

  -- Ensure deposit_requests + withdraw_requests exist (these migrations are conservative)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deposit_requests') THEN
    -- enable RLS and policies for deposit_requests
    EXECUTE 'ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY';
    -- allow authenticated users to insert their own deposit request
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'deposit_requests_insert_owner') THEN
      CREATE POLICY deposit_requests_insert_owner ON public.deposit_requests FOR INSERT
        WITH CHECK (auth.role() = 'authenticated' AND (user_id::text = auth.uid()::text));
    END IF;
    -- allow users to select their own deposit rows
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'deposit_requests_select_owner') THEN
      CREATE POLICY deposit_requests_select_owner ON public.deposit_requests FOR SELECT
        USING (user_id::text = auth.uid()::text);
    END IF;
    -- disallow updates/deletes by users (only admins via service_role should change status)
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'deposit_requests_no_mod_update') THEN
      CREATE POLICY deposit_requests_no_mod_update ON public.deposit_requests FOR UPDATE
        USING (false);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'deposit_requests_no_mod_delete') THEN
      CREATE POLICY deposit_requests_no_mod_delete ON public.deposit_requests FOR DELETE
        USING (false);
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'withdraw_requests') THEN
    EXECUTE 'ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'withdraw_requests_insert_owner') THEN
      CREATE POLICY withdraw_requests_insert_owner ON public.withdraw_requests FOR INSERT
        WITH CHECK (auth.role() = 'authenticated' AND (user_id::text = auth.uid()::text));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'withdraw_requests_select_owner') THEN
      CREATE POLICY withdraw_requests_select_owner ON public.withdraw_requests FOR SELECT
        USING (user_id::text = auth.uid()::text);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'withdraw_requests_no_mod_update') THEN
      CREATE POLICY withdraw_requests_no_mod_update ON public.withdraw_requests FOR UPDATE
        USING (false);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'withdraw_requests_no_mod_delete') THEN
      CREATE POLICY withdraw_requests_no_mod_delete ON public.withdraw_requests FOR DELETE
        USING (false);
    END IF;
  END IF;

  -- Trigger functions to process approvals server-side via DB trigger when status flips to approved
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'process_deposit_approval') THEN
    CREATE OR REPLACE FUNCTION public.process_deposit_approval()
      RETURNS trigger LANGUAGE plpgsql AS $fn$
    DECLARE
      acct_row record;
      new_balance numeric;
    BEGIN
      -- only act when status changed to 'approved'
      IF (TG_OP = 'UPDATE' AND NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status)) THEN
        SELECT id, available_balance INTO acct_row FROM public.accounts WHERE user_id = NEW.user_id LIMIT 1;
        IF acct_row IS NULL THEN
          -- create a new account row if missing
          INSERT INTO public.accounts (user_id, available_balance) VALUES (NEW.user_id, 0) RETURNING id, available_balance INTO acct_row;
        END IF;
        new_balance := COALESCE(acct_row.available_balance,0) + COALESCE(NEW.amount::numeric,0);
        UPDATE public.accounts SET available_balance = new_balance WHERE id = acct_row.id;
        -- insert immutable ledger entry
        INSERT INTO public.ledger_entries (user_id, type, amount, currency, reference, metadata)
          VALUES (NEW.user_id, 'credit', NEW.amount::numeric, COALESCE(NEW.currency,'USD'), COALESCE(NEW.reference, NEW.id::text), jsonb_build_object('source','manual_deposit'));
        -- also mirror to transactions table if it exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='transactions') THEN
          INSERT INTO public.transactions (user_id, type, amount, currency, status, description)
            VALUES (NEW.user_id, 'credit', NEW.amount::numeric, COALESCE(NEW.currency,'USD'), 'completed', concat('Deposit approved (', COALESCE(NEW.reference, NEW.id::text), ')'));
        END IF;
      END IF;
      RETURN NEW;
    END; $fn$;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'process_withdraw_approval') THEN
    CREATE OR REPLACE FUNCTION public.process_withdraw_approval()
      RETURNS trigger LANGUAGE plpgsql AS $fn$
    DECLARE
      acct_row record;
      new_balance numeric;
      amount_num numeric := COALESCE(NEW.amount::numeric,0);
    BEGIN
      IF (TG_OP = 'UPDATE' AND NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM NEW.status)) THEN
        SELECT id, available_balance INTO acct_row FROM public.accounts WHERE user_id = NEW.user_id LIMIT 1;
        IF acct_row IS NULL THEN
          RAISE EXCEPTION 'account_not_found';
        END IF;
        IF COALESCE(acct_row.available_balance,0) < amount_num THEN
          RAISE EXCEPTION 'insufficient_balance';
        END IF;
        new_balance := COALESCE(acct_row.available_balance,0) - amount_num;
        UPDATE public.accounts SET available_balance = new_balance WHERE id = acct_row.id;
        INSERT INTO public.ledger_entries (user_id, type, amount, currency, reference, metadata)
          VALUES (NEW.user_id, 'debit', amount_num, COALESCE(NEW.currency,'USD'), COALESCE(NEW.reference, NEW.id::text), jsonb_build_object('source','manual_withdrawal'));
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='transactions') THEN
          INSERT INTO public.transactions (user_id, type, amount, currency, status, description)
            VALUES (NEW.user_id, 'debit', amount_num, COALESCE(NEW.currency,'USD'), 'completed', concat('Withdrawal processed (', NEW.id::text, ')'));
        END IF;
      END IF;
      RETURN NEW;
    END; $fn$;
  END IF;

  -- Attach triggers to deposit_requests and withdraw_requests
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='deposit_requests') AND
     NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'deposit_requests_after_update_approval') THEN
    CREATE TRIGGER deposit_requests_after_update_approval
      AFTER UPDATE ON public.deposit_requests
      FOR EACH ROW EXECUTE FUNCTION public.process_deposit_approval();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='withdraw_requests') AND
     NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'withdraw_requests_after_update_approval') THEN
    CREATE TRIGGER withdraw_requests_after_update_approval
      AFTER UPDATE ON public.withdraw_requests
      FOR EACH ROW EXECUTE FUNCTION public.process_withdraw_approval();
  END IF;

END$$;

-- End migration
