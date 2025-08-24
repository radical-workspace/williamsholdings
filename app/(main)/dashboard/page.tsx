import { sbServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'
import GreetingClock from '@/components/GreetingClock';

function formatMoney(amount: number, currency: string) {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount); }
  catch { return `$${amount.toFixed(2)}`; }
}

export default async function Dashboard() {
  let balance = 0;
  let acct = '••••••••';
  let currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'USD';
  let status: 'Active' | 'Inactive' = 'Inactive';
  let name = 'there';

  try {
    const sb = sbServer();
    const { data: { user } } = await sb.auth.getUser();

    if (user) {
      try {
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
      } catch (dbError) {
        // If database queries fail, use default values and user email
        console.error('Database query error:', dbError);
        name = user.email?.split('@')[0] ?? 'there';
      }
    }
  } catch (error) {
    console.error('Authentication error:', error);
  }

  const masked = acct.length >= 6 ? `${acct.slice(0,4)}••••${acct.slice(-2)}` : acct;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* HERO */}
      <section>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <GreetingClock name={name} />
              <div className="mt-4 text-sm opacity-90">Available Balance</div>
              <div className="mt-1 text-3xl md:text-4xl font-extrabold tracking-tight">{formatMoney(balance, currency)}</div>
              <div className="mt-2 text-sm opacity-90">Your Account Number: <span className="font-mono">{masked}</span></div>
            </div>

            <div className="flex items-center gap-3">
              <a href="/transactions" className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium shadow-sm">Transactions</a>
              <a href="/deposit" className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium shadow-sm">Top up</a>
            </div>
          </div>
        </div>
      </section>

      {/* ACTION TILES */}
      <section>
        <h2 className="text-2xl font-semibold">What would you like to do today?</h2>
        <p className="text-slate-600 mt-1">Choose from our popular actions below</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <a href="/profile" className="block p-4 rounded-lg border hover:shadow-md transition bg-white">
            <h3 className="font-semibold text-lg">Account Info</h3>
            <p className="text-sm text-slate-600 mt-2">View and edit your details</p>
          </a>
          <a href="/transactions" className="block p-4 rounded-lg border hover:shadow-md transition bg-white">
            <h3 className="font-semibold text-lg">Transactions</h3>
            <p className="text-sm text-slate-600 mt-2">View your recent transactions</p>
          </a>
          <a href="/cards" className="block p-4 rounded-lg border hover:shadow-md transition bg-white">
            <h3 className="font-semibold text-lg">Cards</h3>
            <p className="text-sm text-slate-600 mt-2">Apply for a bank card (coming soon)</p>
          </a>
          <a href="/deposit" className="block p-4 rounded-lg border hover:shadow-md transition bg-white">
            <h3 className="font-semibold text-lg">Deposit</h3>
            <p className="text-sm text-slate-600 mt-2">Add funds to your account</p>
          </a>
          <a href="/withdraw" className="block p-4 rounded-lg border hover:shadow-md transition bg-white">
            <h3 className="font-semibold text-lg">Withdraw</h3>
            <p className="text-sm text-slate-600 mt-2">Withdraw to bank or cards</p>
          </a>
          <a href="/support" className="block p-4 rounded-lg border hover:shadow-md transition bg-white">
            <h3 className="font-semibold text-lg">Support</h3>
            <p className="text-sm text-slate-600 mt-2">Contact our helpdesk</p>
          </a>
        </div>
      </section>
    </div>
  );
}
