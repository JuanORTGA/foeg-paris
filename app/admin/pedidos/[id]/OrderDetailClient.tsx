'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Printer,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  MapPin,
  CreditCard,
  Package,
  ExternalLink,
} from 'lucide-react';
import { updateOrderStatus } from '../actions';
import { useLanguage } from '@/lib/language-context';
import { getTranslatedColor } from '@/lib/i18n';

interface OrderItem {
  id: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderDetailProps {
  order: {
    id: string;
    orderNumber: string;
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    total: number;
    currency: string;
    status: string;
    paymentMethod: string;
    trackingNumber?: string | null;
    createdAt: string;
    items: OrderItem[];
  };
}

export default function OrderDetailClient({ order }: OrderDetailProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    const res = await updateOrderStatus(order.id, newStatus);
    setUpdating(false);
    if (res.success) {
      setStatus(newStatus);
      setToast(t('admin.orderDetail.updatedSuccess'));
      setTimeout(() => setToast(null), 3000);
      router.refresh();
    } else {
      alert(res.error || (language === 'es' ? 'Error al actualizar el estado.' : language === 'en' ? 'Error updating status.' : 'Erreur lors de la mise à jour du statut.'));
    }
  };

  const subtotal = order.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const tva = (subtotal * 0.2).toFixed(2);

