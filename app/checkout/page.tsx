'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  CreditCard,
  AlertCircle,
  Loader2,
  Truck,
  Store,
  Tag,
  CheckCircle2,
  X,
  Globe,
  Coins,
  QrCode,
  Smartphone,
  Landmark,
  ArrowRight,
  ExternalLink,
  Building2,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { useLanguage } from '@/lib/language-context';
import { getTranslatedColor } from '@/lib/i18n';
import MediaBox from '@/components/ui/MediaBox';
import { processPayment, validateCoupon } from './actions';
import { PaymentMethod } from '@/lib/payments';
import { SHIPPING_COUNTRIES, calculateShipping, DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from '@/lib/shipping';
import { getShippingSettings } from '@/lib/shipping-actions';
import { getPublicPaymentSettings } from '@/lib/payment-settings-actions';
import { getPickupBoutiques } from '@/lib/boutiques-actions';
import { Boutique, DEFAULT_BOUTIQUES } from '@/lib/boutiques-types';
import {
  DEFAULT_PAYMENT_SETTINGS,
  type PublicPaymentSettings,
} from '@/lib/payment-settings-types';
import {
  VisaIcon,
  MastercardIcon,
  PaypalIcon,
  ZelleIcon,
  BinanceIcon,
  ZinliIcon,
  ApplePayIcon,
  ShopPayIcon,
} from '@/components/ui/PaymentIcons';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, subtotal, isFreeShipping, clearCart } = useCart();
  const { formatPrice, currency, formatVesPrice, bcvRate } = useCurrency();
  const { t, language } = useLanguage();

  // Exclusividad Atelier: Redirigir a login/registro obligatorio si no está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/cuenta?callbackUrl=/checkout');
    }
  }, [status, router]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Mode de livraison : 'SHIPPING' | 'PICKUP'
  const [shippingMethod, setShippingMethod] = useState<'SHIPPING' | 'PICKUP'>('SHIPPING');
  const [pickupBoutiques, setPickupBoutiques] = useState<Boutique[]>(DEFAULT_BOUTIQUES);
  const [selectedPickupBoutique, setSelectedPickupBoutique] = useState<Boutique | null>(DEFAULT_BOUTIQUES[0] || null);
  const [countryCode, setCountryCode] = useState('FR');

  // Méthode de paiement : International vs Virement Français vs Alternatifs
  const [paymentCategory, setPaymentCategory] = useState<'INTERNATIONAL' | 'VIREMENT' | 'REGIONAL'>('INTERNATIONAL');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('STRIPE');
  const [paymentSettings, setPaymentSettings] = useState<PublicPaymentSettings>(DEFAULT_PAYMENT_SETTINGS);

  useEffect(() => {
    getPublicPaymentSettings().then((res) => {
      if (res) {
        setPaymentSettings(res);
        // Sélectionner par défaut la première méthode active
        if (res.enable_stripe) {
          setPaymentCategory('INTERNATIONAL');
          setPaymentMethod('STRIPE');
        } else if (res.enable_paypal) {
          setPaymentCategory('INTERNATIONAL');
          setPaymentMethod('PAYPAL');
        } else if (res.enable_virement || res.enable_virement_2 || res.enable_virement_3) {
          setPaymentCategory('VIREMENT');
          setPaymentMethod('VIREMENT');
        } else if (res.enable_zelle) {
          setPaymentCategory('REGIONAL');
          setPaymentMethod('ZELLE');
        } else if (res.enable_binance) {
          setPaymentCategory('REGIONAL');
          setPaymentMethod('BINANCE');
        } else if (res.enable_zinli) {
          setPaymentCategory('REGIONAL');
          setPaymentMethod('ZINLI');
        } else if (res.enable_pagomovil) {
          setPaymentCategory('REGIONAL');
          setPaymentMethod('PAGO_MOVIL');
        }
      }
    });

    getPickupBoutiques().then((res) => {
      if (res && res.length > 0) {
        setPickupBoutiques(res);
        setSelectedPickupBoutique(res[0]);
      }
    });
  }, []);

  // Formulaire de commande
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  // Pré-remplir les données de l'acheteur à partir de sa session sécurisée
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        email: prev.email || session.user?.email || '',
        firstName: prev.firstName || session.user?.name?.split(' ')[0] || '',
        lastName: prev.lastName || session.user?.name?.split(' ').slice(1).join(' ') || '',
      }));
    }
  }, [session]);

  const [selectedBankIndex, setSelectedBankIndex] = useState(0);

  // Gestion des Codes Privilèges / Cupons
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
  } | null>(null);

  // Paramètres dynamiques de livraison
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);

  // Charger le coupon sauvegardé et les règles de livraison dynamiques
  useEffect(() => {
    try {
      const saved = localStorage.getItem('foeg_applied_coupon');
      if (saved) {
        setAppliedCoupon(JSON.parse(saved));
      }
    } catch (_) { }

    getShippingSettings()
      .then((s) => {
        if (s) setShippingSettings(s);
      })
      .catch((err) => console.warn('[CHECKOUT SHIPPING SETTINGS ERROR]:', err));
  }, []);

  // Calculs financiers et expédition dynamique internationale
  const shippingInfo = calculateShipping(
    countryCode,
    subtotal,
    shippingMethod === 'PICKUP',
    shippingSettings,
    language
  );
  const shippingCost = shippingInfo.cost;
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'PERCENTAGE'
      ? (subtotal * appliedCoupon.value) / 100
      : appliedCoupon.value
    : 0;

  const total = Math.max(0, subtotal - discountAmount + (items.length > 0 ? shippingCost : 0));

  // Validation du Code Privilège
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const res = await validateCoupon(couponInput);
      if (res.valid && res.code && res.discountType && res.discountValue !== undefined) {
        const couponData = {
          code: res.code,
          type: res.discountType,
          value: res.discountValue,
        };
        setAppliedCoupon(couponData);
        setCouponMessage({ text: res.message || t('checkout.promoApplied') });
        setCouponInput('');
        try {
          localStorage.setItem('foeg_applied_coupon', JSON.stringify(couponData));
        } catch (_) { }
      } else {
        setCouponMessage({ text: res.message || 'Code invalide.', error: true });
      }
    } catch (err: any) {
      setCouponMessage({ text: 'Erreur lors de la validation du code.', error: true });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
    try {
      localStorage.removeItem('foeg_applied_coupon');
    } catch (_) { }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await processPayment({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        address: shippingMethod === 'PICKUP' ? (selectedPickupBoutique?.address || '48 Rue Lucien Sampaix') : form.address,
        city: shippingMethod === 'PICKUP' ? (selectedPickupBoutique?.city || 'Paris') : form.city,
        postalCode: shippingMethod === 'PICKUP' ? (selectedPickupBoutique?.postalCode || '75010') : form.postalCode,
        country: shippingMethod === 'PICKUP' ? (selectedPickupBoutique?.country || 'France') : (SHIPPING_COUNTRIES.find((c) => c.code === countryCode)?.nameFr || countryCode),
        shippingMethod,
        shippingCost: shippingInfo.cost,
        shippingTitle: shippingInfo.serviceName,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        discountAmount,
        total,
        currency,
        items: items.map((it) => ({
          productId: it.product.id,
          slug: it.product.slug,
          name: it.product.name,
          size: it.size,
          color: it.color,
          quantity: it.quantity,
          price: it.product.price,
        })),
      });

      if (!res.success) {
        setErrorMessage(res.error || t('common.error'));
        setLoading(false);
        return;
      }

      clearCart();
      try {
        localStorage.removeItem('foeg_applied_coupon');
      } catch (_) { }

      // Redirection dynamique vers la passerelle (Stripe, PayPal, Cobrix) ou la page merci
      if (res.redirectUrl) {
        if (res.redirectUrl.startsWith('http://') || res.redirectUrl.startsWith('https://')) {
          window.location.href = res.redirectUrl;
        } else {
          router.push(res.redirectUrl);
        }
      } else {
        router.push(`/checkout/merci?orderId=${res.orderId}`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t('common.error'));
      setLoading(false);
    }
  };

  // Écran d'attente haute couture pendant la vérification d'authentification
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex flex-col items-center justify-center space-y-4 pt-24 pb-32">
        <Loader2 className="w-6 h-6 animate-spin text-foeg-navy" strokeWidth={1.5} />
        <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted font-light">
          {language === 'es'
            ? 'Verificando acceso privado al Atelier...'
            : language === 'en'
            ? 'Verifying private Atelier access...'
            : 'Vérification de l’accès privé Atelier...'}
        </span>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-28 md:pt-36 pb-32 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto text-left animate-fadeIn">
      {/* Retorno discret */}
      <div className="mb-8">
        <Link
          href="/hombre"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black transition-colors font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1} />
          <span>{t('checkout.back')}</span>
        </Link>
      </div>

      {/* Titre Principal */}
      <div className="border-b border-foeg-border/80 pb-6 mb-10">
        <span className="text-[11px] uppercase tracking-[0.3em] text-foeg-muted block mb-2 font-medium">
          {t('checkout.badge')}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foeg-black tracking-tight">
          {t('checkout.title')}
        </h1>
      </div>

      {/* ======================================================== */}
      {/* RÉSUMÉ COMMANDE MOBILE REPLIABLE (Style The Row / Net-a-Porter) */}
      {/* ======================================================== */}
      <div className="lg:hidden mb-8 border border-foeg-border/80 bg-[#FAF9F6]">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-light text-foeg-black cursor-pointer select-none active:bg-foeg-surface/60 transition-colors"
          aria-expanded={mobileSummaryOpen}
        >
          <div className="flex items-center space-x-2 text-foeg-navy font-medium tracking-wide">
            <ShoppingBag className="w-4 h-4 text-foeg-navy" strokeWidth={1.5} />
            <span className="uppercase tracking-[0.16em] text-[11px]">
              {mobileSummaryOpen
                ? (language === 'es' ? 'Ocultar resumen del pedido' : language === 'en' ? 'Hide order summary' : 'Masquer le récapitulatif')
                : (language === 'es' ? 'Mostrar resumen del pedido' : language === 'en' ? 'Show order summary' : 'Afficher le récapitulatif')}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-foeg-muted transition-transform duration-200 ${
                mobileSummaryOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
          <div className="font-serif text-lg font-normal text-foeg-black">
            {formatPrice(total)}
          </div>
        </button>

        {mobileSummaryOpen && (
          <div className="px-4 pb-6 pt-2 border-t border-foeg-border/60 space-y-4">
            {/* Pièces */}
            <div className="divide-y divide-foeg-border/40 max-h-64 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={`m-${it.product.id}-${it.size}-${it.color || ''}`} className="py-3 flex items-center space-x-3 text-xs">
                  <div className="w-12 h-16 bg-foeg-surface border border-foeg-border/60 shrink-0 overflow-hidden relative">
                    <MediaBox
                      src={it.product.images[0]}
                      alt={it.product.name}
                      aspectRatio="portrait"
                      className="w-full h-full"
                      imageClassName="object-cover"
                      sizes="48px"
                    />
                    <span className="absolute -top-1 -right-1 bg-foeg-navy text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                      {it.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-xs text-foeg-black truncate font-normal">
                      {it.product.name}
                    </h4>
                    <p className="text-[10px] text-foeg-muted uppercase tracking-wider font-mono mt-0.5">
                      {t('cart.size')} : {it.size} {it.color ? `· ${getTranslatedColor(it.color, language)}` : ''}
                    </p>
                  </div>
                  <div className="text-xs font-medium text-foeg-black shrink-0">
                    {formatPrice(it.product.price * it.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Décompte Financier */}
            <div className="pt-3 border-t border-foeg-border/60 space-y-2 text-xs font-light">
              <div className="flex justify-between text-foeg-muted">
                <span>{t('checkout.subtotal')}</span>
                <span className="font-medium text-foeg-black">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{t('checkout.discount')}</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-foeg-muted">
                <span>
                  {t('checkout.shipping')} · <span className="text-[11px] font-mono">{shippingInfo.serviceName}</span>
                </span>
                <span className="font-medium text-foeg-black">
                  {shippingInfo.isFree ? (
                    <span className="text-emerald-700 font-medium">{t('checkout.freeComplimentary')}</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-foeg-border flex justify-between items-baseline">
                <span className="text-xs font-medium text-foeg-black uppercase tracking-wider">
                  {t('checkout.total')}
                </span>
                <span className="font-serif text-xl font-normal text-foeg-black">
                  {formatPrice(total)}
                </span>
              </div>
              {paymentMethod === 'PAGO_MOVIL' && bcvRate > 0 && (
                <div className="text-right text-[11px] text-emerald-800 font-mono">
                  ≈ {formatVesPrice(Number((total * bcvRate).toFixed(2)))} (Tasa BCV: {bcvRate.toFixed(2)})
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid Réparti Style "The Row" (Formulaire 60% / Résumé Sticky 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* ======================================================== */}
        {/* COLONNE GAUCHE (7/12) : PAIEMENT EXPRESS & FORMULAIRE */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-10">
          {/* SECTION 1: EXPRESS CHECKOUT (Apple Pay / Shop Pay / PayPal) */}
          <div className="border border-foeg-border p-6 bg-foeg-surface/40">
            <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted block mb-4 text-center font-medium">
              {t('checkout.expressTitle')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Shop Pay */}
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setPaymentCategory('INTERNATIONAL');
                  setPaymentMethod('STRIPE');
                }}
                className="w-full h-12 bg-[#5A31F4] hover:bg-[#4822d6] text-white px-4 font-semibold text-xs tracking-wider transition-all duration-200 cursor-pointer shadow-subtle flex items-center justify-center space-x-1.5 rounded-[4px]"
              >
                <ShopPayIcon />
              </button>

              {/* PayPal */}
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setPaymentCategory('INTERNATIONAL');
                  setPaymentMethod('PAYPAL');
                }}
                className="w-full h-12 bg-[#FFC439] hover:bg-[#f0b52b] text-[#003087] px-4 font-bold text-xs tracking-wider transition-all duration-200 cursor-pointer shadow-subtle flex items-center justify-center space-x-2 rounded-[4px]"
              >
                <PaypalIcon className="h-4 w-auto" />
                <span className="italic font-black text-sm text-[#003087]">Pay<span className="text-[#0079C1]">Pal</span></span>
              </button>

              {/* Apple Pay / Google Pay */}
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setPaymentCategory('INTERNATIONAL');
                  setPaymentMethod('STRIPE');
                }}
                className="w-full h-12 bg-black hover:bg-zinc-800 text-white px-4 font-medium text-xs tracking-wider transition-all duration-200 cursor-pointer shadow-subtle flex items-center justify-center space-x-1.5 rounded-[4px]"
              >
                <ApplePayIcon className="h-4 w-auto text-white" />
              </button>
            </div>

            {/* Séparateur élégant "OU" */}
            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-foeg-border"></div>
              <span className="flex-shrink mx-4 text-[9px] font-medium tracking-[0.25em] text-foeg-muted uppercase">
                {t('checkout.or')}
              </span>
              <div className="flex-grow border-t border-foeg-border"></div>
            </div>
          </div>

          <form onSubmit={handleConfirmOrder} className="space-y-10">
            {/* SECTION 2: COORDONNÉES DE CONTACT */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-foeg-border/60 pb-3">
                <h2 className="font-serif text-lg text-foeg-black font-normal tracking-wide">
                  {t('checkout.contactTitle')}
                </h2>
                <Link
                  href="/cuenta"
                  className="text-[11px] text-foeg-muted hover:text-foeg-navy transition-colors font-light underline underline-offset-4"
                >
                  {t('checkout.alreadyMember')}
                </Link>
              </div>

              <div>
                <input
                  type="email"
                  required
                  placeholder={t('checkout.emailPlaceholder')}
                  suppressHydrationWarning
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-wide focus:border-foeg-navy focus:outline-none transition-colors placeholder:text-gray-400 rounded-[2px]"
                />
                <p className="text-[11px] text-foeg-muted font-light mt-1.5">
                  {t('checkout.emailNotice')}
                </p>
              </div>
            </section>

            {/* SECTION 3: SÉLECTEUR DE MODE DE RÉCEPTION (The Row Style) */}
            <section className="space-y-4">
              <div className="border-b border-foeg-border/60 pb-3">
                <h2 className="font-serif text-lg text-foeg-black font-normal tracking-wide">
                  {t('checkout.deliveryMethod')}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Livraison Signature */}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShippingMethod('SHIPPING')}
                  className={`p-4 border text-left transition-all cursor-pointer flex flex-col justify-between ${shippingMethod === 'SHIPPING'
                      ? 'border-foeg-navy bg-foeg-surface/60 ring-1 ring-foeg-navy'
                      : 'border-foeg-border bg-white hover:border-foeg-border/80'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center space-x-2 text-xs font-medium text-foeg-black uppercase tracking-wider">
                      <Truck className="w-4 h-4 text-foeg-navy" strokeWidth={1.5} />
                      <span>{shippingInfo.serviceName}</span>
                    </span>
                    <span className="text-[11px] font-medium text-foeg-black">
                      {shippingInfo.isFree ? (
                        <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                          {t('checkout.freeComplimentary')}
                        </span>
                      ) : (
                        formatPrice(shippingInfo.cost)
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-foeg-muted font-light leading-relaxed">
                    {t('checkout.estimatedDelivery').replace('{time}', shippingInfo.estimatedDelivery)}
                  </p>
                </button>

                {/* Option 2: Retrait en Boutique */}
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShippingMethod('PICKUP')}
                  className={`p-4 border text-left transition-all cursor-pointer flex flex-col justify-between ${shippingMethod === 'PICKUP'
                      ? 'border-foeg-navy bg-foeg-surface/60 ring-1 ring-foeg-navy'
                      : 'border-foeg-border bg-white hover:border-foeg-border/80'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center space-x-2 text-xs font-medium text-foeg-black uppercase tracking-wider">
                      <Store className="w-4 h-4 text-foeg-navy" strokeWidth={1.5} />
                      <span>{t('checkout.pickupStore')}</span>
                    </span>
                    <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      {t('checkout.freeInStore')}
                    </span>
                  </div>
                  <p className="text-[11px] text-foeg-muted font-light leading-relaxed">
                    {t('checkout.pickupStoreDesc')}
                  </p>
                </button>
              </div>
            </section>

            {/* SECTION 4: ADRESSE DE LIVRAISON */}
            <section className="space-y-4">
              <div className="border-b border-foeg-border/60 pb-3">
                <h2 className="font-serif text-lg text-foeg-black font-normal tracking-wide">
                  {shippingMethod === 'PICKUP'
                    ? t('checkout.pickupStore')
                    : t('checkout.shippingTitle')}
                </h2>
              </div>

              {shippingMethod === 'PICKUP' ? (
                <div className="p-4 bg-foeg-surface border border-foeg-border/80 space-y-4">
                  {/* Sélecteur Dynamique de Boutique pour le retrait */}
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium block mb-2">
                      {t('checkout.selectPickupBoutique')}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pickupBoutiques.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          suppressHydrationWarning
                          onClick={() => setSelectedPickupBoutique(b)}
                          className={`p-3 text-left border text-xs transition-all cursor-pointer ${
                            selectedPickupBoutique?.id === b.id
                              ? 'border-foeg-navy bg-foeg-navy text-white shadow-xs'
                              : 'border-foeg-border/80 bg-white hover:border-foeg-navy/60 text-foeg-black'
                          }`}
                        >
                          <span className="block font-medium truncate">{b.name}</span>
                          <span
                            className={`text-[10px] block mt-0.5 truncate ${
                              selectedPickupBoutique?.id === b.id ? 'text-white/80' : 'text-foeg-muted'
                            }`}
                          >
                            {b.address ? `${b.address}, ` : ''}{b.city} ({b.country})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Détails de la boutique sélectionnée */}
                  {selectedPickupBoutique && (
                    <div className="p-3 bg-white border border-foeg-border/60 flex items-start space-x-3 text-xs">
                      <Store className="w-4 h-4 text-foeg-navy shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div className="space-y-0.5">
                        <div className="font-medium text-foeg-black uppercase tracking-wider text-[11px]">
                          {selectedPickupBoutique.name}
                        </div>
                        <div className="text-foeg-muted text-[11px]">
                          {selectedPickupBoutique.address ? `${selectedPickupBoutique.address}, ` : ''}
                          {selectedPickupBoutique.postalCode ? `${selectedPickupBoutique.postalCode} ` : ''}
                          {selectedPickupBoutique.city} · {selectedPickupBoutique.hoursWeekday}
                        </div>
                        {selectedPickupBoutique.addressNotes && (
                          <div className="text-[10px] text-foeg-muted italic pt-0.5 leading-relaxed">
                            {selectedPickupBoutique.addressNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-foeg-border/50">
                    <input
                      type="text"
                      required
                      placeholder={t('checkout.firstName')}
                      suppressHydrationWarning
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-wide focus:border-foeg-navy focus:outline-none rounded-[2px]"
                    />
                    <input
                      type="text"
                      required
                      placeholder={t('checkout.lastName')}
                      suppressHydrationWarning
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-wide focus:border-foeg-navy focus:outline-none rounded-[2px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                      {t('checkout.destinationCountry')}
                    </label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      suppressHydrationWarning
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-wide focus:border-foeg-navy focus:outline-none rounded-[2px]"
                    >
                      {(
                        (shippingSettings.countries && shippingSettings.countries.length > 0
                          ? shippingSettings.countries
                          : SHIPPING_COUNTRIES
                        ).filter((c) => c.enabled !== false)
                      ).map((c) => (
                        <option key={c.code} value={c.code}>
                          {language === 'es' ? c.nameEs : language === 'en' ? c.nameEn : c.nameFr}{' '}
                          {c.code === 'FR'
                            ? language === 'es'
                              ? '(Francia Metropolitana)'
                              : language === 'en'
                              ? '(Metropolitan France)'
                              : '(France Métropolitaine)'
                            : c.isEu
                            ? language === 'es'
                              ? '(Unión Europea)'
                              : language === 'en'
                              ? '(European Union)'
                              : '(Union Européenne)'
                            : '(DHL Express)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder={t('checkout.firstName')}
                      suppressHydrationWarning
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-wide focus:border-foeg-navy focus:outline-none rounded-[2px] transition-colors"
                    />
                    <input
                      type="text"
                      required
                      placeholder={t('checkout.lastName')}
                      suppressHydrationWarning
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-wide focus:border-foeg-navy focus:outline-none rounded-[2px] transition-colors"
                    />
                  </div>

                  <input
                    type="text"
                    required
                    placeholder={t('checkout.address')}
                    suppressHydrationWarning
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-wide focus:border-foeg-navy focus:outline-none rounded-[2px] transition-colors"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder={t('checkout.postalCode')}
                      suppressHydrationWarning
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-wide focus:border-foeg-navy focus:outline-none rounded-[2px] transition-colors"
                    />
                    <input
                      type="text"
                      required
                      placeholder={t('checkout.city')}
                      suppressHydrationWarning
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-wide focus:border-foeg-navy focus:outline-none rounded-[2px] transition-colors"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* ========================================================================= */}
            {/* SECTION 5: ARCHITECTURE DE PAIEMENT UNIFIÉE (International & Venezuela) */}
            {/* ========================================================================= */}
            <section className="space-y-5">
              <div className="border-b border-foeg-border/60 pb-3 flex items-center justify-between">
                <h2 className="font-serif text-lg text-foeg-black font-normal tracking-wide">
                  {t('checkout.paymentTitle')}
                </h2>
                <div className="flex items-center space-x-1.5 text-foeg-muted">
                  <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-[10px] tracking-widest uppercase font-mono">TLS 256-Bit</span>
                </div>
              </div>

              {/* Onglets de Catégorie : Cartes/PayPal vs Virement Français vs Alternatifs */}
              {(paymentSettings.enable_stripe ||
                paymentSettings.enable_paypal ||
                paymentSettings.enable_virement ||
                paymentSettings.enable_zelle ||
                paymentSettings.enable_binance ||
                paymentSettings.enable_zinli ||
                paymentSettings.enable_pagomovil) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 border border-foeg-border p-1 bg-foeg-surface/40 gap-1 sm:gap-0 rounded-none">
                  {(paymentSettings.enable_stripe || paymentSettings.enable_paypal) && (
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => {
                        setPaymentCategory('INTERNATIONAL');
                        setPaymentMethod(paymentSettings.enable_stripe ? 'STRIPE' : 'PAYPAL');
                      }}
                      className={`py-3 px-3 text-[11px] sm:text-xs uppercase tracking-wider font-medium transition-all flex items-center justify-center space-x-2 cursor-pointer rounded-none active:scale-[0.99] ${
                        paymentCategory === 'INTERNATIONAL'
                          ? 'bg-foeg-navy text-white shadow-subtle'
                          : 'text-foeg-muted hover:text-foeg-black hover:bg-white/50'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{t('checkout.cardsAndPaypal')}</span>
                    </button>
                  )}

                  {(paymentSettings.enable_virement ||
                    paymentSettings.enable_virement_2 ||
                    paymentSettings.enable_virement_3) && (
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => {
                        setPaymentCategory('VIREMENT');
                        setPaymentMethod('VIREMENT');
                      }}
                      className={`py-3 px-3 text-[11px] sm:text-xs uppercase tracking-wider font-medium transition-all flex items-center justify-center space-x-2 cursor-pointer rounded-none active:scale-[0.99] ${
                        paymentCategory === 'VIREMENT'
                          ? 'bg-foeg-navy text-white shadow-subtle'
                          : 'text-foeg-muted hover:text-foeg-black hover:bg-white/50'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{t('checkout.frenchBankTransfer')}</span>
                    </button>
                  )}

                  {(paymentSettings.enable_zelle ||
                    paymentSettings.enable_binance ||
                    paymentSettings.enable_zinli ||
                    paymentSettings.enable_pagomovil) && (
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => {
                        setPaymentCategory('REGIONAL');
                        if (paymentSettings.enable_zelle) setPaymentMethod('ZELLE');
                        else if (paymentSettings.enable_binance) setPaymentMethod('BINANCE');
                        else if (paymentSettings.enable_zinli) setPaymentMethod('ZINLI');
                        else if (paymentSettings.enable_pagomovil) setPaymentMethod('PAGO_MOVIL');
                      }}
                      className={`py-3 px-3 text-[11px] sm:text-xs uppercase tracking-wider font-medium transition-all flex items-center justify-center space-x-2 cursor-pointer rounded-none active:scale-[0.99] ${
                        paymentCategory === 'REGIONAL'
                          ? 'bg-foeg-navy text-white shadow-subtle'
                          : 'text-foeg-muted hover:text-foeg-black hover:bg-white/50'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{t('checkout.alternativePayments')}</span>
                    </button>
                  )}
                </div>
              )}

              {/* SÉLECTEUR DE MÉTHODES SELON LA CATÉGORIE */}
              {paymentCategory === 'INTERNATIONAL' && (paymentSettings.enable_stripe || paymentSettings.enable_paypal) && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Carte Bancaire (Stripe) */}
                    {paymentSettings.enable_stripe && (
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setPaymentMethod('STRIPE')}
                        className={`p-4 border text-left transition-all cursor-pointer flex items-center justify-between rounded-none ${
                          paymentMethod === 'STRIPE'
                            ? 'border-foeg-navy bg-foeg-surface/60 ring-1 ring-foeg-navy'
                            : 'border-foeg-border bg-white hover:border-foeg-border/80'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1.5 bg-white p-1 border border-gray-200">
                            <VisaIcon className="h-3 w-auto" />
                            <MastercardIcon className="h-3.5 w-auto" />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-foeg-black uppercase tracking-wider block">
                              {t('checkout.creditCardLabel')}
                            </span>
                            <span className="text-[10px] text-foeg-muted">{t('checkout.creditCardDesc')}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono bg-foeg-navy text-white px-2 py-0.5 rounded-none">
                          Stripe
                        </span>
                      </button>
                    )}

                    {/* PayPal */}
                    {paymentSettings.enable_paypal && (
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setPaymentMethod('PAYPAL')}
                        className={`p-4 border text-left transition-all cursor-pointer flex items-center justify-between rounded-none ${
                          paymentMethod === 'PAYPAL'
                            ? 'border-foeg-navy bg-foeg-surface/60 ring-1 ring-foeg-navy'
                            : 'border-foeg-border bg-white hover:border-foeg-border/80'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-1 bg-white border border-gray-200 flex items-center justify-center">
                            <PaypalIcon className="h-4 w-auto" />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-foeg-black uppercase tracking-wider block">
                              PayPal
                            </span>
                            <span className="text-[10px] text-foeg-muted">{t('checkout.paypalDesc')}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono bg-[#FFC439] text-[#003087] px-2 py-0.5 font-bold rounded-none">
                          PayPal
                        </span>
                      </button>
                    )}
                  </div>

                  {/* FORMULAIRE DYNAMIQUE : STRIPE */}
                  {paymentMethod === 'STRIPE' && paymentSettings.enable_stripe && (
                    <div className="p-5 border border-foeg-border bg-foeg-surface/20 space-y-4 animate-fadeIn rounded-none">
                      <div className="flex items-center justify-between text-xs text-foeg-navy font-medium uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4" strokeWidth={1.5} />
                          <span>{t('checkout.cardPaymentTitle')}</span>
                        </div>
                        <span className="text-[10px] font-mono text-foeg-muted">PCI-DSS Compliant</span>
                      </div>

                      <input
                        type="text"
                        required
                        placeholder={t('checkout.cardNumber')}
                        suppressHydrationWarning
                        value={form.cardNumber}
                        onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                        maxLength={19}
                        className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-widest focus:border-foeg-navy focus:outline-none rounded-[2px] transition-colors"
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          required
                          placeholder={t('checkout.expiry')}
                          suppressHydrationWarning
                          value={form.expiry}
                          onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                          maxLength={5}
                          className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-wider focus:border-foeg-navy focus:outline-none rounded-[2px] transition-colors"
                        />
                        <input
                          type="password"
                          required
                          placeholder={t('checkout.cvc')}
                          suppressHydrationWarning
                          value={form.cvc}
                          onChange={(e) => setForm({ ...form, cvc: e.target.value })}
                          maxLength={4}
                          className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light tracking-widest focus:border-foeg-navy focus:outline-none rounded-[2px] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* FORMULAIRE DYNAMIQUE : PAYPAL */}
                  {paymentMethod === 'PAYPAL' && paymentSettings.enable_paypal && (
                    <div className="p-6 border border-foeg-border bg-foeg-surface/30 text-center space-y-3 animate-fadeIn rounded-none">
                      <div className="w-12 h-12 mx-auto rounded-full bg-[#FFC439]/20 flex items-center justify-center text-[#003087]">
                        <ExternalLink className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <p className="text-xs text-foeg-black font-light max-w-sm mx-auto leading-relaxed">
                        {t('checkout.paypalRedirect')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION VIREMENT BANCAIRE FRANÇAIS */}
              {paymentCategory === 'VIREMENT' &&
                (paymentSettings.enable_virement ||
                  paymentSettings.enable_virement_2 ||
                  paymentSettings.enable_virement_3) && (() => {
                  const availableBanks = [
                    paymentSettings.enable_virement
                      ? {
                          id: 0,
                          name: paymentSettings.bank_name || 'Banque Principale',
                          holder: paymentSettings.bank_holder_name || 'Maison FOEG Paris SAS',
                          iban: paymentSettings.bank_iban,
                          bic: paymentSettings.bank_bic,
                        }
                      : null,
                    paymentSettings.enable_virement_2
                      ? {
                          id: 1,
                          name: paymentSettings.bank_name_2 || 'Banque Secondaire',
                          holder: paymentSettings.bank_holder_name_2 || 'Maison FOEG Paris SAS',
                          iban: paymentSettings.bank_iban_2,
                          bic: paymentSettings.bank_bic_2,
                        }
                      : null,
                    paymentSettings.enable_virement_3
                      ? {
                          id: 2,
                          name: paymentSettings.bank_name_3 || 'Banque Alternative',
                          holder: paymentSettings.bank_holder_name_3 || 'Maison FOEG Paris SAS',
                          iban: paymentSettings.bank_iban_3,
                          bic: paymentSettings.bank_bic_3,
                        }
                      : null,
                  ].filter(Boolean) as { id: number; name: string; holder: string; iban: string; bic: string }[];

                  const currentBank = availableBanks[selectedBankIndex] || availableBanks[0];

                  return (
                    <div className="p-6 border border-foeg-border bg-white space-y-4 animate-fadeIn shadow-subtle">
                      <div className="flex items-center justify-between border-b border-foeg-border/60 pb-3">
                        <div className="flex items-center space-x-2.5 text-xs uppercase tracking-wider font-medium text-foeg-navy">
                          <Building2 className="w-4 h-4 text-foeg-navy" />
                          <span>{t('checkout.frenchBankOfficial')}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 border border-emerald-200">
                          SEPA
                        </span>
                      </div>

                      {availableBanks.length > 1 && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-2">
                            {t('checkout.selectFrenchBank')}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {availableBanks.map((b, idx) => (
                              <button
                                key={b.id}
                                type="button"
                                suppressHydrationWarning
                                onClick={() => setSelectedBankIndex(idx)}
                                className={`p-2.5 text-left border text-xs transition-all cursor-pointer ${
                                  selectedBankIndex === idx
                                    ? 'border-foeg-navy bg-foeg-navy text-white shadow-xs'
                                    : 'border-foeg-border/80 bg-white hover:border-foeg-navy/60 text-foeg-black'
                                }`}
                              >
                                <span className="block font-medium truncate">{b.name}</span>
                                <span
                                  className={`text-[10px] truncate block ${
                                    selectedBankIndex === idx ? 'text-white/80' : 'text-foeg-muted'
                                  }`}
                                >
                                  {b.iban.substring(0, 14)}...
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-foeg-muted font-light leading-relaxed">
                        {t('checkout.virementInstruction')}
                      </p>

                      {currentBank && (
                        <div className="p-4 bg-foeg-surface/60 border border-foeg-border/80 font-mono text-xs text-foeg-black space-y-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-foeg-border/40">
                            <span className="text-foeg-muted font-sans text-[11px] uppercase tracking-wider">{t('checkout.beneficiary')}</span>
                            <span className="font-semibold">{currentBank.holder}</span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-foeg-border/40">
                            <span className="text-foeg-muted font-sans text-[11px] uppercase tracking-wider">{t('checkout.bankEstablishment')}</span>
                            <span>{currentBank.name}</span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-foeg-border/40">
                            <span className="text-foeg-muted font-sans text-[11px] uppercase tracking-wider">{t('admin.pagos.bankIban')} :</span>
                            <span className="font-bold text-foeg-navy tracking-wider">{currentBank.iban}</span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:justify-between py-1">
                            <span className="text-foeg-muted font-sans text-[11px] uppercase tracking-wider">{t('admin.pagos.bankBic')} :</span>
                            <span className="tracking-wider">{currentBank.bic}</span>
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 font-light space-y-1">
                        <p className="font-medium text-amber-900">
                          {t('checkout.virementRefAlert')}
                        </p>
                        <p>
                          {t('checkout.virementRefNote')}
                        </p>
                      </div>
                    </div>
                  );
                })()}

              {/* SECTION PAIEMENTS ALTERNATIFS (ZELLE, BINANCE PAY, ZINLI, PAGO MÓVIL) */}
              {paymentCategory === 'REGIONAL' && (
                paymentSettings.enable_zelle ||
                paymentSettings.enable_binance ||
                paymentSettings.enable_zinli ||
                paymentSettings.enable_pagomovil
              ) && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Zelle */}
                    {paymentSettings.enable_zelle && (
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setPaymentMethod('ZELLE')}
                        className={`p-3.5 border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                          paymentMethod === 'ZELLE'
                            ? 'border-foeg-navy bg-foeg-surface/80 ring-1 ring-foeg-navy'
                            : 'border-foeg-border bg-white hover:border-foeg-border/80'
                        }`}
                      >
                        <ZelleIcon className="h-4 w-auto" />
                        <span className="text-[11px] font-medium text-foeg-black">Zelle</span>
                        <span className="text-[9px] text-foeg-muted">USD (États-Unis)</span>
                      </button>
                    )}

                    {/* Binance Pay */}
                    {paymentSettings.enable_binance && (
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setPaymentMethod('BINANCE')}
                        className={`p-3.5 border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                          paymentMethod === 'BINANCE'
                            ? 'border-foeg-navy bg-foeg-surface/80 ring-1 ring-foeg-navy'
                            : 'border-foeg-border bg-white hover:border-foeg-border/80'
                        }`}
                      >
                        <BinanceIcon className="h-4 w-auto" />
                        <span className="text-[11px] font-medium text-foeg-black">Binance Pay</span>
                        <span className="text-[9px] text-foeg-muted">Crypto / USDT</span>
                      </button>
                    )}

                    {/* Zinli */}
                    {paymentSettings.enable_zinli && (
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setPaymentMethod('ZINLI')}
                        className={`p-3.5 border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                          paymentMethod === 'ZINLI'
                            ? 'border-foeg-navy bg-foeg-surface/80 ring-1 ring-foeg-navy'
                            : 'border-foeg-border bg-white hover:border-foeg-border/80'
                        }`}
                      >
                        <ZinliIcon className="h-4 w-auto" />
                        <span className="text-[11px] font-medium text-foeg-black">Zinli</span>
                        <span className="text-[9px] text-foeg-muted">Visa Prépayée</span>
                      </button>
                    )}

                    {/* Pago Móvil */}
                    {paymentSettings.enable_pagomovil && (
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setPaymentMethod('PAGO_MOVIL')}
                        className={`p-3.5 border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                          paymentMethod === 'PAGO_MOVIL'
                            ? 'border-foeg-navy bg-foeg-surface/80 ring-1 ring-foeg-navy'
                            : 'border-foeg-border bg-white hover:border-foeg-border/80'
                        }`}
                      >
                        <Landmark className="w-4 h-4 text-emerald-700" />
                        <span className="text-[11px] font-medium text-foeg-black">Pago Móvil</span>
                        <span className="text-[10px] text-foeg-muted">Taux BCV</span>
                      </button>
                    )}
                  </div>

                  {/* CADRE INFORMATIF MÉTHODES ALTERNATIVES */}
                  <div className="p-5 border border-foeg-border bg-foeg-surface/30 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-medium text-foeg-black">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>{t('checkout.settlement')} : {paymentMethod.replace('_', ' ')}</span>
                      </div>
                      <span className="text-[9px] font-mono text-foeg-muted">{t('checkout.atelierValidation')}</span>
                    </div>

                    <p className="text-xs text-foeg-muted font-light leading-relaxed">
                      {t('checkout.altPaymentReservationNote').replace('{method}', paymentMethod.replace('_', ' '))}
                    </p>

                    <div className="p-3 bg-white border border-foeg-border/80 text-[11px] font-mono text-foeg-black space-y-1.5">
                      {paymentMethod === 'ZELLE' && paymentSettings.enable_zelle && (
                        <div>
                          <div><strong>Destinataire Zelle :</strong> {paymentSettings.zelle_email}</div>
                          <div className="text-foeg-muted">Titulaire : {paymentSettings.zelle_name}</div>
                        </div>
                      )}
                      {paymentMethod === 'BINANCE' && paymentSettings.enable_binance && (
                        <div>
                          <div><strong>Binance Pay ID :</strong> {paymentSettings.binance_pay_id}</div>
                          <div className="text-foeg-muted">Réseaux : {paymentSettings.binance_network}</div>
                        </div>
                      )}
                      {paymentMethod === 'ZINLI' && paymentSettings.enable_zinli && (
                        <div>
                          <div><strong>Compte Zinli :</strong> {paymentSettings.zinli_email}</div>
                          <div className="text-foeg-muted">Titulaire : {paymentSettings.zinli_name}</div>
                        </div>
                      )}
                      {paymentMethod === 'PAGO_MOVIL' && paymentSettings.enable_pagomovil && (
                        <div className="space-y-1.5">
                          <div><strong>Banque Réceptrice :</strong> {paymentSettings.pagomovil_bank}</div>
                          <div><strong>Téléphone :</strong> {paymentSettings.pagomovil_phone}</div>
                          <div><strong>Cédula / RIF :</strong> {paymentSettings.pagomovil_id}</div>
                          <div><strong>Titulaire :</strong> {paymentSettings.pagomovil_name}</div>
                          <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-950 font-sans flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider font-medium text-emerald-900">
                              {t('merci.bcvTotal')} :
                            </span>
                            <span className="font-mono text-sm font-bold text-emerald-950">
                              {formatVesPrice(total)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Messages d'erreur */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-xs font-light flex items-center space-x-3">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Bouton de confirmation principal (Mobile & Tablet) */}
            <div className="block lg:hidden">
              <button
                type="submit"
                disabled={loading || items.length === 0}
                suppressHydrationWarning
                className="w-full bg-foeg-navy text-white hover:bg-[#15223c] py-4 px-6 text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 rounded-[2px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('checkout.processing')}</span>
                  </>
                ) : (
                  <span>
                    {paymentMethod === 'STRIPE'
                      ? t('checkout.payWithCard').replace('{total}', formatPrice(total))
                      : paymentMethod === 'PAYPAL'
                        ? t('checkout.payWithPaypal').replace('{total}', formatPrice(total))
                        : paymentMethod === 'VIREMENT'
                          ? t('checkout.confirmVirement').replace('{total}', formatPrice(total))
                          : paymentMethod === 'PAGO_MOVIL'
                            ? t('checkout.confirmPagoMovil').replace('{total}', formatPrice(total))
                            : `${t('checkout.submit')} · ${formatPrice(total)}`}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ======================================================== */}
        {/* COLONNE DROITE (5/12) : RÉCAPITULATIF STICKY THE ROW */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="bg-[#F9F9F9] border border-gray-200/80 p-6 md:p-8 shadow-subtle space-y-6">
            <h2 className="font-serif text-xl text-foeg-black font-normal tracking-wide pb-4 border-b border-foeg-border/80">
              {t('checkout.summaryTitle')}
            </h2>

            {/* Liste des pièces commandées avec visuel */}
            <div className="divide-y divide-foeg-border/60 max-h-72 overflow-y-auto pr-2">
              {items.length === 0 ? (
                <p className="py-6 text-xs text-foeg-muted font-light">
                  Votre sélection est vide.
                </p>
              ) : (
                items.map((it) => (
                  <div key={`${it.product.id}-${it.size}-${it.color || ''}`} className="py-3.5 flex items-center space-x-4">
                    <div className="w-14 h-18 bg-foeg-surface border border-foeg-border/60 shrink-0 overflow-hidden relative">
                      <MediaBox
                        src={it.product.images[0]}
                        alt={it.product.name}
                        aspectRatio="portrait"
                        className="w-full h-full"
                        imageClassName="object-cover"
                        sizes="56px"
                      />
                      <span className="absolute -top-1.5 -right-1.5 bg-foeg-navy text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                        {it.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xs text-foeg-black truncate font-normal">
                        {it.product.name}
                      </h4>
                      <p className="text-[10px] text-foeg-muted uppercase tracking-wider font-mono mt-0.5">
                        {t('cart.size')} : {it.size} {it.color ? `· ${getTranslatedColor(it.color, language)}` : ''}
                      </p>
                    </div>

                    <div className="text-xs font-medium text-foeg-black">
                      {formatPrice(it.product.price * it.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* CHAMP DU CODE PRIVILÈGE / CUPÓN */}
            <div className="pt-4 border-t border-foeg-border/80">
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={t('checkout.promoCode')}
                    suppressHydrationWarning
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 text-foeg-black text-xs font-light uppercase tracking-wider focus:border-foeg-navy focus:outline-none rounded-[2px] transition-colors"
                  />
                  <Tag className="w-3.5 h-3.5 text-foeg-muted absolute right-3 top-3 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  disabled={couponLoading || !couponInput.trim()}
                  suppressHydrationWarning
                  className="px-4 py-2.5 bg-foeg-black text-white hover:bg-foeg-navy text-[11px] uppercase tracking-widest font-medium transition-colors cursor-pointer disabled:opacity-40"
                >
                  {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('checkout.apply')}
                </button>
              </form>

              {/* Étiquette du coupon actif */}
              {appliedCoupon && (
                <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <div className="flex items-center space-x-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {appliedCoupon.code} (
                      {appliedCoupon.type === 'PERCENTAGE'
                        ? `-${appliedCoupon.value}%`
                        : `-${formatPrice(appliedCoupon.value)}`}
                      )
                    </span>
                  </div>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleRemoveCoupon}
                    className="text-emerald-700 hover:text-emerald-950 p-0.5 cursor-pointer"
                    title="Retirer le code"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {couponMessage && (
                <p
                  className={`text-[11px] font-light mt-1.5 ${couponMessage.error ? 'text-red-600' : 'text-emerald-700'
                    }`}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* DÉCOMPTE DU SOUS-TOTAL ET DU TOTAL */}
            <div className="pt-4 border-t border-foeg-border/80 space-y-2.5 text-xs font-light">
              <div className="flex justify-between text-foeg-muted">
                <span>{t('checkout.subtotal')}</span>
                <span className="font-medium text-foeg-black">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{t('checkout.discount')}</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-foeg-muted">
                <span>
                  {t('checkout.shipping')} · <span className="text-[11px] font-mono">{shippingInfo.serviceName}</span>
                </span>
                <span className="font-medium text-foeg-black">
                  {shippingInfo.isFree ? (
                    <span className="text-emerald-700 font-medium">{t('checkout.freeComplimentary')}</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>

              {shippingInfo.isNonEu && (
                <div className="p-3 bg-foeg-surface/60 border border-foeg-border/80 text-[10px] text-foeg-muted font-light leading-relaxed">
                  <span className="font-medium text-foeg-black uppercase tracking-wider block mb-0.5">
                    {t('checkout.customsNoticeTitle')}
                  </span>
                  {shippingInfo.customsNotice || "Les droits de douane et taxes locales peuvent s'appliquer à la réception de votre colis."}
                </div>
              )}

              <div className="pt-3 border-t border-foeg-border flex justify-between items-baseline">
                <span className="text-sm font-medium text-foeg-black uppercase tracking-wider">
                  {t('checkout.total')}
                </span>
                <span className="font-serif text-2xl font-normal text-foeg-black">
                  {formatPrice(total)}
                </span>
              </div>

              <p className="text-[10px] text-foeg-muted pt-1">
                {currency === 'EUR' ? t('checkout.taxNoticeEur') : t('checkout.taxNoticeUsd')}
              </p>
            </div>

            {/* BOUTON CONFIRMER LA COMMANDE (Desktop Sticky) */}
            <div className="hidden lg:block pt-2">
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={loading || items.length === 0}
                suppressHydrationWarning
                className="w-full bg-foeg-navy text-white hover:bg-[#15223c] py-4 px-6 text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 rounded-[2px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('checkout.processing')}</span>
                  </>
                ) : (
                  <span>
                    {paymentMethod === 'STRIPE'
                      ? t('checkout.payWithCard').replace('{total}', formatPrice(total))
                      : paymentMethod === 'PAYPAL'
                        ? t('checkout.payWithPaypal').replace('{total}', formatPrice(total))
                        : paymentMethod === 'VIREMENT'
                          ? t('checkout.confirmVirement').replace('{total}', formatPrice(total))
                          : paymentMethod === 'PAGO_MOVIL'
                            ? t('checkout.confirmPagoMovil').replace('{total}', formatPrice(total))
                            : `${t('checkout.submit')} · ${formatPrice(total)}`}
                  </span>
                )}
              </button>
            </div>

            {/* Réassurance & Garanties de la Maison */}
            <div className="pt-4 border-t border-foeg-border/60 space-y-2 text-[10px] text-foeg-muted uppercase tracking-wider font-light">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-foeg-navy shrink-0" strokeWidth={1.5} />
                <span>{t('checkout.securityNotice')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-3.5 h-3.5 text-foeg-navy shrink-0" strokeWidth={1.5} />
                <span>{t('checkout.insuredDelivery')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
