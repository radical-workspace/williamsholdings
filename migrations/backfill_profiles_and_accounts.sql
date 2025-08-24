-- Backfill profiles and default accounts for existing auth.users without profiles
-- Run in Supabase SQL editor (Project -> SQL)

-- 1) Create profiles for users missing one
INSERT INTO profiles (id, user_id, email, first_name, last_name, role, created_at)
SELECT u.id, u.id, u.email, NULL, NULL, 'user', now()
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- 2) Create a default account for users who have no accounts
INSERT INTO accounts (id, user_id, account_number, available_balance, currency, status, created_at)
SELECT gen_random_uuid(), u.id, 'WH' || substr(md5(u.id::text || now()::text), 1, 8), 0, 'USD', 'active', now()
FROM auth.users u
LEFT JOIN accounts a ON a.user_id = u.id
WHERE a.user_id IS NULL;

-- Notes:
-- - gen_random_uuid() requires the pgcrypto extension. If not available, use uuid_generate_v4() instead.
-- - Review the inserted rows and remove any you don't want.
-- - Run inside Supabase project SQL editor with an admin role (service role key not required for the editor).
