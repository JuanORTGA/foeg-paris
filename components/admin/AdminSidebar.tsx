'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Shirt,
  Tag,
  Users,
  BookOpen,
  Settings,
  FileText,
  Star,
  Mail,
  Image as ImageIcon,
  Truck,
  CreditCard,
  Globe,
  Store,
  LogOut,
  X,
  PenTool,
  Ticket,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import AnimatedBirdLogo from '@/components/ui/AnimatedBirdLogo';

interface AdminSidebarProps {
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const navigation = [
    { name: t('admin.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('admin.studio') || 'Studio', href: '/admin/cms', icon: PenTool },
    { name: t('admin.orders'), href: '/admin/pedidos', icon: Shirt },
    { name: t('admin.products'), href: '/admin/productos', icon: Tag },
    { name: t('admin.media'), href: '/admin/media', icon: ImageIcon },
    { name: t('admin.shipping'), href: '/admin/envios', icon: Truck },
    { name: t('admin.payments'), href: '/admin/pagos', icon: CreditCard },
    { name: language === 'es' ? 'Cupones' : language === 'en' ? 'Coupons' : 'Codes Privilèges', href: '/admin/cupones', icon: Ticket },
    { name: t('admin.boutiques') || 'Boutiques', href: '/admin/boutiques', icon: Store },
    { name: t('admin.clients'), href: '/admin/clientes', icon: Users },
    { name: t('admin.reviews'), href: '/admin/resenas', icon: Star },
    { name: t('admin.newsletter'), href: '/admin/newsletter', icon: Mail },
    { name: t('admin.journal'), href: '/admin/journal', icon: BookOpen },
    { name: t('admin.seo'), href: '/admin/seo', icon: Globe },
    { name: t('admin.settings'), href: '/admin/ajustes', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      localStorage.removeItem('foeg_admin_logged');
      sessionStorage.removeItem('foeg_admin_verified');
    } catch {}
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Contenedor del Sidebar con animación Hover estilo Instagram */}
      <aside
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className={`fixed left-0 top-0 h-[100dvh] z-50 bg-foeg-navy text-foeg-white flex flex-col justify-between border-none shadow-2xl transition-all duration-300 ease-in-out select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden no-scrollbar pb-[env(safe-area-inset-bottom)] ${
          /* En móviles es un Drawer desplegable; en desktop se ajusta por hover */
          isMobileOpen ? 'translate-x-0 w-72 max-w-[85vw]' : '-translate-x-full md:translate-x-0'
        } ${isExpanded ? 'md:w-64' : 'md:w-20'}`}
        aria-label="Sidebar d'administration"
      >
        <div
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Logo FOEG Admin con el Pájaro de la Marca */}
          <div
            className={`p-5 md:p-6 border-b border-white/10 flex items-center transition-all duration-300 ${
              isExpanded ? 'justify-between' : 'md:justify-center justify-between'
            }`}
          >
            <Link
              href="/admin"
              prefetch={true}
              onClick={onCloseMobile}
              className="focus:outline-none flex items-center group min-w-0"
              title={!isExpanded ? 'FOEG Administration' : undefined}
            >
              <div className="shrink-0 flex items-center justify-center">
                <AnimatedBirdLogo size={36} />
              </div>
              <div
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isExpanded || isMobileOpen ? 'opacity-100 max-w-xs ml-3.5' : 'opacity-0 max-w-0 md:w-0'
                }`}
              >
                <span className="font-serif text-xl tracking-[0.22em] text-white uppercase block leading-none">
                  FOEG
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-white/60 block mt-1 font-light">
                  Administration
                </span>
              </div>
            </Link>

            {/* Botón de cerrar en móvil */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1 text-white/70 hover:text-white"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Menú de Navegación Lateral con Estados Activos */}
          <nav className="p-3 md:p-3 space-y-1" aria-label="Navigation administration">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={onCloseMobile}
                  title={!isExpanded ? item.name : undefined}
                  className={`group relative flex items-center text-xs uppercase tracking-[0.2em] transition-all duration-200 rounded-none h-11 ${
                    isExpanded ? 'px-4 justify-start space-x-3.5' : 'md:px-0 md:justify-center px-4 justify-start space-x-3.5'
                  } ${
                    isActive
                      ? 'bg-white/15 text-white font-medium border-l-2 border-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5 font-light'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.2} />
                  <span
                    className={`whitespace-nowrap transition-all duration-200 ${
                      isExpanded || isMobileOpen
                        ? 'opacity-100 max-w-xs delay-75 block'
                        : 'opacity-0 max-w-0 md:w-0 md:hidden overflow-hidden'
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* =========================================================================
            BLOQUE INFERIOR (PERFIL DE ADMINISTRADOR ADAPTABLE)
        ========================================================================= */}
        <div className="p-3 md:p-4 border-t border-white/10 bg-foeg-navy shrink-0">
          {/* Bloque de Perfil de Administrador (Lujo Silencioso Adaptable) */}
          <div
            className={`flex items-center transition-all duration-200 ${
              isExpanded ? 'justify-between px-1' : 'md:justify-center justify-between px-1'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              {/* Avatar circular con monograma FOEG */}
              <div
                className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white text-xs font-serif font-medium shrink-0 shadow-sm"
                title={!isExpanded ? t('admin.direction') : undefined}
              >
                F
              </div>

              {/* Textos del Administrador (Visibles al expandir o en móvil) */}
              <div
                className={`truncate transition-all duration-200 ${
                  isExpanded || isMobileOpen
                    ? 'opacity-100 max-w-xs'
                    : 'opacity-0 max-w-0 md:w-0 md:hidden overflow-hidden'
                }`}
              >
                <span className="text-xs uppercase tracking-[0.2em] text-white font-medium block truncate">
                  {t('admin.direction')}
                </span>
                <span className="text-[10px] text-white/50 tracking-wider font-light block truncate">
                  Atelier Paris
                </span>
              </div>
            </div>

            {/* Botón minimalista de Déconnexion */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={handleLogout}
              className={`p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-none transition-colors cursor-pointer shrink-0 ${
                isExpanded ? 'inline-block' : 'md:hidden inline-block'
              }`}
              title={t('admin.logout')}
              aria-label={t('admin.logout')}
            >
              <LogOut className="w-4 h-4" strokeWidth={1} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
