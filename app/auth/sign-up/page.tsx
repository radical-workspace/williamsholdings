import { Suspense } from 'react';
import SignUpClient from '@/components/auth/SignUpClient';

export default function Page(){
  return (
    <Suspense fallback={<div/>}>
      <SignUpClient />
    </Suspense>
  );
}
