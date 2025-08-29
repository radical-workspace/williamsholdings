import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase/server'

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json({ items: [], warning: 'SUPABASE_SERVICE_ROLE_KEY not configured' })
    const { data, error } = await supabaseAdmin.from('withdraw_requests').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const items = data || []

    // Attach payout method details for requests that reference a payout_method_id
    const payoutIds = Array.from(new Set(items.map((it: any) => it.payout_method_id).filter(Boolean)))
    let payoutMap: Record<string, any> = {}
    if (payoutIds.length) {
      const { data: pm, error: pmErr } = await supabaseAdmin.from('payout_methods').select('*').in('id', payoutIds)
      if (!pmErr && pm) {
        payoutMap = Object.fromEntries(pm.map((p: any) => [String(p.id), p]))
      }
    }

    const enriched = items.map((it: any) => ({
      ...it,
      payout_method: it.payout_method_id ? (payoutMap[String(it.payout_method_id)] || null) : null,
    }))

    return NextResponse.json({ items: enriched })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
