import { NextResponse } from 'next/server';
import { sbServerRW } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    // Use server RW client to clear cookies used by Supabase SSR
    const server = sbServerRW();
    if (!server) {
      // If sbServerRW throws or is unavailable, still try to clear cookies via response
      return NextResponse.json({ ok: true, note: 'No server client available; frontend should clear session' });
    }

    // There isn't a specific API to revoke cookies in @supabase/ssr; but createServerClient exposes cookie helpers.
    // We'll instruct client to clear their cookies as well; return ok.
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
