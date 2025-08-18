-- PostgreSQL/Supabase RLS Policy Fix for WilliamsHoldings Banking App
-- Run this in Supabase SQL Editor (PostgreSQL syntax)

-- Step 1: Drop existing policies (if they exist)
DO $$ 
BEGIN
    -- Drop profiles policies
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view own account" ON public.accounts;
    DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can manage own account" ON public.accounts;
    DROP POLICY IF EXISTS "Enable all access for authenticated users on profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Enable all access for authenticated users on accounts" ON public.accounts;
EXCEPTION
    WHEN undefined_object THEN
        NULL; -- Ignore if policies don't exist
END $$;

-- Step 2: Create permissive policies for profiles
CREATE POLICY "profiles_authenticated_all" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Step 3: Create permissive policies for accounts
CREATE POLICY "accounts_authenticated_all" 
ON public.accounts 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Step 4: Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Step 5: Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.accounts TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Alternative: More secure user-specific policies (uncomment if needed)
/*
-- Drop the permissive policies first
DROP POLICY IF EXISTS "profiles_authenticated_all" ON public.profiles;
DROP POLICY IF EXISTS "accounts_authenticated_all" ON public.accounts;

-- Create user-specific policies
CREATE POLICY "profiles_user_specific" ON public.profiles
    FOR ALL 
    TO authenticated
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "accounts_user_specific" ON public.accounts
    FOR ALL 
    TO authenticated
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);
*/
