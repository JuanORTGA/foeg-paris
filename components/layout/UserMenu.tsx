'use client';

// FOEG Paris - Maison de Confection Française
// UserMenu Component avec Lógica Condicional Estricta (NextAuth)
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  User,
  MapPin,
  Heart,
  Shirt,
  LogIn,
  UserPlus,
  LogOut,
  MessageCircle,
  Instagram,
  Crown,
  Bell,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useCart } from '@/lib/cart-context';
import { getClientNotifications, markClientNotificationAsRead } from '@/app/(shop)/cuenta/actions';

interface UserMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
  hoverClass?: string;
  conciergeSettings?: {
    whatsapp?: string;
    instagram?: string;
  };
}

export default function UserMenu({
  isOpen: controlledIsOpen,
  onClose,
  hoverClass = 'hover:text-foeg-navy',
  conciergeSettings = {
    instagram: 'https://www.instagram.com/foegparis/',
    whatsapp: '+33 6 12 34 56 78',
  },
}: UserMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  console.log("UserMenu renderizado, isOpen:", isOpen);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    if (!isControlled) {
      setInternalIsOpen(false);
    }
  };

  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const { t, language } = useLanguage();
  const { wishlistCount, clearWishlist } = useWishlist();
  const { clearCart } = useCart();

  // TAREA 1: Notifications Client
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  // TAREA 1: Estado estricto de sesión
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const userName = session?.user?.name ? session.user.name.trim().split(' ')[0] : '';

  useEffect(() => {
    if (!isAuthenticated) return;
    getClientNotifications()
      .then((res) => {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      })
      .catch(() => {});
  }, [isAuthenticated, isOpen]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !target.closest('[data-user-menu-trigger="true"]')
      ) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // TAREA 4: Desconexión suave con limpieza total de carrito y lista de deseos
  const handleSignOut = async () => {
    handleClose();
    clearCart();
    clearWishlist();
    try {
      localStorage.removeItem('foeg_cart_items');
      localStorage.removeItem('foeg_wishlist');
      localStorage.removeItem('foeg_applied_coupon');
      window.dispatchEvent(new Event('foeg-session-logout'));
    } catch (_) {}
    await signOut({ redirect: false });
  };

  return (
    <div
      ref={menuRef}
      style={{ display: isOpen ? 'block' : 'none', zIndex: 60 }}
      className={`absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] max-w-[280px] sm:w-72 bg-foeg-white border border-gray-200 text-foeg-black shadow-floating py-4 px-5 space-y-3.5 z-50 rounded-none transition-all duration-200 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      role="menu"
      aria-orientation="vertical"
    >
      {/* TAREA 2 & 3: ENCABEZADO "ESPACE PRIVÉ" */}
      <div className="border-b border-gray-200 pb-3">
        <span className="text-[9px] uppercase tracking-[0.25em] text-foeg-navy font-semibold block">
          {t('account.badge')}
        </span>
        <h4 className="font-serif text-lg font-light tracking-wider text-foeg-navy mt-0.5 uppercase">
          {t('account.espace')}
        </h4>
        {isAuthenticated && userName && (
          <span className="text-[10px] text-foeg-muted tracking-[0.18em] uppercase font-light block mt-0.5 truncate">
            {userName}
          </span>
        )}
      </div>

      {/* TAREA 2: ESTADO NO LOGUEADO (unauthenticated) */}
      {!isAuthenticated ? (
        <div className="space-y-2 text-xs">
          <Link
            href="/cuenta"
            prefetch={true}
            onClick={handleClose}
            className="flex items-center space-x-3 text-foeg-black hover:text-foeg-navy transition-colors py-1 group uppercase tracking-[0.16em] text-[11px] font-medium"
          >
            <LogIn className="w-3.5 h-3.5 text-foeg-muted group-hover:text-foeg-navy transition-colors" strokeWidth={1.5} />
            <span>{t('account.signIn')}</span>
          </Link>

          <Link
            href="/cuenta"
            prefetch={true}
            onClick={handleClose}
            className="flex items-center space-x-3 text-foeg-muted hover:text-foeg-black transition-colors py-1 group uppercase tracking-[0.16em] text-[11px] font-light"
          >
            <UserPlus className="w-3.5 h-3.5 text-foeg-muted group-hover:text-foeg-black transition-colors" strokeWidth={1.5} />
            <span>{t('account.create')}</span>
          </Link>

          <Link
            href="/cercle-prive"
            prefetch={true}
            onClick={handleClose}
            className="flex items-center space-x-3 text-foeg-navy hover:text-foeg-black transition-colors py-1 group uppercase tracking-[0.16em] text-[11px] font-medium border-t border-gray-100 pt-2"
          >
            <Crown className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1.5} />
            <span>{language === 'es' ? 'El Círculo Privado' : language === 'en' ? 'The Private Circle' : 'Le Cercle Privé'}</span>
          </Link>

          {/* Conserjería Privada VIP en menú no autenticado */}
          <button
            type="button"
            onClick={() => {
              handleClose();
              window.dispatchEvent(new Event('open-concierge-modal'));
            }}
            className="flex items-center space-x-3 text-foeg-black hover:text-foeg-navy transition-colors py-1 group uppercase tracking-[0.16em] text-[11px] font-medium w-full text-left cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
            </svg>
            <span>{language === 'es' ? 'Conserjería Privada' : language === 'en' ? 'Private Concierge' : 'Conciergerie Privée'}</span>
          </button>
        </div>
      ) : (
        /* TAREA 3: ESTADO LOGUEADO (authenticated) */
        <div className="space-y-2.5 text-xs">
          {/* 1. Mon Profil + Cloche de Notifications (TAREA 1) */}
          <div className="flex items-center justify-between py-1">
            <Link
              href="/cuenta/perfil"
              prefetch={true}
              onClick={handleClose}
              className="flex items-center space-x-3 text-foeg-black hover:text-foeg-navy transition-colors group uppercase tracking-[0.16em] text-[11px] font-light"
            >
              <User className="w-3.5 h-3.5 text-foeg-muted group-hover:text-foeg-navy transition-colors" strokeWidth={1.5} />
              <span>{t('account.profile')}</span>
            </Link>

            {/* Cloche de Notifications */}
            <button
              type="button"
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-1 text-foeg-muted hover:text-foeg-navy transition-colors cursor-pointer"
              title={language === 'es' ? 'Notificaciones' : language === 'en' ? 'Notifications' : 'Notifications'}
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-bold text-white leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Tiroir de Notifications déroulant */}
          {showNotifs && (
            <div className="p-3 bg-foeg-surface/60 border border-foeg-border/80 space-y-2 animate-fadeIn text-[11px]">
              <div className="flex items-center justify-between border-b border-foeg-border/60 pb-1.5">
                <span className="text-[9px] uppercase tracking-wider font-semibold text-foeg-navy">
                  {language === 'es' ? 'Notificaciones' : language === 'en' ? 'Notifications' : 'Notifications'}
                </span>
                {unreadCount > 0 && (
                  <span className="text-[9px] text-red-600 font-mono">
                    {unreadCount} {language === 'es' ? 'nueva(s)' : language === 'en' ? 'new' : 'nouvelle(s)'}
                  </span>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-[10px] text-foeg-muted py-2 text-center font-light">
                  {language === 'es' ? 'Sin notificaciones recientes' : language === 'en' ? 'No recent notifications' : 'Aucune notification récente'}
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 no-scrollbar">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 border transition-colors ${
                        !n.isRead ? 'bg-white border-foeg-navy/30' : 'bg-transparent border-foeg-border/50 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-medium text-[10px] text-foeg-black uppercase tracking-wider">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={async () => {
                              await markClientNotificationAsRead(n.id);
                              setNotifications((prev) =>
                                prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
                              );
                              setUnreadCount((c) => Math.max(0, c - 1));
                            }}
                            className="text-[9px] text-foeg-navy hover:underline shrink-0"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-foeg-muted font-light mt-0.5 leading-snug">
                        {n.message}
                      </p>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={handleClose}
                          className="text-[9px] text-foeg-navy hover:underline inline-flex items-center space-x-1 mt-1 font-medium"
                        >
                          <span>{language === 'es' ? 'Ver pedido' : language === 'en' ? 'View order' : 'Consulter'}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Mes Adresses */}
          <Link
            href="/cuenta/direcciones"
            prefetch={true}
            onClick={handleClose}
            className="flex items-center space-x-3 text-foeg-black hover:text-foeg-navy transition-colors py-1 group uppercase tracking-[0.16em] text-[11px] font-light"
          >
            <MapPin className="w-3.5 h-3.5 text-foeg-muted group-hover:text-foeg-navy transition-colors" strokeWidth={1.5} />
            <span>{t('account.addresses')}</span>
          </Link>

          {/* 3. Liste de Désirs */}
          <Link
            href="/cuenta/deseos"
            prefetch={true}
            onClick={handleClose}
            className="flex items-center justify-between text-foeg-black hover:text-foeg-navy transition-colors py-1 group uppercase tracking-[0.16em] text-[11px] font-light"
          >
            <span className="flex items-center space-x-3">
              <Heart className="w-3.5 h-3.5 text-foeg-muted group-hover:text-foeg-navy transition-colors" strokeWidth={1.5} />
              <span>{t('wishlist.title').split('·')[0].trim() || 'Liste de Désirs'}</span>
            </span>
            {wishlistCount > 0 && (
              <span className="text-[10px] bg-foeg-sand/50 text-foeg-navy px-1.5 py-0.2 rounded-full font-mono">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* 4. Historique des Commandes */}
          <Link
            href="/cuenta/pedidos"
            prefetch={true}
            onClick={handleClose}
            className="flex items-center space-x-3 text-foeg-black hover:text-foeg-navy transition-colors py-1 group uppercase tracking-[0.16em] text-[11px] font-light"
          >
            <Shirt className="w-3.5 h-3.5 text-foeg-muted group-hover:text-foeg-navy transition-colors" strokeWidth={1.5} />
            <span>{t('account.orders')}</span>
          </Link>

          {/* 5. Le Cercle Privé VIP */}
          <Link
            href="/cercle-prive"
            prefetch={true}
            onClick={handleClose}
            className="flex items-center space-x-3 text-foeg-navy hover:text-foeg-black transition-colors py-1 group uppercase tracking-[0.16em] text-[11px] font-medium border-t border-gray-100 pt-2"
          >
            <Crown className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1.5} />
            <span>{language === 'es' ? 'Mi Círculo Privado' : language === 'en' ? 'My Private Circle' : 'Mon Cercle Privé'}</span>
          </Link>

          {/* 6. Conserjería Privada VIP en menú autenticado */}
          <button
            type="button"
            onClick={() => {
              handleClose();
              window.dispatchEvent(new Event('open-concierge-modal'));
            }}
            className="flex items-center space-x-3 text-foeg-black hover:text-foeg-navy transition-colors py-1 group uppercase tracking-[0.16em] text-[11px] font-medium w-full text-left cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
            </svg>
            <span>{language === 'es' ? 'Conserjería Privada' : language === 'en' ? 'Private Concierge' : 'Conciergerie Privée'}</span>
          </button>

          {/* 7. Déconnexion */}
          <div className="pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center space-x-3 text-foeg-black hover:text-gray-500 transition-colors py-1 group uppercase tracking-[0.16em] text-[11px] font-light cursor-pointer w-full text-left"
            >
              <LogOut className="w-3.5 h-3.5 text-foeg-muted group-hover:text-gray-500 transition-colors" strokeWidth={1.5} />
              <span>{t('account.logout') || 'Déconnexion'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Conciergerie en la parte inferior con WhatsApp Oficial */}
      <div className="pt-2.5 border-t border-gray-200 flex items-center justify-between text-[10px] text-foeg-muted font-light">
        <span className="uppercase tracking-[0.16em]">{language === 'es' ? 'Conserjería :' : language === 'en' ? 'Concierge :' : 'Conciergerie :'}</span>
        <div className="flex items-center space-x-3">
          {conciergeSettings.whatsapp && (
            <a
              href={`https://wa.me/${conciergeSettings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:opacity-80 transition-opacity"
              title="WhatsApp Conciergerie"
              aria-label="WhatsApp Conciergerie"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
              </svg>
            </a>
          )}
          {conciergeSettings.instagram && (
            <a
              href={conciergeSettings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foeg-black hover:text-foeg-navy transition-colors"
              title="Instagram Officiel"
              aria-label="Instagram Officiel"
            >
              <Instagram className="w-3.5 h-3.5" strokeWidth={1.5} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
