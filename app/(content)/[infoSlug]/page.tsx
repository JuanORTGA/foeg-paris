'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getInfoPageContent } from '@/lib/info-pages-data';
import { useLanguage } from '@/lib/language-context';

export default function InfoPage() {
  const params = useParams();
  const { language } = useLanguage();
  const slug = typeof params?.infoSlug === 'string' ? params.infoSlug : '';
  const pageData = getInfoPageContent(slug, language);

  if (!pageData) {
    return notFound();
  }

  return (
    <article className="pt-28 md:pt-40 pb-32 px-6 md:px-12 max-w-3xl mx-auto animate-fadeIn">
      {/* Retorno */}
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black transition-colors font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1} />
          <span>
            {language === 'es'
              ? 'Volver al Inicio'
              : language === 'en'
              ? 'Back to Home'
              : 'Retour à l’Accueil'}
          </span>
        </Link>
      </div>

      {/* Cabecera */}
      <header className="border-b border-foeg-border/80 pb-8 mb-12 space-y-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block">
          {pageData.category} · Maison FOEG Paris
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight leading-tight">
          {pageData.title}
        </h1>
        <p className="text-xs sm:text-sm text-foeg-muted font-light tracking-wide">
          {pageData.subtitle}
        </p>
      </header>

      {/* Contenido en prosa elegante de Lujo Silencioso */}
      <div className="space-y-6 text-sm text-foeg-black/85 font-light leading-relaxed">
        {pageData.content.map((paragraph, idx) => (
          <p key={idx} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Pie de página de cortesía */}
      <div className="mt-16 pt-8 border-t border-foeg-border/60 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-foeg-muted font-light gap-4">
        <span>Maison FOEG · 48 Rue Lucien Sampaix, Paris, France 75010</span>
        <Link
          href="/boutique"
          className="text-foeg-navy hover:text-foeg-black uppercase tracking-[0.18em] font-medium transition-colors"
        >
          {language === 'es'
            ? 'Visitar las Tiendas →'
            : language === 'en'
            ? 'Visit our Boutiques →'
            : 'Visiter la Boutique →'}
        </Link>
      </div>
    </article>
  );
}
