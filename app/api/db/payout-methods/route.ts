import { NextResponse } from 'next/server'
import { sbServerRW, supabaseAdmin } from '../../../../lib/supabase/server'

export async function GET() {
  try {
  if (!supabaseAdmin) return NextResponse.json({ items: [], warning: 'SUPABASE_SERVICE_ROLE_KEY not configured' })

  const sb = sbServerRW()
  const { data: sessionData } = await sb.auth.getSession()
  const userId = sessionData?.session?.user?.id
  if (!userId) return NextResponse.json({ items: [] })

  const { data, error } = await supabaseAdmin.from('payout_methods').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { methodCode, label, address, bankName, accountName, network } = body
    if (!methodCode) return NextResponse.json({ error: 'methodCode required' }, { status: 400 })

    const sb = sbServerRW()
    const { data: sessionData } = await sb.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) return NextResponse.json({ error: 'authentication required' }, { status: 401 })

    if (!supabaseAdmin) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

    const payload = {
      user_id: userId,
      method_code: methodCode,
      label: label || null,
      address: address || null,
      bank_name: bankName || null,
      account_name: accountName || null,
      network: network || null,
    }

    const { data, error } = await supabaseAdmin.from('payout_methods').insert([payload]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, item: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
