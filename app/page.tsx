// app/page.tsx
import { redirect } from 'next/navigation';
import { sbServer } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  try {
    const sb = sbServer();
    const { data: { user }, error } = await sb.auth.getUser();
    
    // If there's an auth error or no user, redirect to sign-in
    if (error || !user) {
      redirect('/auth/sign-in');
    }

    const pinOk = cookies().get('pin_verified')?.value === 'true';
    if (!pinOk) redirect('/auth/pin?redirectedFrom=/dashboard');

    redirect('/dashboard');
  } catch (error) {
    // If Supabase connection fails, redirect to sign-in page
    console.error('Supabase connection error:', error);
    redirect('/auth/sign-in');
  }
}
