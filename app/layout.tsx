import './globals.css';

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || 'WilliamsHoldings';
const PRIMARY = process.env.NEXT_PUBLIC_PRIMARY_HEX || '#059669';

export const metadata = {
  title: BRAND,
  description: `${BRAND} banking app`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <style>{`:root{--brand:${PRIMARY}}`}</style>
      </head>
      <body>
        <div className="mx-auto min-h-screen max-w-md bg-slate-50">{children}</div>
      </body>
    </html>
  );
}
