'use client';
import { useEffect, useState } from 'react';

export default function PayoutMethodsPage() {
  const [list,setList]=useState<any[]>([]);
  const [methodCode,setMethodCode]=useState('BTC');
  const [label,setLabel]=useState('');
  const [address,setAddress]=useState('');
  const [bankName,setBankName]=useState('');
  const [accountName,setAccountName]=useState('');
  const [network,setNetwork]=useState('');

  async function load() {
    try {
      const r = await fetch('/api/db/payout-methods');
      if (!r.ok) return;
      const d = await r.json(); setList(d.items || []);
    } catch {}
  }
  useEffect(()=>{ load(); },[]);

  async function save(e:React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch('/api/db/payout-methods', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ methodCode, label, address, bankName, accountName, network })
      });
      if (r.ok) { setLabel(''); setAddress(''); setBankName(''); setAccountName(''); setNetwork(''); load(); }
      else alert('Endpoint not active yet. The UI is ready; plug in your API later.');
    } catch { alert('UI saved locally. Connect API later.'); }
  }

  const isBank = methodCode === 'USD_BANK';

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Payout Methods</h1>
      <form onSubmit={save} className="card space-y-3">
        <select className="input" value={methodCode} onChange={e=>setMethodCode(e.target.value)}>
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="USDT_TRC20">Tether USDT (TRC20)</option>
          <option value="USDT_ERC20">Tether USDT (ERC20)</option>
          <option value="USDC_ERC20">USD Coin (ERC20)</option>
          <option value="USD_BANK">USD Bank Transfer</option>
        </select>

        {!isBank ? (
          <>
            <input className="input" value={label} onChange={e=>setLabel(e.target.value)} placeholder="Label (e.g., My BTC)" />
            <input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Wallet address" required />
            {(methodCode.includes('USDT') || methodCode.includes('USDC')) && (
              <select className="input" value={network} onChange={e=>setNetwork(e.target.value)} required>
                <option value="">Select network</option>
                <option value="TRON">TRC20 (TRON)</option>
                <option value="ETH">ERC20 (Ethereum)</option>
              </select>
            )}
          </>
        ) : (
          <>
            <input className="input" value={label} onChange={e=>setLabel(e.target.value)} placeholder="Label (e.g., Chase USD)" />
            <input className="input" value={bankName} onChange={e=>setBankName(e.target.value)} placeholder="Bank name" required />
            <input className="input" value={accountName} onChange={e=>setAccountName(e.target.value)} placeholder="Account name" required />
            <input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Account number / IBAN" required />
          </>
        )}

        <button className="btn btn-primary w-full">Save Method</button>
      </form>

      <div className="space-y-2">
        {list.map((it:any)=>(
          <div key={it.id} className="card">
            <div className="font-medium">{it.label || it.method_code}</div>
            <div className="text-sm text-slate-600 break-all">{it.address}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
