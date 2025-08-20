'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { sbClient } from '@/lib/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalAccounts: number;
  totalBalance: number;
  totalTransactions: number;
  recentUsers: any[];
  recentTransactions: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAccounts: 0,
    totalBalance: 0,
    totalTransactions: 0,
    recentUsers: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  const checkAdminAuth = useCallback(async () => {
    // Use Supabase auth session rather than localStorage
    const { data: { user } } = await sbClient().auth.getUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Verify admin role
    const { data: profile } = await sbClient()
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    checkAdminAuth();
    loadDashboardData();
  }, [checkAdminAuth]);

  async function loadDashboardData() {
    try {
      // Load statistics
    const [usersResult, accountsResult, transactionsResult] = await Promise.all([
  sbClient().from('profiles').select('*', { count: 'exact' }),
  sbClient().from('accounts').select('*, profiles!inner(first_name, last_name, email)', { count: 'exact' }),
  sbClient().from('transactions').select('*', { count: 'exact' })
    ]);

      // Calculate total balance
  const { data: balanceData } = await sbClient()
        .from('accounts')
        .select('available_balance');

  const totalBalance = balanceData?.reduce((sum: number, acc: any) => sum + (Number(acc.available_balance) || 0), 0) || 0;

      // Get recent users (last 10)
  const { data: recentUsers } = await sbClient()
        .from('profiles')
        .select('*, accounts!left(account_number, available_balance)')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent transactions (last 10)
  const { data: recentTransactions } = await sbClient()
        .from('transactions')
        .select('*, profiles!inner(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalUsers: usersResult.count || 0,
        totalAccounts: accountsResult.count || 0,
        totalBalance,
        totalTransactions: transactionsResult.count || 0,
        recentUsers: recentUsers || [],
        recentTransactions: recentTransactions || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
  await sbClient().auth.signOut();
    router.push('/admin/login');
  }

  function formatMoney(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalUsers.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Accounts</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalAccounts.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Balance</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatMoney(stats.totalBalance)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalTransactions.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
            </div>
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {stats.recentUsers.map((user) => (
                  <li key={user.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {user.accounts?.[0] ? formatMoney(Number(user.accounts[0].available_balance) || 0) : 'No account'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {stats.recentTransactions.map((tx) => (
                  <li key={tx.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {tx.profiles?.first_name} {tx.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{tx.type} • {tx.status}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${tx.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                          {tx.type === 'debit' ? '-' : '+'}{formatMoney(Number(tx.amount) || 0)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
