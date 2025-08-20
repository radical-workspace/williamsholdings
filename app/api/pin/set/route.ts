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

    // First check if profile exists, if not create it
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('Creating profile for user:', user.id);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({ 
          user_id: user.id, 
          first_name: user.email?.split('@')[0] || 'User',
          pin_hash: hash(pin)
        })
        .select()
        .single();

      if (createError) {
        console.log('Profile creation error:', createError);
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
      
      console.log('Profile created successfully');
      return NextResponse.json({ ok: true });
    } else if (profileError) {
      console.log('Profile query error:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // Profile exists, update PIN
    console.log('Updating PIN for existing profile');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ pin_hash: hash(pin) })
      .eq('user_id', user.id);

    if (updateError) {
      console.log('PIN update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    console.log('PIN set successfully');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
