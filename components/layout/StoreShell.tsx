'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';
import MiniCart from '@/components/layout/MiniCart';
import ConciergeWidget from '@/components/layout/ConciergeWidget';
import NavigationProgress from '@/components/ui/NavigationProgress';

export default function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isInvoice = pathname?.startsWith('/factura');
  const isMaintenance = pathname?.startsWith('/maintenance');

  if (isAdmin || isInvoice || isMaintenance) {
    // Si estamos en la sección de administración, factura oficial o página de mantenimiento, no se carga Header, Footer, CookieBanner ni MiniCart
    return <div className="min-h-screen bg-foeg-white text-foeg-black">{children}</div>;
  }

  return (
    <>
      <NavigationProgress />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
      <MiniCart />
      <ConciergeWidget />
    </>
  );
}
