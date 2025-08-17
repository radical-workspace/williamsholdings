'use client';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard', label: 'Home' },
  { href: '/stats',     label: 'Stats' },
  { href: '/cards',     label: 'Cards' },
  { href: '/profile',   label: 'Profile' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="pb-20">
      <div className="p-4">{children}</div>
      <nav className="navbar">
        <div className="navbar-inner">
          {tabs.map(t => {
            const active = path === t.href;
            return (
              <a key={t.href} href={t.href} className={`nav-item ${active ? 'nav-item-active' : ''}`}>
                {t.label}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
