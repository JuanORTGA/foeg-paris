'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, ArrowUpRight, Heart } from 'lucide-react';
import MediaBox from '@/components/ui/MediaBox';
import { MockProduct } from '@/lib/mock-data';
import { useLanguage } from '@/lib/language-context';
import { useCurrency } from '@/lib/currency-context';
import { useWishlist } from '@/lib/wishlist-context';
import { getProductBadge } from '@/lib/badge-helper';

export interface ProductCardProps {
  product: MockProduct;
  onQuickView?: (product: MockProduct) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] || product.images[0];
  const wishlisted = isWishlisted(product.id || product.slug);

  const totalStock = (product.variants || []).reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  const isSoldOut = (product.variants && product.variants.length > 0) ? totalStock === 0 : false;

  return (
    <article className="group flex flex-col">
      {/* Contenedor de Imagen con proporción 3:4 y Efecto Hover "The Row" */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-foeg-surface border border-foeg-border/50">
        <Link
          href={`/producto/${product.slug}`}
          prefetch={true}
          className="block w-full h-full relative focus:outline-none"
          tabIndex={-1}
        >
          {/* Primera Imagen: Efecto Crossfade The Row */}
          <div className="absolute inset-0 transition-opacity duration-700 ease-in-out group-hover:opacity-0">
            <MediaBox
              src={primaryImage}
              alt={product.name}
              aspectRatio="full"
              className="w-full h-full"
              imageClassName="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Segunda Imagen: Revelación suave en hover */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 pointer-events-none">
            <MediaBox
              src={secondaryImage}
              alt={`${product.name} — ${language === 'es' ? 'Vista alternativa' : language === 'en' ? 'Alternative view' : 'Vue alternative'}`}
              aspectRatio="full"
              className="w-full h-full"
              imageClassName="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>

        {/* Bouton Wishlist / Liste de Désirs (Haut Droite) */}
        <button
          type="button"
          suppressHydrationWarning
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id || product.slug);
          }}
          className={`absolute top-3 right-3 z-20 p-2 rounded-none transition-all duration-300 cursor-pointer shadow-subtle ${
            wishlisted
              ? 'bg-foeg-navy text-white'
              : 'bg-white/90 hover:bg-white text-foeg-black/70 hover:text-foeg-black backdrop-blur-xs'
          }`}
          aria-label={
            wishlisted
              ? language === 'es'
                ? 'Quitar de la lista de deseos'
                : language === 'en'
                ? 'Remove from wishlist'
                : 'Retirer de la liste de désirs'
              : language === 'es'
              ? 'Añadir a la lista de deseos'
              : language === 'en'
              ? 'Add to wishlist'
              : 'Ajouter à la liste de désirs'
          }
        >
          <Heart
            className={`w-3.5 h-3.5 ${wishlisted ? 'fill-white text-white' : ''}`}
            strokeWidth={1.5}
          />
        </button>

        {/* Badge Épuisé / Calificación Dinámica de Producto */}
        {(() => {
          if (isSoldOut) {
            return (
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span className="bg-white text-foeg-black text-[9px] uppercase tracking-[0.25em] px-2.5 py-1 font-semibold shadow-subtle border border-foeg-black/40">
                  {t('products.outOfStock') || 'Épuisé'}
                </span>
              </div>
            );
          }

          const badgeConfig = getProductBadge(product, t);
          if (badgeConfig) {
            return (
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span className={`${badgeConfig.className} text-[9px] uppercase tracking-[0.25em] px-2.5 py-1 font-medium shadow-subtle`}>
                  {badgeConfig.label}
                </span>
              </div>
            );
          }

          return null;
        })()}

        {/* Botón interactivo: si hay onQuickView abre el modal, si no lleva al detalle del producto */}
        <div className="absolute inset-x-4 bottom-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onQuickView && !isSoldOut ? (
            <button
              type="button"
              suppressHydrationWarning
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-full bg-foeg-white/95 text-foeg-black hover:bg-foeg-navy hover:text-foeg-white py-3 px-4 text-[10px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 rounded-none shadow-subtle border border-foeg-border/80 flex items-center justify-center space-x-2 cursor-pointer"
              aria-label={`Aperçu rapide de ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5" strokeWidth={1} />
              <span>{isSoldOut ? `${t('products.outOfStock') || 'Épuisé'} — M'avertir` : t('products.viewDetails')}</span>
            </button>
          ) : (
            <Link
              href={`/producto/${product.slug}`}
              prefetch={true}
              className={`w-full py-3 px-4 text-[10px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 rounded-none shadow-subtle border flex items-center justify-center space-x-2 cursor-pointer ${
                isSoldOut
                  ? 'bg-foeg-white/95 text-foeg-black hover:bg-foeg-navy hover:text-white border-foeg-border/90'
                  : 'bg-foeg-white/95 text-foeg-black hover:bg-foeg-navy hover:text-foeg-white border-foeg-border/80'
              }`}
              aria-label={isSoldOut ? `Épuisé — M'avertir : ${product.name}` : `Découvrir ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5" strokeWidth={1} />
              <span>{isSoldOut ? `${t('products.outOfStock') || 'Épuisé'} — M'avertir` : t('products.viewDetails')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Información Editorial del Producto */}
      <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1.5 sm:gap-3">
            <h3 className="font-serif text-sm sm:text-base md:text-lg font-normal text-foeg-black group-hover:text-foeg-navy transition-colors leading-snug line-clamp-1">
              <Link href={`/producto/${product.slug}`} prefetch={true} className="hover:underline underline-offset-4 decoration-foeg-border">
                {product.name}
              </Link>
            </h3>
            <Link
              href={`/producto/${product.slug}`}
              prefetch={true}
              className="group/arrow p-1 sm:p-1.5 -mr-1 -mt-1 text-foeg-muted hover:text-foeg-navy group-hover:text-foeg-navy transition-all duration-200 cursor-pointer flex items-center justify-center rounded-none hover:bg-foeg-navy/10 shrink-0"
              aria-label={`Découvrir ${product.name}`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover/arrow:translate-x-0.5 group-hover/arrow:-translate-y-0.5" strokeWidth={1.5} />
            </Link>
          </div>

          <p className="text-[11px] sm:text-xs text-foeg-muted font-light leading-relaxed mt-0.5 sm:mt-1 line-clamp-1">
            {product.composition}
          </p>
        </div>

        <div className="pt-1.5 sm:pt-2">
          <span className="text-[11px] sm:text-xs font-medium tracking-wider text-foeg-black block">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </article>
  );
}
