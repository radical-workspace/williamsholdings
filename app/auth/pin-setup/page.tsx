import { Suspense } from 'react';
import PinSetupClient from '@/components/auth/PinSetupClient';

export default function Page(){
  return (
    <Suspense fallback={<div/>}>
      <PinSetupClient />
    </Suspense>
  );
}
