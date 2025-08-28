'use client';
import { useEffect, useState } from 'react';

export default function WithdrawPage() {
  const [methods, setMethods] = useState<any[]>([]);
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/db/payout-methods').then(async r => {
      if (!r.ok) return;
      const d = await r.json();
      setMethods(d.items || []);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Withdraw</h1>
      <div className="card space-y-3">
  <select aria-label="Select payout method" className="input" value={method} onChange={e=>setMethod(e.target.value)} required>
          <option value="">Select payout method</option>
          {methods.map((m:any) => <option key={m.id} value={m.id}>{m.label || m.method_code}</option>)}
        </select>
        <input className="input" type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount (USD)" />
        <input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Wallet / Account address" />
        <input className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="Note (optional)" />

        <button className="btn btn-primary w-full" disabled={!amount || (!method && !address) || isSubmitting}
          onClick={async () => {
            if (!amount || Number(amount) <= 0) { alert('Enter a valid amount'); return; }
            if (!method && !address) { alert('Select a payout method or enter an address'); return; }
            setIsSubmitting(true);
            try {
              const payload: any = { amount: Number(amount), currency: 'USD', note: note || null };
              if (method) payload.payout_method_id = method;
              if (address) payload.address = address;
              const res = await fetch('/api/db/withdraws', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              const body = await res.json();
              if (!res.ok) {
                alert(body?.error || 'Withdraw request failed');
              } else {
                alert('Withdrawal request submitted for admin approval');
                setAmount(''); setNote(''); setMethod(''); setAddress('');
              }
            } catch (err) {
              console.error(err);
              alert('Network error — try again later');
            } finally { setIsSubmitting(false); }
          }}>
          {isSubmitting ? 'Requesting…' : 'Request Withdrawal'}
        </button>
      </div>
      <div className="text-sm text-slate-500">Add payout destinations in <a className="underline" href="/payout-methods">Payout Methods</a>.</div>
    </div>
  );
}
