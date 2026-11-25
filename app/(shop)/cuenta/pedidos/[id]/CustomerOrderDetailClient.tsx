'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, Truck, Check, CreditCard, ShieldCheck, Clock, CheckCircle2, Printer } from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';
import { useLanguage } from '@/lib/language-context';
import { getTranslatedColor } from '@/lib/i18n';
import MediaBox from '@/components/ui/MediaBox';

export interface OrderDetailItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderDetailData {
  id: string;
  orderNumber: string;
  date: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  total: number;
  currency: string;
  status: string;
  trackingNumber: string;
  items: OrderDetailItem[];
}

interface CustomerOrderDetailClientProps {
  order: OrderDetailData;
}

export default function CustomerOrderDetailClient({ order }: CustomerOrderDetailClientProps) {
  const { formatPrice } = useCurrency();
  const { t, language } = useLanguage();

  const isDelivered = order.status === 'Livré';
  const isShipping = order.status === 'Expédié';
  const isPendingVerification =
    order.status === 'PENDING_VERIFICATION' ||
    order.status.includes('attente') ||
    order.status === 'À Vérifier';

  return (
    <div className="pt-28 md:pt-40 pb-32 px-6 md:px-12 max-w-4xl mx-auto animate-fadeIn text-left space-y-10">
      {/* Retour aux commandes */}
      <div>
        <Link
          href="/cuenta/pedidos"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black transition-colors font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1} />
          <span>Retour à Mes Commandes</span>
        </Link>
      </div>

      {/* En-tête */}
      <div className="border-b border-foeg-border/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block">
            Bordereau Atelier · Commande Privée
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-foeg-black tracking-tight">
            Commande #{order.orderNumber}
          </h1>
          <p className="text-xs text-foeg-muted font-light mt-1">
            Enregistrée le {order.date} · Suivi de confection en direct.
          </p>
        </div>

        <div>
          <span
            className={`inline-flex items-center px-3 py-1 text-xs uppercase tracking-wider font-medium ${
              isDelivered
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : isShipping
                ? 'bg-blue-50 text-foeg-navy border border-blue-300'
                : isPendingVerification
                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                : 'bg-amber-50 text-amber-800 border border-amber-300'
            }`}
          >
            {isPendingVerification ? 'Réservé (À Vérifier)' : order.status}
          </span>
        </div>
      </div>

      {/* TAREA 2: BLOQUEO / DESBLOQUEO DE FACTURA */}
      {isPendingVerification ? (
        <div className="p-5 bg-amber-50 border border-amber-300 flex items-start space-x-3 text-amber-950 shadow-subtle animate-fadeIn">
          <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-serif text-sm font-semibold tracking-wide">
              {language === 'es'
                ? 'Factura en proceso de validación por la Conserjería'
                : language === 'en'
                ? 'Invoice pending Concierge validation'
                : 'Facture en cours de validation par la Conciergerie'}
            </h3>
            <p className="text-xs text-amber-900/90 font-light leading-relaxed">
              {language === 'es'
                ? 'Su justificativo está siendo verificado por la Maison. En cuanto se confirme la recepción de los fondos, el botón de descarga se habilitará automáticamente.'
                : language === 'en'
                ? 'Your transfer proof is being reviewed by the Maison. Once funds are confirmed, invoice download will be unlocked automatically.'
                : 'Votre justificatif est en cours d’examen par la Maison. Dès confirmation de la réception des fonds, votre facture officielle sera débloquée au téléchargement.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 bg-foeg-surface border border-foeg-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle animate-fadeIn">
          <div className="flex items-center space-x-3 text-foeg-navy">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-serif text-sm text-foeg-black font-normal">
                {language === 'es' ? 'Factura Oficial Disponible' : language === 'en' ? 'Official Invoice Available' : 'Facture Officielle Disponible'}
              </h3>
              <p className="text-xs text-foeg-muted font-light">
                {language === 'es' ? 'Documento fiscal oficial preparado por nuestros talleres.' : language === 'en' ? 'Official invoice prepared by our Parisian ateliers.' : 'Document officiel émis par nos ateliers parisiens.'}
              </p>
            </div>
          </div>

          <Link
            href={`/factura/${order.orderNumber}`}
            target="_blank"
            className="inline-flex items-center justify-center space-x-2 bg-foeg-navy hover:bg-black text-white px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors shadow-subtle shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Descargar Factura' : language === 'en' ? 'Download Invoice' : 'Télécharger la Facture'}</span>
          </Link>
        </div>
      )}

      {/* Ligne de temps du statut */}
      <div className="bg-foeg-surface/40 p-6 border border-foeg-border/60">
        <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block mb-4 font-medium">
          {language === 'es' ? 'Progreso de la Confección' : language === 'en' ? 'Crafting Progress' : 'Progression de la Confection'}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-light">
          <div className="flex items-center space-x-3 text-foeg-black font-medium">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                isPendingVerification ? 'bg-amber-600 text-white font-bold' : 'bg-foeg-navy text-white'
              }`}
            >
              {isPendingVerification ? '!' : '✓'}
            </span>
            <div>
              <div className="font-medium">
                {isPendingVerification
                  ? (language === 'es' ? '1. Pago por Validar' : language === 'en' ? '1. Payment to Validate' : '1. Virement à Valider')
                  : (language === 'es' ? '1. Pedido Validado' : language === 'en' ? '1. Order Confirmed' : '1. Commande Validée')}
              </div>
              <div className="text-[10px] text-foeg-muted font-light">
                {isPendingVerification
                  ? (language === 'es' ? 'Comprobante en revisión' : language === 'en' ? 'Receipt under review' : 'Justificatif en cours d’examen')
                  : (language === 'es' ? 'Pago confirmado' : language === 'en' ? 'Payment confirmed' : 'Règlement confirmé')}
              </div>
            </div>
          </div>

          <div
            className={`flex items-center space-x-3 ${
              order.status !== 'En attente' ? 'text-foeg-black font-medium' : 'text-foeg-muted'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                order.status === 'Expédié' || order.status === 'Livré'
                  ? 'bg-foeg-navy text-white'
                  : 'bg-foeg-navy/20 text-foeg-navy'
              }`}
            >
              2
            </span>
            <div>
              <div className="font-medium">
                {language === 'es' ? '2. Preparación en Atelier' : language === 'en' ? '2. Atelier Preparation' : '2. Préparation Atelier'}
              </div>
              <div className="text-[10px] text-foeg-muted font-light">
                {language === 'es' ? 'Embalaje y control de calidad' : language === 'en' ? 'Garment packaging & inspection' : 'Mise sous housse et contrôle'}
              </div>
            </div>
          </div>

          <div
            className={`flex items-center space-x-3 ${
              isDelivered ? 'text-emerald-800 font-medium' : isShipping ? 'text-foeg-navy font-medium' : 'text-foeg-muted/60'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                isDelivered
                  ? 'bg-emerald-600 text-white'
                  : isShipping
                  ? 'bg-foeg-navy text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              3
            </span>
            <div>
              <div className="font-medium">
                {language === 'es' ? '3. Envío Signature' : language === 'en' ? '3. Signature Delivery' : '3. Expédition Signature'}
              </div>
              <div className="text-[10px] text-foeg-muted font-light">N° : {order.trackingNumber}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu de la commande */}
      <div className="bg-white border border-foeg-border p-6 sm:p-8 space-y-6 shadow-subtle">
        <h2 className="text-xs uppercase tracking-[0.2em] text-foeg-black font-medium border-b border-foeg-border pb-3">
          {language === 'es' ? 'Prendas Confeccionadas' : language === 'en' ? 'Crafted Pieces' : 'Pièces Confectionnées'} ({order.items.length})
        </h2>

        <div className="divide-y divide-foeg-border/60 text-xs font-light">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                {item.image && (
                  <div className="w-14 h-18 relative shrink-0 border border-foeg-border bg-foeg-surface overflow-hidden">
                    <MediaBox
                      src={item.image}
                      alt={item.name}
                      aspectRatio="full"
                      className="w-full h-full"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-serif text-base text-foeg-black font-normal">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-foeg-muted mt-0.5">
                    {item.size.includes('·')
                      ? `${item.size.split('·')[0].trim()} · ${getTranslatedColor(
                          item.size.split('·')[1].trim(),
                          language
                        )}`
                      : `${t('cart.size')} : ${item.size}`}{' '}
                    · {t('invoice.thQty')} : {item.quantity}
                  </p>
                </div>
              </div>
              <div className="font-medium text-foeg-black text-sm whitespace-nowrap">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Détails financiers et adresse */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-foeg-border text-xs">
          {/* Adresse */}
          <div className="space-y-1.5 font-light">
            <span className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-foeg-navy" /> Adresse de Réception
            </span>
            <p className="font-medium text-foeg-black">
              {order.firstName} {order.lastName}
            </p>
            <p className="text-foeg-muted">{order.address}</p>
            <p className="text-foeg-muted">
              {order.postalCode} {order.city}
            </p>
          </div>

          {/* Récapitulatif Total */}
          <div className="space-y-2 md:text-right font-light">
            <div className="flex justify-between md:justify-end md:space-x-8 text-foeg-muted">
              <span>Sous-total :</span>
              <span className="text-foeg-black font-medium">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between md:justify-end md:space-x-8 text-foeg-muted">
              <span>Livraison Signature :</span>
              <span className="text-foeg-navy font-medium">Offerte</span>
            </div>
            <div className="flex justify-between md:justify-end md:space-x-8 text-sm font-medium text-foeg-black pt-2 border-t border-foeg-border/60">
              <span className="uppercase tracking-wider">Total Réglé :</span>
              <span className="font-serif text-xl font-normal text-foeg-black">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
