'use client';
import { useEffect, useState } from 'react';

type Channel = { code: string; name: string; requiresNetwork?: boolean };

const FALLBACK: Channel[] = [
  { code: 'BTC', name: 'Bitcoin (BTC)' },
  { code: 'USDT_TRC20', name: 'Tether USDT (TRC20)', requiresNetwork: true },
  { code: 'USDT_ERC20', name: 'Tether USDT (ERC20)', requiresNetwork: true },
  { code: 'USDC_ERC20', name: 'USD Coin (ERC20)', requiresNetwork: true },
  { code: 'USD_BANK', name: 'USD Bank Transfer' },
];

export default function DepositPage() {
  const [channels, setChannels] = useState<Channel[]>(FALLBACK);
  const [channel, setChannel] = useState('');
  const [network, setNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Try to load real channels if your API exists; otherwise fallback
  useEffect(() => {
    fetch('/api/db/channels').then(async r => {
      if (!r.ok) return;
      const d = await r.json();
      if (d?.channels?.length) {
        setChannels(d.channels.map((c: any) => ({
          code: c.code, name: c.display_name, requiresNetwork: !!c.network
        })));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Deposit</h1>
      <div className="card space-y-3">
        <select className="input" value={channel} onChange={e=>setChannel(e.target.value)} required>
          <option value="">Select method</option>
          {channels.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>

        {(channel.includes('USDT') || channel.includes('USDC')) && (
          <select className="input" value={network} onChange={e=>setNetwork(e.target.value)} required>
            <option value="">Select network</option>
            <option value="TRON">TRC20 (TRON)</option>
            <option value="ETH">ERC20 (Ethereum)</option>
          </select>
        )}

        <input type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}
               placeholder="Amount (USD)" className="input" />

        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Payment reference / note (optional)" className="input" />

        <button className="btn btn-primary w-full"
          onClick={() => alert('Deposit intent UI is ready. Connect to your API later to generate addresses.')}>
          Continue
        </button>
      </div>
      <p className="text-sm text-slate-500">BTC, USDT, USDC and USD bank transfer supported.</p>
    </div>
  );
}
