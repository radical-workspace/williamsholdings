"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
export default function PinClient(){
  const [pin,setPin]=useState(''); const [error,setError]=useState<string|null>(null);
  const [loading,setLoading]=useState(false); const r=useRouter(); const sp=useSearchParams(); const from=sp.get('redirectedFrom')||'/dashboard';
  async function submit(e:React.FormEvent){e.preventDefault(); setError(null); setLoading(true);
    const res=await fetch('/api/pin/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin})}); const data=await res.json(); setLoading(false);
    if(!res.ok){ if(data?.error==='PIN not set'){ r.push(`/auth/pin-setup?redirectedFrom=${encodeURIComponent(from)}`); return; } setError(data.error||'Wrong PIN'); return; }
    r.push(from); }
  return (<div className="min-h-screen flex items-center justify-center p-4"><div className="w-full max-w-sm space-y-4 card">
    <h1 className="text-xl font-semibold text-center">Enter PIN</h1>
    <form onSubmit={submit} className="space-y-3">
      <input className="input" inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} placeholder="6-digit PIN" required/>
      {error&&<div className="text-red-600 text-sm">{error}</div>}
      <button className="btn btn-primary w-full" disabled={loading}>{loading?'Checking…':'Verify PIN'}</button>
      <div className="text-sm text-slate-600 text-center">No PIN yet? <a className="underline" href={`/auth/pin-setup?redirectedFrom=${encodeURIComponent(from)}`}>Set it</a></div>
  </form></div></div>);
}
