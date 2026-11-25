'use client';

import React from 'react';
import Link from 'next/link';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Package,
  Award,
  Globe,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { getTranslatedColor } from '@/lib/i18n';

interface OrderItem {
  id: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
}

interface FacturaClientProps {
  order: {
    id: string;
    orderNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    shippingMethod: string;
    paymentMethod: string;
    addressString?: string | null;
    total: number;
    currency: string;
    status: string;
    trackingNumber?: string | null;
    createdAt: Date | string;
    items: OrderItem[];
  };
}

export default function FacturaClient({ order }: FacturaClientProps) {
  const { t, language, setLanguage } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  // Cálculo fiscal: Total = Subtotal HT + TVA 20%
  const total = Number(order.total);
  const subtotalHt = total / 1.2;
  const tva = total - subtotalHt;

  const formattedDate = new Date(order.createdAt).toLocaleDateString(
    language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  const isPickup = order.shippingMethod === 'PICKUP';

  const getFormattedPaymentMethod = (method: string) => {
    const m = (method || '').toUpperCase().trim();
    if (m === 'VIREMENT BANCAIRE' || m === 'VIREMENT' || m === 'VIREMENT_BANCAIRE') {
      return language === 'es'
        ? 'Transferencia Bancaria (Francia)'
        : language === 'en'
        ? 'Bank Transfer (France)'
        : 'Virement Bancaire (France)';
    }
    if (m === 'STRIPE' || m === 'CARD' || m === 'CARTE BANCAIRE' || m === 'CARTE') {
      return language === 'es'
        ? 'Tarjeta Bancaria'
        : language === 'en'
        ? 'Credit / Debit Card'
        : 'Carte Bancaire';
    }
    if (m === 'PAYPAL') return 'PayPal';
    if (m === 'ZELLE') return 'Zelle';
    if (m === 'BINANCE' || m === 'BINANCE_PAY' || m === 'CRYPTO') return 'Binance Pay';
    if (m === 'ZINLI') return 'Zinli';
    if (m === 'PAGO_MOVIL' || m === 'PAGOMOVIL') return 'Pago Móvil';
    return method || (language === 'es' ? 'Tarjeta Bancaria' : language === 'en' ? 'Credit Card' : 'Carte Bancaire');
  };

  const isPaid =
    order.status === 'PAID' ||
    order.status === 'Payé' ||
    order.status === 'PAYÉ' ||
    order.status === 'En préparation à l’Atelier' ||
    order.status === 'Expédié' ||
    order.status === 'Livré';

  return (
    <div className="min-h-screen bg-[#FBFBF9] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-foeg-black print:bg-white print:p-0 print:m-0">
      {/* =========================================================================
          BARRA DE HERRAMIENTAS SUPERIOR (SOLO EN PANTALLA, OCULTA AL IMPRIMIR)
         ========================================================================= */}
      <div className="max-w-4xl mx-auto mb-8 print:hidden no-print flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-foeg-border p-4 shadow-subtle">
        <div className="flex items-center space-x-4">
          <Link
            href="/cuenta/pedidos"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-navy transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('invoice.myOrdersBtn')}</span>
          </Link>
          <span className="text-foeg-border">|</span>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-navy transition-colors font-medium"
          >
            {t('invoice.backBtn')}
          </Link>
        </div>

        {/* Selector de idioma & Botón Imprimir / PDF */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* Conmutador de Idioma */}
          <div className="flex items-center justify-center space-x-1.5 text-[11px] font-mono border border-foeg-border px-2 py-1">
            <span className="text-foeg-muted text-[10px] uppercase tracking-wider mr-1">Lang:</span>
            <button
              type="button"
              onClick={() => setLanguage('fr')}
              className={`min-w-[32px] min-h-[32px] flex items-center justify-center px-1.5 py-0.5 cursor-pointer text-xs ${
                language === 'fr' ? 'bg-foeg-navy text-white font-bold' : 'text-foeg-muted hover:text-foeg-black'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`min-w-[32px] min-h-[32px] flex items-center justify-center px-1.5 py-0.5 cursor-pointer text-xs ${
                language === 'en' ? 'bg-foeg-navy text-white font-bold' : 'text-foeg-muted hover:text-foeg-black'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`min-w-[32px] min-h-[32px] flex items-center justify-center px-1.5 py-0.5 cursor-pointer text-xs ${
                language === 'es' ? 'bg-foeg-navy text-white font-bold' : 'text-foeg-muted hover:text-foeg-black'
              }`}
            >
              ES
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center space-x-2 bg-foeg-navy hover:bg-black text-white px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-all shadow-subtle cursor-pointer active:scale-[0.99]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('invoice.printBtn')}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          DOCUMENTO OFICIAL DE FACTURA FOEG PARIS (EDITORIAL HAUTE COUTURE)
         ========================================================================= */}
      <main
        id="printable-invoice"
        className="max-w-4xl mx-auto bg-white border border-foeg-border p-5 sm:p-10 md:p-14 shadow-floating print:border-none print:shadow-none print:p-0 print:m-0 space-y-8 sm:space-y-10"
      >
        {/* CABECERA: MEMBRETE DE LA MAISON Y DATOS DE FACTURA */}
        <header className="border-b-2 border-foeg-black pb-8 flex flex-col sm:flex-row justify-between items-start gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-foeg.png"
                alt="FOEG Paris Logo"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0"
              />
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light tracking-[0.25em] text-foeg-black uppercase">
                FOEG
              </h1>
            </div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-foeg-navy font-semibold">
              {t('invoice.maison')} · Paris 10e
            </p>
            <div className="pt-2 text-xs text-foeg-muted font-light leading-relaxed space-y-0.5">
              <p>{t('invoice.headquarters')}</p>
              <p>{t('invoice.taxNumbers')}</p>
              <p>{t('invoice.concierge')}</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1 sm:self-start bg-foeg-surface/40 sm:bg-transparent p-4 sm:p-0 border border-foeg-border sm:border-none w-full sm:w-auto">
            <span className="inline-block px-3 py-1 bg-foeg-navy text-white text-[10px] uppercase tracking-[0.28em] font-medium mb-1">
              {t('invoice.officialTitle')}
            </span>
            <p className="font-mono text-lg font-medium text-foeg-black tracking-wider">
              FAC-{order.orderNumber}
            </p>
            <p className="text-xs text-foeg-muted font-light">
              {t('invoice.orderRef')} : #{order.orderNumber}
            </p>
            <p className="text-xs text-foeg-muted font-light">
              {t('invoice.emissionDate')} : {formattedDate}
            </p>

            <div className="pt-2 flex items-center sm:justify-end gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                <span>{isPaid ? (language === 'es' ? 'PAYÉ (PAGADO)' : language === 'en' ? 'PAID' : 'PAYÉ') : t('invoice.statusCertified')}</span>
              </span>
            </div>
          </div>
        </header>

        {/* COORDENADAS: CLIENTE, EXPEDICIÓN Y FORMA DE PAGO */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 border-b border-foeg-border/80 pb-8 text-xs">
          {/* Facturado a */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted font-semibold block">
              {t('invoice.billedTo')}
            </span>
            <p className="font-serif text-lg font-light text-foeg-black">
              {order.firstName} {order.lastName}
            </p>
            <p className="text-foeg-muted font-light">{order.email}</p>
            <p className="text-[11px] text-foeg-navy font-medium flex items-center space-x-1 pt-1">
              <Award className="w-3.5 h-3.5" />
              <span>
                {language === 'es'
                  ? 'Miembro Privilegiado FOEG Paris'
                  : language === 'en'
                  ? 'Privilege Member FOEG Paris'
                  : 'Membre Privilège FOEG Paris'}
              </span>
            </p>
          </div>

          {/* Dirección de Envío o Retiro */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted font-semibold block">
              {isPickup ? t('invoice.pickupStore') : t('invoice.shippingAddress')}
            </span>
            {isPickup ? (
              <div className="space-y-1">
                <p className="font-medium text-foeg-black flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-foeg-navy" />
                  <span>
                    {language === 'es'
                      ? 'Retiro en Boutique Física'
                      : language === 'en'
                      ? 'In-Store Boutique Pickup'
                      : 'Retrait en Boutique Physique'}
                  </span>
                </p>
                <p className="text-foeg-muted font-light">
                  {order.addressString || order.address || (language === 'es' ? 'Boutique Seleccionada' : language === 'en' ? 'Selected Boutique' : 'Boutique Sélectionnée')}
                </p>
                <p className="text-[10px] text-emerald-800 font-medium">
                  {language === 'es'
                    ? 'Servicio Click & Collect Privado · Gratuito'
                    : language === 'en'
                    ? 'Private Click & Collect Service · Complimentary'
                    : 'Service Click & Collect Privé · Gratuit'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-medium text-foeg-black">{order.address}</p>
                <p className="text-foeg-muted font-light">
                  {order.postalCode} {order.city}
                </p>
                <p className="text-foeg-muted font-light">
                  {language === 'es'
                    ? 'Francia Metropolitana / Internacional'
                    : language === 'en'
                    ? 'Metropolitan France / International'
                    : 'France Métropolitaine / International'}
                </p>
                {order.trackingNumber && (
                  <p className="font-mono text-[11px] text-foeg-navy font-medium pt-1">
                    {language === 'es' ? 'N° de Seguimiento : ' : language === 'en' ? 'Tracking No. : ' : 'N° Suivi : '}
                    {order.trackingNumber}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Modalidad de Pago Dinámica */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted font-semibold block">
              {t('invoice.paymentMethod')}
            </span>
            <p className="font-medium text-foeg-black flex items-center space-x-1.5 uppercase tracking-wide">
              <CreditCard className="w-3.5 h-3.5 text-foeg-navy" />
              <span>{getFormattedPaymentMethod(order.paymentMethod)}</span>
            </p>
            <p className="text-[11px] text-emerald-800 font-light flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {language === 'es'
                  ? 'Pago verificado y seguro'
                  : language === 'en'
                  ? 'Verified & secure payment'
                  : 'Règlement vérifié & sécurisé'}
              </span>
            </p>
            <p className="text-[10px] text-foeg-muted italic">
              {language === 'es'
                ? 'Protocolo de cifrado TLS 256-bit'
                : language === 'en'
                ? 'TLS 256-bit encryption protocol'
                : 'Protocole de chiffrement TLS 256-bit'}
            </p>
          </div>
        </section>

        {/* TABLA DE PRODUCTOS Y PIEZAS CONFECCIONADAS (RESPONSIVE TOUCH & PRINT) */}
        <section className="space-y-4">
          {/* Vista móvil compacta (< sm, oculta al imprimir) */}
          <div className="sm:hidden print:hidden divide-y divide-foeg-border/70 border border-foeg-border">
            {(order.items || []).map((item) => (
              <div key={`m-${item.id}`} className="p-3.5 space-y-2 bg-white">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-serif text-sm font-medium text-foeg-black leading-snug">
                      {item.productName}
                    </p>
                    <p className="text-[9px] text-foeg-muted uppercase tracking-wider font-light mt-0.5">
                      {language === 'es'
                        ? 'Confección Atelier París'
                        : language === 'en'
                        ? 'Paris Atelier Craftsmanship'
                        : 'Confection Atelier Paris'}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-foeg-black text-xs shrink-0">
                    {(item.price * item.quantity).toFixed(2)} {order.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-foeg-border/40 text-foeg-muted">
                  <span className="font-mono">
                    {t('invoice.thSize')}: <strong className="text-foeg-black">{item.size.includes('·') ? `${item.size.split('·')[0].trim()} · ${getTranslatedColor(item.size.split('·')[1].trim(), language)}` : item.size}</strong>
                  </span>
                  <span className="font-mono">
                    {t('invoice.thQty')}: <strong className="text-foeg-black">{item.quantity}</strong> × {item.price.toFixed(2)} {order.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabla formal completa para desktop e impresión PDF */}
          <div className="hidden sm:block print:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-foeg-black text-[10px] uppercase tracking-[0.22em] font-semibold text-foeg-black">
                  <th className="py-3 px-2">{t('invoice.thItem')}</th>
                  <th className="py-3 px-2 text-center">{t('invoice.thSize')}</th>
                  <th className="py-3 px-2 text-center">{t('invoice.thQty')}</th>
                  <th className="py-3 px-2 text-right">{t('invoice.thUnitPrice')}</th>
                  <th className="py-3 px-2 text-right">{t('invoice.thTotal')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foeg-border/80 font-light">
                {(order.items || []).map((item) => (
                  <tr key={item.id} className="py-3.5">
                    <td className="py-4 px-2">
                      <p className="font-serif text-sm sm:text-base text-foeg-black font-medium">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-foeg-muted uppercase tracking-wider font-light mt-0.5">
                        {language === 'es'
                          ? 'Confección Atelier París · Pieza Firmada y Numerada'
                          : language === 'en'
                          ? 'Paris Atelier Craftsmanship · Signed & Numbered Piece'
                          : 'Confection Atelier Paris · Pièce Signée & Numérotée'}
                      </p>
                    </td>
                    <td className="py-4 px-2 text-center font-mono font-medium text-foeg-black">
                      {item.size.includes('·')
                        ? `${item.size.split('·')[0].trim()} · ${getTranslatedColor(
                            item.size.split('·')[1].trim(),
                            language
                          )}`
                        : item.size}
                    </td>
                    <td className="py-4 px-2 text-center font-mono">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-2 text-right font-mono text-foeg-muted">
                      {item.price.toFixed(2)} {order.currency}
                    </td>
                    <td className="py-4 px-2 text-right font-mono font-medium text-foeg-black text-sm">
                      {(item.price * item.quantity).toFixed(2)} {order.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DESGLOSE FISCAL Y FINANCIERO */}
        <section className="border-t border-foeg-border pt-6 flex justify-end">
          <div className="w-full sm:w-80 space-y-2.5 text-xs">
            <div className="flex justify-between text-foeg-muted font-light">
              <span>{t('invoice.subtotalHt')}</span>
              <span className="font-mono">
                {subtotalHt.toFixed(2)} {order.currency}
              </span>
            </div>
            <div className="flex justify-between text-foeg-muted font-light">
              <span>{t('invoice.vat')}</span>
              <span className="font-mono">
                {tva.toFixed(2)} {order.currency}
              </span>
            </div>
            <div className="flex justify-between text-foeg-muted font-light">
              <span>{t('invoice.shipping')}</span>
              <span className="text-emerald-700 font-medium uppercase tracking-wider text-[10px]">
                {t('invoice.free')} (0,00 {order.currency})
              </span>
            </div>
            <div className="flex justify-between text-base sm:text-lg font-serif font-normal border-t-2 border-foeg-black pt-3 text-foeg-black">
              <span>{t('invoice.totalTtc')}</span>
              <span className="font-mono font-semibold tracking-wider">
                {total.toFixed(2)} {order.currency}
              </span>
            </div>
          </div>
        </section>

        {/* RECUADRO DE CERTIFICADO DE AUTENTICIDAD Y SELLO ATELIER PARIS */}
        <footer className="border-t border-foeg-border pt-8 space-y-6">
          <div className="bg-[#FAF9F6] border border-foeg-border p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl text-left">
              <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-navy font-semibold block flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-700" />
                <span>{t('invoice.certificateTitle')}</span>
              </span>
              <p className="text-[11px] text-foeg-muted font-light leading-relaxed">
                {t('invoice.certificateText')}
              </p>
            </div>

            {/* Sello de la Maison FOEG */}
            <div className="shrink-0 w-28 h-28 rounded-full border-2 border-dashed border-foeg-navy/40 flex flex-col items-center justify-center text-center p-2 text-foeg-navy select-none">
              <span className="text-[8px] uppercase tracking-widest font-semibold block">Maison FOEG</span>
              <span className="font-serif text-sm font-bold block my-0.5">PARIS</span>
              <span className="text-[7px] uppercase tracking-wider text-foeg-muted block">Atelier Sampaix</span>
              <span className="text-[7px] text-emerald-800 font-mono font-bold block mt-0.5">
                {language === 'es' ? 'CERTIFICADO' : language === 'en' ? 'CERTIFIED' : 'CERTIFIÉ'}
              </span>
            </div>
          </div>

          <div className="text-center text-[10px] text-foeg-muted font-light leading-relaxed space-y-1">
            <p>
              {language === 'es'
                ? 'Para cualquier consulta relativa a esta factura, cambio de talla o cita en salón privado :'
                : language === 'en'
                ? 'For any request regarding this invoice, size exchange or private salon appointment :'
                : 'Pour toute demande relative à cette facture, échange de taille ou prise de rendez-vous en salon privé :'}
            </p>
            <p className="font-medium text-foeg-black">
              concierge@foeg-paris.com · +33 1 42 68 55 00 · 48 Rue Lucien Sampaix, 75010 Paris
            </p>
          </div>
        </footer>
      </main>

      {/* Estilos CSS específicos para la impresión y exportación en PDF */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          header:not(#printable-invoice header),
          aside,
          nav,
          button,
          select,
          input,
          .no-print,
          .print\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>
    </div>
  );
}
