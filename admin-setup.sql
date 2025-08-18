/* 
   WilliamsHoldings Banking System - Database Setup with Admin Support
   Copy and paste this into Supabase SQL Editor
*/

-- Add role column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create index on role for better performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Enhanced Transactions Table with Better Indexing
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Multi-column indexes for better query performance
CREATE INDEX IF NOT EXISTS transactions_user_status_idx 
    ON public.transactions(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON public.transactions(status);

-- Create pin_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pin_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    pin_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- More efficient trigger function
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers with minimal overhead
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER transactions_update_timestamp
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW 
    WHEN (OLD.* IS DISTINCT FROM NEW.*) 
    EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS update_pin_codes_updated_at ON public.pin_codes;
CREATE TRIGGER pin_codes_update_timestamp
    BEFORE UPDATE ON public.pin_codes
    FOR EACH ROW 
    WHEN (OLD.* IS DISTINCT FROM NEW.*) 
    EXECUTE FUNCTION public.update_timestamp();

-- For testing/development: Configure RLS properly
-- Enable RLS for production security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY "Users can view own transactions" 
    ON public.transactions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions" 
    ON public.transactions FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- For development: Temporarily disable RLS on profiles and accounts
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;

-- Insert sample admin user (replace with your actual email)
-- Password: admin123 (change this in production!)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    gen_random_uuid(),
    'admin@williamsholdings.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create corresponding profile for admin user
INSERT INTO public.profiles (
    id,
    user_id,
    email,
    first_name,
    last_name,
    role
) 
SELECT 
    u.id,
    u.id,
    u.email,
    'System',
    'Administrator',
    'admin'
FROM auth.users u 
WHERE u.email = 'admin@williamsholdings.com'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- Sample data for testing
INSERT INTO public.transactions (user_id, type, amount, currency, status, description)
SELECT 
    p.user_id,
    'credit',
    1000.00,
    'USD',
    'completed',
    'Initial deposit'
FROM public.profiles p
WHERE p.role = 'user'
AND NOT EXISTS (
    SELECT 1 FROM public.transactions t WHERE t.user_id = p.user_id
)
LIMIT 5;

INSERT INTO public.transactions (user_id, type, amount, currency, status, description)
SELECT 
    p.user_id,
    'debit',
    50.00,
    'USD',
    'completed',
    'Account maintenance fee'
FROM public.profiles p
WHERE p.role = 'user'
AND EXISTS (
    SELECT 1 FROM public.transactions t WHERE t.user_id = p.user_id AND t.type = 'credit'
)
LIMIT 3;

-- Update account balances based on transactions
UPDATE public.accounts 
SET available_balance = (
    SELECT COALESCE(
        SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END), 
        0
    )
    FROM public.transactions t 
    WHERE t.user_id = accounts.user_id 
    AND t.status = 'completed'
)
WHERE EXISTS (
    SELECT 1 FROM public.transactions t WHERE t.user_id = accounts.user_id
);

-- Performance-optimized views for admin dashboard
CREATE OR REPLACE VIEW public.user_transaction_summary AS
WITH transaction_aggregates AS (
    SELECT 
        user_id,
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debits,
        MAX(created_at) as last_transaction_date
    FROM public.transactions
    WHERE status = 'completed'
    GROUP BY user_id
)
SELECT 
    u.id as user_id,
    u.email,
    COALESCE(ta.total_transactions, 0) as transaction_count,
    COALESCE(ta.total_credits, 0.00) as total_credits,
    COALESCE(ta.total_debits, 0.00) as total_debits,
    (COALESCE(ta.total_credits, 0) - COALESCE(ta.total_debits, 0)) as net_balance,
    ta.last_transaction_date
FROM auth.users u
LEFT JOIN transaction_aggregates ta ON u.id = ta.user_id;

CREATE OR REPLACE VIEW admin_user_summary AS
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at,
    COUNT(a.id) as account_count,
    COALESCE(SUM(a.available_balance), 0) as total_balance,
    COUNT(t.id) as transaction_count
FROM public.profiles p
LEFT JOIN public.accounts a ON p.user_id = a.user_id
LEFT JOIN public.transactions t ON p.user_id = t.user_id
GROUP BY p.id, p.email, p.first_name, p.last_name, p.role, p.created_at;

CREATE OR REPLACE VIEW admin_transaction_summary AS
SELECT 
    t.*,
    p.first_name,
    p.last_name,
    p.email,
    a.account_number
FROM public.transactions t
JOIN public.profiles p ON t.user_id = p.user_id
LEFT JOIN public.accounts a ON t.user_id = a.user_id;

-- Permissions (minimal privilege principle)
REVOKE ALL ON public.transactions FROM public;
GRANT SELECT, INSERT ON public.transactions TO authenticated;
GRANT UPDATE ON public.transactions TO authenticated; -- Allow status updates for admin
GRANT SELECT ON public.user_transaction_summary TO authenticated;
GRANT ALL ON public.pin_codes TO authenticated;
GRANT ALL ON admin_user_summary TO authenticated;
GRANT ALL ON admin_transaction_summary TO authenticated;

-- Success message
SELECT 'Database setup completed successfully! Admin user created with email: admin@williamsholdings.com and password: admin123' as message;
