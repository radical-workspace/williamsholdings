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
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* HERO */}
      <section>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white p-6 shadow-xl ring-1 ring-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <GreetingClock name={name} />
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${status === 'Active' ? 'bg-white/20' : 'bg-white/10'}`}>{status}</span>
              </div>

              <div className="mt-4 text-sm opacity-90">Available Balance</div>
              <div className="mt-1 text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">{formatMoney(balance, currency)}</div>
              <div className="mt-3 text-sm opacity-90">Your Account Number: <span className="font-mono bg-white/10 px-2 py-0.5 rounded">{masked}</span></div>
            </div>

            <div className="flex items-center gap-3">
              <a href="/transactions" className="inline-flex items-center px-5 py-2 bg-white text-blue-700 rounded-full font-semibold shadow hover:translate-y-[-1px] transition">Transactions</a>
              <a href="/deposit" className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-full font-medium shadow-sm hover:bg-white/20 transition">Top up</a>
            </div>
          </div>
        </div>
      </section>

      {/* ACTION TILES */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">What would you like to do today?</h2>
            <p className="text-slate-600 mt-1">Choose from our popular actions below</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <a href="/profile" className="group block p-5 rounded-xl border border-slate-100 bg-white hover:shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 1116 0H2z" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Account Info</h3>
                <p className="text-sm text-slate-600 mt-1">View and edit your details</p>
              </div>
            </div>
          </a>

          <a href="/transactions" className="group block p-5 rounded-xl border border-slate-100 bg-white hover:shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3v12a2 2 0 002 2h10v-2H5V3H3z"/><path d="M9 7h8v2H9V7zM9 11h8v2H9v-2z"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Transactions</h3>
                <p className="text-sm text-slate-600 mt-1">View your recent transactions</p>
              </div>
            </div>
          </a>

          <a href="/cards" className="group block p-5 rounded-xl border border-slate-100 bg-white hover:shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 7a2 2 0 012-2h12a2 2 0 012 2v2H2V7z"/><path d="M2 11h16v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Cards</h3>
                <p className="text-sm text-slate-600 mt-1">Apply for a WilliamsHoldings Visa</p>
              </div>
            </div>
          </a>

          <a href="/deposit" className="group block p-5 rounded-xl border border-slate-100 bg-white hover:shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h4V8l4 4-4 4v-2H3a1 1 0 01-1-1z"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Deposit</h3>
                <p className="text-sm text-slate-600 mt-1">Add funds to your account</p>
              </div>
            </div>
          </a>

          <a href="/withdraw" className="group block p-5 rounded-xl border border-slate-100 bg-white hover:shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 12h10v2H5v-2zM5 8h10v2H5V8z"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Withdraw</h3>
                <p className="text-sm text-slate-600 mt-1">Withdraw to bank or cards</p>
              </div>
            </div>
          </a>

          <a href="/support" className="group block p-5 rounded-xl border border-slate-100 bg-white hover:shadow-lg transform hover:-translate-y-1 transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M18 13v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2l8-5 8 5z"/></svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Support</h3>
                <p className="text-sm text-slate-600 mt-1">Contact our helpdesk</p>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
