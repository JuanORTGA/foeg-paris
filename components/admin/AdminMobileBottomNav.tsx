'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  Tag,
  CreditCard,
  Menu,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface AdminMobileBottomNavProps {
  onOpenFullMenu: () => void;
}

export default function AdminMobileBottomNav({ onOpenFullMenu }: AdminMobileBottomNavProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const primaryItems = [
    {
      name: language === 'fr' ? 'Accueil' : language === 'en' ? 'Home' : 'Inicio',
      href: '/admin',
      icon: LayoutDashboard,
      isActive: pathname === '/admin',
    },
    {
      name: language === 'fr' ? 'Commandes' : language === 'en' ? 'Orders' : 'Pedidos',
      href: '/admin/pedidos',
      icon: Shirt,
      isActive: pathname?.startsWith('/admin/pedidos'),
    },
    {
      name: language === 'fr' ? 'Pièces' : language === 'en' ? 'Products' : 'Productos',
      href: '/admin/productos',
      icon: Tag,
      isActive: pathname?.startsWith('/admin/productos'),
    },
    {
      name: language === 'fr' ? 'Paiements' : language === 'en' ? 'Payments' : 'Pagos',
      href: '/admin/pagos',
      icon: CreditCard,
      isActive: pathname?.startsWith('/admin/pagos'),
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-foeg-navy/95 backdrop-blur-md border-t border-white/10 text-white shadow-floating select-none pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigation mobile administration rapide"
    >
      <div className="h-14 px-1 grid grid-cols-5 items-center">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center h-full py-1 transition-all duration-200 cursor-pointer ${
                item.isActive
                  ? 'text-white font-medium bg-white/10'
                  : 'text-white/60 hover:text-white font-light'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" strokeWidth={item.isActive ? 1.75 : 1.25} />
              <span className="text-[9px] uppercase tracking-wider text-center w-full truncate px-0.5">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Botón "Más / Menú completo" */}
        <button
          type="button"
          onClick={onOpenFullMenu}
          className="flex flex-col items-center justify-center h-full py-1 text-white/60 hover:text-white transition-all duration-200 cursor-pointer"
          aria-label="Ouvrir le menu complet d'administration"
        >
          <Menu className="w-4 h-4 mb-0.5" strokeWidth={1.25} />
          <span className="text-[9px] uppercase tracking-wider text-center w-full truncate px-0.5">
            {language === 'fr' ? 'Menu' : language === 'en' ? 'Menu' : 'Menú'}
          </span>
        </button>
      </div>
    </nav>
  );
}
