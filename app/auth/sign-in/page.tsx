'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sbClient } from '@/lib/supabase/client';
export const dynamic = 'force-dynamic'
export default function SignIn(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(false);
  const r=useRouter(); const sp=useSearchParams(); const from=sp.get('redirectedFrom')||'/dashboard';
  async function submit(e:React.FormEvent){e.preventDefault(); setError(null); setLoading(true);
    const sb=sbClient(); const {error}=await sb.auth.signInWithPassword({email,password}); setLoading(false);
    if(error){setError(error.message);return;} r.push(`/auth/pin?redirectedFrom=${encodeURIComponent(from)}`); }
  return (<div className="min-h-screen flex items-center justify-center p-4"><div className="w-full max-w-sm space-y-4 card">
    <div className="text-center space-y-1"><img src="/logo.svg" className="mx-auto h-10" alt="WilliamsHoldings logo"/><h1 className="text-xl font-semibold">Sign in</h1></div>
    <form onSubmit={submit} className="space-y-3">
      <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
      <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/>
      {error&&<div className="text-red-600 text-sm">{error}</div>}
      <button className="btn btn-primary w-full" disabled={loading}>{loading?'Signing in…':'Sign in'}</button>
    </form>
    <div className="text-sm text-slate-600 text-center">No account? <a className="underline" href={`/auth/sign-up?redirectedFrom=${encodeURIComponent(from)}`}>Create one</a></div>
  </div></div>);
}
