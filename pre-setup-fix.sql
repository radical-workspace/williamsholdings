/* 
   PRE-SETUP: Fix existing database schema issues
   Run this FIRST, then run the main admin-setup.sql
*/

-- First, let's check and fix the profiles table structure
-- Add missing id column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- Make id the primary key if it isn't already
DO $$ 
BEGIN
    -- Try to add primary key constraint
    BEGIN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
    EXCEPTION 
        WHEN others THEN
            -- If constraint already exists or fails, try to update existing records
            UPDATE public.profiles SET id = gen_random_uuid() WHERE id IS NULL;
    END;
END $$;

-- Ensure user_id exists and is properly constrained
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT fk_profiles_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    EXCEPTION 
        WHEN others THEN
            -- Constraint might already exist
            NULL;
    END;
END $$;

-- Add other essential columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Fix any profiles that don't have user_id set
UPDATE public.profiles 
SET user_id = id 
WHERE user_id IS NULL AND id IS NOT NULL;

-- Success message
SELECT 'Pre-setup completed! Now run the main admin-setup.sql' as message;
