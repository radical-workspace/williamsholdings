import { NextResponse } from 'next/server'
import { handleDepositApproval } from '../../../../../lib/admin/approval'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, action, note } = body
    if (!id || !action) return NextResponse.json({ error: 'missing id or action' }, { status: 400 })
    const updated = await handleDepositApproval(id, action, note)
    return NextResponse.json({ ok: true, updated })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
