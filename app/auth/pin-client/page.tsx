'use client';
import { useState } from 'react';
import { sbClient } from '@/lib/supabase/client';
import * as crypto from 'crypto';

function hashPin(pin: string) {
  return crypto.createHash('sha256').update('salt' + pin).digest('hex');
}

export default function ClientPinVerify() {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!/^\d{6}$/.test(pin)) {
      setStatus('PIN must be 6 digits');
      return;
    }

    setLoading(true);
    setStatus('Verifying PIN...');

    try {
      const sb = sbClient();
      
      // Get current user
      const { data: { user }, error: userError } = await sb.auth.getUser();
      
      if (userError || !user) {
        setStatus(`Authentication error: ${userError?.message || 'Not signed in'}`);
        setLoading(false);
        return;
      }

      setStatus('User authenticated. Checking PIN...');

      // Get the user's profile with PIN hash
      const { data: profile, error: profileError } = await sb
        .from('profiles')
        .select('pin_hash')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setStatus('❌ PIN not set. Please set up your PIN first.');
        } else {
          setStatus(`Profile error: ${profileError.message}`);
        }
        setLoading(false);
        return;
      }

      if (!profile?.pin_hash) {
        setStatus('❌ PIN not set. Please set up your PIN first.');
        setLoading(false);
        return;
      }

      // Verify PIN
      const pinHash = hashPin(pin);
      
      if (profile.pin_hash === pinHash) {
        setStatus('✅ PIN verified successfully! Redirecting to dashboard...');
        
        // Set verification flags
        localStorage.setItem('pin_verified', 'true');
        localStorage.setItem('pin_verified_at', Date.now().toString());
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setStatus('❌ Incorrect PIN. Please try again.');
      }
      
    } catch (error) {
      setStatus(`Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4 card">
        <h1 className="text-xl font-semibold text-center">Enter PIN (Client-Side)</h1>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <input 
            className="input" 
            inputMode="numeric" 
            maxLength={6} 
            value={pin} 
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))} 
            placeholder="6-digit PIN" 
            required 
          />
          
          {status && (
            <div className={`text-sm p-2 rounded ${
              status.includes('✅') ? 'bg-green-100 text-green-700' :
              status.includes('❌') ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {status}
            </div>
          )}
          
          <button 
            className="btn btn-primary w-full" 
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify PIN'}
          </button>
        </form>

        <div className="text-center space-y-2">
          <div className="text-sm text-slate-600">
            No PIN yet? <a href="/auth/pin-setup-client" className="underline">Set it up</a>
          </div>
          <div className="space-x-2 text-sm">
            <a href="/auth/debug" className="text-blue-600 underline">
              Debug Page
            </a>
            <a href="/auth/test" className="text-blue-600 underline">
              Test Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
