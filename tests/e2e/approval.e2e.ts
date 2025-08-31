import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// E2E test: only run when SUPABASE_SERVICE_ROLE_KEY is present and TEST_E2E=1
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !SERVICE || process.env.TEST_E2E !== '1') {
  console.warn('Skipping E2E approval test; set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and TEST_E2E=1 to run')
  process.exit(0)
}

const supabase = createClient(URL, SERVICE)

describe('E2E approval flow (smoke)', () => {
  it('creates test deposit and approves it', async () => {
    // create test user profile and account
    const userRes = await supabase.from('profiles').insert([{ id: '00000000-0000-0000-0000-000000000001', email: 'e2e+test@example.com' }])
    // create account
    await supabase.from('accounts').insert([{ user_id: '00000000-0000-0000-0000-000000000001', available_balance: 0 }])
    // create deposit request
    const dep = { user_id: '00000000-0000-0000-0000-000000000001', amount: 42, currency: 'USD', status: 'pending' }
    const { data: drow } = await supabase.from('deposit_requests').insert([dep]).select().single()
    // call admin approve route on local server
    const res = await fetch('http://localhost:3000/api/admin/deposits/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: drow.id, action: 'approve' }) })
    const j = await res.json()
    expect(res.ok).toBeTruthy()
    // verify account updated
    const { data: acct } = await supabase.from('accounts').select('*').eq('user_id', dep.user_id).single()
    expect(Number(acct.available_balance)).toBeGreaterThanOrEqual(42)
  })
})
