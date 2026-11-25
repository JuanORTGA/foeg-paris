'use client';

// FOEG Paris - Maison de Confection Française
// Quick View Modal (The Row + Temu Hybrid Split Screen)
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Check, ShoppingBag } from 'lucide-react';
import { MockProduct } from '@/lib/mock-data';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { useLanguage } from '@/lib/language-context';
import MediaBox from '@/components/ui/MediaBox';
import { getTranslatedColor } from '@/lib/i18n';
import { getProductBadge } from '@/lib/badge-helper';

export interface QuickViewModalProps {
  product: MockProduct | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { t, language } = useLanguage();

  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false);

  // Lista de tallas dinámica según el producto
  const isPantalon = product?.subcategory === 'Pantalons' || (product?.variants && product.variants.some((v) => /^\d+$/.test(v.size)));
  const defaultSizes = isPantalon ? ['26', '28', '30', '32', '34', '36'] : ['XS', 'S', 'M', 'L', 'XL'];
  
  const allSizes: string[] = product?.variants && product.variants.length > 0
    ? Array.from(new Set(product.variants.map((v) => v.size)))
    : defaultSizes;

  // Lista de colores disponibles
  const availableColors: string[] = product?.variants && product.variants.length > 0
    ? Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)))
    : ['Noir Carbone'];

  // Obtener stock de una talla
  const getStockForSize = (size: string) => {
    if (!product) return 0;
    const variant = product.variants?.find((v) => v.size === size);
    return variant ? variant.stock : 1;
  };

  // Comprobar si toda la prenda está agotada
  const isEntirelySoldOut = product?.variants
    ? product.variants.every((v) => v.stock <= 0)
    : false;

  // Seleccionar automáticamente la primera talla con stock disponible al abrir
  useEffect(() => {
    if (product) {
      const availableSize = allSizes.find((size) => getStockForSize(size) > 0);
      setSelectedSize(availableSize || allSizes[0] || 'M');
      setSelectedColor(availableColors[0] || 'Noir Carbone');
      setIsAdded(false);
    }
  }, [product]);

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const currentSizeOutOfStock = getStockForSize(selectedSize) <= 0;

  const handleAddToCart = () => {
    if (isEntirelySoldOut || currentSizeOutOfStock) return;
    addItem(product, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Aperçu rapide : ${product.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-8 animate-fadeIn"
    >
      {/* Contenedor Principal Split-Screen (60% / 40% Desktop, Stacked Mobile) */}
      <div className="relative w-full max-w-4xl bg-foeg-white border border-foeg-border rounded-none shadow-floating flex flex-col md:flex-row overflow-hidden max-h-[92vh] md:max-h-[82vh]">
        {/* TAREA 1: Columna Izquierda (60% del ancho) - Imagen Editorial de Alta Definición */}
        <div className="w-full md:w-[58%] lg:w-[60%] shrink-0 relative bg-foeg-surface overflow-hidden aspect-[4/3] sm:aspect-[3/4] md:aspect-auto md:h-auto min-h-[220px] sm:min-h-[280px] md:min-h-[500px]">
          <MediaBox
            src={product.images[0]}
            alt={product.name}
            aspectRatio="full"
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority={true}
          />

          {/* Insignia elegante según disponibilidad o calificación */}
          {(() => {
            if (isEntirelySoldOut) {
              return (
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <span className="bg-foeg-white text-foeg-black text-[9px] uppercase tracking-[0.25em] px-3 py-1.5 font-medium border border-foeg-border/80 shadow-subtle">
                    {t('products.outOfStock') || 'Épuisé'}
                  </span>
                </div>
              );
            }

            const badgeConfig = getProductBadge(product, t);
            if (badgeConfig) {
              return (
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <span className={`${badgeConfig.className} text-[9px] uppercase tracking-[0.25em] px-3 py-1 font-medium shadow-subtle`}>
                    {badgeConfig.label}
                  </span>
                </div>
              );
            }

            return null;
          })()}
        </div>

        {/* TAREA 1 & 2: Columna Derecha (40% del ancho) - Panel The Row + Temu Style */}
        <div className="w-full md:w-[42%] lg:w-[40%] flex flex-col justify-between p-6 sm:p-8 md:p-9 bg-foeg-white relative overflow-y-auto">
          {/* TAREA 3: Botón de Cerrar (X) fino en la esquina superior derecha */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-1.5 text-foeg-muted hover:text-foeg-black transition-colors focus:outline-none cursor-pointer z-20"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" strokeWidth={1.2} />
          </button>

          {/* Sección Superior: Encabezado, Título, Precio y Descripción */}
          <div className="space-y-4 pr-6 sm:pr-8">
            {/* Encabezado Sans-serif */}
            <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted font-medium block">
              {product.origin ? product.origin.split(',')[0].trim().toUpperCase() : 'CONFECTIONNÉ À PARIS'}
            </span>

            {/* Título en tipografía Serif de gran elegancia */}
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-foeg-black tracking-tight leading-snug">
              {product.name}
            </h2>

            {/* Precio en fuente Sans-serif */}
            <p className="text-base sm:text-lg font-normal text-foeg-black tracking-wide">
              {formatPrice(product.price)}
            </p>

            {/* Descripción limitada a 3 líneas con "..." y "Lire la suite" */}
            <div className="pt-1">
              <p className="text-xs text-foeg-muted font-light leading-relaxed line-clamp-3">
                {product.description}
              </p>
              <Link
                href={`/producto/${product.slug}`}
                prefetch={true}
                onClick={onClose}
                className="text-[11px] uppercase tracking-[0.16em] text-foeg-navy hover:text-foeg-black underline underline-offset-4 transition-colors font-medium inline-block mt-1.5"
              >
                {t('pdp.readMore')}
              </Link>
            </div>
          </div>

          {/* Sección Inferior: Selector de Tallas y Botones de Acción */}
          <div className="pt-6 border-t border-foeg-border/80 space-y-5 mt-6">
            {/* Selector de Color */}
            {availableColors.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium">
                  {t('pdp.colorLabel')}{' '}
                  <span className="font-semibold text-foeg-navy">
                    {getTranslatedColor(selectedColor, language)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {availableColors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-2.5 py-1 text-[11px] border uppercase tracking-wider transition-all cursor-pointer ${
                        selectedColor === col
                          ? 'border-foeg-navy bg-foeg-navy text-white font-medium'
                          : 'border-foeg-border text-foeg-black hover:border-foeg-navy'
                      }`}
                    >
                      {getTranslatedColor(col, language)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SELECTOR DE TALLAS (CRÍTICO) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium">
                  {t('cart.size') || 'Taille'} : <span className="font-semibold">{selectedSize}</span>
                </span>
                {currentSizeOutOfStock && (
                  <span className="text-[10px] text-amber-800 uppercase tracking-wider font-light">
                    {t('pdp.outOfStock')}
                  </span>
                )}
              </div>

              {/* Botones de Talla (S, M, L) - Con tachado si stock = 0 */}
              <div className="flex items-center space-x-2.5">
                {allSizes.map((size) => {
                  const outOfStock = getStockForSize(size) <= 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      suppressHydrationWarning
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`h-10 min-w-10 px-3.5 text-xs uppercase tracking-wider font-medium transition-all duration-200 border rounded-none cursor-pointer relative ${
                        outOfStock
                          ? 'border-foeg-border text-foeg-muted/40 line-through cursor-not-allowed bg-foeg-surface/40'
                          : isSelected
                          ? 'bg-foeg-navy text-foeg-white border-foeg-navy shadow-subtle'
                          : 'border-foeg-border text-foeg-black hover:border-foeg-black bg-transparent'
                      }`}
                      aria-label={`Taille ${size}${outOfStock ? ' - Épuisé' : ''}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="space-y-2.5 pt-1">
              {/* Botón Principal: AJOUTER AU PANIER en Azul Marino foeg-navy */}
              <button
                type="button"
                suppressHydrationWarning
                disabled={isEntirelySoldOut || currentSizeOutOfStock}
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-6 text-xs uppercase tracking-[0.22em] font-medium transition-all duration-300 rounded-none shadow-subtle flex items-center justify-center space-x-2 ${
                  isEntirelySoldOut || currentSizeOutOfStock
                    ? 'bg-foeg-border text-foeg-muted cursor-not-allowed border border-foeg-border'
                    : isAdded
                    ? 'bg-emerald-800 text-white cursor-default'
                    : 'bg-foeg-navy hover:bg-foeg-black text-foeg-white cursor-pointer active:scale-[0.99]'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('pdp.addedToBag')}</span>
                  </>
                ) : isEntirelySoldOut || currentSizeOutOfStock ? (
                  <span>{t('pdp.outOfStock')}</span>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{t('pdp.addToBag')}</span>
                  </>
                )}
              </button>

              {/* Enlace Secundario Sutil: Voir la fiche complète */}
              <Link
                href={`/producto/${product.slug}`}
                prefetch={true}
                onClick={onClose}
                className="block text-center text-[10px] uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black transition-colors font-light py-1"
              >
                {t('pdp.viewDetails')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
