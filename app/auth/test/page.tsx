'use client';
import { useState } from 'react';
import { sbClient } from '@/lib/supabase/client';

export default function TestAuth() {
  const [email, setEmail] = useState('test@williamsholdings.com');
  const [password, setPassword] = useState('password123');
  const [pin, setPin] = useState('123456');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    setStatus('Creating account...');
    
    try {
      const sb = sbClient();
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: 'Test User'
          }
        }
      });

      if (error) {
        setStatus(`Sign up error: ${error.message}`);
      } else {
        setStatus('✅ Account created! You can now sign in.');
      }
    } catch (err) {
      setStatus(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  async function signIn() {
    setLoading(true);
    setStatus('Signing in...');
    
    try {
      const sb = sbClient();
      const { data, error } = await sb.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setStatus(`Sign in error: ${error.message}`);
        setLoading(false);
        return;
      }

      setStatus('✅ Signed in! Waiting for session...');
      
      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('Setting PIN...');
      await setPIN();
    } catch (err) {
      setStatus(`Error: ${err}`);
      setLoading(false);
    }
  }

  async function setPIN() {
    try {
      const res = await fetch('/api/pin/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
        credentials: 'include' // Important for cookies
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(`PIN set error (${res.status}): ${data.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      setStatus('✅ PIN set successfully! Now verifying...');
      await verifyPIN();
    } catch (err) {
      setStatus(`PIN set error: ${err}`);
      setLoading(false);
    }
  }

  async function verifyPIN() {
    try {
      const res = await fetch('/api/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
        credentials: 'include' // Important for cookies
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(`PIN verify error (${res.status}): ${data.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      setStatus('✅ All authentication steps completed! You can now go to dashboard.');
      setLoading(false);
    } catch (err) {
      setStatus(`PIN verify error: ${err}`);
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Quick Test Setup</h1>
      
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold">Test Credentials</h2>
        <input 
          className="input" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)}
        />
        <input 
          className="input" 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
        />
        <input 
          className="input" 
          placeholder="PIN (6 digits)" 
          value={pin} 
          onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
      </div>

      <div className="card space-y-3">
        <h2 className="text-lg font-semibold">Quick Setup</h2>
        <div className="space-y-2">
          <button 
            onClick={signUp} 
            disabled={loading}
            className="btn btn-primary w-full"
          >
            1. Create Test Account
          </button>
          <button 
            onClick={signIn} 
            disabled={loading}
            className="btn btn-ghost w-full"
          >
            2. Sign In & Set PIN
          </button>
        </div>
      </div>

      {status && (
        <div className="card">
          <h3 className="font-semibold mb-2">Status</h3>
          <p className="text-sm">{status}</p>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold mb-2">Manual Steps</h3>
        <div className="space-y-1 text-sm">
          <a href="/auth/sign-up" className="block text-blue-600 underline">
            → Go to Sign Up Page
          </a>
          <a href="/auth/sign-in" className="block text-blue-600 underline">
            → Go to Sign In Page
          </a>
          <a href="/auth/pin-setup-client" className="block text-green-600 underline font-semibold">
            → Client-Side PIN Setup (Bypass API Issues)
          </a>
          <a href="/auth/pin-client" className="block text-green-600 underline">
            → Client-Side PIN Verify
          </a>
          <a href="/auth/debug" className="block text-blue-600 underline">
            → Back to Debug Page
          </a>
          <a href="/dashboard" className="block text-blue-600 underline">
            → Try Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
