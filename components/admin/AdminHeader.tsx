'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Bell, User, LogOut, Settings, Check, ChevronDown, CheckCheck, Menu } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import {
  getUnreadNotifications,
  markAllNotificationsAsRead,
  AdminNotification,
} from '@/lib/notifications';

interface AdminHeaderProps {
  onToggleMobileMenu?: () => void;
}

export default function AdminHeader({ onToggleMobileMenu }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = () => {
      getUnreadNotifications().then((res) => {
        if (isMounted) setNotifications(res);
      });
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling temps réel (10s)

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Mapeo dinámico de Breadcrumbs
  const getBreadcrumbTitle = () => {
    if (pathname === '/admin') return t('admin.dashboard');
    if (pathname?.includes('/admin/pedidos')) return t('admin.orders');
    if (pathname?.includes('/admin/productos')) return t('admin.products');
    if (pathname?.includes('/admin/contenido')) return t('admin.content');
    if (pathname?.includes('/admin/media')) return t('admin.media');
    if (pathname?.includes('/admin/envios')) return t('admin.shipping');
    if (pathname?.includes('/admin/pagos')) return t('admin.payments');
    if (pathname?.includes('/admin/boutiques')) return t('admin.boutiques') || 'Boutiques';
    if (pathname?.includes('/admin/perfil')) return t('account.profile');
    if (pathname?.includes('/admin/clientes')) return t('admin.clients');
    if (pathname?.includes('/admin/resenas')) return t('admin.reviews');
    if (pathname?.includes('/admin/newsletter')) return t('admin.newsletter');
    if (pathname?.includes('/admin/journal')) return t('admin.journal');
    if (pathname?.includes('/admin/seo')) return t('admin.seo');
    if (pathname?.includes('/admin/ajustes')) return t('admin.settings');
    return t('admin.overview');
  };

  // Helper de traducción automática de notificaciones históricas
  const formatNotificationContent = (title: string, message: string) => {
    if (language === 'fr') return { title, message };

    let tTitle = title;
    let tMessage = message;

    if (language === 'es') {
      if (title.includes('Pièce Modifiée')) tTitle = 'Prenda Modificada en el Atelier';
      else if (title.includes('Nouveau Produit')) tTitle = 'Nuevo Producto Añadido';
      else if (title.includes('Nouvelle Commande')) tTitle = 'Nuevo Pedido Recibido';
      else if (title.includes('Justificatif de Paiement')) tTitle = 'Comprobante de Pago Recibido';
      else if (title.includes('Paiement Local Approuvé')) tTitle = 'Pago Local Aprobado';
      else if (title.includes('Statut de Commande')) tTitle = 'Estado de Pedido Actualizado';
      else if (title.includes('Nouvelle Expérience') || title.includes('Avis')) tTitle = 'Nueva Reseña de Cliente Recibida';
      else if (title.includes('Inscription') || title.includes('Newsletter')) tTitle = 'Nueva Suscripción al Newsletter';
      else if (title.includes('Campagne Newsletter') || title.includes('Boletín')) tTitle = 'Boletín Exclusivo Enviado';
      else if (title.includes('Essai') || title.includes('Journal')) tTitle = 'Nuevo Ensayo Publicado en el Journal';
      else if (title.includes('SEO')) tTitle = 'Ajustes SEO Actualizados';
      else if (title.includes('Généraux') || title.includes('Ajustes Globales')) tTitle = 'Ajustes Globales Actualizados';

      tMessage = tMessage
        .replace(/La pièce /g, 'La prenda ')
        .replace(/ a été mise à jour dans Neon\./g, ' ha sido actualizada en Neon.')
        .replace(/ a rejoint la collection /g, ' se ha incorporado a la colección ')
        .replace(/Commande #/g, 'Pedido #')
        .replace(/ enregistrée via /g, ' registrado vía ')
        .replace(/Reçu soumis pour la commande #/g, 'Comprobante recibido para el pedido #')
        .replace(/\(Réf:/g, '(Ref:')
        .replace(/ a partagé un avis sur /g, ' ha compartido una reseña sobre ')
        .replace(/\(En attente de validation\)/g, '(En espera de validación)')
        .replace(/ s'est inscrit\(e\) aux communications exclusives FOEG \(/g, ' se ha suscrito a las comunicaciones exclusivas de FOEG (')
        .replace(/La campagne "([^"]+)" a été transmise avec succès à (\d+) destinataire\(s\)\./g, 'El comunicado "$1" fue transmitido con éxito a $2 destinatario(s).')
        .replace(/L'essai "([^"]+)" \(([^)]+)\) a été publié dans le Journal FOEG\./g, 'El ensayo "$1" ($2) ha sido publicado en el Journal FOEG.')
        .replace(/Les balises méta Google et réseaux sociaux ont été synchronisées\./g, 'Las metaetiquetas de Google y redes sociales han sido sincronizadas.')
        .replace(/Les coordonnées, réseaux sociaux et règles commerciales ont été synchronisés\./g, 'Las coordenadas, redes sociales y reglas comerciales han sido sincronizadas.')
        .replace(/Le virement pour la commande #([A-Za-z0-9-]+) a été validé avec succès par l'administrateur\./g, 'La transferencia para el pedido #$1 fue validada con éxito por el administrador.')
        .replace(/La commande #([A-Za-z0-9-]+) est désormais "([^"]+)"\./g, 'El pedido #$1 ahora está "$2".');
    } else if (language === 'en') {
      if (title.includes('Pièce Modifiée')) tTitle = 'Garment Modified in Atelier';
      else if (title.includes('Nouveau Produit')) tTitle = 'New Product Added';
      else if (title.includes('Nouvelle Commande')) tTitle = 'New Order Received';
      else if (title.includes('Justificatif de Paiement')) tTitle = 'Payment Receipt Received';
      else if (title.includes('Paiement Local Approuvé')) tTitle = 'Local Payment Approved';
      else if (title.includes('Statut de Commande')) tTitle = 'Order Status Updated';
      else if (title.includes('Nouvelle Expérience') || title.includes('Avis')) tTitle = 'New Customer Review Received';
      else if (title.includes('Inscription') || title.includes('Newsletter')) tTitle = 'New Newsletter Subscription';
      else if (title.includes('Campagne Newsletter') || title.includes('Boletín')) tTitle = 'Exclusive Newsletter Dispatched';
      else if (title.includes('Essai') || title.includes('Journal')) tTitle = 'New Essay Published in Journal';
      else if (title.includes('SEO')) tTitle = 'SEO Settings Updated';
      else if (title.includes('Généraux') || title.includes('Ajustes Globales')) tTitle = 'Global Settings Updated';

      tMessage = tMessage
        .replace(/La pièce /g, 'The garment ')
        .replace(/ a été mise à jour dans Neon\./g, ' has been updated in Neon.')
        .replace(/ a rejoint la collection /g, ' joined the collection ')
        .replace(/Commande #/g, 'Order #')
        .replace(/ enregistrée via /g, ' recorded via ')
        .replace(/Reçu soumis pour la commande #/g, 'Receipt submitted for order #')
        .replace(/\(Réf:/g, '(Ref:')
        .replace(/ a partagé un avis sur /g, ' shared a review on ')
        .replace(/\(En attente de validation\)/g, '(Pending validation)')
        .replace(/ s'est inscrit\(e\) aux communications exclusives FOEG \(/g, ' subscribed to FOEG exclusive communications (')
        .replace(/La campagne "([^"]+)" a été transmise avec succès à (\d+) destinataire\(s\)\./g, 'The newsletter "$1" was successfully sent to $2 recipient(s).')
        .replace(/L'essai "([^"]+)" \(([^)]+)\) a été publié dans le Journal FOEG\./g, 'The essay "$1" ($2) has been published in FOEG Journal.')
        .replace(/Les balises méta Google et réseaux sociaux ont été synchronisées\./g, 'Google meta tags and social network cards have been synchronized.')
        .replace(/Les coordonnées, réseaux sociaux et règles commerciales ont été synchronisés\./g, 'Contact details, social links and business rules have been synchronized.')
        .replace(/Le virement pour la commande #([A-Za-z0-9-]+) a été validé avec succès par l'administrateur\./g, 'The bank transfer for order #$1 has been successfully verified by admin.')
        .replace(/La commande #([A-Za-z0-9-]+) est désormais "([^"]+)"\./g, 'Order #$1 is now "$2".');
    }

    return { title: tTitle, message: tMessage };
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      localStorage.removeItem('foeg_admin_logged');
    } catch {}
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <header className="h-16 md:h-20 bg-white border-b border-foeg-border/80 px-4 sm:px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* LADO IZQUIERDO: Mobile Toggle + Breadcrumbs Dinámicos */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-1 text-foeg-black hover:text-foeg-navy transition-colors cursor-pointer shrink-0"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
        <Link
          href="/admin"
          className="text-foeg-muted hover:text-foeg-navy transition-colors font-light hidden sm:inline"
        >
          {t('admin.administration')}
        </Link>
        <span className="text-foeg-muted/50 font-light hidden sm:inline">/</span>
        <span className="text-foeg-black font-medium tracking-[0.2em] truncate max-w-[120px] sm:max-w-none text-[11px] sm:text-xs">
          {getBreadcrumbTitle()}
        </span>
      </div>

      {/* LADO DERECHO: Selector de Idioma, Notificaciones, Perfil */}
      <div className="flex items-center space-x-3 sm:space-x-5 md:space-x-7 shrink-0">
        {/* 1. Selector de Idioma: FR / EN / ES */}
        <div className="flex items-center space-x-1.5 text-xs font-sans tracking-[0.14em] text-foeg-black pr-3 border-r border-foeg-border/80">
          {(['fr', 'en', 'es'] as const).map((lang, idx) => (
            <React.Fragment key={lang}>
              {idx > 0 && <span className="opacity-30">/</span>}
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setLanguage(lang)}
                className={`uppercase transition-all duration-200 cursor-pointer ${
                  language === lang
                    ? 'font-bold text-foeg-navy underline underline-offset-4'
                    : 'text-foeg-muted hover:text-foeg-black font-light'
                }`}
                aria-label={`Langue ${lang.toUpperCase()}`}
              >
                {lang.toUpperCase()}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* 2. Campana de Notificaciones con punto indicador / Badge de Neon */}
        <div className="relative">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="p-1.5 text-foeg-muted hover:text-foeg-navy transition-colors relative cursor-pointer focus:outline-none"
            aria-label="Notifications Atelier"
          >
            <Bell className="w-[19px] h-[19px]" strokeWidth={1.5} />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-foeg-navy text-white text-[9px] font-sans font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            ) : (
              <span
                title={t('admin.notif.upToDate')}
                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-foeg-surface border border-foeg-border text-foeg-navy flex items-center justify-center ring-1 ring-white shadow-xs"
              >
                <Check className="w-2 h-2 text-foeg-navy" strokeWidth={2.5} />
              </span>
            )}
          </button>

          {/* Menú Desplegable de Notificaciones Conectado a Neon */}
          {notificationsOpen && (
            <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-auto sm:mt-3 w-auto sm:w-96 bg-white border border-foeg-border shadow-floating z-40 p-4 space-y-3 animate-fadeIn text-xs max-h-[85dvh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-foeg-border/60 pb-2">
                <span className="font-serif text-sm font-normal text-foeg-black">
                  {t('admin.notif.title')}
                </span>
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[10px] uppercase tracking-wider text-foeg-navy hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    {t('admin.notif.markAllRead')}
                  </button>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider text-foeg-navy bg-foeg-surface px-2 py-0.5 border border-foeg-border/60 font-medium">
                    {t('admin.notif.upToDate')}
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto divide-y divide-foeg-border/40 font-light">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-foeg-muted text-[11px] font-light">
                    {t('admin.notif.empty')}
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const formatted = formatNotificationContent(notif.title, notif.message);
                    const notifLink = notif.link || (notif.type === 'review' ? '/admin/resenas' : notif.type === 'order' ? '/admin/pedidos' : '/admin/productos');

                    return (
                      <Link
                        key={notif.id}
                        href={notifLink}
                        onClick={() => setNotificationsOpen(false)}
                        className={`block pt-2.5 pb-2 px-2 hover:bg-foeg-surface/50 transition-colors rounded-none ${
                          !notif.isRead ? 'font-normal bg-foeg-surface/20' : 'opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-medium ${
                              notif.type === 'product'
                                ? 'text-foeg-navy'
                                : notif.type === 'order'
                                ? 'text-emerald-800'
                                : notif.type === 'review'
                                ? 'text-amber-800'
                                : 'text-foeg-black'
                            }`}
                          >
                            {formatted.title}
                          </span>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-foeg-navy" />
                          )}
                        </div>
                        <div className="text-[11px] text-foeg-muted mt-0.5 leading-relaxed">
                          {formatted.message}
                        </div>
                        <div className="text-[9px] text-foeg-muted/70 mt-1 font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString(
                            language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              <div className="pt-2 border-t border-foeg-border/60 text-center">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[10px] uppercase tracking-wider text-foeg-muted hover:text-foeg-black font-medium cursor-pointer"
                >
                  {t('admin.notif.close')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Perfil y Menú de Cierre de Sesión */}
        <div className="relative">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center space-x-2 text-xs text-foeg-black hover:text-foeg-navy transition-colors focus:outline-none cursor-pointer py-1"
            aria-label="Menu profil utilisateur"
          >
            <div className="w-8 h-8 rounded-full bg-foeg-navy text-foeg-white flex items-center justify-center font-serif text-xs font-normal border border-foeg-navy">
              FO
            </div>
            <span className="hidden md:inline font-medium tracking-wide">
              {t('admin.direction')}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-foeg-muted" strokeWidth={1.5} />
          </button>

          {/* Menú Desplegable de Perfil */}
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-white border border-foeg-border shadow-floating z-40 p-2 animate-fadeIn text-xs">
              <div className="p-3 border-b border-foeg-border/60">
                <div className="font-serif text-sm font-normal text-foeg-black">{t('admin.direction')}</div>
                <div className="text-[10px] text-foeg-muted font-light mt-0.5">direction@foeg-paris.com</div>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/perfil"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 text-foeg-black hover:bg-foeg-surface/60 transition-colors uppercase tracking-[0.14em] text-[11px]"
                >
                  <User className="w-3.5 h-3.5 text-foeg-muted" strokeWidth={1.5} />
                  <span>{t('account.profile')}</span>
                </Link>

                <Link
                  href="/admin/ajustes"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 text-foeg-black hover:bg-foeg-surface/60 transition-colors uppercase tracking-[0.14em] text-[11px]"
                >
                  <Settings className="w-3.5 h-3.5 text-foeg-muted" strokeWidth={1.5} />
                  <span>{t('admin.settings')}</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-foeg-border/60">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-red-700 hover:bg-red-50 transition-colors uppercase tracking-[0.14em] text-[11px] font-medium text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" strokeWidth={1.5} />
                  <span>{t('admin.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
