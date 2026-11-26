'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shirt, Truck, ExternalLink, ArrowRight, ShieldCheck, Printer, Clock } from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';
import { useLanguage } from '@/lib/language-context';

export interface CustomerOrderItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface CustomerOrderData {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  currency: string;
  status: string;
  trackingNumber: string;
  items: CustomerOrderItem[];
}

interface CustomerOrdersClientProps {
  orders: CustomerOrderData[];
  userEmail: string;
  userName: string;
}

export default function CustomerOrdersClient({
  orders,
  userEmail,
  userName,
}: CustomerOrdersClientProps) {
  const { formatPrice } = useCurrency();
  const { t, language } = useLanguage();

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('livr') || s.includes('deliver') || s.includes('entreg')) return t('orders.statusDelivered');
    if (s.includes('expéd') || s.includes('ship') || s.includes('enviad')) return t('orders.statusShipped');
    if (s.includes('attente') || s.includes('pend') || s.includes('vérif')) return t('orders.statusPending');
    return status;
  };

  return (
    <div className="pt-28 md:pt-40 pb-32 px-6 md:px-12 max-w-4xl mx-auto animate-fadeIn text-left">
      {/* Navegación de retorno */}
      <div className="mb-10">
        <Link
          href="/cuenta"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black transition-colors font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1} />
          <span>{t('orders.backAccount')}</span>
        </Link>
      </div>

      {/* Cabecera */}
      <div className="border-b border-foeg-border/80 pb-8 mb-12 space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block">
          {t('orders.badge')}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
          {t('orders.title')}
        </h1>
        <p className="text-xs text-foeg-muted font-light tracking-wide">
          {t('orders.subtitle')}{' '}
          <strong className="text-foeg-black font-medium">{userName || userEmail}</strong>.
        </p>
      </div>

      {/* Lista de Pedidos Reales de Neon */}
      {orders.length === 0 ? (
        <div className="py-20 text-center border border-foeg-border/60 bg-foeg-surface/20 space-y-5">
          <div className="w-12 h-12 rounded-full bg-foeg-navy/10 text-foeg-navy mx-auto flex items-center justify-center">
            <Shirt className="w-6 h-6" strokeWidth={1} />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-2xl text-foeg-black font-light">
              {t('orders.empty')}
            </h3>
            <p className="text-xs text-foeg-muted font-light max-w-sm mx-auto leading-relaxed">
              {t('orders.emptySubtitle')}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/hombre"
              className="inline-flex items-center space-x-2 bg-foeg-navy hover:bg-foeg-black text-white px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
            >
              <span>{t('orders.discover')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-foeg-border/80 border-t border-b border-foeg-border/80">
          {orders.map((order) => {
            const isDelivered = order.status === 'Livré';
            const isShipping = order.status === 'Expédié';
            const isPendingVerification = order.status === 'PENDING_VERIFICATION' || order.status.includes('attente') || order.status === 'À Vérifier';

            return (
              <div
                key={order.id}
                className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-foeg-surface/20 transition-colors p-4"
              >
                {/* Lado Izquierdo: Info de la orden */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-medium text-foeg-black tracking-wider">
                      #{order.orderNumber}
                    </span>
                    <span className="text-foeg-muted/60 text-xs">·</span>
                    <span className="text-xs text-foeg-muted font-light">
                      {order.date}
                    </span>
                  </div>

                  {/* Resumen de artículos */}
                  <div className="text-xs text-foeg-black font-serif text-base pt-1">
                    {order.items.map((it, idx) => (
                      <span key={it.id}>
                        {idx > 0 && ' · '}
                        {it.name} <span className="text-xs font-sans text-foeg-muted font-light">(Taille {it.size} × {it.quantity})</span>
                      </span>
                    ))}
                  </div>

                  {/* Número de seguimiento */}
                  <div className="flex items-center space-x-2 pt-1 text-[11px] text-foeg-muted font-light">
                    <Truck className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1} />
                    <span>{t('orders.parcel')} {order.trackingNumber}</span>
                  </div>
                </div>

                {/* Lado Derecho: Estado, Precio y Botón de Detalle */}
                <div className="flex items-center justify-between md:justify-end md:space-x-8 pt-4 md:pt-0 border-t md:border-t-0 border-foeg-border/60">
                  <div className="text-left md:text-right space-y-1">
                    <div className="text-sm font-medium text-foeg-black tracking-wide">
                      {formatPrice(order.total)}
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isShipping
                            ? 'bg-blue-50 text-foeg-navy border border-blue-200'
                            : isPendingVerification
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones del Pedido */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    {isPendingVerification ? (
                      <span
                        className="inline-flex items-center space-x-1.5 text-[10px] uppercase tracking-wider font-medium text-amber-900 bg-amber-50 border border-amber-300 px-3 py-2"
                        title={
                          language === 'es'
                            ? 'Factura en proceso de validación por la Conserjería'
                            : language === 'en'
                            ? 'Invoice pending Concierge validation'
                            : 'Facture en cours de validation par la Conciergerie'
                        }
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" strokeWidth={1.5} />
                        <span>
                          {language === 'es'
                            ? 'Factura en validación'
                            : language === 'en'
                            ? 'Invoice pending validation'
                            : 'Facture en cours de validation par la Conciergerie'}
                        </span>
                      </span>
                    ) : (
                      <Link
                        href={`/factura/${order.orderNumber}`}
                        target="_blank"
                        className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-[0.16em] bg-foeg-navy text-white hover:bg-black font-medium transition-colors px-3.5 py-2 shadow-subtle"
                        title={
                          language === 'es'
                            ? 'Descargar Factura Oficial en PDF'
                            : language === 'en'
                            ? 'Download Official Invoice PDF'
                            : 'Télécharger la Facture Officielle en PDF'
                        }
                      >
                        <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>{language === 'es' ? 'Factura' : language === 'en' ? 'Invoice' : 'Facture'}</span>
                      </Link>
                    )}

                    <Link
                      href={`/cuenta/pedidos/${order.orderNumber}`}
                      className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-[0.16em] text-foeg-navy hover:text-foeg-black font-medium transition-colors border border-foeg-navy/30 hover:border-foeg-navy px-3.5 py-2"
                    >
                      <span>{t('orders.details')}</span>
                      <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
