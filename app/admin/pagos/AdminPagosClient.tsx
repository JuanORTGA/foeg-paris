'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Eye,
  EyeOff,
  Save,
  Check,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import {
  VisaIcon,
  MastercardIcon,
  PaypalIcon,
  ZelleIcon,
  BinanceIcon,
  ZinliIcon,
} from '@/components/ui/PaymentIcons';
import { updatePaymentSettings } from '@/lib/payment-settings-actions';
import { type PaymentSettings } from '@/lib/payment-settings-types';
import { useLanguage } from '@/lib/language-context';

interface AdminPagosClientProps {
  initialSettings: PaymentSettings;
}

function LuxuryToggle({
  checked,
  onChange,
  activeLabel,
  disabledLabel,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  activeLabel?: string;
  disabledLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between sm:justify-start space-x-3 focus:outline-none cursor-pointer group select-none shrink-0"
      aria-pressed={checked}
    >
      <span
        className={`text-[10px] uppercase tracking-[0.22em] transition-colors truncate max-w-[150px] sm:max-w-none ${
          checked ? 'text-foeg-navy font-medium' : 'text-foeg-muted/70 font-light'
        }`}
      >
        {checked ? (activeLabel || 'Activé au Checkout') : (disabledLabel || 'Désactivé')}
      </span>
      <div
        className={`w-12 h-6 transition-colors duration-200 relative flex items-center px-0.5 rounded-none shrink-0 ${
          checked ? 'bg-foeg-navy' : 'bg-[#E5E0D8]'
        }`}
      >
        <div
          className={`w-5 h-5 bg-white transition-transform duration-200 rounded-none shadow-sm ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  );
}

export default function AdminPagosClient({ initialSettings }: AdminPagosClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<PaymentSettings>(initialSettings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Visibilité des secrets
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showStripeWebhook, setShowStripeWebhook] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof PaymentSettings) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, typeof val === 'boolean' ? (val ? 'true' : 'false') : (val || ''));
    });

    const res = await updatePaymentSettings(data);
    if (res.success) {
      showToast(t('admin.pagos.savedSuccess'));
      startTransition(() => {
        router.refresh();
      });
    } else {
      alert(res.error || 'Erreur');
    }
  };

  return (
    <div className="space-y-12 max-w-5xl relative pb-24 text-foeg-black">
      {/* Toast Flotante */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-foeg-navy text-white px-7 py-4 shadow-floating flex items-center space-x-3 text-xs uppercase tracking-[0.2em] animate-fadeIn border border-white/20">
          <div className="w-5 h-5 bg-white/20 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* En-tête Principal de la Maison */}
      <div className="border-b border-foeg-border/80 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block">
            Maison FOEG Paris · Conciergerie Financière
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-foeg-black tracking-tight">
            {t('admin.pagos.title')}
          </h1>
          <p className="text-xs text-foeg-muted font-light max-w-2xl leading-relaxed">
            {t('admin.pagos.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 shrink-0 self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-700" strokeWidth={1.5} />
          <span>TLS 256-Bit</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-14">
        {/* =========================================================================
            SECTION 1 : PAIEMENTS INTERNATIONAUX (STRIPE & PAYPAL)
        ========================================================================= */}
        <div className="space-y-10">
          <div className="border-b border-foeg-black pb-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-foeg-muted block">{t('admin.pagos.sec1')}</span>
            <h2 className="font-serif text-2xl font-normal text-foeg-black mt-1">{t('admin.pagos.sec1Title')}</h2>
          </div>

          {/* 1.1 STRIPE */}
          <div className="p-4 sm:p-7 md:p-9 bg-white border border-foeg-border/80 space-y-7 shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-foeg-border/60 gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-1 bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                  <Image
                    src="/images/payments/stripe-cards.png"
                    alt="Visa & MasterCard"
                    width={100}
                    height={40}
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-foeg-black tracking-wide">Stripe</h3>
                  <span className="text-[11px] text-foeg-muted font-light mt-0.5 block">
                    {t('admin.pagos.stripeDesc')}
                  </span>
                </div>
              </div>
              <LuxuryToggle
                checked={formData.enable_stripe}
                onChange={() => handleToggle('enable_stripe')}
                activeLabel={t('admin.pagos.activeAtCheckout')}
                disabledLabel={t('admin.pagos.disabled')}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 pt-1">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.stripePub')} *
                </label>
                <input
                  type="text"
                  name="stripe_publishable_key"
                  value={formData.stripe_publishable_key}
                  onChange={handleInputChange}
                  placeholder="pk_live_... ou pk_test_..."
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono text-foeg-black focus:outline-none transition-colors truncate"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                    {t('admin.pagos.stripeSec')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showStripeSecret ? 'text' : 'password'}
                      name="stripe_secret_key"
                      value={formData.stripe_secret_key}
                      onChange={handleInputChange}
                      placeholder="sk_live_... ou sk_test_..."
                      className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 pr-9 text-xs font-mono text-foeg-black focus:outline-none transition-colors truncate"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeSecret(!showStripeSecret)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-foeg-muted hover:text-foeg-black p-1 transition-colors cursor-pointer"
                    >
                      {showStripeSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                    {t('admin.pagos.stripeWh')}
                  </label>
                  <div className="relative">
                    <input
                      type={showStripeWebhook ? 'text' : 'password'}
                      name="stripe_webhook_secret"
                      value={formData.stripe_webhook_secret}
                      onChange={handleInputChange}
                      placeholder="whsec_..."
                      className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 pr-9 text-xs font-mono text-foeg-black focus:outline-none transition-colors truncate"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStripeWebhook(!showStripeWebhook)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-foeg-muted hover:text-foeg-black p-1 transition-colors cursor-pointer"
                    >
                      {showStripeWebhook ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1.2 PAYPAL */}
          <div className="p-4 sm:p-7 md:p-9 bg-white border border-foeg-border/80 space-y-7 shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-foeg-border/60 gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-1.5 bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                  <Image
                    src="/images/payments/paypal.png"
                    alt="PayPal"
                    width={80}
                    height={36}
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-foeg-black tracking-wide">PayPal</h3>
                  <span className="text-[11px] text-foeg-muted font-light mt-0.5 block">
                    {t('admin.pagos.paypalDesc')}
                  </span>
                </div>
              </div>
              <LuxuryToggle
                checked={formData.enable_paypal}
                onChange={() => handleToggle('enable_paypal')}
                activeLabel={t('admin.pagos.activeAtCheckout')}
                disabledLabel={t('admin.pagos.disabled')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.paypalClient')}
                </label>
                <input
                  type="text"
                  name="paypal_client_id"
                  value={formData.paypal_client_id}
                  onChange={handleInputChange}
                  placeholder="Client ID..."
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono text-foeg-black focus:outline-none transition-colors truncate"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.paypalSec')}
                </label>
                <div className="relative">
                  <input
                    type={showPaypalSecret ? 'text' : 'password'}
                    name="paypal_secret"
                    value={formData.paypal_secret}
                    onChange={handleInputChange}
                    placeholder="Secret Key..."
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 pr-9 text-xs font-mono text-foeg-black focus:outline-none transition-colors truncate"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-foeg-muted hover:text-foeg-black p-1 transition-colors cursor-pointer"
                  >
                    {showPaypalSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2 : VIREMENT BANCAIRE FRANÇAIS (SEPA) - MULTI-BANQUES
        ========================================================================= */}
        <div className="space-y-10">
          <div className="border-b border-foeg-black pb-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-foeg-muted block">{t('admin.pagos.sec2')}</span>
            <h2 className="font-serif text-2xl font-normal text-foeg-black mt-1">{t('admin.pagos.sec2Title')}</h2>
          </div>

          {/* 2.1 BANQUE 1 : COMPTE PRINCIPAL */}
          <div className="p-7 sm:p-9 bg-white border border-foeg-border/80 space-y-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-foeg-border/60 gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-1 bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                  <Image
                    src="/images/payments/bnp-paribas.png"
                    alt="BNP Paribas"
                    width={90}
                    height={36}
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-serif text-xl font-normal text-foeg-black tracking-wide">
                      {t('admin.pagos.bank1Title')}
                    </h3>
                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-foeg-navy/10 text-foeg-navy font-semibold">
                      Recommandé
                    </span>
                  </div>
                  <span className="text-[11px] text-foeg-muted font-light mt-0.5 block">
                    {t('admin.pagos.bank1Desc')}
                  </span>
                </div>
              </div>
              <LuxuryToggle
                checked={formData.enable_virement}
                onChange={() => handleToggle('enable_virement')}
                activeLabel={t('admin.pagos.activeAtCheckout')}
                disabledLabel={t('admin.pagos.disabled')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankHolder')} *
                </label>
                <input
                  type="text"
                  name="bank_holder_name"
                  value={formData.bank_holder_name}
                  onChange={handleInputChange}
                  placeholder="Ex. Maison FOEG Paris SAS"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankName')} *
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  placeholder="Ex. BNP Paribas Paris Marais"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankIban')} *
                </label>
                <input
                  type="text"
                  name="bank_iban"
                  value={formData.bank_iban}
                  onChange={handleInputChange}
                  placeholder="FR76 3000 4000 0100 0123 4567 890"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono uppercase text-foeg-black focus:outline-none transition-colors tracking-wider"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankBic')} *
                </label>
                <input
                  type="text"
                  name="bank_bic"
                  value={formData.bank_bic}
                  onChange={handleInputChange}
                  placeholder="BNPAFRFRPPXXX"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono uppercase text-foeg-black focus:outline-none transition-colors tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* 2.2 BANQUE 2 : COMPTE SECONDAIRE */}
          <div className="p-7 sm:p-9 bg-white border border-foeg-border/80 space-y-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-foeg-border/60 gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-1 bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                  <Image
                    src="/images/payments/societe-generale.png"
                    alt="Société Générale"
                    width={90}
                    height={36}
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-foeg-black tracking-wide">
                    {t('admin.pagos.bank2Title')}
                  </h3>
                  <span className="text-[11px] text-foeg-muted font-light mt-0.5 block">
                    {t('admin.pagos.bank2Desc')}
                  </span>
                </div>
              </div>
              <LuxuryToggle
                checked={formData.enable_virement_2}
                onChange={() => handleToggle('enable_virement_2')}
                activeLabel={t('admin.pagos.activeAtCheckout')}
                disabledLabel={t('admin.pagos.disabled')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankHolder')}
                </label>
                <input
                  type="text"
                  name="bank_holder_name_2"
                  value={formData.bank_holder_name_2}
                  onChange={handleInputChange}
                  placeholder="Ex. Maison FOEG Paris SAS"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankName')}
                </label>
                <input
                  type="text"
                  name="bank_name_2"
                  value={formData.bank_name_2}
                  onChange={handleInputChange}
                  placeholder="Ex. Société Générale Paris Bastille"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankIban')}
                </label>
                <input
                  type="text"
                  name="bank_iban_2"
                  value={formData.bank_iban_2}
                  onChange={handleInputChange}
                  placeholder="FR76 3000 3000 0200 0987 6543 210"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono uppercase text-foeg-black focus:outline-none transition-colors tracking-wider"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankBic')}
                </label>
                <input
                  type="text"
                  name="bank_bic_2"
                  value={formData.bank_bic_2}
                  onChange={handleInputChange}
                  placeholder="SOGEFRFRPPXXX"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono uppercase text-foeg-black focus:outline-none transition-colors tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* 2.3 BANQUE 3 : COMPTE ALTERNATIF / TRÉSORERIE */}
          <div className="p-7 sm:p-9 bg-white border border-foeg-border/80 space-y-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-foeg-border/60 gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-1 bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                  <Image
                    src="/images/payments/credit-agricole.png"
                    alt="Crédit Agricole"
                    width={90}
                    height={36}
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-foeg-black tracking-wide">
                    {t('admin.pagos.bank3Title')}
                  </h3>
                  <span className="text-[11px] text-foeg-muted font-light mt-0.5 block">
                    {t('admin.pagos.bank3Desc')}
                  </span>
                </div>
              </div>
              <LuxuryToggle
                checked={formData.enable_virement_3}
                onChange={() => handleToggle('enable_virement_3')}
                activeLabel={t('admin.pagos.activeAtCheckout')}
                disabledLabel={t('admin.pagos.disabled')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankHolder')}
                </label>
                <input
                  type="text"
                  name="bank_holder_name_3"
                  value={formData.bank_holder_name_3}
                  onChange={handleInputChange}
                  placeholder="Ex. Maison FOEG Paris SAS"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankName')}
                </label>
                <input
                  type="text"
                  name="bank_name_3"
                  value={formData.bank_name_3}
                  onChange={handleInputChange}
                  placeholder="Ex. Crédit Agricole Île-de-France"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankIban')}
                </label>
                <input
                  type="text"
                  name="bank_iban_3"
                  value={formData.bank_iban_3}
                  onChange={handleInputChange}
                  placeholder="FR76 1820 6000 0300 0555 4443 221"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono uppercase text-foeg-black focus:outline-none transition-colors tracking-wider"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.bankBic')}
                </label>
                <input
                  type="text"
                  name="bank_bic_3"
                  value={formData.bank_bic_3}
                  onChange={handleInputChange}
                  placeholder="AGRIFRPPXXX"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono uppercase text-foeg-black focus:outline-none transition-colors tracking-wider"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3 : PAIEMENTS ALTERNATIFS, CRYPTO & PAGO MÓVIL
        ========================================================================= */}
        <div className="space-y-10">
          <div className="border-b border-foeg-black pb-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-foeg-muted block">{t('admin.pagos.sec3')}</span>
            <h2 className="font-serif text-2xl font-normal text-foeg-black mt-1">{t('admin.pagos.sec3Title')}</h2>
          </div>

          {/* 3.1 ZELLE */}
          <div className="p-7 sm:p-9 bg-white border border-foeg-border/80 space-y-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-foeg-border/60 gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-1 bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                  <Image
                    src="/images/payments/zelle.png"
                    alt="Zelle"
                    width={80}
                    height={36}
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-foeg-black tracking-wide">Zelle</h3>
                  <span className="text-[11px] text-foeg-muted font-light mt-0.5 block">
                    {t('admin.pagos.zelleDesc')}
                  </span>
                </div>
              </div>
              <LuxuryToggle
                checked={formData.enable_zelle}
                onChange={() => handleToggle('enable_zelle')}
                activeLabel={t('admin.pagos.activeAtCheckout')}
                disabledLabel={t('admin.pagos.disabled')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.zelleEmail')}
                </label>
                <input
                  type="text"
                  name="zelle_email"
                  value={formData.zelle_email}
                  onChange={handleInputChange}
                  placeholder="concierge@foeg-paris.com ou +1..."
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.zelleHolder')}
                </label>
                <input
                  type="text"
                  name="zelle_name"
                  value={formData.zelle_name}
                  onChange={handleInputChange}
                  placeholder="Maison FOEG Paris LLC"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3.2 BINANCE PAY */}
          <div className="p-7 sm:p-9 bg-white border border-foeg-border/80 space-y-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-foeg-border/60 gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-1 bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                  <Image
                    src="/images/payments/binance.png"
                    alt="Binance Pay"
                    width={90}
                    height={36}
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-foeg-black tracking-wide">Binance Pay</h3>
                  <span className="text-[11px] text-foeg-muted font-light mt-0.5 block">
                    {t('admin.pagos.binanceDesc')}
                  </span>
                </div>
              </div>
              <LuxuryToggle
                checked={formData.enable_binance}
                onChange={() => handleToggle('enable_binance')}
                activeLabel={t('admin.pagos.activeAtCheckout')}
                disabledLabel={t('admin.pagos.disabled')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.binancePayId')}
                </label>
                <input
                  type="text"
                  name="binance_pay_id"
                  value={formData.binance_pay_id}
                  onChange={handleInputChange}
                  placeholder="Ex. 892104928"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.binanceNet')}
                </label>
                <input
                  type="text"
                  name="binance_network"
                  value={formData.binance_network}
                  onChange={handleInputChange}
                  placeholder="Ex. BSC (BEP20) / TRC20"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3.3 ZINLI */}
          <div className="p-7 sm:p-9 bg-white border border-foeg-border/80 space-y-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-foeg-border/60 gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-1 bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                  <Image
                    src="/images/payments/zinli.png"
                    alt="Zinli"
                    width={80}
                    height={36}
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-normal text-foeg-black tracking-wide">Zinli</h3>
                  <span className="text-[11px] text-foeg-muted font-light mt-0.5 block">
                    {t('admin.pagos.zinliDesc')}
                  </span>
                </div>
              </div>
              <LuxuryToggle
                checked={formData.enable_zinli}
                onChange={() => handleToggle('enable_zinli')}
                activeLabel={t('admin.pagos.activeAtCheckout')}
                disabledLabel={t('admin.pagos.disabled')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.zinliEmail')}
                </label>
                <input
                  type="text"
                  name="zinli_email"
                  value={formData.zinli_email}
                  onChange={handleInputChange}
                  placeholder="payments@foeg-paris.com"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.zinliHolder')}
                </label>
                <input
                  type="text"
                  name="zinli_name"
                  value={formData.zinli_name}
                  onChange={handleInputChange}
                  placeholder="Maison FOEG Paris"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3.4 PAGO MÓVIL */}
          <div className="p-7 sm:p-9 bg-white border border-foeg-border/80 space-y-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-foeg-border/60 gap-4">
              <div>
                <h3 className="font-serif text-xl font-normal text-foeg-black tracking-wide">Pago Móvil</h3>
                <span className="text-[11px] text-foeg-muted font-light mt-0.5 block">
                  {t('admin.pagos.pagomovilDesc')}
                </span>
              </div>
              <LuxuryToggle
                checked={formData.enable_pagomovil}
                onChange={() => handleToggle('enable_pagomovil')}
                activeLabel={t('admin.pagos.activeAtCheckout')}
                disabledLabel={t('admin.pagos.disabled')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-1">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.pagomovilBank')}
                </label>
                <input
                  type="text"
                  name="pagomovil_bank"
                  value={formData.pagomovil_bank}
                  onChange={handleInputChange}
                  placeholder="Ex. Mercantil (0105), Banesco"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.pagomovilPhone')}
                </label>
                <input
                  type="text"
                  name="pagomovil_phone"
                  value={formData.pagomovil_phone}
                  onChange={handleInputChange}
                  placeholder="Ex. 0414-9281049"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.pagomovilId')}
                </label>
                <input
                  type="text"
                  name="pagomovil_id"
                  value={formData.pagomovil_id}
                  onChange={handleInputChange}
                  placeholder="Ex. V-29.892.400"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs font-mono text-foeg-black focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {t('admin.pagos.pagomovilHolder')}
                </label>
                <input
                  type="text"
                  name="pagomovil_name"
                  value={formData.pagomovil_name}
                  onChange={handleInputChange}
                  placeholder="Ex. Maison FOEG Paris"
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bouton de Sauvegarde Général */}
        <div className="pt-6 border-t border-foeg-border/80 flex items-center justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-foeg-navy hover:bg-foeg-black text-white px-9 py-4 text-xs uppercase tracking-[0.25em] font-medium transition-all shadow-subtle flex items-center space-x-2.5 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t('admin.pagos.saveBtn')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
