'use client';
import { useState, useEffect } from 'react';
import { sbClient } from '@/lib/supabase/client';
import * as crypto from 'crypto';

function hashPin(pin: string) {
  return crypto.createHash('sha256').update('salt' + pin).digest('hex');
}

export default function CompleteAuthFlow() {
  const [step, setStep] = useState<'signup' | 'signin' | 'pinsetup' | 'dashboard'>('signin');
  const [email, setEmail] = useState('test@williamsholdings.com');
  const [password, setPassword] = useState('password123');
  const [pin, setPin] = useState('123456');
  const [confirmPin, setConfirmPin] = useState('123456');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      const sb = sbClient();
      const { data: { user } } = await sb.auth.getUser();
      setUser(user);
      
      if (user) {
        setStatus(`Signed in as: ${user.email}`);
        
        // Check if PIN is set
        const { data: profile } = await sb
          .from('profiles')
          .select('pin_hash')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.pin_hash) {
          setStep('dashboard');
          setStatus('✅ Fully authenticated! PIN is set.');
        } else {
          setStep('pinsetup');
          setStatus('Signed in, but PIN not set. Please set your PIN.');
        }
      } else {
        setStatus('Not signed in. Please sign up or sign in.');
        setStep('signin');
      }
    } catch (error) {
      setStatus(`Auth check error: ${error}`);
    }
  }

  async function handleSignUp() {
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
        setStatus('✅ Account created! Now signing in...');
        await handleSignIn();
      }
    } catch (err) {
      setStatus(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
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

      setStatus('✅ Signed in! Checking profile...');
      setUser(data.user);
      
      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if profile exists and has PIN
      const { data: profile, error: profileError } = await sb
        .from('profiles')
        .select('pin_hash')
        .eq('user_id', data.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        setStatus('Profile not found. Moving to PIN setup...');
        setStep('pinsetup');
      } else if (profile?.pin_hash) {
        setStatus('✅ Profile exists with PIN. Ready to go!');
        setStep('dashboard');
      } else {
        setStatus('Profile exists but no PIN. Please set your PIN.');
        setStep('pinsetup');
      }
      
    } catch (err) {
      setStatus(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPin() {
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
      const pinHash = hashPin(pin);

      // Try simpler approach - just insert, let database handle conflicts
      const { data: profile, error } = await sb
        .from('profiles')
        .upsert({ 
          user_id: user.id, 
          first_name: user.email?.split('@')[0] || 'User',
          pin_hash: pinHash
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        setStatus(`Database error: ${error.message}. 

SOLUTION: Go to Supabase Dashboard → SQL Editor → Run:
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;`);
        setLoading(false);
        return;
      }

      setStatus('✅ PIN set successfully!');
      setStep('dashboard');
      
    } catch (error) {
      setStatus(`Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'signup' || step === 'signin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 card">
          <h1 className="text-xl font-semibold text-center">
            {step === 'signup' ? 'Create Account' : 'Sign In'}
          </h1>
          
          <div className="space-y-3">
            <input 
              className="input" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              type="email"
              required 
            />
            <input 
              className="input" 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
            />
            
            {status && (
              <div className={`text-sm p-2 rounded ${
                status.includes('✅') ? 'bg-green-100 text-green-700' :
                status.includes('error') ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {status}
              </div>
            )}
            
            <div className="space-y-2">
              <button 
                onClick={step === 'signup' ? handleSignUp : handleSignIn}
                className="btn btn-primary w-full" 
                disabled={loading}
              >
                {loading ? 'Working...' : (step === 'signup' ? 'Create Account' : 'Sign In')}
              </button>
              
              <button
                onClick={() => setStep(step === 'signup' ? 'signin' : 'signup')}
                className="btn btn-ghost w-full"
                disabled={loading}
              >
                {step === 'signup' ? 'Already have account? Sign In' : 'Need account? Sign Up'}
              </button>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-sm text-slate-600">
              Using test credentials by default
            </div>
            <a href="/auth/debug" className="text-blue-600 underline text-sm">
              Debug Page
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'pinsetup') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 card">
          <h1 className="text-xl font-semibold text-center">Set Your PIN</h1>
          
          <div className="space-y-3">
            <div className="text-sm text-green-600 text-center">
              ✅ Signed in as: {user?.email}
            </div>
            
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
                status.includes('error') ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {status}
              </div>
            )}
            
            <button 
              onClick={handleSetPin}
              className="btn btn-primary w-full" 
              disabled={loading}
            >
              {loading ? 'Setting PIN...' : 'Set PIN'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'dashboard') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 card">
          <h1 className="text-xl font-semibold text-center">✅ Authentication Complete!</h1>
          
          <div className="space-y-3 text-center">
            <div className="text-green-600">
              Signed in as: {user?.email}
            </div>
            <div className="text-green-600">
              PIN is set and ready!
            </div>
            
            <div className="space-y-2">
              <a href="/dashboard" className="btn btn-primary w-full block">
                Go to Dashboard
              </a>
              <button 
                onClick={() => {
                  sbClient().auth.signOut();
                  setStep('signin');
                  setUser(null);
                  setStatus('');
                }}
                className="btn btn-ghost w-full"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
