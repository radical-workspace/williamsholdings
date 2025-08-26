"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { sbClient } from '@/lib/supabase/client';

export default function SignUpClient(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const from = sp.get('redirectedFrom') || '/dashboard';

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setError(null);
    setLoading(true);
    try{
      const sb = sbClient();
      const { data, error } = await sb.auth.signUp({ email, password });
      setLoading(false);
      if (error) { setError(error.message); return; }

      const user = data?.user;
      if (user) {
        // Ensure the profiles row exists so admin dashboard can list this user
        try {
          const profileRow = {
            id: user.id,
            user_id: user.id,
            email,
            first_name: null,
            last_name: null,
            role: 'user',
            created_at: new Date().toISOString()
          };

          const { error: profileError } = await sb.from('profiles').insert(profileRow).select();
          if (profileError && !/duplicate|already exists/i.test(profileError.message || '')) {
            console.error('Failed to create profile:', profileError);
          }

          // Create default account
          try {
            const accountNumber = 'WH' + Math.random().toString().slice(2, 10);
            const { error: accountError } = await sb.from('accounts').insert({
              user_id: user.id,
              account_number: accountNumber,
              available_balance: 0,
              currency: 'USD',
              status: 'active'
            });
            if (accountError && !/duplicate|already exists/i.test(accountError.message || '')) {
              console.error('Failed to create default account:', accountError);
            }
          } catch (accErr) {
            console.error('Account creation error:', accErr);
          }
        } catch (err) {
          console.error('Profile creation error:', err);
        }
      }

      router.push(`/auth/pin-setup?redirectedFrom=${encodeURIComponent(from)}`);
    }catch(err:any){
      setLoading(false);
      setError(err?.message || 'Sign up failed');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Image src="/logo.svg" alt="WilliamsHoldings logo" width={48} height={48} className="mx-auto" />
          <h1 className="text-2xl font-bold text-white mt-3">Create account</h1>
          <p className="text-blue-200">WilliamsHoldings</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Password"
                required
              />
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href={`/auth/sign-in?redirectedFrom=${encodeURIComponent(from)}`} className="text-blue-300 hover:text-blue-200 text-sm">
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
