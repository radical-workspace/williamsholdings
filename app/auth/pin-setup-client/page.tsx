'use client';
import { useState } from 'react';
import { sbClient } from '@/lib/supabase/client';
import * as crypto from 'crypto';

function hashPin(pin: string) {
  return crypto.createHash('sha256').update('salt' + pin).digest('hex');
}

export default function ClientPinSetup() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (pin !== confirmPin) {
      setStatus('PINs do not match');
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setStatus('PIN must be 6 digits');
      return;
    }

    setLoading(true);
    setStatus('Setting PIN...');

    try {
      const sb = sbClient();
      
      // Get current user
      const { data: { user }, error: userError } = await sb.auth.getUser();
      
      if (userError || !user) {
        setStatus(`Authentication error: ${userError?.message || 'Not signed in'}`);
        setLoading(false);
        return;
      }

      setStatus('User authenticated. Creating/updating profile...');

      // Hash the PIN
      const pinHash = hashPin(pin);

      // First try to insert a new profile
      let { data: profile, error: insertError } = await sb
        .from('profiles')
        .insert({ 
          user_id: user.id, 
          first_name: user.email?.split('@')[0] || 'User',
          pin_hash: pinHash
        })
        .select()
        .single();

      if (insertError) {
        // If insert failed due to duplicate, try to update instead
        if (insertError.code === '23505') { // Unique violation
          setStatus('Profile exists. Updating PIN...');
          
          const { data: updateProfile, error: updateError } = await sb
            .from('profiles')
            .update({ pin_hash: pinHash })
            .eq('user_id', user.id)
            .select()
            .single();

          if (updateError) {
            setStatus(`Update error: ${updateError.message}`);
            setLoading(false);
            return;
          }
          
          profile = updateProfile;
        } else {
          setStatus(`Profile error: ${insertError.message}`);
          setLoading(false);
          return;
        }
      }

      setStatus('PIN set successfully! Verifying...');

      // Verify the PIN works
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const testHash = hashPin(pin);
      if (profile?.pin_hash === testHash) {
        setStatus('✅ PIN verification successful! Redirecting to dashboard...');
        
        // Set a simple localStorage flag for now (we'll improve this later)
        localStorage.setItem('pin_verified', 'true');
        localStorage.setItem('pin_verified_at', Date.now().toString());
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setStatus('❌ PIN verification failed');
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
        <h1 className="text-xl font-semibold text-center">Set your PIN (Client-Side)</h1>
        
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
          <input 
            className="input" 
            inputMode="numeric" 
            maxLength={6} 
            value={confirmPin} 
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} 
            placeholder="Confirm PIN" 
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
            {loading ? 'Setting PIN...' : 'Set PIN'}
          </button>
        </form>

        <div className="text-center space-y-2">
          <div className="text-sm text-slate-600">
            This uses client-side database access to bypass API issues
          </div>
          <div className="space-x-2">
            <a href="/auth/debug" className="text-blue-600 underline text-sm">
              Debug Page
            </a>
            <a href="/auth/test" className="text-blue-600 underline text-sm">
              Test Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
