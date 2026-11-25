import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true';
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  // Identificar si el usuario tiene rol de administrador
  const isAdminUser = request.auth?.user?.role === 'ADMIN';

  // Identificar si la solicitud viene por el dominio/subdominio de administración
  const isAdminDomain = host.startsWith('admin.') || host.startsWith('admin-');

  // Separación de Enlaces (Tienda vs Admin) en Producción
  if (!isLocalhost) {
    if (isAdminDomain) {
      // En el dominio de administración:
      // Si entra a la raíz '/', redirigir a /admin si está logueado, o a /admin/login si no lo está
      if (pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = isAdminUser ? '/admin' : '/admin/login';
        return NextResponse.redirect(url);
      }
    } else {
      // En el dominio público de la tienda:
      // Si un cliente intenta acceder a cualquier ruta /admin, proteger la tienda enviándolo al inicio
      if (pathname.startsWith('/admin')) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }
  }

  // =========================================================================
  // PROTECCIÓN OBLIGATORIA DEL PANEL DE ADMINISTRACIÓN
  // =========================================================================
  // Si entra a /admin o cualquier sub-ruta (excepto /admin/login) y no es ADMIN -> Login obligatorio
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAdminUser) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // Si ya es ADMIN y visita /admin/login -> ir directo al panel
  if (pathname === '/admin/login' && isAdminUser) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
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
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
