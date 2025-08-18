import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import * as crypto from 'crypto';

function hash(pin: string) { 
  return crypto.createHash('sha256').update('salt' + pin).digest('hex'); 
}

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    if (!pin || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('Auth error:', authError?.message || 'No user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('pin_hash')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.log('Profile query error:', profileError);
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({ error: 'PIN not set' }, { status: 400 });
      }
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (!profile?.pin_hash) {
      return NextResponse.json({ error: 'PIN not set' }, { status: 400 });
    }

    if (profile.pin_hash !== hash(pin)) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 400 });
    }

    const isProd = process.env.NODE_ENV === 'production';
    cookieStore.set('pin_verified', 'true', { 
      httpOnly: true, 
      secure: isProd, 
      sameSite: 'lax', 
      path: '/', 
      maxAge: 60 * 60 * 8 
    });

    console.log('PIN verified successfully');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
