import { NextResponse } from 'next/server'
import { sbServerRW, supabaseAdmin } from '../../../../lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, address, cardType, purchaseAmount } = body
    if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

    // if physical, require address
    if (cardType === 'physical' && !address) return NextResponse.json({ error: 'address required for physical card' }, { status: 400 })

    const sb = sbServerRW()
    const { data: sessionData } = await sb.auth.getSession()
    const userId = sessionData?.session?.user?.id

    if (!userId) return NextResponse.json({ error: 'authentication required' }, { status: 401 })

    if (!supabaseAdmin) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

    const payload: any = { user_id: userId, name, status: 'pending' }
    if (cardType) payload.card_type = cardType
    if (purchaseAmount !== undefined) payload.purchase_amount = purchaseAmount
    if (address) payload.address = address

    // Insert a card request record.
    const { data, error } = await supabaseAdmin.from('card_requests').insert([payload]).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, request: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
