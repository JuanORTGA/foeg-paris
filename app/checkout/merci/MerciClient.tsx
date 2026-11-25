'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Package,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Coins,
  Smartphone,
  Landmark,
  CheckCircle2,
  FileText,
  Printer,
  X,
  Loader2,
  AlertCircle,
  UploadCloud,
  Copy,
} from 'lucide-react';
import { formatVesPrice } from '@/lib/bcv';
import { submitPaymentReceipt } from '../actions';
import { useLanguage } from '@/lib/language-context';

interface MerciClientProps {
  order: any;
  paymentMethod: string;
  refParam?: string;
  bcvRate: number;
  paymentSettings?: any;
}

export default function MerciClient({
  order,
  paymentMethod,
  refParam,
  bcvRate,
  paymentSettings,
}: MerciClientProps) {
  const { t, language } = useLanguage();
  const isLocalPayment =
    paymentMethod === 'VIREMENT' ||
    paymentMethod === 'ZELLE' ||
    paymentMethod === 'BINANCE' ||
    paymentMethod === 'ZINLI' ||
    paymentMethod === 'PAGO_MOVIL';

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState(refParam || '');
  const [bankOrWallet, setBankOrWallet] = useState(paymentMethod.replace('_', ' '));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldKey: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const CopyButton = ({ text, fieldKey }: { text: string; fieldKey: string }) => (
    <button
      type="button"
      onClick={() => handleCopy(text, fieldKey)}
      className="inline-flex items-center space-x-1 px-2 py-0.5 ml-2 text-[10px] font-sans font-medium uppercase tracking-wider bg-foeg-surface hover:bg-foeg-navy hover:text-white border border-foeg-border transition-colors cursor-pointer select-none"
      title={language === 'es' ? 'Copiar al portapapeles' : language === 'en' ? 'Copy to clipboard' : 'Copier'}
      aria-label={language === 'es' ? 'Copiar al portapapeles' : language === 'en' ? 'Copy to clipboard' : 'Copier'}
    >
      {copiedField === fieldKey ? (
        <>
          <Check className="w-3 h-3 text-emerald-600" />
          <span className="text-emerald-700">{language === 'es' ? 'Copiado' : language === 'en' ? 'Copied' : 'Copié'}</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 text-foeg-muted" />
          <span>{language === 'es' ? 'Copiar' : language === 'en' ? 'Copy' : 'Copier'}</span>
        </>
      )}
    </button>
  );

  const formattedTotal = Number(order.total).toLocaleString('fr-FR', {
    style: 'currency',
    currency: order.currency || 'EUR',
  });

  const vesAmount = Number((order.total * bcvRate).toFixed(2));

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitPaymentReceipt({
        orderId: order.id,
        referenceNumber,
        bankOrWallet,
        notes,
      });

      if (res.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(res.error || 'Erreur lors de la transmission.');
      }
    } catch (err: any) {
      setSubmitError('Erreur de communication avec la Conciergerie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 md:pt-36 pb-32 px-6 md:px-12 max-w-3xl mx-auto space-y-10 animate-fadeIn text-left">
      {/* En-tête de Confirmation Dynamique */}
      <div className="text-center space-y-4 border-b border-foeg-border/80 pb-8">
        <div className="w-16 h-16 rounded-full bg-foeg-navy/10 text-foeg-navy mx-auto flex items-center justify-center">
          <Check className="w-8 h-8" strokeWidth={1} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy block font-medium">
          Maison FOEG Paris · Atelier Privé
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foeg-black tracking-tight">
          {language === 'es'
            ? (isLocalPayment ? 'Gracias. Su pedido ha sido reservado.' : 'Gracias por su confianza')
            : language === 'en'
            ? (isLocalPayment ? 'Thank you. Your order is reserved.' : 'Thank you for your order')
            : (isLocalPayment ? 'Merci. Votre commande est réservée.' : 'Merci pour votre confiance')}
        </h1>
        <p className="text-xs sm:text-sm text-foeg-muted font-light leading-relaxed max-w-md mx-auto">
          {language === 'es'
            ? (isLocalPayment
                ? `Su pedido #${order.orderNumber} está reservado en el Atelier. Por favor envíe su comprobante para iniciar su envío.`
                : `Su pedido #${order.orderNumber} está siendo preparado por nuestros artesanos en París.`)
            : language === 'en'
            ? (isLocalPayment
                ? `Your order #${order.orderNumber} is reserved at the Atelier. Please submit your payment receipt to dispatch.`
                : `Your order #${order.orderNumber} is being crafted by our Parisian artisans.`)
            : (isLocalPayment
                ? `Votre commande #${order.orderNumber} est réservée en Atelier. Veuillez transmettre votre reçu afin de lancer son expédition.`
                : `Votre commande #${order.orderNumber} est en cours de confection par nos artisans parisiens.`)}
        </p>
      </div>

      {/* BANNER SPÉCIAL PAIEMENTS LOCAUX (ZELLE, BINANCE, PAGO MÓVIL, ZINLI) */}
      {isLocalPayment && (
        <div className="p-6 bg-foeg-surface border border-foeg-border space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-2 text-foeg-navy font-medium text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{t('merci.wireDetails')} · {paymentMethod.replace('_', ' ')}</span>
            </span>
            <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 border border-amber-300">
              {t('merci.activeReservation')}
            </span>
          </div>

          <div className="p-4 bg-white border border-foeg-border font-mono text-xs text-foeg-black space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <strong>{t('merci.orderRef')} :</strong> #{order.orderNumber}
              </div>
              <CopyButton text={order.orderNumber} fieldKey="orderRef" />
            </div>

            {paymentMethod === 'VIREMENT' && (
              <div className="space-y-3 pt-1">
                {/* Banque Principale */}
                <div className="p-3 bg-foeg-surface/50 border border-foeg-border/70 space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-foeg-navy font-semibold">
                    {t('merci.primaryAccount')} — {paymentSettings?.bank_name || 'BNP Paribas Paris Marais'}
                  </div>
                  <div><strong>{t('merci.beneficiary')} :</strong> {paymentSettings?.bank_holder_name || 'Maison FOEG Paris SAS'}</div>
                  <div className="flex items-center flex-wrap gap-1">
                    <strong>{t('merci.ibanFr')} :</strong>
                    <span className="text-foeg-navy font-bold tracking-wider break-all">{paymentSettings?.bank_iban || 'FR76 3000 4000 0100 0123 4567 890'}</span>
                    <CopyButton text={paymentSettings?.bank_iban || 'FR76 3000 4000 0100 0123 4567 890'} fieldKey="iban1" />
                  </div>
                  <div className="flex items-center flex-wrap gap-1">
                    <strong>{t('merci.bicSwift')} :</strong>
                    <span>{paymentSettings?.bank_bic || 'BNPAFRFRPPXXX'}</span>
                    <CopyButton text={paymentSettings?.bank_bic || 'BNPAFRFRPPXXX'} fieldKey="bic1" />
                  </div>
                </div>

                {/* Banque 2 si activée */}
                {paymentSettings?.enable_virement_2 && (
                  <div className="p-3 bg-foeg-surface/50 border border-foeg-border/70 space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-foeg-navy font-semibold">
                      {t('merci.secondaryAccount')} — {paymentSettings?.bank_name_2 || 'Société Générale'}
                    </div>
                    <div><strong>{t('merci.beneficiary')} :</strong> {paymentSettings?.bank_holder_name_2 || 'Maison FOEG Paris SAS'}</div>
                    <div className="flex items-center flex-wrap gap-1">
                      <strong>{t('merci.ibanFr')} :</strong>
                      <span className="text-foeg-navy font-bold tracking-wider break-all">{paymentSettings?.bank_iban_2}</span>
                      <CopyButton text={paymentSettings?.bank_iban_2 || ''} fieldKey="iban2" />
                    </div>
                    <div className="flex items-center flex-wrap gap-1">
                      <strong>{t('merci.bicSwift')} :</strong>
                      <span>{paymentSettings?.bank_bic_2}</span>
                      <CopyButton text={paymentSettings?.bank_bic_2 || ''} fieldKey="bic2" />
                    </div>
                  </div>
                )}

                {/* Banque 3 si activée */}
                {paymentSettings?.enable_virement_3 && (
                  <div className="p-3 bg-foeg-surface/50 border border-foeg-border/70 space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-foeg-navy font-semibold">
                      {t('merci.altAccount')} — {paymentSettings?.bank_name_3 || 'Crédit Agricole'}
                    </div>
                    <div><strong>{t('merci.beneficiary')} :</strong> {paymentSettings?.bank_holder_name_3 || 'Maison FOEG Paris SAS'}</div>
                    <div className="flex items-center flex-wrap gap-1">
                      <strong>{t('merci.ibanFr')} :</strong>
                      <span className="text-foeg-navy font-bold tracking-wider break-all">{paymentSettings?.bank_iban_3}</span>
                      <CopyButton text={paymentSettings?.bank_iban_3 || ''} fieldKey="iban3" />
                    </div>
                    <div className="flex items-center flex-wrap gap-1">
                      <strong>{t('merci.bicSwift')} :</strong>
                      <span>{paymentSettings?.bank_bic_3}</span>
                      <CopyButton text={paymentSettings?.bank_bic_3 || ''} fieldKey="bic3" />
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-foeg-muted pt-1">
                  {t('merci.wireNotice').replace('{orderNumber}', order.orderNumber)}
                </div>
              </div>
            )}

            {paymentMethod === 'ZELLE' && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center flex-wrap gap-1">
                  <strong>Destinataire Zelle :</strong>
                  <span className="text-foeg-navy font-medium break-all">{paymentSettings?.zelle_email || 'concierge@foeg-paris.com'}</span>
                  <CopyButton text={paymentSettings?.zelle_email || 'concierge@foeg-paris.com'} fieldKey="zelle" />
                </div>
                <div className="text-foeg-muted">Titulaire : {paymentSettings?.zelle_name || 'Maison FOEG Paris LLC'}</div>
              </div>
            )}

            {paymentMethod === 'BINANCE' && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center flex-wrap gap-1">
                  <strong>Binance Pay ID :</strong>
                  <span className="text-foeg-navy font-bold">{paymentSettings?.binance_pay_id || '892104928'}</span> (USDT)
                  <CopyButton text={paymentSettings?.binance_pay_id || '892104928'} fieldKey="binance" />
                </div>
                <div className="text-foeg-muted">Réseau : {paymentSettings?.binance_network || 'BSC (BEP20) ou TRC20 sans frais'}</div>
              </div>
            )}

            {paymentMethod === 'ZINLI' && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center flex-wrap gap-1">
                  <strong>Compte Zinli :</strong>
                  <span className="text-foeg-navy font-medium break-all">{paymentSettings?.zinli_email || 'payments@foeg-paris.com'}</span>
                  <CopyButton text={paymentSettings?.zinli_email || 'payments@foeg-paris.com'} fieldKey="zinli" />
                </div>
                <div className="text-foeg-muted">Titulaire : {paymentSettings?.zinli_name || 'Maison FOEG Paris'} · Validation sans frais</div>
              </div>
            )}

            {paymentMethod === 'PAGO_MOVIL' && (
              <div className="space-y-2 pt-1">
                <div><strong>Banque :</strong> {paymentSettings?.pagomovil_bank || 'Banco Mercantil (0105)'}</div>
                <div className="flex items-center flex-wrap gap-1">
                  <strong>Téléphone :</strong>
                  <span className="font-bold text-foeg-navy">{paymentSettings?.pagomovil_phone || '0414-9281049'}</span>
                  <CopyButton text={paymentSettings?.pagomovil_phone || '0414-9281049'} fieldKey="pm_phone" />
                </div>
                <div className="flex items-center flex-wrap gap-1">
                  <strong>Cédula / RIF :</strong>
                  <span className="font-bold text-foeg-navy">{paymentSettings?.pagomovil_id || 'V-29.892.400'}</span>
                  <CopyButton text={paymentSettings?.pagomovil_id || 'V-29.892.400'} fieldKey="pm_id" />
                </div>
                <div><strong>Titulaire :</strong> {paymentSettings?.pagomovil_name || 'Maison FOEG Paris'}</div>
                <div className="mt-2.5 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="block text-[11px] text-emerald-800 uppercase tracking-wider font-semibold">
                      {t('merci.bcvTotal')} :
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      {t('merci.bcvRate')} : {bcvRate.toFixed(2)} Bs/$
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base sm:text-lg font-bold text-emerald-950">
                      {formatVesPrice(vesAmount)}
                    </span>
                    <CopyButton text={vesAmount.toString()} fieldKey="pm_ves" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bouton pour déclarer le reçu de virement */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-foeg-muted font-light leading-relaxed">
              {t('merci.notifyConcierge')}
            </p>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsReceiptModalOpen(true)}
              className="w-full sm:w-auto bg-foeg-navy hover:bg-foeg-black text-white px-5 py-2.5 text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer shadow-subtle shrink-0 flex items-center justify-center space-x-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('merci.submitReceiptBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Détails de la Commande */}
      <div className="bg-white border border-foeg-border shadow-subtle p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foeg-border/60 pb-4 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">
              Bordereau Atelier
            </span>
            <span className="font-mono text-sm font-medium text-foeg-black">
              #{order.orderNumber}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">
              Courriel de Suivi
            </span>
            <span className="font-medium text-foeg-black">
              {order.email}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">
              Mode & Statut
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
                order.status === 'PENDING_VERIFICATION' || order.status.includes('attente')
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {paymentMethod} · {order.status === 'PENDING_VERIFICATION' ? 'Réservé (À vérifier)' : order.status}
            </span>
          </div>
        </div>

        {/* Liste des Pièces Confectionnées */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
            Vos Pièces d’Exception
          </span>
          <div className="divide-y divide-foeg-border/60 border border-foeg-border text-xs">
            {order.items.map((it: any) => (
              <div key={it.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-sm text-foeg-black font-normal">
                    {it.productName}
                  </h3>
                  <p className="text-[11px] text-foeg-muted font-light mt-0.5">
                    Taille FR {it.size} · Quantité : {it.quantity}
                  </p>
                </div>
                <div className="font-medium text-foeg-black">
                  {(Number(it.price) * Number(it.quantity)).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adresse de Réception et Total */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-foeg-border/60 text-xs font-light">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-foeg-navy" /> Destination de Réception
            </span>
            <p className="font-medium text-foeg-black">
              {order.firstName} {order.lastName}
            </p>
            <p className="text-foeg-muted">{order.address}</p>
            <p className="text-foeg-muted">{order.postalCode} {order.city}</p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
              {t('merci.orderTotal')}
            </span>
            <p className="font-serif text-2xl font-light text-foeg-black">
              {formattedTotal}
            </p>
            {paymentMethod === 'PAGO_MOVIL' && (
              <p className="font-mono text-xs text-emerald-800 font-medium">
                {formatVesPrice(vesAmount)} {language === 'es' ? '(Tasa BCV)' : language === 'en' ? '(BCV Rate)' : '(Taux BCV)'}
              </p>
            )}
            <p className="text-[10px] text-emerald-800 font-medium">
              {t('merci.certifiedSecure')}
            </p>
          </div>
        </div>
      </div>

      {/* Boutons d'Action */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href={`/factura/${order.orderNumber}`}
          target="_blank"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-foeg-navy hover:bg-black text-white px-7 py-4 text-xs uppercase tracking-[0.2em] font-medium transition-colors text-center shadow-subtle"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>
            {language === 'es'
              ? 'Descargar Factura Oficial (PDF)'
              : language === 'en'
              ? 'Download Official Invoice (PDF)'
              : 'Télécharger la Facture Officielle (PDF)'}
          </span>
        </Link>

        <Link
          href="/cuenta/pedidos"
          className="w-full sm:w-auto bg-white border border-foeg-border hover:border-foeg-navy text-foeg-black px-7 py-4 text-xs uppercase tracking-[0.2em] font-medium transition-colors text-center"
        >
          {language === 'es'
            ? 'Mis Pedidos'
            : language === 'en'
            ? 'My Orders'
            : 'Mes Commandes'}
        </Link>

        <Link
          href="/"
          className="w-full sm:w-auto bg-white border border-foeg-border hover:border-foeg-navy text-foeg-black px-7 py-4 text-xs uppercase tracking-[0.2em] font-medium transition-colors text-center"
        >
          {language === 'es'
            ? 'Volver al Inicio'
            : language === 'en'
            ? 'Return to Home'
            : 'Retourner à la Maison'}
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE SOUMISSION DU REÇU DE VIREMENT (TAREA 4) */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-foeg-border shadow-floating w-full max-w-lg max-h-[90dvh] overflow-y-auto p-5 sm:p-8 space-y-5 relative">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsReceiptModalOpen(false)}
              className="absolute top-3.5 right-3.5 text-foeg-muted hover:text-foeg-black cursor-pointer p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-foeg-border/80 pb-3">
              <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-navy font-semibold block">
                {t('merci.modalConcierge')}
              </span>
              <h3 className="font-serif text-2xl font-light text-foeg-black mt-1">
                {t('merci.modalTitle')}
              </h3>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-serif text-xl text-foeg-black">{t('merci.modalSuccessTitle')}</h4>
                <p className="text-xs text-foeg-muted font-light max-w-xs mx-auto leading-relaxed">
                  {t('merci.modalSuccessDesc')}
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setIsReceiptModalOpen(false)}
                    className="bg-foeg-navy text-white px-6 py-2.5 text-xs uppercase tracking-wider font-medium cursor-pointer"
                  >
                    {t('merci.modalClose')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReceipt} className="space-y-4">
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-foeg-black font-medium block mb-1.5">
                    {t('merci.modalRefLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 08920491829 / TXID Binance"
                    suppressHydrationWarning
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-foeg-surface/40 border border-foeg-border text-foeg-black text-xs font-mono focus:border-foeg-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-foeg-black font-medium block mb-1.5">
                    {t('merci.modalBankLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Zelle Chase / Mercantil Pago Móvil / Binance Pay"
                    suppressHydrationWarning
                    value={bankOrWallet}
                    onChange={(e) => setBankOrWallet(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-foeg-surface/40 border border-foeg-border text-foeg-black text-xs font-light focus:border-foeg-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-foeg-black font-medium block mb-1.5">
                    {t('merci.modalNoteLabel')}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={language === 'es' ? 'Detalles o referencia de su transferencia...' : language === 'en' ? 'Transfer details or reference...' : 'Précisions sur votre transfert...'}
                    suppressHydrationWarning
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-foeg-surface/40 border border-foeg-border text-foeg-black text-xs font-light focus:border-foeg-navy focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setIsReceiptModalOpen(false)}
                    className="px-4 py-2.5 border border-foeg-border text-xs uppercase tracking-wider text-foeg-muted hover:text-foeg-black cursor-pointer"
                  >
                    {t('merci.modalCancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !referenceNumber.trim()}
                    suppressHydrationWarning
                    className="px-6 py-2.5 bg-foeg-navy text-white hover:bg-foeg-black text-xs uppercase tracking-wider font-medium cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('merci.modalSubmitting')}</span>
                      </>
                    ) : (
                      <span>{t('merci.modalSubmit')}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
