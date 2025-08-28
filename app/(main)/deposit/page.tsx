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

// Company's payment details (replace with real values)
const COMPANY_PAYMENT_INFO = {
  BTC: { address: '1FfmbHfnpaZjKFvyi1okTjJJusN455paPH' },
  USDT_TRC20: { address: '0xbvssfggetokhddgfdgvcvcc' },
  USDT_ERC20: { address: '0xwtyrwkfkhyhgdfsfgrgrggy' },
  USDC_ERC20: { address: '0xfagdtwrrfjfhfvnerhfhfjl' },
  USD_BANK: { bankName: 'Bank of America', accountNumber: '087424384', routing: '026009593', name: 'WilliamsHoldings LLC' }
}

export default function DepositPage() {
  const [channels, setChannels] = useState<Channel[]>(FALLBACK);
  const [channel, setChannel] = useState('');
  const [network, setNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [txProof, setTxProof] = useState('');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // generate reference when amount or channel changes
  useEffect(() => {
    if (!channel || !amount) return;
    const ref = `WH-${channel}-${Date.now().toString().slice(-6)}`;
    setReference(ref);
  }, [channel, amount]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Deposit</h1>
      <div className="card space-y-3">
        <select aria-label="Deposit method" className="input" value={channel} onChange={e=>setChannel(e.target.value)} required>
          <option value="">Select method</option>
          {channels.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>

        {(channel.includes('USDT') || channel.includes('USDC')) && (
          <select aria-label="Deposit network" className="input" value={network} onChange={e=>setNetwork(e.target.value)} required>
            <option value="">Select network</option>
            <option value="TRON">TRC20 (TRON)</option>
            <option value="ETH">ERC20 (Ethereum)</option>
          </select>
        )}

        <input type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}
               placeholder="Amount (USD)" className="input" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input value={reference} readOnly className="input flex-1" />
            <button className="btn" onClick={() => navigator.clipboard.writeText(reference)}>Copy</button>
          </div>

          <input value={txProof} onChange={e=>setTxProof(e.target.value)} placeholder="Proof / Transaction ID (optional)" className="input" />

          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Payment reference / note (optional)" className="input" />

          <button className="btn btn-primary w-full" onClick={async () => {
            if (!channel || Number(amount) <= 0) {
              alert('Please select a deposit method and enter a valid amount.');
              return;
            }
            setIsSubmitting(true);
            try {
              const paymentInfo = COMPANY_PAYMENT_INFO[channel as keyof typeof COMPANY_PAYMENT_INFO] || {};
              const payload = { amount: Number(amount), currency: 'USD', source: channel, note: note || null, reference, proof: txProof || null, payment_info: paymentInfo };
              const res = await fetch('/api/db/deposits', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
              });
              const body = await res.json();
              if (!res.ok) {
                alert(body?.error || 'Deposit failed. Try again later.');
              } else {
                alert('Deposit intent created. Check your deposit requests for status.');
                // Optionally clear form
                setAmount(''); setNote(''); setChannel(''); setNetwork(''); setTxProof(''); setReference('');
              }
            } catch (err) {
              console.error(err);
              alert('Network error. Try again later.');
            } finally {
              setIsSubmitting(false);
            }
          }} disabled={!amount || isSubmitting}>
            {isSubmitting ? 'Processing…' : 'Continue'}
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-500">BTC, USDT, USDC and USD bank transfer supported.</p>
    </div>
  );
}

// Add handler below the component (keeps top-level component code tidy)
async function handleContinue(this: any) {
  // This function is hoisted into the component's closure by binding in JSX.
}
