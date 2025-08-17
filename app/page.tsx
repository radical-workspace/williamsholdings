// app/page.tsx
import { redirect } from 'next/navigation';
import { sbServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  const sb = sbServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  const pinOk = cookies().get('pin_verified')?.value === 'true';
  if (!pinOk) redirect('/auth/pin?redirectedFrom=/dashboard');

  redirect('/dashboard');
}
