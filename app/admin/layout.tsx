"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { sbClient } from '@/lib/supabase/client';
import useAdminAuth from '@/components/hooks/useAdminAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Use centralized admin auth hook
  const { checking } = useAdminAuth(true);

  async function handleLogout() {
    try {
      // attempt server-side logout first
      try {
        await fetch('/api/admin/logout', { method: 'POST' });
      } catch (e) {
        console.warn('Server logout failed, falling back to client signOut', e);
      }
      await sbClient().auth.signOut();
    } catch (e) {
      console.error('Logout error', e);
    }
  router.push('/admin/login');
  }

  // If the current route is the admin login page, render children without the admin nav/header.
  if (pathname && pathname.includes('/admin/login')) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">WilliamsHoldings Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <a href="/admin/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="/admin/users" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Users</a>
                <a href="/admin/accounts" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Accounts</a>
                <a href="/admin/transactions" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Transactions</a>
                <a href="/admin/settings" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Settings</a>
              </nav>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
