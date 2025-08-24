import './globals.css';
import ThemeToggle from '../components/ThemeToggle';

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
      </body>
    </html>
  );
}
