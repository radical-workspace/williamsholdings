-- Database setup for WilliamsHoldings Banking App

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    pin_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_number TEXT UNIQUE NOT NULL,
    available_balance DECIMAL(15,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    account_type TEXT DEFAULT 'checking',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create transactions table  
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    transaction_type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'transfer'
    description TEXT,
    reference_id TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own account" ON public.accounts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, first_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'));
    
    INSERT INTO public.accounts (user_id, account_number)
    VALUES (NEW.id, 'ACC' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0'));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for testing (optional)
-- You can run these manually if you want test data