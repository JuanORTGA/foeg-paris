'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileBottomNav from '@/components/admin/AdminMobileBottomNav';
import PageLoader from '@/components/ui/PageLoader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Si es la página de Login o el CMS Visual WYSIWYG de pantalla completa, no renderizamos el Sidebar ni el AdminHeader
  if (pathname?.startsWith('/admin/login') || pathname?.startsWith('/admin/cms')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-foeg-white text-foeg-black relative flex w-full overflow-x-hidden">

      {/* =========================================================================
          BARRA LATERAL IZQUIERDA (HOVER SIDEBAR ESTILO INSTAGRAM)
      ========================================================================= */}
      <AdminSidebar
        isExpanded={isSidebarExpanded}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* =========================================================================
          CONTENIDO DEL ADMIN (CON MARGEN DINÁMICO QUE SE EMPUJA AL EXPANDIR)
      ========================================================================= */}
      <div
        className={`flex-1 flex flex-col min-w-0 w-full overflow-x-hidden transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'
        } ml-0`}
      >
        <AdminHeader onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 bg-foeg-white p-3.5 sm:p-8 lg:p-14 w-full min-w-0 overflow-x-hidden pb-20 md:pb-14">
          <div className="max-w-6xl mx-auto w-full min-w-0">{children}</div>
        </main>
      </div>

      {/* Barra de Navegación Inferior Móvil Fija */}
      <AdminMobileBottomNav onOpenFullMenu={() => setIsMobileMenuOpen(true)} />
    </div>
  );
}
