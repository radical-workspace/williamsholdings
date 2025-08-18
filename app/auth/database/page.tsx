'use client';
import { useState } from 'react';
import { sbClient } from '@/lib/supabase/client';

export default function DatabaseSetup() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function checkTables() {
    setLoading(true);
    setStatus('Checking database tables...');
    
    try {
      const sb = sbClient();
      
      // Test profiles table
      const { data: profiles, error: profileError } = await sb
        .from('profiles')
        .select('count', { count: 'exact' })
        .limit(1);
      
      if (profileError) {
        setStatus(`❌ Profiles table error: ${profileError.message}`);
        setLoading(false);
        return;
      }
      
      // Test accounts table  
      const { data: accounts, error: accountError } = await sb
        .from('accounts')
        .select('count', { count: 'exact' })
        .limit(1);
        
      if (accountError) {
        setStatus(`❌ Accounts table error: ${accountError.message}`);
        setLoading(false);
        return;
      }
      
      setStatus('✅ Database tables exist and are accessible!');
      
    } catch (error) {
      setStatus(`❌ Database connection error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  async function createTables() {
    setLoading(true);
    setStatus('Creating database tables...');
    
    try {
      const sb = sbClient();
      
      // Note: This won't work from client-side due to RLS
      // But we can provide the SQL for manual execution
      setStatus(`
❌ Tables must be created manually in Supabase dashboard.

Go to: https://supabase.com/dashboard
1. Open your project
2. Go to SQL Editor  
3. Run this SQL:

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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = user_id);
    
CREATE POLICY "Users can manage own account" ON public.accounts
    FOR ALL USING (auth.uid() = user_id);
      `);
      
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Database Setup</h1>
      
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold">Database Status</h2>
        
        <div className="space-y-2">
          <button 
            onClick={checkTables}
            disabled={loading}
            className="btn btn-primary"
          >
            Check Database Tables
          </button>
          
          <button 
            onClick={createTables}
            disabled={loading}
            className="btn btn-ghost"
          >
            Show Table Creation SQL
          </button>
        </div>
        
        {status && (
          <div className="bg-slate-100 p-3 rounded text-sm whitespace-pre-wrap">
            {status}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Quick Links</h3>
        <div className="space-y-1 text-sm">
          <a href="/auth/complete" className="block text-green-600 underline font-semibold">
            → Complete Auth Flow (Recommended)
          </a>
          <a href="/auth/debug" className="block text-blue-600 underline">
            → Debug Page
          </a>
          <a href="https://supabase.com/dashboard" target="_blank" className="block text-purple-600 underline">
            → Supabase Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
