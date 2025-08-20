"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sbClient } from '@/lib/supabase/client';

export default function useAdminAuth(redirectIfMissing: boolean = true) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const { data: { user } } = await sbClient().auth.getUser();
        if (!user) {
          if (redirectIfMissing) router.push('/admin/login');
        }
      } catch (e) {
        if (redirectIfMissing) router.push('/admin/login');
      } finally {
        if (mounted) setChecking(false);
      }
    }
    check();
    return () => { mounted = false; };
  }, [redirectIfMissing, router]);

  return { checking };
}
