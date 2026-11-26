'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Minus, Truck, RotateCcw, Heart, Bell, Check, Loader2, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import MediaBox, { isVideoUrl } from '@/components/ui/MediaBox';
import ProductCard from '@/components/product/ProductCard';
import Reviews from '@/components/product/Reviews';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { useLanguage } from '@/lib/language-context';
import { useWishlist } from '@/lib/wishlist-context';
import { MockProduct } from '@/lib/mock-data';
import { createStockAlert } from '@/lib/stock-actions';
import { getTranslatedColor } from '@/lib/i18n';
import { getProductBadge } from '@/lib/badge-helper';

interface ProductoClientProps {
  currentProduct: MockProduct;
  relatedProducts: MockProduct[];
}

export default function ProductoClient({ currentProduct, relatedProducts }: ProductoClientProps) {
  const { addItem } = useCart();
  const { formatPrice, currency } = useCurrency();
  const { t, language } = useLanguage();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const width = container.clientWidth;
    if (width > 0) {
      const newIdx = Math.round(container.scrollLeft / width);
      if (newIdx !== mobileActiveIndex && newIdx >= 0 && newIdx < currentProduct.images.length) {
        setMobileActiveIndex(newIdx);
        setSelectedImageIndex(newIdx);
      }
    }
  };

  const scrollToMobileSlide = (idx: number) => {
    if (mobileCarouselRef.current) {
      const width = mobileCarouselRef.current.clientWidth;
      mobileCarouselRef.current.scrollTo({
        left: width * idx,
        behavior: 'smooth',
      });
    }
    setMobileActiveIndex(idx);
    setSelectedImageIndex(idx);
  };

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  // Detección de tipo de prenda (Pantalones vs Prendas Superiores)
  const isPantalon =
    currentProduct.subcategory === 'Pantalons' ||
    (currentProduct.variants && currentProduct.variants.some((v) => /^\d+$/.test(v.size)));

  // Lista de colores únicos disponibles
  const rawColors = Array.from(
    new Set((currentProduct.variants || []).map((v) => v.color).filter(Boolean))
  );
  const availableColors = rawColors.length > 0 ? rawColors : ['Noir Carbone'];
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0]);

  // Tallas según tipo de prenda y color seleccionado
  const colorVariants = (currentProduct.variants || []).filter(
    (v) => !v.color || v.color === selectedColor
  );

  const defaultSizes = isPantalon
    ? ['26', '28', '30', '32', '34', '36']
    : ['XS', 'S', 'M', 'L', 'XL'];

  const standardOrder = ['XS', 'S', 'M', 'L', 'XL'];
  const pantsOrder = ['26', '28', '30', '32', '34', '36'];
  const activeOrder = isPantalon ? pantsOrder : standardOrder;

  const rawAvailable = colorVariants.length > 0
    ? Array.from(new Set(colorVariants.map((v) => v.size)))
    : defaultSizes;

  const availableSizes: string[] = [...rawAvailable].sort((a, b) => {
    const idxA = activeOrder.indexOf(a);
    const idxB = activeOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizes.find((sz) => {
      const v = colorVariants.find((cv) => cv.size === sz);
      return v ? Number(v.stock) > 0 : true;
    }) || availableSizes[0] || (isPantalon ? '28' : 'S')
  );

  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    const matchingVariant = (currentProduct.variants || []).find(
      (v) => v.color === colorName && v.size === selectedSize
    );
    if (!matchingVariant || Number(matchingVariant.stock) === 0) {
      const inStockVariant = (currentProduct.variants || []).find(
        (v) => v.color === colorName && Number(v.stock) > 0
      );
      if (inStockVariant) {
        setSelectedSize(inStockVariant.size);
      }
    }
  };

  // Helper para código hexadecimal de color
  const getColorHex = (colorName: string) => {
    const c = colorName.toLowerCase();
    if (c.includes('noir') || c.includes('black') || c.includes('carbone') || c.includes('ébène') || c.includes('absolu')) return '#18181B';
    if (c.includes('blanc') || c.includes('white') || c.includes('ivoire')) return '#FBF9F5';
    if (c.includes('craie') || c.includes('mastic') || c.includes('chalk')) return '#E8E5DF';
    if (c.includes('bordeaux') || c.includes('burgundy') || c.includes('séquins') || c.includes('sequin')) return '#581825';
    if (c.includes('bleu') || c.includes('navy') || c.includes('nuit')) return '#1A2836';
    if (c.includes('camel') || c.includes('beige') || c.includes('écru') || c.includes('doré')) return '#C39B77';
    if (c.includes('gris') || c.includes('grey') || c.includes('anthracite')) return '#4B4D50';
    if (c.includes('vert') || c.includes('green') || c.includes('émeraude')) return '#1B4D3E';
    return '#2B2B2B';
  };

  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    details: true,
    sizing: false,
    shipping: false,
  });

  const wishlisted = isWishlisted(currentProduct.id || currentProduct.slug);

  const [alertEmail, setAlertEmail] = useState('');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [showAlertInput, setShowAlertInput] = useState(false);

  const handleOpenLightbox = (index: number) => {
    setLightboxImageIndex(index);
    setIsLightboxOpen(true);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setLightboxImageIndex((prev) => (prev === 0 ? currentProduct.images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxImageIndex((prev) => (prev === currentProduct.images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, currentProduct.images.length]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setMobileActiveIndex(0);
    if (mobileCarouselRef.current) {
      mobileCarouselRef.current.scrollLeft = 0;
    }
    setLightboxImageIndex(0);
    setIsLightboxOpen(false);
    const newColors = Array.from(new Set((currentProduct.variants || []).map((v) => v.color).filter(Boolean)));
    const firstColor = newColors[0] || 'Noir Carbone';
    setSelectedColor(firstColor);
    const firstSize = isPantalon ? '28' : 'S';
    setSelectedSize(firstSize);
    setShowAlertInput(false);
    setAlertMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentProduct.slug, isPantalon]);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentVariant = currentProduct.variants.find(
    (v) => v.size === selectedSize && (!v.color || v.color === selectedColor)
  );
  const currentStock = currentVariant ? Number(currentVariant.stock) : 5;
  const isOutOfStock = currentVariant ? currentStock === 0 : false;
  const isLowStock = currentVariant ? currentStock > 0 && currentStock <= 3 : false;
  const totalProductStock = currentProduct.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  const isEntirelyOutOfStock = (currentProduct.variants && currentProduct.variants.length > 0) ? totalProductStock === 0 : false;
  const isCurrentSelectionOutOfStock = isEntirelyOutOfStock || isOutOfStock;

  const handleStockAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail.trim()) return;
    setAlertLoading(true);
    setAlertMessage(null);
    const res = await createStockAlert(alertEmail, currentProduct.name, isEntirelyOutOfStock ? undefined : selectedSize);
    setAlertLoading(false);
    if (res.success) {
      setAlertMessage({ text: res.message || 'Votre demande a été transmise.' });
      setAlertEmail('');
    } else {
      setAlertMessage({ text: res.error || 'Erreur lors de la demande.', error: true });
    }
  };

  return (
    <div className="pt-24 sm:pt-28 md:pt-36 pb-32 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      {/* Migas de pan sutiles */}
      <nav className="mb-8 text-xs text-foeg-muted uppercase tracking-[0.2em] font-light flex items-center space-x-2">
        <Link href="/" className="hover:text-foeg-black transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link href="/hombre" className="hover:text-foeg-black transition-colors">
          {currentProduct.category || 'Hombre'}
        </Link>
        <span>/</span>
        <span className="text-foeg-black font-normal truncate max-w-xs">
          {currentProduct.name}
        </span>
      </nav>

      {/* FICHA DE PRODUCTO (PDP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* COLUMNA IZQUIERDA / GALERÍA COMPLETA (MÓVIL Y ESCRITORIO) */}
        <div className="lg:col-span-7 w-full">
          {/* =========================================================================
              1. MÓVIL (< md): FOTOS EN CUADRO UNA AL LADO DE OTRA (SEGÚN CANTIDAD DE FOTOS)
          ========================================================================= */}
          <div className="block md:hidden w-full mb-8 select-none">
            {currentProduct.images.length === 1 ? (
              /* CASO 1: 1 SOLA FOTO -> CUADRO DESTACADO GRANDE */
              <div
                onClick={() => handleOpenLightbox(0)}
                className="relative w-full aspect-square min-h-[320px] max-h-[440px] overflow-hidden bg-foeg-surface border border-foeg-border/80 shadow-subtle cursor-zoom-in"
              >
                {isVideoUrl(currentProduct.images[0]) ? (
                  <video
                    src={currentProduct.images[0]}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <img
                    src={currentProduct.images[0]}
                    alt={`${currentProduct.name} — Vue principale`}
                    className="w-full h-full object-cover object-center select-none"
                    loading="eager"
                  />
                )}
                {(() => {
                  const badgeConfig = getProductBadge(currentProduct, t);
                  if (badgeConfig) {
                    return (
                      <div className="absolute top-3 left-3 z-10 pointer-events-none">
                        <span className={`${badgeConfig.className} text-[9px] uppercase tracking-[0.22em] px-2.5 py-1 font-medium shadow-subtle`}>
                          {badgeConfig.label}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            ) : currentProduct.images.length === 2 ? (
              /* CASO 2: 2 FOTOS -> DOS CUADROS UNO AL LADO DEL OTRO */
              <div className="grid grid-cols-2 gap-2.5 w-full">
                {currentProduct.images.map((img, idx) => (
                  <div
                    key={`mobile-2grid-${idx}`}
                    onClick={() => handleOpenLightbox(idx)}
                    className="relative w-full aspect-square overflow-hidden bg-foeg-surface border border-foeg-border/80 shadow-subtle cursor-zoom-in"
                  >
                    {isVideoUrl(img) ? (
                      <video
                        src={img}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <img
                        src={img}
                        alt={`${currentProduct.name} — Vue ${idx + 1}`}
                        className="w-full h-full object-cover object-center select-none"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                    )}
                    {idx === 0 && (() => {
                      const badgeConfig = getProductBadge(currentProduct, t);
                      if (badgeConfig) {
                        return (
                          <div className="absolute top-2 left-2 z-10 pointer-events-none">
                            <span className={`${badgeConfig.className} text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 font-medium shadow-subtle`}>
                              {badgeConfig.label}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ))}
              </div>
            ) : (
              /* CASO 3: 3 O MÁS FOTOS -> CARRUSEL DE CUADROS UNO AL LADO DEL OTRO */
              <div className="space-y-3">
                <div
                  ref={mobileCarouselRef}
                  onScroll={handleMobileScroll}
                  className="flex gap-2.5 w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-1"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {currentProduct.images.map((img, idx) => (
                    <div
                      key={`mobile-carousel-${idx}`}
                      onClick={() => handleOpenLightbox(idx)}
                      className="w-[82vw] sm:w-[48vw] shrink-0 snap-center relative aspect-square min-h-[300px] overflow-hidden bg-foeg-surface border border-foeg-border/80 shadow-subtle cursor-zoom-in"
                    >
                      {isVideoUrl(img) ? (
                        <video
                          src={img}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <img
                          src={img}
                          alt={`${currentProduct.name} — Vue ${idx + 1}`}
                          className="w-full h-full object-cover object-center select-none"
                          loading={idx === 0 ? 'eager' : 'lazy'}
                        />
                      )}

                      {idx === 0 && (() => {
                        const badgeConfig = getProductBadge(currentProduct, t);
                        if (badgeConfig) {
                          return (
                            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                              <span className={`${badgeConfig.className} text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 font-medium shadow-subtle`}>
                                {badgeConfig.label}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  ))}
                </div>

                {/* Dots indicadores y contador */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-1.5">
                    {currentProduct.images.map((_, idx) => (
                      <button
                        key={`dot-cuadro-${idx}`}
                        type="button"
                        onClick={() => scrollToMobileSlide(idx)}
                        className={`h-1 transition-all duration-300 rounded-full cursor-pointer ${
                          mobileActiveIndex === idx
                            ? 'w-6 bg-foeg-navy'
                            : 'w-2 bg-foeg-border hover:bg-foeg-muted'
                        }`}
                        aria-label={`Vue ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] tracking-widest font-mono text-foeg-muted uppercase">
                    {mobileActiveIndex + 1} / {currentProduct.images.length}
                  </span>
                </div>

                {/* Tira inferior de miniaturas en cuadro */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar snap-x">
                  {currentProduct.images.map((img, idx) => {
                    const isSelected = mobileActiveIndex === idx;
                    return (
                      <button
                        key={`thumb-cuadro-${idx}`}
                        type="button"
                        onClick={() => scrollToMobileSlide(idx)}
                        className={`relative aspect-square w-14 shrink-0 snap-start overflow-hidden bg-foeg-surface transition-all duration-200 border cursor-pointer ${
                          isSelected
                            ? 'border-b-2 border-b-foeg-navy ring-1 ring-foeg-navy opacity-100 shadow-sm'
                            : 'border-foeg-border/80 opacity-60 hover:opacity-100'
                        }`}
                      >
                        {isVideoUrl(img) ? (
                          <video
                            src={img}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={img}
                            alt={`Miniature ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              2. ESCRITORIO (md+): GALERÍA EDITORIAL THE ROW STYLE (MINIATURAS VERTICALES + ZOOM)
          ========================================================================= */}
          <div className="hidden md:flex flex-row gap-4 lg:gap-6 items-start w-full">
            {/* MINIATURAS VERTICALES - Visible solo en Desktop (md+) */}
            {currentProduct.images.length > 1 && (
              <div
                className="flex flex-col gap-2.5 w-20 lg:w-24 shrink-0 max-h-[720px] overflow-y-auto no-scrollbar scroll-smooth pr-0.5"
                aria-label="Galerie de miniatures"
              >
                {currentProduct.images.map((img, idx) => {
                  const isSelected = selectedImageIndex === idx;
                  return (
                    <button
                      key={`thumb-desktop-${idx}`}
                      type="button"
                      onMouseEnter={() => setSelectedImageIndex(idx)}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`group relative aspect-[3/4] w-full overflow-hidden bg-foeg-surface transition-all duration-200 border cursor-pointer focus:outline-none ${
                        isSelected
                          ? 'border-b-2 border-b-foeg-navy ring-1 ring-foeg-navy shadow-sm opacity-100'
                          : 'border-foeg-border/80 hover:border-foeg-black/60 opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`Sélectionner vue ${idx + 1}`}
                    >
                      <MediaBox
                        src={img}
                        alt={`${currentProduct.name} — Miniature ${idx + 1}`}
                        aspectRatio="full"
                        priority={idx === 0}
                        sizes="(max-width: 1024px) 80px, 96px"
                        className="w-full h-full"
                      />
                      {isSelected && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-foeg-navy" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ZoomIn className="w-4 h-4 text-white drop-shadow" strokeWidth={1.5} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* CENTRO: FOTO PRINCIPAL Y CUADRÍCULA EDITORIAL (DESKTOP) */}
            <div className="w-full flex-1 space-y-4 min-w-0">
              {/* IMAGEN PRINCIPAL GRANDE CON ZOOM */}
              <div
                onClick={() => handleOpenLightbox(selectedImageIndex)}
                className="group relative aspect-[3/4] w-full overflow-hidden bg-foeg-surface border border-foeg-border/60 cursor-zoom-in select-none"
                title="Cliquer pour agrandir et examiner les détails de la matière"
              >
                <MediaBox
                  key={`main-pdp-${selectedImageIndex}`}
                  src={currentProduct.images[selectedImageIndex] || currentProduct.images[0]}
                  alt={`${currentProduct.name} — Vue principale`}
                  aspectRatio="full"
                  priority={selectedImageIndex === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="w-full h-full animate-fadeIn"
                  imageClassName="transition-all duration-300 ease-out group-hover:scale-[1.02]"
                />

                {(() => {
                  const badgeConfig = getProductBadge(currentProduct, t);
                  if (badgeConfig) {
                    return (
                      <div className="absolute top-4 left-4 z-10 pointer-events-none">
                        <span className={`${badgeConfig.className} text-[10px] uppercase tracking-[0.25em] px-3 py-1 font-medium shadow-subtle`}>
                          {badgeConfig.label}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* OVERLAY LUPA SUTIL */}
                <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-foeg-white/95 text-foeg-navy text-[11px] uppercase tracking-wider px-3 py-1.5 font-light border border-foeg-border/60 flex items-center gap-1.5 shadow-sm">
                    <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{t('pdp.zoomFabric')}</span>
                  </div>
                </div>
              </div>

              {/* GRID SECUNDARIO DE 2 COLUMNAS (SOLO DESKTOP) */}
              {currentProduct.images.length > 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {currentProduct.images
                    .filter((_, idx) => idx !== selectedImageIndex)
                    .slice(0, 2)
                    .map((img, idx) => {
                      const actualIdx = currentProduct.images.indexOf(img);
                      return (
                        <div
                          key={`editorial-grid-${idx}`}
                          onClick={() => handleOpenLightbox(actualIdx >= 0 ? actualIdx : idx + 1)}
                          className="group relative aspect-[3/4] overflow-hidden bg-foeg-surface border border-foeg-border/60 cursor-zoom-in transition-all duration-300 hover:border-foeg-black/60"
                          title="Cliquer pour agrandir le détail de la matière"
                        >
                          <MediaBox
                            src={img}
                            alt={`${currentProduct.name} — Vue détail ${idx + 1}`}
                            aspectRatio="full"
                            sizes="(max-width: 1024px) 50vw, 25vw"
                            className="w-full h-full"
                            imageClassName="transition-all duration-500 ease-out group-hover:scale-[1.02]"
                          />
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-foeg-white/90 p-1.5 border border-foeg-border/60 shadow-sm text-foeg-navy">
                              <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN INTERACTIVA */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="space-y-2 border-b border-foeg-border/80 pb-6">
              <span className="text-[11px] uppercase tracking-[0.25em] text-foeg-muted block font-light">
                {currentProduct.origin}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight leading-tight">
                {currentProduct.name}
              </h1>
              <div className="pt-2 flex items-baseline space-x-3">
                <span className="text-2xl font-normal text-foeg-black tracking-wider">
                  {formatPrice(currentProduct.price)}
                </span>
                <span className="text-[11px] text-foeg-muted font-light tracking-wide">
                  {currency === 'EUR' ? t('pdp.taxesIncluded') : t('pdp.taxesIntl')}
                </span>
              </div>
            </div>

            {/* Sélecteur de Couleur (The Row Minimalist Swatches) */}
            <div className="space-y-2.5 pt-2 border-t border-foeg-border/60">
              <div className="flex justify-between items-center text-xs tracking-[0.18em] uppercase">
                <span className="text-foeg-black font-medium">
                  {t('pdp.colorLabel')}{' '}
                  <span className="font-semibold text-foeg-navy pl-1">
                    {getTranslatedColor(selectedColor, language)}
                  </span>
                </span>
                <span className="text-[10px] text-foeg-muted tracking-widest uppercase">
                  {availableColors.length}{' '}
                  {availableColors.length === 1
                    ? t('pdp.colorsAvailableSingular')
                    : t('pdp.colorsAvailablePlural')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {availableColors.map((colorName) => {
                  const isSelected = selectedColor === colorName;
                  const hex = getColorHex(colorName);
                  const isWhite = hex === '#FBF9F5' || colorName.toLowerCase().includes('blanc');

                  return (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => handleSelectColor(colorName)}
                      className={`group relative flex items-center space-x-2 py-2 px-3.5 border transition-all cursor-pointer ${isSelected
                          ? 'border-foeg-navy bg-foeg-surface/70 text-foeg-black shadow-subtle'
                          : 'border-foeg-border hover:border-foeg-black text-foeg-muted bg-white'
                        }`}
                      title={getTranslatedColor(colorName, language)}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full shrink-0 border ${isWhite ? 'border-foeg-border' : 'border-black/20'
                          }`}
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[11px] font-medium tracking-wider uppercase">
                        {getTranslatedColor(colorName, language)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Tallas */}
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs tracking-[0.18em] uppercase">
                <span className="text-foeg-black font-medium">
                  {isPantalon ? t('pdp.sizePantsLabel') : t('pdp.sizeStandardLabel')}
                </span>
                {isOutOfStock ? (
                  <span className="text-foeg-muted/60 line-through text-[11px]">{t('pdp.outOfStock')}</span>
                ) : isLowStock ? (
                  <span className="text-foeg-navy font-medium text-[11px] flex items-center space-x-1">
                    <span>●</span>
                    <span>{t('pdp.lowStock')}</span>
                  </span>
                ) : (
                  <span className="text-foeg-muted text-[11px]">{t('pdp.inStock')}</span>
                )}
              </div>

              <div className={`grid gap-2.5 ${availableSizes.length > 5 ? 'grid-cols-6' : availableSizes.length > 4 ? 'grid-cols-5' : 'grid-cols-3'}`}>
                {availableSizes.map((size) => {
                  const variant = (currentProduct.variants || []).find(
                    (v) => v.size === size && (!v.color || v.color === selectedColor)
                  );
                  const outOfStock = variant ? Number(variant.stock) === 0 : false;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 flex flex-col items-center justify-center text-xs uppercase tracking-widest transition-all duration-200 border rounded-none font-medium relative ${outOfStock
                          ? 'border-foeg-border/40 bg-foeg-surface/40 text-foeg-muted/40 cursor-not-allowed line-through opacity-40'
                          : isSelected
                            ? 'border-foeg-navy bg-foeg-navy text-foeg-white shadow-subtle'
                            : 'border-foeg-border text-foeg-black bg-foeg-white hover:border-foeg-black cursor-pointer'
                        }`}
                      aria-label={`Taille ${size} ${outOfStock ? 'épuisée' : ''}`}
                    >
                      <span className="font-mono text-xs">{size}</span>
                      {outOfStock && (
                        <span className="absolute text-[8px] tracking-normal bottom-1 text-foeg-muted/50 no-underline">
                          {t('pdp.outOfStock')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bouton Añadir a la bolsa + Wishlist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                {isCurrentSelectionOutOfStock ? (
                  <button
                    type="button"
                    onClick={() => setShowAlertInput((prev) => !prev)}
                    className="flex-1 py-4 px-6 text-xs uppercase tracking-[0.22em] font-medium transition-all duration-300 rounded-none flex items-center justify-center space-x-2 shadow-subtle border border-foeg-black/40 bg-white text-foeg-black hover:bg-foeg-black hover:text-white cursor-pointer active:scale-[0.99]"
                  >
                    <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{isEntirelyOutOfStock ? t('pdp.notifyStock') : t('pdp.notifyStockSize')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      addItem(currentProduct, selectedSize, selectedColor, 1);
                    }}
                    className="flex-1 py-4 px-6 text-xs uppercase tracking-[0.22em] font-medium transition-all duration-300 rounded-none flex items-center justify-center space-x-2 shadow-subtle bg-foeg-navy text-foeg-white hover:bg-foeg-black cursor-pointer active:scale-[0.99]"
                  >
                    {t('pdp.addToBag')}
                  </button>
                )}

                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => toggleWishlist(currentProduct.id || currentProduct.slug)}
                  className={`p-4 border transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center shadow-subtle ${wishlisted
                    ? 'border-foeg-navy bg-foeg-navy text-white'
                    : 'border-foeg-border hover:border-foeg-black bg-white text-foeg-black'
                    }`}
                  aria-label="Ajouter à la liste de désirs"
                  title="Sauvegarder dans ma liste de désirs"
                >
                  <Heart
                    className={`w-4 h-4 ${wishlisted ? 'fill-white text-white' : 'text-foeg-black'}`}
                    strokeWidth={1.5}
                  />
                </button>
              </div>

              {/* Formulaire d'alerte de réassort (Back in stock) */}
              {showAlertInput && (
                <form onSubmit={handleStockAlert} className="p-4 border border-foeg-border bg-foeg-surface/40 space-y-2.5 animate-fadeIn">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-navy font-semibold block">
                    {t('pdp.restockAlertTitle')}
                  </span>
                  <p className="text-xs text-foeg-muted font-light leading-relaxed">
                    {t('pdp.restockAlertDesc')}
                  </p>
                  <div className="flex border-b border-foeg-black/40 focus-within:border-foeg-navy transition-colors pb-1">
                    <input
                      type="email"
                      required
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      placeholder="votre.courriel@paris.fr"
                      className="bg-transparent text-xs text-foeg-black placeholder:text-foeg-muted/60 focus:outline-none w-full py-1 font-light"
                    />
                    <button
                      type="submit"
                      disabled={alertLoading}
                      className="text-[10px] uppercase tracking-[0.2em] text-foeg-black hover:text-foeg-navy transition-colors px-2 font-medium cursor-pointer whitespace-nowrap"
                    >
                      {alertLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t('pdp.notifyBtn')}
                    </button>
                  </div>
                  {alertMessage && (
                    <p
                      className={`text-[11px] font-light pt-1 animate-fadeIn flex items-center space-x-1 ${alertMessage.error ? 'text-red-700' : 'text-emerald-800'
                        }`}
                    >
                      {!alertMessage.error && <Check className="w-3.5 h-3.5 shrink-0" />}
                      <span>{alertMessage.text}</span>
                    </p>
                  )}
                </form>
              )}

              <div className="flex items-center justify-center space-x-6 pt-1 text-[11px] text-foeg-muted font-light">
                <span className="flex items-center space-x-1.5">
                  <Truck className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1} />
                  <span>{t('pdp.fastShipping')}</span>
                </span>
                <span>·</span>
                <span className="flex items-center space-x-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1} />
                  <span>{t('pdp.returnPolicy')}</span>
                </span>
              </div>
            </div>

            {/* ACORDEONES */}
            <div className="divide-y divide-foeg-border/80 border-y border-foeg-border/80 pt-2">
              {/* Détails du Produit */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('details')}
                  className="w-full flex items-center justify-between text-left group focus:outline-none cursor-pointer"
                  aria-expanded={openAccordions.details}
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-foeg-black group-hover:text-foeg-navy transition-colors font-medium">
                    {t('pdp.productDetails')}
                  </span>
                  <span className="text-foeg-black group-hover:text-foeg-navy transition-colors p-1">
                    {openAccordions.details ? (
                      <Minus className="w-4 h-4" strokeWidth={1} />
                    ) : (
                      <Plus className="w-4 h-4" strokeWidth={1} />
                    )}
                  </span>
                </button>
                {openAccordions.details && (
                  <div className="pt-4 pb-2 space-y-4 text-xs text-foeg-muted font-light leading-relaxed animate-fadeIn">
                    <p className="text-foeg-black/90">{currentProduct.description}</p>
                    <div className="space-y-1.5 pt-2 border-t border-foeg-border/50">
                      <p>
                        <strong className="text-foeg-black font-medium">{t('pdp.composition')}</strong>{' '}
                        {currentProduct.composition}
                      </p>
                      <p>
                        <strong className="text-foeg-black font-medium">{t('pdp.craftsmanship')}</strong>{' '}
                        {currentProduct.origin}
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-[11px] uppercase tracking-wider text-foeg-black font-medium block mb-1">
                        {t('pdp.care')}
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-foeg-muted">
                        {currentProduct.care.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Guide des Tailles */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('sizing')}
                  className="w-full flex items-center justify-between text-left group focus:outline-none cursor-pointer"
                  aria-expanded={openAccordions.sizing}
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-foeg-black group-hover:text-foeg-navy transition-colors font-medium">
                    {t('pdp.sizingTitle')}
                  </span>
                  <span className="text-foeg-black group-hover:text-foeg-navy transition-colors p-1">
                    {openAccordions.sizing ? (
                      <Minus className="w-4 h-4" strokeWidth={1} />
                    ) : (
                      <Plus className="w-4 h-4" strokeWidth={1} />
                    )}
                  </span>
                </button>
                {openAccordions.sizing && (
                  <div className="pt-4 pb-2 space-y-3 text-xs font-light animate-fadeIn">
                    <p className="text-foeg-muted text-[11px]">
                      {t('pdp.sizingSubtitle')}
                    </p>
                    <div className="overflow-x-auto border border-foeg-border">
                      {isPantalon ? (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-foeg-surface uppercase tracking-wider text-[10px] text-foeg-black font-medium border-b border-foeg-border">
                            <tr>
                              <th className="py-2.5 px-3">{t('pdp.sizePantsLabel')}</th>
                              <th className="py-2.5 px-3">{t('pdp.waist')}</th>
                              <th className="py-2.5 px-3">{t('pdp.hips')}</th>
                              <th className="py-2.5 px-3">{t('pdp.inseam')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-foeg-border/50 text-foeg-muted">
                            {[
                              { size: '26', waist: '68 cm', hips: '92 cm', inseam: '82 cm' },
                              { size: '28', waist: '72 cm', hips: '96 cm', inseam: '83 cm' },
                              { size: '30', waist: '76 cm', hips: '100 cm', inseam: '84 cm' },
                              { size: '32', waist: '80 cm', hips: '104 cm', inseam: '85 cm' },
                              { size: '34', waist: '84 cm', hips: '108 cm', inseam: '86 cm' },
                              { size: '36', waist: '88 cm', hips: '112 cm', inseam: '86 cm' },
                            ].map((m) => (
                              <tr
                                key={m.size}
                                className={selectedSize === m.size ? 'bg-foeg-navy/5 font-medium text-foeg-black' : ''}
                              >
                                <td className="py-2 px-3 font-mono font-medium">{m.size}</td>
                                <td className="py-2 px-3">{m.waist}</td>
                                <td className="py-2 px-3">{m.hips}</td>
                                <td className="py-2 px-3">{m.inseam}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-foeg-surface uppercase tracking-wider text-[10px] text-foeg-black font-medium border-b border-foeg-border">
                            <tr>
                              <th className="py-2.5 px-3">{t('pdp.sizeLabel')}</th>
                              <th className="py-2.5 px-3">{t('pdp.chest')}</th>
                              <th className="py-2.5 px-3">{t('pdp.waist')}</th>
                              <th className="py-2.5 px-3">{t('pdp.hips')}</th>
                              <th className="py-2.5 px-3">{t('pdp.length')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-foeg-border/50 text-foeg-muted">
                            {[
                              { size: 'XS', chest: '86 cm', waist: '66 cm', hips: '92 cm', length: '68 cm' },
                              { size: 'S', chest: '92 cm', waist: '72 cm', hips: '98 cm', length: '70 cm' },
                              { size: 'M', chest: '98 cm', waist: '78 cm', hips: '104 cm', length: '72 cm' },
                              { size: 'L', chest: '104 cm', waist: '84 cm', hips: '110 cm', length: '74 cm' },
                              { size: 'XL', chest: '110 cm', waist: '90 cm', hips: '116 cm', length: '76 cm' },
                            ].map((m) => (
                              <tr
                                key={m.size}
                                className={selectedSize === m.size ? 'bg-foeg-navy/5 font-medium text-foeg-black' : ''}
                              >
                                <td className="py-2 px-3 font-mono font-medium">{m.size}</td>
                                <td className="py-2 px-3">{m.chest}</td>
                                <td className="py-2 px-3">{m.waist}</td>
                                <td className="py-2 px-3">{m.hips}</td>
                                <td className="py-2 px-3">{m.length}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Livraison & Retours */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between text-left group focus:outline-none cursor-pointer"
                  aria-expanded={openAccordions.shipping}
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-foeg-black group-hover:text-foeg-navy transition-colors font-medium">
                    {t('pdp.shippingTitle')}
                  </span>
                  <span className="text-foeg-black group-hover:text-foeg-navy transition-colors p-1">
                    {openAccordions.shipping ? (
                      <Minus className="w-4 h-4" strokeWidth={1} />
                    ) : (
                      <Plus className="w-4 h-4" strokeWidth={1} />
                    )}
                  </span>
                </button>
                {openAccordions.shipping && (
                  <div className="pt-4 pb-2 space-y-3 text-xs text-foeg-muted font-light leading-relaxed animate-fadeIn">
                    <p>
                      <strong className="text-foeg-black font-medium">{t('pdp.shippingSignatureLabel')}</strong>{' '}
                      {t('pdp.shippingDesc')}
                    </p>
                    <p>
                      <strong className="text-foeg-black font-medium">{t('pdp.shippingDelaysLabel')}</strong>{' '}
                      {t('pdp.shippingDelaysDesc')}
                    </p>
                    <p>
                      <strong className="text-foeg-black font-medium">{t('pdp.returnsLabel')}</strong>{' '}
                      {t('pdp.returnsDesc')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Reviews
              productId={currentProduct.id}
              productName={currentProduct.name}
              productSlug={currentProduct.slug}
            />
          </div>
        </div>
      </div>

      {/* COMPLÉTEZ LE LOOK */}
      {relatedProducts.length > 0 && (
        <section className="mt-28 pt-16 border-t border-foeg-border/80">
          <div className="mb-12 text-left">
            <span className="text-[11px] uppercase tracking-[0.25em] text-foeg-muted block mb-2 font-medium">
              {t('pdp.materialAssoc')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-foeg-black font-normal tracking-wide">
              {t('pdp.completeLook')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* LIGHTBOX MODAL (PLEIN ÉCRAN - TOQUE TEMU / LUXE SILENCIEUX) */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Vue agrandie de la matière"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Header del Lightbox */}
          <div
            className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-4">
              <span className="font-serif text-lg tracking-wide text-white/90">
                {currentProduct.name}
              </span>
              <span className="hidden sm:inline-block text-xs uppercase tracking-[0.2em] text-white/50 border-l border-white/20 pl-4 font-light">
                Détail Matière & Coupe
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <span className="text-xs uppercase tracking-widest text-white/60 font-light">
                {lightboxImageIndex + 1} / {currentProduct.images.length}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none cursor-pointer"
                aria-label="Fermer la vue plein écran"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Imagen Central en Alta Resolución */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Anterior */}
            {currentProduct.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImageIndex((prev) => (prev === 0 ? currentProduct.images.length - 1 : prev - 1));
                }}
                className="absolute left-2 md:left-6 z-20 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all focus:outline-none bg-black/40 backdrop-blur-sm cursor-pointer"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
              </button>
            )}

            <div className="relative max-h-[80vh] max-w-[85vw] w-auto h-full flex items-center justify-center">
              <img
                src={currentProduct.images[lightboxImageIndex]}
                alt={`${currentProduct.name} — Zoom détail`}
                className="max-h-[80vh] max-w-[85vw] object-contain select-none shadow-2xl transition-all duration-300"
              />
            </div>

            {/* Botón Siguiente */}
            {currentProduct.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImageIndex((prev) => (prev === currentProduct.images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-2 md:right-6 z-20 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all focus:outline-none bg-black/40 backdrop-blur-sm cursor-pointer"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Footer de navegación rápida con miniaturas */}
          <div
            className="z-10 w-full max-w-xl mx-auto flex items-center justify-center gap-3 overflow-x-auto py-2 no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {currentProduct.images.map((img, idx) => (
              <button
                key={`lb-thumb-${idx}`}
                type="button"
                onClick={() => setLightboxImageIndex(idx)}
                className={`relative w-12 h-16 shrink-0 overflow-hidden border transition-all duration-200 cursor-pointer ${lightboxImageIndex === idx
                    ? 'border-white ring-1 ring-white opacity-100 scale-105'
                    : 'border-white/30 opacity-50 hover:opacity-80'
                  }`}
                aria-label={`Aller à l'image ${idx + 1}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BARRA INFERIOR PEGAJOSA EN MÓVIL (STICKY QUICK-ADD TO BAG) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#F7F5F0]/95 backdrop-blur-md border-t border-foeg-border/80 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-3 shadow-floating">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-11 bg-foeg-surface border border-foeg-border/60 shrink-0 overflow-hidden relative">
            <MediaBox
              src={currentProduct.images[0]}
              alt={currentProduct.name}
              aspectRatio="full"
              className="w-full h-full object-cover"
              sizes="36px"
            />
          </div>
          <div className="truncate">
            <p className="font-serif text-xs font-medium text-foeg-black truncate">
              {currentProduct.name}
            </p>
            <p className="text-[10px] text-foeg-muted font-mono">
              {formatPrice(currentProduct.price)} {selectedSize ? `· T. ${selectedSize}` : ''}
            </p>
          </div>
        </div>

        {isCurrentSelectionOutOfStock ? (
          <button
            type="button"
            onClick={() => setShowAlertInput((prev) => !prev)}
            className="bg-foeg-surface border border-foeg-black/40 text-foeg-black text-[10px] uppercase tracking-wider py-2.5 px-3.5 font-medium shrink-0 cursor-pointer"
          >
            {t('pdp.notifyStock')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => addItem(currentProduct, selectedSize, selectedColor, 1)}
            className="bg-foeg-navy text-white text-[10px] uppercase tracking-wider py-2.5 px-4 font-medium shrink-0 cursor-pointer active:scale-95 transition-transform"
          >
            {t('pdp.addToBag')}
          </button>
        )}
      </div>
    </div>
  );
}
