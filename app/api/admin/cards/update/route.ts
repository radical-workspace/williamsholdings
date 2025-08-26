import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase/server'

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
    const { id, action } = await req.json()
    if (!id || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 })
    if (!['approve','reject'].includes(action)) return NextResponse.json({ error: 'invalid action' }, { status: 400 })

    const status = action === 'approve' ? 'approved' : 'rejected'
  const { data, error } = await supabaseAdmin.from('card_requests').update({ status }).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Queue an outbound email to notify user (fetch user's email)
  const { data: user } = await supabaseAdmin.from('profiles').select('email').eq('user_id', data.user_id).single()
    if (user?.email) {
      const subject = action === 'approve' ? 'Your WilliamsHoldings Visa is approved' : 'Your WilliamsHoldings Visa application'
      let body = action === 'approve' ? `Hi, your card request (id: ${id}) was approved.` : `Hi, your card request (id: ${id}) was not approved.`
      if (data?.card_type) body += `\nCard type: ${data.card_type}`
      if (data?.purchase_amount) body += `\nPurchase amount: ${data.purchase_amount}`
      await supabaseAdmin.from('outbound_emails').insert([{ to_email: user.email, subject, body }])
    }

    return NextResponse.json({ ok: true, request: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
