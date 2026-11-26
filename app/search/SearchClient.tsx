'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { MockProduct } from '@/lib/mock-data';
import { useLanguage } from '@/lib/language-context';

interface SearchClientProps {
  query: string;
  products: MockProduct[];
}

export default function SearchClient({ query, products }: SearchClientProps) {
  const { language } = useLanguage();

  const uiTexts = {
    fr: {
      back: 'Retour à l’Accueil',
      tag: 'Résultats de Recherche · Maison FOEG',
      all: 'Toutes les créations',
      foundSingular: 'pièce trouvée',
      foundPlural: 'pièces trouvées',
      noResults: 'Aucune pièce ne correspond à votre recherche',
      noResultsDesc:
        'Nos ateliers confectionnent des séries limitées. Essayez de chercher par matière (ex. « cachemire », « soie ») ou explorez nos vestiaires permanents.',
      femmeBtn: 'Vestiaire Femme',
      hommeBtn: 'Vestiaire Homme',
    },
    es: {
      back: 'Volver al Inicio',
      tag: 'Resultados de Búsqueda · Maison FOEG',
      all: 'Todas las creaciones',
      foundSingular: 'prenda encontrada',
      foundPlural: 'prendas encontradas',
      noResults: 'Ninguna prenda coincide con su búsqueda',
      noResultsDesc:
        'Nuestros ateliers confeccionan series limitadas. Pruebe a buscar por materia (ej. «cachemira», «seda») o explore nuestras colecciones permanentes.',
      femmeBtn: 'Colección Mujer',
      hommeBtn: 'Colección Hombre',
    },
    en: {
      back: 'Back to Home',
      tag: 'Search Results · Maison FOEG',
      all: 'All creations',
      foundSingular: 'piece found',
      foundPlural: 'pieces found',
      noResults: 'No piece matches your search',
      noResultsDesc:
        'Our ateliers craft limited series. Try searching by material (e.g., “cashmere”, “silk”) or explore our permanent wardrobes.',
      femmeBtn: 'Women’s Collection',
      hommeBtn: 'Men’s Collection',
    },
  }[language] || {
    back: 'Retour à l’Accueil',
    tag: 'Résultats de Recherche · Maison FOEG',
    all: 'Toutes les créations',
    foundSingular: 'pièce trouvée',
    foundPlural: 'pièces trouvées',
    noResults: 'Aucune pièce ne correspond à votre recherche',
    noResultsDesc:
      'Nos ateliers confectionnent des séries limitées. Essayez de chercher par matière (ex. « cachemire », « soie ») ou explorez nos vestiaires permanents.',
    femmeBtn: 'Vestiaire Femme',
    hommeBtn: 'Vestiaire Homme',
  };

  return (
    <div className="pt-28 md:pt-40 pb-32 px-6 md:px-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Retour rapide */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black transition-colors font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1} />
          <span>{uiTexts.back}</span>
        </Link>
      </div>

      {/* Cabecera Editorial de Búsqueda */}
      <header className="border-b border-foeg-border/80 pb-8 mb-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block mb-2">
          {uiTexts.tag}
        </span>
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-foeg-black tracking-tight">
            {query ? `« ${query} »` : uiTexts.all}
          </h1>
          <span className="text-xs uppercase tracking-[0.2em] text-foeg-muted font-light whitespace-nowrap">
            {products.length} {products.length === 1 ? uiTexts.foundSingular : uiTexts.foundPlural}
          </span>
        </div>
      </header>

      {/* Grid de Productos o Estado Vacío */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-14">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border border-foeg-border/60 bg-foeg-surface/20 space-y-6 max-w-2xl mx-auto px-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-foeg-border/40 flex items-center justify-center text-foeg-navy">
            <Search className="w-5 h-5" strokeWidth={1.2} />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl text-foeg-black font-light">
              {uiTexts.noResults}
            </h2>
            <p className="text-xs text-foeg-muted font-light leading-relaxed">
              {uiTexts.noResultsDesc}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/hombre"
              className="px-6 py-3 border border-foeg-black text-foeg-black text-xs uppercase tracking-[0.2em] hover:bg-foeg-black hover:text-white transition-all duration-200"
            >
              {uiTexts.hommeBtn}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
