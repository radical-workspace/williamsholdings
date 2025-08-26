import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, action, note } = body
    if (!id || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 })
    if (!supabaseAdmin) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })

    const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : null
    if (!status) return NextResponse.json({ error: 'invalid action' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('deposit_requests').update({ status, admin_note: note || null, processed_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // queue outbound email
    const emailPayload = {
      user_id: data.user_id,
      subject: `Your deposit request has been ${status}`,
      body: `Hello, your deposit request for ${data.amount} has been ${status}. ${note || ''}`,
      status: 'queued'
    }
    await supabaseAdmin.from('outbound_emails').insert([emailPayload])

    return NextResponse.json({ ok: true, item: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
