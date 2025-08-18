'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sbClient } from '@/lib/supabase/client';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  async function checkAdminAuth() {
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }

    const { data: { user } } = await sbClient.auth.getUser();
    if (!user) {
      localStorage.removeItem('admin_session');
      router.push('/admin/login');
      return;
    }
  }

  async function handleCreateAdminUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    try {
      // Create user with Supabase Auth
      const { data, error: authError } = await sbClient.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Create profile with admin role
        const { error: profileError } = await sbClient
          .from('profiles')
          .insert({
            id: data.user.id,
            user_id: data.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            role: 'admin'
          });

        if (profileError) throw profileError;

        setMessage('Admin user created successfully!');
        (e.target as HTMLFormElement).reset();
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSystemMaintenance(action: string) {
    setLoading(true);
    setMessage('');

    try {
      switch (action) {
        case 'backup':
          // In a real application, this would trigger a database backup
          setMessage('Database backup initiated. This is a simulated action.');
          break;
        case 'cleanup':
          // Clean up old transactions or logs
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { error } = await sbClient
            .from('transactions')
            .delete()
            .eq('status', 'failed')
            .lt('created_at', thirtyDaysAgo.toISOString());

          if (error) throw error;
          setMessage('Cleaned up old failed transactions.');
          break;
        case 'reset_demo':
          // Reset demo data
          await sbClient.from('transactions').delete().neq('id', '');
          await sbClient.from('accounts').update({ available_balance: 1000 }).neq('id', '');
          setMessage('Demo data reset completed.');
          break;
        default:
          setMessage('Unknown action.');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">← Dashboard</a>
              <h1 className="text-xl font-semibold text-gray-900">Admin Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Create Admin User */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create Admin User</h3>
              <p className="text-sm text-gray-500">Add a new administrator to the system</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateAdminUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="Enter first name"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="Enter last name"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="admin@williamsholdings.com"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="Enter secure password"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Creating...' : 'Create Admin User'}
                </button>
              </form>
            </div>
          </div>

          {/* System Maintenance */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Maintenance</h3>
              <p className="text-sm text-gray-500">Database and system maintenance operations</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleSystemMaintenance('backup')}
                  disabled={loading}
                  className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100"
                >
                  <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span className="text-sm font-medium">Backup Database</span>
                  <span className="text-xs text-gray-500">Create system backup</span>
                </button>

                <button
                  onClick={() => handleSystemMaintenance('cleanup')}
                  disabled={loading}
                  className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100"
                >
                  <svg className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-sm font-medium">Cleanup Data</span>
                  <span className="text-xs text-gray-500">Remove old failed transactions</span>
                </button>

                <button
                  onClick={() => handleSystemMaintenance('reset_demo')}
                  disabled={loading}
                  className="flex flex-col items-center p-4 border border-red-300 rounded-lg hover:bg-red-50 disabled:bg-gray-100"
                >
                  <svg className="h-8 w-8 text-red-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm font-medium">Reset Demo</span>
                  <span className="text-xs text-gray-500">Reset all demo data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Database Schema */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Database Schema</h3>
              <p className="text-sm text-gray-500">Current database tables and structure</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">profiles</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• id (uuid, primary key)</li>
                    <li>• user_id (uuid, foreign key)</li>
                    <li>• email (text)</li>
                    <li>• first_name (text)</li>
                    <li>• last_name (text)</li>
                    <li>• phone (text)</li>
                    <li>• role (text)</li>
                    <li>• created_at (timestamp)</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">accounts</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• id (uuid, primary key)</li>
                    <li>• user_id (uuid, foreign key)</li>
                    <li>• account_number (text)</li>
                    <li>• available_balance (numeric)</li>
                    <li>• currency (text)</li>
                    <li>• status (text)</li>
                    <li>• created_at (timestamp)</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">transactions</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• id (uuid, primary key)</li>
                    <li>• user_id (uuid, foreign key)</li>
                    <li>• type (text)</li>
                    <li>• amount (numeric)</li>
                    <li>• currency (text)</li>
                    <li>• status (text)</li>
                    <li>• description (text)</li>
                    <li>• created_at (timestamp)</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">pin_codes</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• id (uuid, primary key)</li>
                    <li>• user_id (uuid, foreign key)</li>
                    <li>• pin_hash (text)</li>
                    <li>• created_at (timestamp)</li>
                    <li>• updated_at (timestamp)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Information</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Application</dt>
                  <dd className="text-sm text-gray-900">WilliamsHoldings Banking System</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Version</dt>
                  <dd className="text-sm text-gray-900">1.0.0</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Framework</dt>
                  <dd className="text-sm text-gray-900">Next.js 14.2.5</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Database</dt>
                  <dd className="text-sm text-gray-900">Supabase PostgreSQL</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Authentication</dt>
                  <dd className="text-sm text-gray-900">Supabase Auth</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Environment</dt>
                  <dd className="text-sm text-gray-900">Development</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
