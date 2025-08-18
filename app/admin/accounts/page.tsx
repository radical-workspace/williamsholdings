'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sbClient } from '@/lib/supabase/client';

interface Account {
  id: string;
  user_id: string;
  account_number: string;
  available_balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAdjustment, setBalanceAdjustment] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAdminAuth();
    loadAccounts();
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

  async function loadAccounts() {
    try {
      const { data, error } = await sbClient
        .from('accounts')
        .select(`
          *,
          profiles!inner (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateAccount(accountId: string, updates: Partial<Account>) {
    try {
      const { error } = await sbClient
        .from('accounts')
        .update(updates)
        .eq('id', accountId);

      if (error) throw error;
      
      await loadAccounts();
      setShowEditModal(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Failed to update account');
    }
  }

  async function handleBalanceAdjustment() {
    if (!selectedAccount || !balanceAdjustment) return;

    try {
      const adjustment = parseFloat(balanceAdjustment);
      const newBalance = Number(selectedAccount.available_balance) + adjustment;

      // Update account balance
      const { error: accountError } = await sbClient
        .from('accounts')
        .update({ available_balance: newBalance })
        .eq('id', selectedAccount.id);

      if (accountError) throw accountError;

      // Create transaction record
      const { error: transactionError } = await sbClient
        .from('transactions')
        .insert({
          user_id: selectedAccount.user_id,
          type: adjustment > 0 ? 'credit' : 'debit',
          amount: Math.abs(adjustment),
          currency: selectedAccount.currency,
          status: 'completed',
          description: `Admin adjustment: ${adjustmentReason}`,
        });

      if (transactionError) throw transactionError;

      await loadAccounts();
      setShowBalanceModal(false);
      setSelectedAccount(null);
      setBalanceAdjustment('');
      setAdjustmentReason('');
    } catch (error) {
      console.error('Error adjusting balance:', error);
      alert('Failed to adjust balance');
    }
  }

  async function handleDeleteAccount(accountId: string) {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete related transactions
      await sbClient.from('transactions').delete().eq('user_id', accountId);
      
      // Then delete the account
      const { error } = await sbClient.from('accounts').delete().eq('id', accountId);
      
      if (error) throw error;
      await loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function formatMoney(amount: number, currency: string = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">← Dashboard</a>
              <h1 className="text-xl font-semibold text-gray-900">Account Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by user, email, or account number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                title="Filter by account status"
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Accounts ({filteredAccounts.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Holder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {account.account_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {account.profiles?.first_name} {account.profiles?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{account.profiles?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatMoney(Number(account.available_balance), account.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(account.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowBalanceModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Balance
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Account Modal */}
      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Account</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateAccount(selectedAccount.id, {
                  status: formData.get('status') as any,
                  currency: formData.get('currency') as string,
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <input
                      type="text"
                      value={selectedAccount.account_number}
                      disabled
                      title="Account number (read-only)"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      defaultValue={selectedAccount.status}
                      title="Select account status"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select
                      name="currency"
                      defaultValue={selectedAccount.currency}
                      title="Select account currency"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                    <input
                      type="text"
                      value={formatMoney(Number(selectedAccount.available_balance), selectedAccount.currency)}
                      disabled
                      title="Current account balance (read-only)"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedAccount(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Balance Adjustment Modal */}
      {showBalanceModal && selectedAccount && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adjust Balance</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account</label>
                  <p className="text-sm text-gray-600">
                    {selectedAccount.account_number} - {selectedAccount.profiles?.first_name} {selectedAccount.profiles?.last_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatMoney(Number(selectedAccount.available_balance), selectedAccount.currency)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adjustment Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={balanceAdjustment}
                    onChange={(e) => setBalanceAdjustment(e.target.value)}
                    placeholder="Enter amount (+ for credit, - for debit)"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use positive numbers for credits, negative for debits
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="Enter reason for adjustment"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>
                {balanceAdjustment && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>New Balance:</strong> {formatMoney(
                        Number(selectedAccount.available_balance) + parseFloat(balanceAdjustment || '0'),
                        selectedAccount.currency
                      )}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowBalanceModal(false);
                    setSelectedAccount(null);
                    setBalanceAdjustment('');
                    setAdjustmentReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBalanceAdjustment}
                  disabled={!balanceAdjustment || !adjustmentReason}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  Apply Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
