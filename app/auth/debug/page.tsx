'use client';
import { useState, useEffect } from 'react';
import { sbClient } from '@/lib/supabase/client';

export default function AuthTest() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const sb = sbClient();
      const { data: { user }, error: userError } = await sb.auth.getUser();
      
      if (userError) {
        setError(`User error: ${userError.message}`);
        setLoading(false);
        return;
      }

      setUser(user);

      if (user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await sb
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          setError(`Profile error: ${profileError.message}`);
        } else {
          setProfile(profile);
        }

        // Check if account exists
        const { data: account, error: accountError } = await sb
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (accountError) {
          setError(`Account error: ${accountError.message}`);
        } else {
          setAccount(account);
        }
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  async function createProfile() {
    if (!user) return;
    
    try {
      const sb = sbClient();
      const { error } = await sb
        .from('profiles')
        .insert({ 
          user_id: user.id, 
          first_name: user.email?.split('@')[0] || 'User' 
        });
      
      if (error) {
        setError(`Profile creation error: ${error.message}`);
      } else {
        checkAuth(); // Refresh data
      }
    } catch (err) {
      setError(`Profile creation failed: ${err}`);
    }
  }

  async function createAccount() {
    if (!user) return;
    
    try {
      const sb = sbClient();
      const accountNumber = 'ACC' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
      const { error } = await sb
        .from('accounts')
        .insert({ 
          user_id: user.id, 
          account_number: accountNumber,
          available_balance: 1000.00 // Demo balance
        });
      
      if (error) {
        setError(`Account creation error: ${error.message}`);
      } else {
        checkAuth(); // Refresh data
      }
    } catch (err) {
      setError(`Account creation failed: ${err}`);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Authentication Debug</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">User Status</h2>
          {user ? (
            <div>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p className="text-green-600">✅ Authenticated</p>
            </div>
          ) : (
            <p className="text-red-600">❌ Not authenticated</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Profile Status</h2>
          {profile ? (
            <div>
              <p><strong>Profile ID:</strong> {profile.id}</p>
              <p><strong>Name:</strong> {profile.first_name}</p>
              <p><strong>PIN Hash:</strong> {profile.pin_hash ? '✅ Set' : '❌ Not set'}</p>
              <p className="text-green-600">✅ Profile exists</p>
            </div>
          ) : (
            <div>
              <p className="text-yellow-600">⚠️ Profile missing</p>
              {user && (
                <button 
                  onClick={createProfile}
                  className="btn btn-primary mt-2"
                >
                  Create Profile
                </button>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Account Status</h2>
          {account ? (
            <div>
              <p><strong>Account Number:</strong> {account.account_number}</p>
              <p><strong>Balance:</strong> ${account.available_balance}</p>
              <p className="text-green-600">✅ Account exists</p>
            </div>
          ) : (
            <div>
              <p className="text-yellow-600">⚠️ Account missing</p>
              {user && (
                <button 
                  onClick={createAccount}
                  className="btn btn-primary mt-2"
                >
                  Create Account
                </button>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          <div className="space-x-2">
            <button onClick={checkAuth} className="btn btn-ghost">
              Refresh Data
            </button>
            {user && (
              <a href="/auth/pin-setup" className="btn btn-primary">
                Set PIN
              </a>
            )}
            {!user && (
              <a href="/auth/sign-in" className="btn btn-primary">
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
