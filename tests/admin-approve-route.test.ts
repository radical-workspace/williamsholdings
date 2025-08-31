import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the approval handlers used by the route to avoid DB dependency
vi.mock('../lib/admin/approval', async () => {
  return {
    handleDepositApproval: vi.fn().mockResolvedValue({ id: 'd1', status: 'approved' }),
    handleWithdrawApproval: vi.fn().mockResolvedValue({ id: 'w1', status: 'approved' })
  }
})

import { POST as depositPOST } from '../app/api/admin/deposits/approve/route'
import { POST as withdrawPOST } from '../app/api/admin/withdraws/approve/route'

function makeRequest(body: any) {
  return new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}

describe('admin approve routes', () => {
  it('deposit approve route returns updated', async () => {
    const req = makeRequest({ id: 'd1', action: 'approve' })
    const res = await depositPOST(req as any)
    const j = await res.json()
    expect(j.ok).toBeTruthy()
    expect(j.updated.status).toBe('approved')
  })

  it('withdraw approve route returns updated', async () => {
    const req = makeRequest({ id: 'w1', action: 'approve' })
    const res = await withdrawPOST(req as any)
    const j = await res.json()
    expect(j.ok).toBeTruthy()
    expect(j.updated.status).toBe('approved')
  })
})
