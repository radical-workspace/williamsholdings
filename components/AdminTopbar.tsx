// components/AdminTopbar.tsx
export default function AdminTopbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-muted/60 bg-surface/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <div className="text-lg font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            WilliamsHoldings Admin
          </span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm">
          {["Dashboard","Users","Accounts","Transactions","Settings"].map(i=>(
            <a key={i} className="text-text/80 hover:text-text transition">{i}</a>
          ))}
        </nav>
        <button
          className="rounded-xl px-4 py-2 font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
