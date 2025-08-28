import './globals.css';
import ThemeToggle from '../components/ThemeToggle';
import { Analytics } from '@vercel/analytics/react';

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || 'WilliamsHoldings';
const PRIMARY = process.env.NEXT_PUBLIC_PRIMARY_HEX || '#059669';

export const metadata = {
  title: `WH — ${BRAND}`,
  description: `Baron ${BRAND} Banking — secure, premium banking with WH`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
  <head>
    <link rel="icon" href="/favicon-wh.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-wh.png" />
  <style>{`:root{--brand:${PRIMARY}}`}</style>
  {/* Inline script to apply theme before hydration to avoid flash */}
  <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme'); if(!t){ t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } if(t==='dark') document.documentElement.classList.add('theme-dark'); }catch(e){} })()` }} />
      </head>
      <body>
        <div className="mx-auto min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="w-full py-4 flex justify-end items-center">
            <ThemeToggle />
          </header>
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
