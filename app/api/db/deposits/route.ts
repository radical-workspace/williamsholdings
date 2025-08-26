import { NextResponse } from 'next/server'
import { sbServerRW, supabaseAdmin } from '../../../../lib/supabase/server'

export async function GET() {
  try {
    const sb = sbServerRW()
    const { data: sessionData } = await sb.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) return NextResponse.json({ items: [] })

    if (!supabaseAdmin) return NextResponse.json({ items: [], warning: 'SUPABASE_SERVICE_ROLE_KEY not configured' })

    const { data, error } = await supabaseAdmin.from('deposit_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { amount, currency, source, note } = body
    if (!amount) return NextResponse.json({ error: 'amount required' }, { status: 400 })

    const sb = sbServerRW()
    const { data: sessionData } = await sb.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) return NextResponse.json({ error: 'authentication required' }, { status: 401 })

    if (!supabaseAdmin) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

    const payload = {
      user_id: userId,
      amount,
      currency: currency || 'USD',
      source: source || null,
      note: note || null,
      status: 'pending',
    }

    const { data, error } = await supabaseAdmin.from('deposit_requests').insert([payload]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, item: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
