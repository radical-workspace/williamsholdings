import { NextResponse } from 'next/server'
import { handleDepositApproval } from '../../../../../lib/admin/approval'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, action, note } = body
    if (!id || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 })

    const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : null
    if (!status) return NextResponse.json({ error: 'invalid action' }, { status: 400 })

    const updated = await handleDepositApproval(id, action, note)
    return NextResponse.json({ ok: true, item: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
