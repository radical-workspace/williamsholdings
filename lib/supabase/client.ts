// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

let _c: ReturnType<typeof createBrowserClient> | null = null;

export function sbClient() {
  if (_c) return _c;
  // Read raw env values and defensively trim/strip surrounding quotes
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  const strip = (v: string) => v.trim().replace(/^['"]+|['"]+$/g, '');
  const url = strip(rawUrl);
  const key = strip(rawKey);

  if (!url || !key) throw new Error('Supabase env vars missing.');
  _c = createBrowserClient(url, key); // <-- stores session in cookies (what the server reads)
  return _c;
}