  const getFormattedPaymentMethod = (method: string) => {
    const m = (method || '').toUpperCase().trim();
    if (m === 'VIREMENT BANCAIRE' || m === 'VIREMENT' || m === 'VIREMENT_BANCAIRE') {
      return language === 'es'
        ? 'Virement Bancaire (France)'
        : language === 'en'
        ? 'Virement Bancaire (France)'
        : 'Virement Bancaire (France)';
    }
    if (m === 'STRIPE' || m === 'CARD' || m === 'CARTE BANCAIRE' || m === 'CARTE') {
      return language === 'es' ? 'Carte Bancaire' : language === 'en' ? 'Carte Bancaire' : 'Carte Bancaire';
    }
    if (m === 'PAYPAL') return 'PayPal';
    if (m === 'ZELLE') return 'Zelle';
    if (m === 'BINANCE' || m === 'BINANCE_PAY' || m === 'CRYPTO') return 'Binance Pay';
    if (m === 'ZINLI') return 'Zinli';
    if (m === 'PAGO_MOVIL' || m === 'PAGOMOVIL') return 'Pago Móvil';
    return method || 'Carte Bancaire';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* BARRA SUPERIOR (OCULTA EN IMPRESIÓN) */}
      <div className="print:hidden no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foeg-border pb-6">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-navy transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('admin.orderDetail.back')}</span>
        </Link>

        <div className="flex items-center space-x-3">
          {/* Selector de Estado */}
          <select
            value={status}
            disabled={updating}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            className="text-xs py-2 px-3 bg-white border border-foeg-border uppercase tracking-wider font-medium text-foeg-black focus:border-foeg-navy cursor-pointer"
          >
            <option value="En attente">{t('admin.orderDetail.statusPending')}</option>
            <option value="En préparation à l’Atelier">{t('admin.orderDetail.statusPrep')}</option>
            <option value="Expédié">{t('admin.orderDetail.statusShipped')}</option>
            <option value="Livré">{t('admin.orderDetail.statusDelivered')}</option>
          </select>

          {/* Botón Imprimir Factura */}
          <Link
            href={`/factura/${order.orderNumber}`}
            target="_blank"
            className="border border-foeg-navy/30 text-foeg-navy hover:border-foeg-navy hover:bg-foeg-navy/5 py-2 px-4 text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer flex items-center space-x-1.5"
            title="Ouvrir la Facture Officielle dans un nouvel onglet"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Facture</span>
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-foeg-navy text-white hover:bg-foeg-black py-2 px-5 text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer flex items-center space-x-2 shadow-subtle"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('admin.orderDetail.printBtn')}</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="print:hidden no-print p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-light animate-fadeIn">
          {toast}
        </div>
      )}

      {/* =========================================================================
          CONTENEDOR FACTURA FORMAL (DISEÑO EDITORIAL & PREPARADO PARA @media print)
         ========================================================================= */}
      <div
        id="printable-invoice"
        className="bg-white border border-foeg-border/80 p-8 sm:p-12 shadow-subtle print:border-none print:shadow-none print:p-0 print:m-0 space-y-10"
      >
        {/* ENCABEZADO DE FACTURA CON LOGO Y MARCA */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-foeg-black/20 pb-8 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-foeg.png"
                alt="FOEG Paris"
                className="w-12 h-12 object-contain shrink-0"
              />
              <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-[0.22em] text-foeg-black uppercase">
                FOEG
              </h1>
            </div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-foeg-muted font-medium">
              Maison de Confection Française
            </p>
            <div className="pt-2 text-xs text-foeg-muted/80 font-light leading-relaxed">
              <p>Atelier & Siège Social : 48 Rue Lucien Sampaix</p>
              <p>75010 Paris · France</p>
              <p>SIRET : 894 123 456 00018 · N° TVA : FR 32 894123456</p>
              <p>concierge@foeg-paris.com · www.foeg-paris.com</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1 sm:self-start">
            <span className="text-[11px] uppercase tracking-[0.25em] text-foeg-navy font-semibold block">
              {language === 'es' ? 'FACTURA OFICIAL' : language === 'en' ? 'OFFICIAL INVOICE' : 'FACTURE OFFICIELLE'}
            </span>
            <p className="font-mono text-base font-medium text-foeg-black tracking-wider">
              FAC-{order.orderNumber}
            </p>
            <p className="text-xs text-foeg-muted font-light pt-1">
              {t('admin.orderDetail.placedOn')} :{' '}
              {new Date(order.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-foeg-muted font-light">
              {t('admin.orderDetail.order')} : #{order.orderNumber}
            </p>
            <div className="pt-2">
              <span
                className={`inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-semibold ${
                  status === 'Livré'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'Expédié'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* DATOS DEL CLIENTE, EXPEDICIÓN Y MÉTODO DE PAGO (3 COLUMNAS) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-xs border-b border-foeg-border/80 pb-8">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted font-medium block">
              {language === 'es' ? 'Facturado a (Cliente)' : language === 'en' ? 'Billed to (Customer)' : 'Facturé à (Client)'}
            </span>
            <p className="font-serif text-lg font-light text-foeg-black">
              {order.firstName} {order.lastName}
            </p>
            <p className="text-foeg-muted font-light">{order.email}</p>
            <p className="text-foeg-muted font-light">{language === 'es' ? 'Cliente Privilegiado · Maison FOEG' : language === 'en' ? 'Privileged Customer · Maison FOEG' : 'Client Privilège · Maison FOEG'}</p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted font-medium block">
              {t('admin.orderDetail.customerInfo')}
            </span>
            <p className="font-medium text-foeg-black">{order.address}</p>
            <p className="text-foeg-muted font-light">
              {order.postalCode} {order.city}
            </p>
            <p className="text-foeg-muted font-light">France Métropolitaine / International</p>
            {order.trackingNumber && (
              <p className="font-mono text-[11px] text-foeg-navy font-medium pt-1">
                {t('admin.orderDetail.trackingLabel')} : {order.trackingNumber}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted font-medium block">
              {t('admin.orderDetail.paymentMethod')}
            </span>
            <p className="font-medium text-foeg-black flex items-center space-x-1.5 pt-0.5">
              <CreditCard className="w-3.5 h-3.5 text-foeg-navy shrink-0" />
              <span className="uppercase">{getFormattedPaymentMethod(order.paymentMethod)}</span>
            </p>
            <p className="text-emerald-800 text-[11px] font-medium uppercase tracking-wider flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{language === 'es' ? 'Pago verificado conforme' : language === 'en' ? 'Payment certified compliant' : 'Règlement certifié conforme'}</span>
            </p>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS DE LA FACTURA */}
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted font-medium block">
            {t('admin.orderDetail.orderItems')}
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-foeg-black text-[10px] uppercase tracking-[0.2em] font-medium text-foeg-black">
                  <th className="py-3 px-2">{language === 'es' ? 'Descripción' : language === 'en' ? 'Item' : 'Désignation'}</th>
                  <th className="py-3 px-2 text-center">{language === 'es' ? 'Talla' : language === 'en' ? 'Size' : 'Taille'}</th>
                  <th className="py-3 px-2 text-center">{language === 'es' ? 'Cant.' : language === 'en' ? 'Qty' : 'Qté'}</th>
                  <th className="py-3 px-2 text-right">{language === 'es' ? 'Precio Unitario' : language === 'en' ? 'Unit Price' : 'Prix Unitaire'}</th>
                  <th className="py-3 px-2 text-right">{language === 'es' ? 'Total' : language === 'en' ? 'Total Amount' : 'Montant Total'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foeg-border/70 font-light">
                {order.items.map((item) => (
                  <tr key={item.id} className="py-3">
                    <td className="py-3.5 px-2">
                      <div className="flex items-center space-x-3.5">
                        {item.image && (
                          <div className="w-10 h-14 bg-foeg-surface border border-foeg-border/80 shrink-0 overflow-hidden relative print:hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-serif text-sm text-foeg-black font-medium">{item.productName}</p>
                          <p className="text-[10px] text-foeg-muted uppercase tracking-wider">
                            Confection Atelier Paris · Pièce Signée
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-center font-mono font-medium">
                      {item.size.includes('·')
                        ? `${item.size.split('·')[0].trim()} · ${getTranslatedColor(
                            item.size.split('·')[1].trim(),
                            language
                          )}`
                        : item.size}
                    </td>
                    <td className="py-3.5 px-2 text-center font-mono">{item.quantity}</td>
                    <td className="py-3.5 px-2 text-right font-mono">
                      {item.price.toFixed(2)} {order.currency}
                    </td>
                    <td className="py-3.5 px-2 text-right font-mono font-medium text-foeg-black">
                      {(item.price * item.quantity).toFixed(2)} {order.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECAPITULATIVO FINANCIERO */}
        <div className="border-t border-foeg-border/80 pt-6 flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-foeg-muted font-light">
              <span>{t('admin.orderDetail.subtotal')} :</span>
              <span className="font-mono">
                {(order.total - Number(tva)).toFixed(2)} {order.currency}
              </span>
            </div>
            <div className="flex justify-between text-foeg-muted font-light">
              <span>{t('admin.orderDetail.tva')} :</span>
              <span className="font-mono">
                {tva} {order.currency}
              </span>
            </div>
            <div className="flex justify-between text-foeg-muted font-light">
              <span>{language === 'es' ? 'Envío Firma :' : language === 'en' ? 'Signature Shipping :' : 'Expédition Signature :'}</span>
              <span className="text-emerald-700 font-medium uppercase tracking-wider text-[10px]">
                {language === 'es' ? 'Gratis' : language === 'en' ? 'Free' : 'Offerte'}
              </span>
            </div>
            <div className="flex justify-between text-base font-serif font-normal border-t border-foeg-black pt-3 text-foeg-black">
              <span>{t('admin.orderDetail.total')} :</span>
              <span className="font-mono font-medium">
                {order.total.toFixed(2)} {order.currency}
              </span>
            </div>
          </div>
        </div>

        {/* PIE DE PÁGINA DE FACTURA */}
        <div className="border-t border-foeg-border/60 pt-6 text-[10px] text-foeg-muted font-light leading-relaxed text-center space-y-1">
          <p>
            {language === 'es' ? 'Maison FOEG Paris le agradece su confianza. Piezas numeradas confeccionadas según el arte de la sastrería.' : language === 'en' ? 'Maison FOEG Paris thanks you for your trust. Numbered pieces crafted according to fine tailoring traditions.' : 'Maison FOEG Paris vous remercie pour votre confiance. Pièces numérotées confectionnées selon les règles de l\'art.'}
          </p>
          <p>
            {language === 'es' ? 'Para cualquier solicitud de ajuste o cita privada en el Atelier: concierge@foeg-paris.com' : language === 'en' ? 'For any adjustment request or private fitting at the Atelier: concierge@foeg-paris.com' : 'Pour toute demande d\'ajustement ou essayage privé en Atelier : concierge@foeg-paris.com'}
          </p>
        </div>
      </div>
    </div>
  );
}
