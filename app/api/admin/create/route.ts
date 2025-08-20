import { NextResponse } from 'next/server';

// Server-side admin creation endpoint
// Requirements:
// - Set SUPABASE_SERVICE_ROLE_KEY in environment (service role key)
// - Caller must provide Authorization: Bearer <access_token> header (their user session)

export async function POST(req: Request) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });

    // Verify caller session: call Supabase auth user endpoint with the caller's token
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: { 'Authorization': authHeader }
    });

    if (!userRes.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const caller = await userRes.json();
    if (!caller?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Ensure caller is admin by checking profiles via service role
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${caller.id}&select=role`, {
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });

    if (!profileRes.ok) return NextResponse.json({ error: 'Failed to validate caller role' }, { status: 403 });
    const profiles = await profileRes.json();
    if (!Array.isArray(profiles) || profiles.length === 0 || profiles[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: admin role required' }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, firstName = 'Admin', lastName = 'User' } = body;
    if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });

    // Create the user via Supabase Admin API
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ email, password })
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      return NextResponse.json({ error: 'Failed to create user', detail: text }, { status: 500 });
    }

    const newUser = await createRes.json();
    const newUserId = newUser?.id;
    if (!newUserId) return NextResponse.json({ error: 'User created but missing id' }, { status: 500 });

    // Insert profile row using service role
    const profileBody = {
      id: newUserId,
      user_id: newUserId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: 'admin',
      created_at: new Date().toISOString()
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(profileBody)
    });

    if (!insertRes.ok) {
      const text = await insertRes.text();
      return NextResponse.json({ error: 'Failed to create profile', detail: text }, { status: 500 });
    }

    const createdProfile = await insertRes.json();
    return NextResponse.json({ ok: true, user: newUser, profile: createdProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
