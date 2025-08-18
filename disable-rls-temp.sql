-- Temporary fix: Disable RLS for testing
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily for testing

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

-- Create permissive policy
CREATE POLICY "Enable all for authenticated users" ON public.profiles
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
