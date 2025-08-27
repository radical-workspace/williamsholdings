"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { sbClient } from '@/lib/supabase/client';

export default function SignUpClient(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(false);
  const r=useRouter(); const sp=useSearchParams(); const from=sp.get('redirectedFrom')||'/dashboard';
  async function submit(e:React.FormEvent){e.preventDefault(); setError(null); setLoading(true);
    const sb=sbClient();
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
        // If profile already exists, ignore the duplicate error
        if (profileError && !/duplicate|already exists/i.test(profileError.message || '')) {
          console.error('Failed to create profile:', profileError);
        }

        // Create a default account for the user so admin dashboard shows balances
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

    r.push(`/auth/pin-setup?redirectedFrom=${encodeURIComponent(from)}`);
  }
  return (<div className="min-h-screen flex items-center justify-center p-4"><div className="w-full max-w-sm space-y-4 card">
    <div className="text-center space-y-1"><Image src="/logo.svg" alt="WilliamsHoldings logo" width={40} height={40} className="mx-auto"/><h1 className="text-xl font-semibold">Create account</h1></div>
    <form onSubmit={submit} className="space-y-3">
      <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
      <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/>
      {error&&<div className="text-red-600 text-sm">{error}</div>}
      <button className="btn btn-primary w-full" disabled={loading}>{loading?'Creating…':'Sign up'}</button>
    </form>
    <div className="text-sm text-slate-600 text-center">Already have an account? <a className="underline" href={`/auth/sign-in?redirectedFrom=${encodeURIComponent(from)}`}>Sign in</a></div>
  </div></div>);
}
