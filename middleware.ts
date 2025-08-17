import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { nextUrl, headers, cookies } = req;
  const p = nextUrl.pathname;

  // Let auth/api/static through
  if (p.startsWith('/auth') || p.startsWith('/api') || p.startsWith('/_next') || p === '/favicon.ico') {
    return NextResponse.next();
  }

  // Allow v0/usercontent previews
  const host = headers.get('host') || '';
  if (host.includes('v0.app') || host.includes('usercontent.net')) return NextResponse.next();

  // Supabase can set any of these cookie names
  const names = cookies.getAll().map(c => c.name);
  const hasSession = names.some(n =>
    n === 'sb-access-token' ||
    n === 'sb-refresh-token' ||
    n === 'supabase-auth-token' ||     // older helpers
    /sb-.*-auth-token/.test(n)         // project-scoped cookie
  );

  if (!hasSession) {
    const to = new URL('/auth/sign-in', nextUrl.origin);
    to.searchParams.set('redirectedFrom', p);
    return NextResponse.redirect(to);
  }

  const pinOK = cookies.get('pin_verified')?.value === 'true';
  if (!pinOK) {
    const to = new URL('/auth/pin', nextUrl.origin);
    to.searchParams.set('redirectedFrom', p);
    return NextResponse.redirect(to);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\\.(?:png|jpg|svg|ico|css|js|map|txt)).*)'],
};
