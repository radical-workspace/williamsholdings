"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
export default function PinSetupClient(){
  const [a,setA]=useState(''); const [b,setB]=useState(''); const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(false);
  const r=useRouter(); const sp=useSearchParams(); const from=sp.get('redirectedFrom')||'/dashboard';
  async function submit(e:React.FormEvent){ e.preventDefault(); setError(null); if(a!==b){ setError('PINs do not match'); return; }
    setLoading(true);
    let res=await fetch('/api/pin/set',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin:a})}); let data=await res.json();
    if(!res.ok){ setLoading(false); setError(data.error||'Failed to set PIN'); return; }
    res=await fetch('/api/pin/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin:a})}); data=await res.json(); setLoading(false);
    if(!res.ok){ setError(data.error||'Failed to verify'); return; } r.push(from); }
  return (<div className="min-h-screen flex items-center justify-center p-4"><div className="w-full max-w-sm space-y-4 card">
    <h1 className="text-xl font-semibold text-center">Set your PIN</h1>
    <form onSubmit={submit} className="space-y-3">
      <input className="input" inputMode="numeric" maxLength={6} value={a} onChange={e=>setA(e.target.value.replace(/\D/g,''))} placeholder="6-digit PIN" required/>
      <input className="input" inputMode="numeric" maxLength={6} value={b} onChange={e=>setB(e.target.value.replace(/\D/g,''))} placeholder="Confirm PIN" required/>
      {error&&<div className="text-red-600 text-sm">{error}</div>}
      <button className="btn btn-primary w-full" disabled={loading}>{loading?'Saving…':'Save PIN'}</button>
    </form></div></div>);
}
