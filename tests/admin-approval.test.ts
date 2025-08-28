import { describe, it, expect, vi, beforeEach } from 'vitest'

// We'll mock the supabaseAdmin used by the helper
vi.mock('../lib/supabase/server', async () => {
  const mock = {
    from: vi.fn()
  }
  return { supabaseAdmin: mock }
})

import { supabaseAdmin } from '../lib/supabase/server'
import { handleDepositApproval, handleWithdrawApproval } from '../lib/admin/approval'

// Helper to create a chainable stub for .from(...).select(...).eq(...).single() or .update/.insert
// Helper to create a chainable select() -> eq() -> limit() -> single() structure
function makeSelectResult(data: any = null, error: any = null) {
  const single = vi.fn().mockResolvedValue({ data, error })
  const limit = vi.fn().mockReturnValue({ single })
  const eq = vi.fn().mockReturnValue({ limit, single })
  const select = vi.fn().mockReturnValue({ eq, single })
  return { select, eq, limit, single }
}

describe('admin approval helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('credits account and creates transaction on deposit approve', async () => {
    // setup: deposit row, account row
    const depositRow = { id: 'd1', user_id: 'u1', amount: '100', currency: 'USD', reference: 'REF123' }
    const acctRow = { id: 'a1', available_balance: 50 }

    // mock supabaseAdmin.from calls in sequence
    // 1. select deposit_requests -> depositRow
    // 2. select accounts -> acctRow
    // 3. update accounts -> success
    // 4. insert transactions -> success
    // 5. update deposit_requests -> updated row
    // 6. insert outbound_emails -> success

    const mockFrom = vi.fn((table: string) => {
      if (table === 'deposit_requests') {
  const sel = makeSelectResult(depositRow, null)
  const update = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { ...depositRow, status: 'approved' }, error: null }) }) }) })
  return { select: sel.select, update }
      }
      if (table === 'accounts') {
  const sel = makeSelectResult(acctRow, null)
  const update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })
  return { select: sel.select, update }
      }
      if (table === 'transactions' || table === 'outbound_emails') {
        return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
      }
      const sel = makeSelectResult(null, null)
      return { select: sel.select }
    })

    ;(supabaseAdmin as any).from = mockFrom

    const updated = await handleDepositApproval('d1', 'approve', 'ok')
    expect(updated.status).toBe('approved')
    // verify accounts update called
    expect(mockFrom).toHaveBeenCalledWith('accounts')
    expect(mockFrom).toHaveBeenCalledWith('transactions')
    expect(mockFrom).toHaveBeenCalledWith('outbound_emails')
  })

  it('debts account and creates transaction on withdraw approve', async () => {
    const withdrawRow = { id: 'w1', user_id: 'u1', amount: '30', currency: 'USD' }
    const acctRow = { id: 'a1', available_balance: 100 }

    const mockFrom = vi.fn((table: string) => {
      if (table === 'withdraw_requests') {
  const sel = makeSelectResult(withdrawRow, null)
  const update = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { ...withdrawRow, status: 'approved' }, error: null }) }) }) })
  return { select: sel.select, update }
      }
      if (table === 'accounts') {
  const sel = makeSelectResult(acctRow, null)
  const update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })
  return { select: sel.select, update }
      }
      if (table === 'transactions' || table === 'outbound_emails') {
        return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
      }
      const sel = makeSelectResult(null, null)
      return { select: sel.select }
    })

    ;(supabaseAdmin as any).from = mockFrom

    const updated = await handleWithdrawApproval('w1', 'approve', 'ok')
    expect(updated.status).toBe('approved')
    expect(mockFrom).toHaveBeenCalledWith('accounts')
    expect(mockFrom).toHaveBeenCalledWith('transactions')
    expect(mockFrom).toHaveBeenCalledWith('outbound_emails')
  })

  it('throws on withdraw approve when insufficient balance', async () => {
    const withdrawRow = { id: 'w2', user_id: 'u1', amount: '300', currency: 'USD' }
    const acctRow = { id: 'a1', available_balance: 100 }

    const mockFrom = vi.fn((table: string) => {
      if (table === 'withdraw_requests') {
  const sel = makeSelectResult(withdrawRow, null)
  const update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })
  return { select: sel.select, update }
      }
      if (table === 'accounts') {
        const sel = makeSelectResult(acctRow, null)
        return { select: sel.select }
      }
      if (table === 'outbound_emails') {
        return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
      }
      const sel = makeSelectResult(null, null)
      return { select: sel.select }
    })

    ;(supabaseAdmin as any).from = mockFrom

    await expect(async () => await (await import('../lib/admin/approval')).handleWithdrawApproval('w2', 'approve')).rejects.toThrow('insufficient_balance')
  })

  it('propagates DB errors during deposit approval', async () => {
    const depositRow = { id: 'd2', user_id: 'u2', amount: '50', currency: 'USD' }

    const mockFrom = vi.fn((table: string) => {
      if (table === 'deposit_requests') {
        return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: depositRow, error: null }) }), update: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }) }
      }
      return { select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }
    })

    ;(supabaseAdmin as any).from = mockFrom

    await expect(async () => await (await import('../lib/admin/approval')).handleDepositApproval('d2', 'approve')).rejects.toBeTruthy()
  })
})
