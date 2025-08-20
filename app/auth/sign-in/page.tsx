import { Suspense } from 'react';
import SignInClient from '@/components/auth/SignInClient';

export default function Page(){
  return (
    <Suspense fallback={<div/>}>
      <SignInClient />
    </Suspense>
  );
}
