'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useLanguage } from '@/lib/language-context';
import { useCurrency } from '@/lib/currency-context';
import MediaBox from '@/components/ui/MediaBox';
import { getTranslatedColor } from '@/lib/i18n';
import { validateCoupon } from '@/app/checkout/actions';

export default function MiniCart() {
  const {
    items,
    removeItem,
    updateQuantity,
    isCartOpen,
    closeCart,
    subtotal,
    freeShippingThreshold,
    amountUntilFreeShipping,
    isFreeShipping,
  } = useCart();
  const { t, language } = useLanguage();
  const { formatPrice, currency } = useCurrency();
  const { status } = useSession();
  const checkoutHref = status === 'authenticated' ? '/checkout' : '/cuenta?callbackUrl=/checkout';

  console.log("MiniCart renderizado, isCartOpen:", isCartOpen);

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
  } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('foeg_applied_coupon');
      if (saved) {
        setAppliedCoupon(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const res = await validateCoupon(couponInput, language);
      if (res.valid && res.code && res.discountType && res.discountValue !== undefined) {
        const couponData = {
          code: res.code,
          type: res.discountType,
          value: res.discountValue,
        };
        setAppliedCoupon(couponData);
        setCouponMessage({
          text:
            res.message ||
            (language === 'es'
              ? 'Código de privilegio aplicado.'
              : language === 'en'
              ? 'Privilege code applied.'
              : 'Code privilège appliqué.'),
        });
        setCouponInput('');
        try {
          localStorage.setItem('foeg_applied_coupon', JSON.stringify(couponData));
        } catch (_) {}
      } else {
        setCouponMessage({
          text:
            res.message ||
            (language === 'es'
              ? 'Código no válido.'
              : language === 'en'
              ? 'Invalid code.'
              : 'Code invalide.'),
          error: true,
        });
      }
    } catch (err: any) {
      setCouponMessage({
        text:
          language === 'es'
            ? 'Error al validar el código.'
            : language === 'en'
            ? 'Error validating code.'
            : 'Erreur lors de la validation.',
        error: true,
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
    try {
      localStorage.removeItem('foeg_applied_coupon');
    } catch (_) {}
  };

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'PERCENTAGE'
      ? (subtotal * appliedCoupon.value) / 100
      : appliedCoupon.value
    : 0;

  const totalWithDiscount = Math.max(0, subtotal - discountAmount);

  // Bloquear scroll de la página cuando el carrito está abierto
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Overlay oscuro (bg-black/50) */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Panel Deslizante (Drawer) desde la derecha */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Votre Panier d'achat"
        className="fixed inset-y-0 right-0 w-full sm:w-[420px] max-w-full bg-foeg-white text-foeg-black shadow-floating flex flex-col z-10 transition-transform duration-500 ease-out border-l border-foeg-border/80"
      >
        {/* =========================================================================
            HEADER DEL CARRITO
        ========================================================================= */}
        <div className="p-4 sm:p-6 md:p-8 border-b border-foeg-border/80 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-normal text-foeg-black tracking-wide">
            {t('cart.title')}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="p-1 text-foeg-black hover:text-foeg-navy transition-colors focus:outline-none cursor-pointer"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" strokeWidth={1} />
          </button>
        </div>

        {/* =========================================================================
            BARRA DE ENVÍO GRATIS (Descuento Silencioso)
        ========================================================================= */}
        <div className="bg-foeg-surface/60 px-4 sm:px-6 md:px-8 py-3 border-b border-foeg-border/60">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] mb-2 font-light">
            {isFreeShipping ? (
              <span className="text-foeg-navy font-medium">
                {t('cart.freeShipping')}
              </span>
            ) : (
              <span className="text-foeg-black">
                {t('cart.moreForFree')
                  .replace('{amount} €', formatPrice(amountUntilFreeShipping))
                  .replace('{amount}', formatPrice(amountUntilFreeShipping))}
              </span>
            )}
            <span className="text-foeg-muted text-[10px]">
              {formatPrice(freeShippingThreshold)}
            </span>
          </div>

          {/* Barra de progreso muy fina en azul marino (foeg-navy) */}
          <div className="w-full h-[2px] bg-foeg-border overflow-hidden">
            <div
              className="h-full bg-foeg-navy transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* =========================================================================
            LISTA DE PRODUCTOS O ESTADO VACÍO
        ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 divide-y divide-foeg-border/60">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
              <span className="font-serif text-xl text-foeg-black font-light">
                {t('cart.empty')}
              </span>
              <p className="text-xs text-foeg-muted font-light max-w-xs leading-relaxed">
                {t('cart.emptySubtitle')}
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-4 text-xs uppercase tracking-[0.2em] text-foeg-black border-b border-foeg-black pb-1 hover:text-foeg-navy hover:border-foeg-navy transition-colors font-light cursor-pointer"
              >
                {t('cart.explore')}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex space-x-4">
                {/* Imagen Pequeña del Producto (aspect-[3/4]) */}
                <div className="relative w-20 aspect-[3/4] bg-foeg-surface shrink-0 overflow-hidden border border-foeg-border/60">
                  <MediaBox
                    src={item.product.images[0]}
                    alt={item.product.name}
                    aspectRatio="full"
                    sizes="80px"
                    className="w-full h-full"
                  />
                </div>

                {/* Información de la Prenda */}
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-sm font-normal text-foeg-black leading-snug">
                        <Link
                          href={`/producto/${item.product.slug}`}
                          onClick={closeCart}
                          className="hover:underline underline-offset-4"
                        >
                          {item.product.name}
                        </Link>
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-foeg-muted hover:text-red-800 transition-colors p-1"
                        aria-label={`Supprimer ${item.product.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1} />
                      </button>
                    </div>

                    <p className="text-[11px] text-foeg-muted uppercase tracking-wider font-light">
                      {t('cart.size')} : <span className="text-foeg-black font-medium">{item.size}</span>
                      {item.color && (
                        <>
                          <span className="mx-1.5 text-foeg-border">·</span>
                          <span className="text-foeg-navy font-medium tracking-normal">{getTranslatedColor(item.color, language)}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Control de Cantidad (- / +) */}
                    <div className="flex items-center border border-foeg-border bg-foeg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-foeg-muted hover:text-foeg-black transition-colors"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="w-3 h-3" strokeWidth={1} />
                      </button>
                      <span className="px-2.5 text-xs text-foeg-black font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-foeg-muted hover:text-foeg-black transition-colors"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="w-3 h-3" strokeWidth={1} />
                      </button>
                    </div>

                    {/* Precio Total de la Línea */}
                    <span className="text-xs font-medium tracking-wider text-foeg-black">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* =========================================================================
            FOOTER DEL CARRITO: SUBTOTAL, CUPÓN Y CHECKOUT
        ========================================================================= */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 md:p-8 border-t border-foeg-border/80 bg-foeg-white space-y-3.5">
            {/* Champ Code Privilège */}
            <div className="space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <input
                  type="text"
                  placeholder={
                    language === 'es'
                      ? 'Código de privilegio (ej: CERCLE10)'
                      : language === 'en'
                      ? 'Privilege code (e.g. CERCLE10)'
                      : 'Code privilège (ex: CERCLE10)'
                  }
                  suppressHydrationWarning
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-foeg-surface/40 border border-foeg-border text-foeg-black text-xs uppercase tracking-wider font-light focus:border-foeg-navy focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponInput.trim()}
                  suppressHydrationWarning
                  className="px-3.5 py-2 bg-foeg-black text-white hover:bg-foeg-navy text-[10px] uppercase tracking-widest font-medium transition-colors cursor-pointer disabled:opacity-40"
                >
                  {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (t('checkout.apply') || 'Appliquer')}
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                  <span className="flex items-center space-x-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>
                      {appliedCoupon.code} (-
                      {appliedCoupon.type === 'PERCENTAGE'
                        ? `${appliedCoupon.value}%`
                        : formatPrice(appliedCoupon.value)}
                      )
                    </span>
                  </span>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleRemoveCoupon}
                    className="text-emerald-700 hover:text-emerald-950 text-xs cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </div>
              )}

              {couponMessage && (
                <p
                  className={`text-[10px] font-light ${
                    couponMessage.error ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {couponMessage.text}
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-foeg-border/60">
              <div className="flex justify-between items-center text-xs uppercase tracking-[0.18em]">
                <span className="text-foeg-muted font-light">{t('cart.subtotal')}</span>
                <span className="text-sm font-medium text-foeg-black tracking-wider">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-xs tracking-wider text-emerald-700 font-medium">
                  <span>{t('checkout.discount') || 'Remise Privilège'}</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-xs uppercase tracking-[0.18em] pt-1">
                  <span className="text-foeg-black font-medium">{language === 'es' ? 'Total Estimado' : language === 'en' ? 'Estimated Total' : 'Total Estimé'}</span>
                  <span className="text-sm font-serif font-normal text-foeg-navy">
                    {formatPrice(totalWithDiscount)}
                  </span>
                </div>
              )}

              <p className="text-[10px] text-foeg-muted font-light leading-relaxed">
                {t('cart.taxesNotice')}
              </p>
            </div>

            {/* Botón Principal: "Passer à la caisse" */}
            <Link
              href={checkoutHref}
              onClick={closeCart}
              className="w-full py-4 px-6 text-xs uppercase tracking-[0.22em] font-medium transition-all duration-300 rounded-none bg-foeg-navy text-foeg-white hover:bg-foeg-black flex items-center justify-center space-x-2 shadow-subtle group"
            >
              <span>{t('cart.checkout')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1} />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
