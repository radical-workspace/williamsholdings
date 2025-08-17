import { NextResponse } from 'next/server';
import { sbServer } from '@/lib/supabase/server';
import * as crypto from 'crypto';
function hash(pin:string){ return crypto.createHash('sha256').update('salt'+pin).digest('hex'); }
export async function POST(req:Request){
  const { pin } = await req.json();
  if(!pin || !/^\d{6}$/.test(pin)) return NextResponse.json({ error:'Invalid PIN' }, { status:400 });
  const sb = sbServer(); const { data:{ user } } = await sb.auth.getUser();
  if(!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  const { error } = await sb.from('profiles').update({ pin_hash: hash(pin) }).eq('user_id', user.id);
  if(error) return NextResponse.json({ error: error.message }, { status:400 });
  return NextResponse.json({ ok:true });
}
