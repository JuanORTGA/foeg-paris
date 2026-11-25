import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true';
  const { pathname } = request.nextUrl;

  if (isMaintenance) {
    // Permet l'accès exclusif aux routes d'administration, API, maintenance et fichiers statiques
    const isExcluded =
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/maintenance') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/uploads') ||
      pathname.startsWith('/icons') ||
      pathname.includes('.'); // assets directes (favicon.ico, images, polices)

    if (!isExcluded) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
