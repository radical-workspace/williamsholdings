import { supabaseAdmin } from '../supabase/server'

export type ApprovalAction = 'approve' | 'reject'

export async function handleDepositApproval(id: string, action: ApprovalAction, note?: string) {
  if (!supabaseAdmin) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
  const status = action === 'approve' ? 'approved' : 'rejected'

  // fetch deposit
  const { data: depositRow, error: fetchErr } = await supabaseAdmin.from('deposit_requests').select('*').eq('id', id).single()
  if (fetchErr) throw fetchErr

  // if approve: credit account and insert transaction
  if (status === 'approved') {
    const userId = depositRow.user_id
    const amountNum = Number(depositRow.amount || 0)
    const { data: acct, error: acctErr } = await supabaseAdmin.from('accounts').select('id, available_balance').eq('user_id', userId).limit(1).single()
    if (acctErr) throw acctErr
    const newBalance = (Number(acct.available_balance || 0) + amountNum)
    const { error: balErr } = await supabaseAdmin.from('accounts').update({ available_balance: newBalance }).eq('id', acct.id)
    if (balErr) throw balErr

    const txPayload = {
      user_id: userId,
      type: 'credit',
      amount: amountNum,
      currency: depositRow.currency || 'USD',
      status: 'completed',
      description: `Deposit approved (ref: ${depositRow.reference || depositRow.id})`
    }
    await supabaseAdmin.from('transactions').insert([txPayload])
  }

  // update deposit request
  const { data: updated, error: updErr } = await supabaseAdmin.from('deposit_requests').update({ status, admin_note: note || null, processed_at: new Date().toISOString() }).eq('id', id).select().single()
  if (updErr) throw updErr

  // queue email
  const emailPayload = {
    user_id: updated.user_id,
    subject: `Your deposit request has been ${status}`,
    body: `Hello, your deposit request for ${updated.amount} has been ${status}. ${note || ''}`,
    status: 'queued'
  }
  await supabaseAdmin.from('outbound_emails').insert([emailPayload])

  return updated
}

export async function handleWithdrawApproval(id: string, action: ApprovalAction, note?: string) {
  if (!supabaseAdmin) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
  const status = action === 'approve' ? 'approved' : 'rejected'

  // fetch withdraw
  const { data: withdrawRow, error: fetchErr } = await supabaseAdmin.from('withdraw_requests').select('*').eq('id', id).single()
  if (fetchErr) throw fetchErr

  if (status === 'approved') {
    const userId = withdrawRow.user_id
    const amountNum = Number(withdrawRow.amount || 0)
    const { data: acct, error: acctErr } = await supabaseAdmin.from('accounts').select('id, available_balance').eq('user_id', userId).limit(1).single()
    if (acctErr) throw acctErr
    const available = Number(acct?.available_balance || 0)
    if (amountNum > available) throw new Error('insufficient_balance')
    const newBalance = available - amountNum
    const { error: balErr } = await supabaseAdmin.from('accounts').update({ available_balance: newBalance }).eq('id', acct.id)
    if (balErr) throw balErr

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

  const { data: updated, error: updErr } = await supabaseAdmin.from('withdraw_requests').update({ status, admin_note: note || null, processed_at: new Date().toISOString() }).eq('id', id).select().single()
  if (updErr) throw updErr

  const emailPayload = {
    user_id: updated.user_id,
    subject: `Your withdrawal request has been ${status}`,
    body: `Hello, your withdrawal request for ${updated.amount} has been ${status}. ${note || ''}`,
    status: 'queued'
  }
  await supabaseAdmin.from('outbound_emails').insert([emailPayload])

  return updated
}
