"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { sbClient } from '@/lib/supabase/client';

export default function SignInClient(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(false);
  const r=useRouter(); const sp=useSearchParams(); const from=sp.get('redirectedFrom')||'/dashboard';
  async function submit(e:React.FormEvent){e.preventDefault(); setError(null); setLoading(true);
    const sb=sbClient(); const {error}=await sb.auth.signInWithPassword({email,password}); setLoading(false);
    if(error){setError(error.message);return;} r.push(`/auth/pin?redirectedFrom=${encodeURIComponent(from)}`);
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Image src="/favicon-wh.svg" alt="WH logo" width={56} height={56} className="mx-auto"/>
          <h1 className="mt-4 text-2xl font-extrabold">WilliamHoldings</h1>
          <p className="text-sm text-slate-500">Secure, premium banking with WH</p>
        </div>
        <div className="card p-6 shadow-lg">
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input className="input mt-1" placeholder="you@domain.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input className="input mt-1" type="password" placeholder="Your password" value={password} onChange={e=>setPassword(e.target.value)} required/>
            </label>
            {error&&<div className="text-red-600 text-sm">{error}</div>}
            <button className="btn btn-primary w-full py-3 text-white font-semibold bg-amber-500 hover:bg-amber-600" disabled={loading}>{loading?'Signing in…':'Sign in'}</button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-600">No account? <a className="underline" href={`/auth/sign-up?redirectedFrom=${encodeURIComponent(from)}`}>Create one</a></div>
        </div>
      </div>
    </div>
  );
}
