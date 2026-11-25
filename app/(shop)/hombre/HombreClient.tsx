'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, RotateCcw } from 'lucide-react';
import MediaBox from '@/components/ui/MediaBox';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import { MockProduct } from '@/lib/mock-data';
import { useCurrency } from '@/lib/currency-context';
import { useLanguage } from '@/lib/language-context';

const SUBCATEGORIES = [
  'Tout',
  'Manteaux',
  'Chemises',
  'Pantalons',
  'Chaussures',
  'Accessoires',
] as const;

const SIZES = ['Toutes', 'S', 'M', 'L', 'XL'] as const;

const SORT_OPTIONS = [
  { label: 'Nouveautés', value: 'newest' },
  { label: 'Prix croissant (bas → haut)', value: 'price_asc' },
  { label: 'Prix décroissant (haut → bas)', value: 'price_desc' },
] as const;

interface HombreClientProps {
  products: MockProduct[];
  activeSubcategory?: string;
  activeSize?: string;
  activeSort?: string;
}

export default function HombreClient({
  products,
  activeSubcategory = 'Tout',
  activeSize = 'Toutes',
  activeSort = 'newest',
}: HombreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quickViewProduct, setQuickViewProduct] = useState<MockProduct | null>(null);
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const getSubcategoryLabel = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'tout': return t('catalog.subAll');
      case 'manteaux': return t('catalog.subCoats');
      case 'chemises': return t('catalog.subShirts');
      case 'pantalons': return t('catalog.subPants');
      case 'chaussures': return t('catalog.subShoes');
      case 'accessoires': return t('catalog.subAccessories');
      default: return cat;
    }
  };

  const sortOptions = [
    { label: t('catalog.sortNewest'), value: 'newest' },
    { label: t('catalog.sortPriceAsc'), value: 'price_asc' },
    { label: t('catalog.sortPriceDesc'), value: 'price_desc' },
  ];

  const updateFilters = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === 'Tout' || v === 'Toutes' || v === 'newest') {
        current.delete(k);
      } else {
        current.set(k, v);
      }
    });
    const query = current.toString();
    router.push(query ? `?${query}` : window.location.pathname, { scroll: false });
  };

  const resetAllFilters = () => {
    router.push(window.location.pathname, { scroll: false });
  };

  const hasActiveFilters =
    (activeSubcategory && activeSubcategory !== 'Tout') ||
    (activeSize && activeSize !== 'Toutes') ||
    (activeSort && activeSort !== 'newest');

  return (
    <div className="pt-24 sm:pt-28 md:pt-36 pb-32 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      {/* CABECERA EDITORIAL DE SECCIÓN */}
      <header className="mb-8 text-left">
        <span className="text-[11px] uppercase tracking-[0.3em] text-foeg-muted block mb-2 font-medium">
          {t('catalog.menWardrobe')}
        </span>
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-foeg-black tracking-tight">
            {t('nav.men')}
          </h1>
          <span className="text-[11px] uppercase tracking-[0.25em] text-foeg-muted font-light">
            {products.length} {products.length === 1 ? t('catalog.piece') : t('catalog.pieces')}
          </span>
        </div>
      </header>

      {/* BARRA DE SUBCATEGORÍAS MINIMALISTA (URL REAL) */}
      <nav
        className="flex items-center space-x-6 sm:space-x-10 overflow-x-auto pb-3 mb-6 border-b border-foeg-border/80 text-xs uppercase tracking-[0.2em] scrollbar-none"
        aria-label="Sous-catégories Homme"
      >
        {SUBCATEGORIES.map((cat) => {
          const isActive =
            activeSubcategory.toLowerCase() === cat.toLowerCase() ||
            (cat === 'Tout' && (!activeSubcategory || activeSubcategory === 'Tout'));
          return (
            <button
              key={cat}
              type="button"
              onClick={() => updateFilters({ category: cat === 'Tout' ? null : cat, subcategory: null })}
              className={`py-1.5 transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'text-foeg-black font-medium border-b border-foeg-black'
                  : 'text-foeg-muted hover:text-foeg-black font-light border-b border-transparent'
              }`}
            >
              {getSubcategoryLabel(cat)}
            </button>
          );
        })}
      </nav>

      {/* BARRA DE FILTROS MINIMALISTA DE LUJO SILENCIOSO (TALLA & ORDENACIÓN) */}
      <div className="mb-8 sm:mb-12 py-3 px-3.5 sm:px-4 border border-foeg-border/70 bg-foeg-surface/20 flex flex-wrap items-center justify-between gap-3 sm:gap-4 text-xs font-light">
        <div className="flex items-center flex-wrap gap-4 sm:gap-8">
          {/* Filtro por Talla */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium">
              {t('catalog.size')}
            </span>
            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-wrap gap-y-1">
              {SIZES.map((s) => {
                const isActive = activeSize === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateFilters({ size: s === 'Toutes' ? null : s })}
                    className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-foeg-navy text-white font-medium'
                        : 'text-foeg-black/70 hover:text-foeg-black hover:bg-black/5'
                    }`}
                  >
                    {s === 'Toutes' ? t('catalog.allSizes') : s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro por Ordenación de Precio */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium">
              {t('catalog.sort')}
            </span>
            <select
              value={activeSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="bg-transparent border-b border-foeg-border focus:border-foeg-navy text-xs text-foeg-black py-0.5 pr-4 uppercase tracking-wider focus:outline-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-black bg-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón de reinicio si hay filtros activos */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="flex items-center space-x-1.5 text-[11px] uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-navy transition-colors cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('catalog.resetFilters')}</span>
          </button>
        )}
      </div>

      {/* GRID DE PRODUCTOS */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 md:gap-10 lg:gap-14">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border border-foeg-border/60 bg-foeg-surface/20 space-y-4">
          <p className="font-serif text-2xl text-foeg-black font-light">
            {t('catalog.noResults')}
          </p>
          <p className="text-xs text-foeg-muted font-light max-w-sm mx-auto leading-relaxed">
            {t('catalog.noResultsDesc')}
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-xs uppercase tracking-[0.2em] text-foeg-navy hover:text-foeg-black underline underline-offset-4 cursor-pointer pt-2"
          >
            {t('catalog.showAll')}
          </button>
        </div>
      )}

      {/* MODAL DE VISTA RÁPIDA (QUICK VIEW) */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
