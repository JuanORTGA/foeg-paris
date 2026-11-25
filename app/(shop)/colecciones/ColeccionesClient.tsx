'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import { MockProduct } from '@/lib/mock-data';
import { useLanguage } from '@/lib/language-context';

interface ColeccionesClientProps {
  products: MockProduct[];
}

export default function ColeccionesClient({ products }: ColeccionesClientProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<MockProduct | null>(null);
  const { t } = useLanguage();

  return (
    <div className="pt-28 md:pt-36 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Cabecera Editorial */}
      <header className="mb-10 sm:mb-14 pb-6 sm:pb-8 border-b border-foeg-border/80 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-foeg-muted block mb-2 font-medium">
            Archives & Éditions Permanentes · Paris
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-foeg-black tracking-tight">
            {t('nav.collections')}
          </h1>
        </div>
        <p className="text-xs text-foeg-muted font-light max-w-sm leading-relaxed">
          L’ensemble des silhouettes créées par la Maison FOEG. Matières d’exception, coupes architecturales et confection à la main.
        </p>
      </header>

      {/* Grid de Productos */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 md:gap-10 lg:gap-14">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        ))}
      </div>

      {/* Modal de Vista Rápida */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
