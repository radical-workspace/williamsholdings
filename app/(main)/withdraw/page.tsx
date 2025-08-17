'use client';
import { useEffect, useState } from 'react';

export default function WithdrawPage() {
  const [methods, setMethods] = useState<any[]>([]);
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

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
        <select className="input" value={method} onChange={e=>setMethod(e.target.value)} required>
          <option value="">Select payout method</option>
          {methods.map((m:any) => <option key={m.id} value={m.id}>{m.label || m.method_code}</option>)}
        </select>
        <input className="input" type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount (USD)" />
        <input className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="Note (optional)" />
        <button className="btn btn-primary w-full"
          onClick={() => alert('Withdrawal request UI is ready. Connect to your API later to submit.')}>
          Request Withdrawal
        </button>
      </div>
      <div className="text-sm text-slate-500">Add payout destinations in <a className="underline" href="/payout-methods">Payout Methods</a>.</div>
    </div>
  );
}
