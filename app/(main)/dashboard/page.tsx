import { sbServer } from '@/lib/supabase/server';
import GreetingClock from '@/components/GreetingClock';

function formatMoney(amount: number, currency: string) {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount); }
  catch { return `$${amount.toFixed(2)}`; }
}

export default async function Dashboard() {
  const sb = sbServer();
  const { data: { user } } = await sb.auth.getUser();

  let balance = 0;
  let acct = '••••••••';
  let currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'USD';
  let status: 'Active' | 'Inactive' = 'Inactive';
  let name = 'there';

  if (user) {
    const [{ data: acc }, { data: prof }] = await Promise.all([
      sb.from('accounts')
        .select('available_balance,account_number,currency')
        .eq('user_id', user.id).limit(1).maybeSingle(),
      sb.from('profiles')
        .select('first_name').eq('user_id', user.id).limit(1).maybeSingle()
    ]);

    if (acc) {
      balance = Number(acc.available_balance || 0);
      acct = acc.account_number || acct;
      currency = acc.currency || currency;
      status = 'Active';
    }
    name = prof?.first_name || (user.email?.split('@')[0] ?? 'there');
  }

  const masked = acct.length >= 6 ? `${acct.slice(0,4)}••••${acct.slice(-2)}` : acct;

  return (
    <div className="space-y-5">
      {/* HERO */}
      <section className="hero">
        <GreetingClock name={name} />
        <div className="mt-6">
          <div className="muted">Available Balance</div>
          <div className="mt-1 text-4xl font-extrabold">{formatMoney(balance, currency)}</div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/10 p-4">
          <div className="muted text-sm">Your Account Number</div>
          <div className="mt-1 flex items-center justify-between">
            <div className="text-lg font-semibold tracking-wider">{masked}</div>
            <div className="flex gap-2">
              <a href="/transactions" className="btn btn-white/10">Transactions</a>
              <a href="/deposit" className="btn btn-white/10">Top up</a>
            </div>
          </div>
          <div className="mt-3">
            <span className={`badge ${status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{status}</span>
          </div>
        </div>
      </section>

      {/* ACTION TILES */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">What would you like to do today?</h2>
        <p className="text-slate-600 text-sm">Choose from our popular actions below</p>

        <div className="grid grid-cols-2 gap-3">
          <a href="/profile" className="tile"><h3>Account Info</h3><p>View and edit your details</p></a>
          <a href="/send" className="tile"><h3>Send Money</h3><p>Transfer to wallets or banks</p></a>
          <a href="/deposit" className="tile"><h3>Deposit</h3><p>BTC • USDT • USDC • USD</p></a>
          <a href="/withdraw" className="tile"><h3>Withdraw</h3><p>Select any payout method</p></a>
          <a href="/plans" className="tile"><h3>Investment Plans</h3><p>Daily ROI options</p></a>
          <a href="/active-investments" className="tile"><h3>Active Investments</h3><p>Track performance</p></a>
        </div>
      </section>
    </div>
  );
}
