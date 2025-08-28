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

    // Fetch withdraw request
    const { data: withdrawRow, error: fetchErr } = await supabaseAdmin.from('withdraw_requests').select('*').eq('id', id).single()
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

    // If approving, ensure balance and debit
    if (status === 'approved') {
      const userId = withdrawRow.user_id
      const amountNum = Number(withdrawRow.amount || 0)
      const { data: acct, error: acctErr } = await supabaseAdmin.from('accounts').select('id, available_balance').eq('user_id', userId).limit(1).single()
      if (acctErr) return NextResponse.json({ error: acctErr.message }, { status: 500 })
      const available = Number(acct?.available_balance || 0)
      if (amountNum > available) return NextResponse.json({ error: 'insufficient_balance', message: 'Insufficient balance to approve withdrawal' }, { status: 400 })

      const newBalance = available - amountNum
      const { error: balErr } = await supabaseAdmin.from('accounts').update({ available_balance: newBalance }).eq('id', acct.id)
      if (balErr) return NextResponse.json({ error: balErr.message }, { status: 500 })

      // Insert a transaction record (debit)
      const txPayload = {
        user_id: userId,
        type: 'debit',
        amount: amountNum,
        currency: withdrawRow.currency || 'USD',
        status: 'completed',
        description: `Withdrawal processed (id: ${withdrawRow.id})`
      }
      await supabaseAdmin.from('transactions').insert([txPayload])
    }

    // Update withdraw request status
    const { data: updated, error: updErr } = await supabaseAdmin.from('withdraw_requests').update({ status, admin_note: note || null, processed_at: new Date().toISOString() }).eq('id', id).select().single()
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    // queue outbound email
    const emailPayload = {
      user_id: updated.user_id,
      subject: `Your withdrawal request has been ${status}`,
      body: `Hello, your withdrawal request for ${updated.amount} has been ${status}. ${note || ''}`,
      status: 'queued'
    }
    await supabaseAdmin.from('outbound_emails').insert([emailPayload])

    return NextResponse.json({ ok: true, item: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
