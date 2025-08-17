// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

let _c: ReturnType<typeof createBrowserClient> | null = null;

export function sbClient() {
  if (_c) return _c;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // fallback during migration
  if (!url || !key) throw new Error('Supabase env vars missing.');
  _c = createBrowserClient(url, key); // <-- stores session in cookies (what the server reads)
  return _c;
}
