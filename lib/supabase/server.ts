// lib/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// server-only (do NOT expose SUPABASE_SERVICE_ROLE_KEY to client)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY) : null;

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Use this in Server Components (RSC) — read-only cookies (no set/remove). */
export function sbServer() {
  const c = cookies();
  return createServerClient(URL, KEY, {
    cookies: ({
      get: (name: string) => c.get(name)?.value, // ✅ allowed in RSC
    } as unknown) as any,
  });
}

/** Use ONLY in Route Handlers or Server Actions if you need to WRITE cookies. */
export function sbServerRW() {
  const c = cookies();
  return createServerClient(URL, KEY, {
    cookies: ({
      get: (name: string) => c.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => c.set({ name, value, ...options }),
      remove: (name: string, options: CookieOptions) => c.set({ name, value: '', ...options, maxAge: 0 }),
    } as unknown) as any,
  });
}
