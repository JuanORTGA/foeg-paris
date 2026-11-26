'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, Heart, MessageCircle, Instagram, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/lib/cart-context';
import { useLanguage, Language } from '@/lib/language-context';
import { useCurrency, Currency } from '@/lib/currency-context';
import { useWishlist } from '@/lib/wishlist-context';
import SearchOverlay from '@/components/layout/SearchOverlay';
import AnimatedBirdLogo from '@/components/ui/AnimatedBirdLogo';
import UserMenu from '@/components/layout/UserMenu';
import { getGlobalSettings } from '@/lib/settings-actions';

export default function Header() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const { openCart, totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { wishlistCount } = useWishlist();
  const [headerSettings, setHeaderSettings] = useState({
    instagram: 'https://www.instagram.com/foegparis/',
    whatsapp: '+33 6 12 34 56 78',
    email: 'concierge@foeg-paris.com',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    getGlobalSettings()
      .then((s) => {
        setHeaderSettings({
          instagram: s.social_instagram || 'https://www.instagram.com/foegparis/',
          whatsapp: s.contact_whatsapp || '+33 6 12 34 56 78',
          email: s.contact_email || 'concierge@foeg-paris.com',
        });
      })
      .catch(() => {});
  }, []);

  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    setIsUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Bloquear el scroll de fondo en móviles cuando el menú está desplegado
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // En cualquier módulo (/mujer, /hombre, etc.) o al hacer scroll en Home, usamos el diseño claro
  const isLight = !isHome || isScrolled;
  const textClass = isLight
    ? 'text-foeg-black'
    : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]';
  const hoverClass = isLight ? 'hover:text-foeg-navy' : 'hover:text-white/80';

  return (
    <header
      suppressHydrationWarning
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ease-out border-none ${
        isLight
          ? 'bg-foeg-white/95 backdrop-blur-md shadow-subtle py-0'
          : 'bg-gradient-to-b from-black/40 via-black/15 to-transparent py-1.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-16 sm:h-20 md:h-24 grid grid-cols-2 md:grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
        {/* IZQUIERDA: Marca / Logo con el Pájaro Animado de FOEG */}
        <div className="flex items-center justify-start">
          <Link
            href="/"
            prefetch={true}
            className="group inline-flex items-center space-x-2 sm:space-x-3 focus:outline-none shrink-0"
            aria-label="FOEG - Accueil"
          >
            <AnimatedBirdLogo size={28} className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 shrink-0" />
            <span
              className={`font-serif text-xl sm:text-2xl md:text-3xl font-normal tracking-[0.2em] md:tracking-[0.28em] uppercase transition-colors duration-300 ${textClass} group-hover:opacity-75 shrink-0`}
            >
              FOEG
            </span>
          </Link>
        </div>

        {/* CENTRO: Navegación Principal con los títulos multi-idioma */}
        <nav
          className="hidden md:flex items-center justify-center space-x-6 lg:space-x-8 xl:space-x-10"
          aria-label="Navigation principale"
        >
          {/* Homme con Mega-Menú Desplegable */}
          <div className="relative group py-4">
            <Link
              href="/hombre"
              prefetch={true}
              className={`text-[13px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 py-1 ${textClass} ${hoverClass}`}
            >
              {t('nav.men')}
            </Link>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 ease-out z-50">
              <div className="bg-foeg-white border border-foeg-border text-foeg-black shadow-floating py-4 px-6 min-w-[210px] text-left">
                <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted block mb-3 font-medium">
                  {t('nav.menWardrobe')}
                </span>
                <ul className="space-y-2 text-xs tracking-wider">
                  {[
                    { label: t('catalog.subAll'), href: '/hombre' },
                    { label: t('catalog.subCoats'), href: '/hombre' },
                    { label: t('catalog.subShirts'), href: '/hombre' },
                    { label: t('catalog.subPants'), href: '/hombre' },
                    { label: t('catalog.subShoes'), href: '/hombre' },
                    { label: t('catalog.subAccessories'), href: '/hombre' },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        prefetch={true}
                        className="text-foeg-black/75 hover:text-foeg-black hover:translate-x-1 transition-all duration-200 block py-0.5"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Link
            href="/colecciones"
            prefetch={true}
            className={`text-[13px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 py-1 ${textClass} ${hoverClass}`}
          >
            {t('nav.collections')}
          </Link>
          <Link
            href="/boutique"
            prefetch={true}
            className={`text-[13px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 py-1 ${textClass} ${hoverClass}`}
          >
            {t('nav.boutiques') || 'Boutiques'}
          </Link>
          <Link
            href="/journal"
            prefetch={true}
            className={`text-[13px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 py-1 ${textClass} ${hoverClass}`}
          >
            {t('nav.journal')}
          </Link>
        </nav>

        {/* DERECHA: Acciones, Iconos y Selector de Idioma */}
        <div className={`flex items-center justify-end space-x-2.5 sm:space-x-4 md:space-x-6 ${textClass}`}>
          {/* Selector de Idioma Minimalista: FR / EN / ES */}
          <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-sans tracking-[0.14em] pr-2 border-r border-current/20">
            {(['fr', 'en', 'es'] as const).map((lang, idx) => (
              <React.Fragment key={lang}>
                {idx > 0 && <span className="opacity-30">/</span>}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setLanguage(lang)}
                  className={`uppercase transition-all duration-200 cursor-pointer ${
                    language === lang
                      ? 'font-semibold underline underline-offset-4 opacity-100'
                      : 'font-normal opacity-50 hover:opacity-90'
                  }`}
                  aria-label={`Langue ${lang.toUpperCase()}`}
                >
                  {lang.toUpperCase()}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Selector de Moneda Minimalista: EUR / USD */}
          <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-sans tracking-[0.14em] pr-2 border-r border-current/20">
            {(['EUR', 'USD'] as const).map((curr, idx) => (
              <React.Fragment key={curr}>
                {idx > 0 && <span className="opacity-30">/</span>}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setCurrency(curr)}
                  className={`uppercase transition-all duration-200 cursor-pointer ${
                    currency === curr
                      ? 'font-semibold underline underline-offset-4 opacity-100'
                      : 'font-normal opacity-50 hover:opacity-90'
                  }`}
                  aria-label={`Devise ${curr}`}
                >
                  {curr}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Buscar */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => {
              console.log("CLICK EN SEARCH");
              setSearchOpen(true);
            }}
            className={`p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${hoverClass}`}
            aria-label={t('nav.search')}
          >
            <Search className="w-[19px] h-[19px] pointer-events-none" strokeWidth={1} />
          </button>

          {/* Wishlist / Liste de Désirs */}
          <Link
            href="/cuenta/deseos"
            className={`p-1 transition-colors duration-300 focus:outline-none cursor-pointer relative ${hoverClass}`}
            aria-label="Liste de désirs"
          >
            <Heart className="w-[19px] h-[19px] pointer-events-none" strokeWidth={1} />
            {isMounted && isAuthenticated && wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-foeg-navy text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cuenta de Cliente con Menú Flotante Editorial */}
          <div
            className="relative cursor-pointer"
            style={{ cursor: 'pointer', zIndex: 45 }}
            onClick={(e) => {
              // Fallback si el clic impactó el contenedor
              if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                console.log("CLICK EN USER MENU (DIV CONTAINER)");
                setIsUserMenuOpen((prev) => !prev);
              }
            }}
          >
            <button
              suppressHydrationWarning
              type="button"
              data-user-menu-trigger="true"
              onClick={(e) => {
                e.stopPropagation();
                console.log("CLICK EN USER MENU");
                setIsUserMenuOpen((prev) => !prev);
              }}
              style={{ cursor: 'pointer' }}
              className={`p-1 transition-colors duration-300 focus:outline-none cursor-pointer flex items-center ${hoverClass}`}
              aria-label={t('nav.account')}
              aria-expanded={isUserMenuOpen}
            >
              <User className="w-[19px] h-[19px] pointer-events-none" strokeWidth={1} />
            </button>

            {isMounted && (
              <UserMenu
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                conciergeSettings={headerSettings}
              />
            )}
          </div>

          {/* Carrito con Contador (Badge Inteligente) */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("CLICK EN CART");
              openCart();
            }}
            className={`p-1 transition-colors duration-300 focus:outline-none relative inline-flex items-center cursor-pointer ${hoverClass}`}
            aria-label={`${t('nav.cart')} (${isMounted && isAuthenticated ? totalItems : 0})`}
          >
            <ShoppingBag className="w-[19px] h-[19px] pointer-events-none" strokeWidth={1} />
            {isMounted && isAuthenticated && totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-foeg-navy text-foeg-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium leading-none animate-fadeIn border border-foeg-white/40">
                {totalItems}
              </span>
            )}
            <span className="sr-only">{isMounted && isAuthenticated ? totalItems : 0} articles</span>
          </button>

          {/* Botón Móvil */}
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-1 focus:outline-none transition-colors ${hoverClass}`}
            aria-label="Alternar menú móvil"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" strokeWidth={1} />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={1} />
            )}
          </button>
        </div>
      </div>

      {/* Menú Móvil Desplegable de Alta Costura */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-foeg-white text-foeg-black border-b border-foeg-border px-5 sm:px-8 py-6 transition-all duration-300 shadow-floating max-h-[calc(100dvh-4rem)] pb-[calc(2rem+env(safe-area-inset-bottom))] overflow-y-auto no-scrollbar animate-fadeIn text-left">
          <nav className="flex flex-col space-y-5">
            {/* 1. Categorías Principales con Tipografía de Alta Costura */}
            <div className="space-y-1 divide-y divide-foeg-border/40 border-b border-foeg-border/60 pb-3">
              <Link
                href="/hombre"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl font-light text-foeg-black hover:text-foeg-navy py-2.5 flex items-center justify-between group transition-colors"
              >
                <span className="tracking-wide">{t('nav.men')}</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-sans font-normal opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  Vestiaire
                </span>
              </Link>

              <Link
                href="/colecciones"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl font-light text-foeg-black hover:text-foeg-navy py-2.5 flex items-center justify-between group transition-colors"
              >
                <span className="tracking-wide">{t('nav.collections')}</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-sans font-normal opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  Atelier
                </span>
              </Link>

              <Link
                href="/boutique"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl font-light text-foeg-black hover:text-foeg-navy py-2.5 flex items-center justify-between group transition-colors"
              >
                <span className="tracking-wide">{t('nav.boutiques') || 'Boutiques'}</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-foeg-muted font-sans font-medium">
                  Paris · Caracas
                </span>
              </Link>

              <Link
                href="/journal"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl font-light text-foeg-black hover:text-foeg-navy py-2.5 flex items-center justify-between group transition-colors"
              >
                <span className="tracking-wide">{t('nav.journal')}</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-sans font-normal opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  Chroniques
                </span>
              </Link>

              <Link
                href="/cercle-prive"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl font-light text-foeg-black hover:text-foeg-navy py-2.5 flex items-center justify-between group transition-colors"
              >
                <span className="tracking-wide">
                  {language === 'es' ? 'Círculo Privado' : language === 'en' ? 'Private Circle' : 'Cercle Privé'}
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-amber-700 font-sans font-semibold">
                  VIP
                </span>
              </Link>
            </div>

            {/* 2. Selectores Refinados de Idioma y Moneda (Segmented Pills de Lujo) */}
            <div className="grid grid-cols-2 gap-3 pt-1 pb-3 border-b border-foeg-border/60">
              {/* Idioma */}
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase tracking-[0.25em] text-foeg-muted font-medium block">
                  {language === 'es' ? 'Idioma' : language === 'en' ? 'Language' : 'Langue'}
                </span>
                <div className="inline-flex bg-foeg-surface/80 border border-foeg-border p-0.5 w-full">
                  {(['fr', 'en', 'es'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-all text-center cursor-pointer ${
                        language === lang
                          ? 'bg-foeg-navy text-white shadow-2xs font-semibold'
                          : 'text-foeg-muted hover:text-foeg-black'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Moneda */}
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase tracking-[0.25em] text-foeg-muted font-medium block">
                  {language === 'es' ? 'Moneda' : language === 'en' ? 'Currency' : 'Devise'}
                </span>
                <div className="inline-flex bg-foeg-surface/80 border border-foeg-border p-0.5 w-full">
                  {(['EUR', 'USD'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-medium transition-all text-center cursor-pointer ${
                        currency === curr
                          ? 'bg-foeg-navy text-white shadow-2xs font-semibold'
                          : 'text-foeg-muted hover:text-foeg-black'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Accesos Rápidos Táctiles (Buscar, Carrito, Espacio Privado) */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="flex flex-col items-center justify-center py-3 px-2 border border-foeg-border hover:border-foeg-navy bg-white/70 hover:bg-white text-foeg-black transition-all space-y-1.5 cursor-pointer active:scale-[0.98]"
              >
                <Search className="w-4 h-4 text-foeg-navy" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-[0.16em] font-medium">
                  {language === 'es' ? 'Buscar' : language === 'en' ? 'Search' : 'Recherche'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCart();
                }}
                className="flex flex-col items-center justify-center py-3 px-2 border border-foeg-navy bg-foeg-navy text-white transition-all space-y-1.5 cursor-pointer active:scale-[0.98] shadow-subtle relative"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-white" strokeWidth={1.5} />
                  {isAuthenticated && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-amber-400 text-foeg-navy text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-[0.16em] font-medium">
                  {language === 'es' ? 'Bolsa' : language === 'en' ? 'Bag' : 'Panier'}
                  {isAuthenticated && totalItems > 0 ? ` (${totalItems})` : ''}
                </span>
              </button>

              <Link
                href="/cuenta"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center justify-center py-3 px-2 border border-foeg-border hover:border-foeg-navy bg-white/70 hover:bg-white text-foeg-black transition-all space-y-1.5 cursor-pointer active:scale-[0.98]"
              >
                <User className="w-4 h-4 text-foeg-navy" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-[0.16em] font-medium truncate max-w-full">
                  {isAuthenticated
                    ? (language === 'es' ? 'Mi Espacio' : language === 'en' ? 'Account' : 'Mon Compte')
                    : (language === 'es' ? 'Acceder' : language === 'en' ? 'Sign In' : 'Connexion')}
                </span>
              </Link>
            </div>

            {/* 4. Conserjería VIP & Asistencia Directa */}
            <div className="pt-3 border-t border-foeg-border/60 flex items-center justify-between text-xs text-foeg-muted">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new Event('open-concierge-modal'));
                }}
                className="text-foeg-black hover:text-foeg-navy font-medium text-[11px] uppercase tracking-[0.18em] cursor-pointer group"
              >
                <span className="group-hover:underline underline-offset-4">
                  {language === 'es' ? 'Conserjería Privada' : language === 'en' ? 'Private Concierge' : 'Conciergerie Privée'}
                </span>
              </button>

              <div className="flex items-center space-x-2.5">
                {headerSettings.whatsapp && (
                  <a
                    href={`https://wa.me/${headerSettings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-colors text-[10px] tracking-wider uppercase font-medium"
                    title="WhatsApp Conciergerie VIP"
                    aria-label="WhatsApp Conciergerie VIP"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700" strokeWidth={1.5} />
                    <span>WhatsApp</span>
                  </a>
                )}
                <a
                  href={headerSettings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-foeg-muted hover:text-foeg-black transition-colors border border-foeg-border"
                  aria-label="Instagram FOEG Paris"
                >
                  <Instagram className="w-3.5 h-3.5" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Buscador Global Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
