"use client";

import ThemeToggle from './ThemeToggle';
import { usePathname } from 'next/navigation';

export default function Header(){
  const pathname = usePathname() || '';
  const isAuth = pathname.startsWith('/auth');

  // Transparent header for auth routes; subtle translucent navbar otherwise
  const base = 'w-full py-4 flex justify-end items-center transition-colors';
  const authClasses = 'bg-transparent';
  const normalClasses = 'bg-white/90 dark:bg-[rgba(7,16,34,0.6)] backdrop-blur-sm border-b border-gray-200 dark:border-[rgba(255,255,255,0.04)]';

  return (
    <header className={`${base} ${isAuth ? authClasses : normalClasses}`}>
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-end">
        <ThemeToggle />
      </div>
    </header>
  );
}
