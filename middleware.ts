import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true';
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  // Identificar si la solicitud viene por el dominio/subdominio de administración
  const isAdminDomain = host.startsWith('admin.') || host.startsWith('admin-');

  // Separación de Enlaces (Tienda vs Admin) en Producción
  if (!isLocalhost) {
    if (isAdminDomain) {
      // En el dominio de administración:
      // Si entra a la raíz '/', dirigir directo al panel de administración
      if (pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }
    } else {
      // En el dominio público de la tienda:
      // Si un cliente intenta acceder a /admin, proteger la tienda enviándolo al inicio
      if (pathname.startsWith('/admin')) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }
  }

  // Modo Mantenimiento
  if (isMaintenance) {
    const isExcluded =
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/maintenance') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/uploads') ||
      pathname.startsWith('/icons') ||
      pathname.includes('.');

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
