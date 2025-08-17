import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sbServer } from '@/lib/supabase/server';
import * as crypto from 'crypto';
function hash(pin:string){ return crypto.createHash('sha256').update('salt'+pin).digest('hex'); }
export async function POST(req:Request){
  const { pin } = await req.json();
  if(!pin || !/^\d{6}$/.test(pin)) return NextResponse.json({ error:'Invalid PIN' }, { status:400 });
  const sb = sbServer(); const { data:{ user } } = await sb.auth.getUser();
  if(!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  const { data:prof, error } = await sb.from('profiles').select('pin_hash').eq('user_id', user.id).single();
  if(error) return NextResponse.json({ error: error.message }, { status:400 });
  if(!prof?.pin_hash) return NextResponse.json({ error:'PIN not set' }, { status:400 });
  if(prof.pin_hash !== hash(pin)) return NextResponse.json({ error:'Incorrect PIN' }, { status:400 });
  const isProd = process.env.NODE_ENV === 'production';
  cookies().set('pin_verified','true',{ httpOnly:true, secure:isProd, sameSite:'lax', path:'/', maxAge:60*60*8 });
  return NextResponse.json({ ok:true });
}
