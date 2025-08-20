import { Suspense } from 'react';
import PinClient from '@/components/auth/PinClient';

export default function Page(){
  return (
    <Suspense fallback={<div/>}>
      <PinClient />
    </Suspense>
  );
}
