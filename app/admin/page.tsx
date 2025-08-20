'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sbClient } from '@/lib/supabase/client';

export default function AdminHomePage() {
  const router = useRouter();

  useEffect(() => {
    async function decide() {
      try {
        const { data: { user } } = await sbClient().auth.getUser();
        if (user) router.push('/admin/dashboard');
        else router.push('/admin/login');
      } catch (e) {
        router.push('/admin/login');
      }
    }
    decide();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Redirecting to admin panel...</p>
      </div>
    </div>
  );
}
