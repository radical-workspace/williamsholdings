import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase/server'

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ requests: [], warning: 'SUPABASE_SERVICE_ROLE_KEY not configured' })
  // Return all card requests (admin-only in production; this endpoint is not protected here)
  const { data, error } = await supabaseAdmin.from('card_requests').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ requests: data })
}
