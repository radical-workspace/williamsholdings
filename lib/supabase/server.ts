// lib/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Use this in Server Components (RSC) — read-only cookies (no set/remove). */
export function sbServer() {
  const c = cookies();
  return createServerClient(URL, KEY, {
    cookies: {
      get: (name: string) => c.get(name)?.value, // ✅ allowed in RSC
    },
  });
}

/** Use ONLY in Route Handlers or Server Actions if you need to WRITE cookies. */
export function sbServerRW() {
  const c = cookies();
  return createServerClient(URL, KEY, {
    cookies: {
      get: (n: string) => c.get(n)?.value,
      set: (n: string, v: string, o: CookieOptions) => c.set({ name: n, value: v, ...o }),
      remove: (n: string, o: CookieOptions) => c.set({ name: n, value: '', ...o, maxAge: 0 }),
    },
  });
}
