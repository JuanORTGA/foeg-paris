'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import MediaBox from '@/components/ui/MediaBox';
import { JournalArticle, getLocalizedJournalArticle } from '@/lib/journal-data';
import { useLanguage } from '@/lib/language-context';

interface JournalDetailClientProps {
  article: JournalArticle;
  allArticles: JournalArticle[];
}

export default function JournalDetailClient({
  article: initialArticle,
  allArticles,
}: JournalDetailClientProps) {
  const { language } = useLanguage();

  const article = getLocalizedJournalArticle(initialArticle, language);

  // Trouver l'article suivant
  const currentIndex = allArticles.findIndex((a) => a.slug === initialArticle.slug);
  const nextRawArticle =
    currentIndex !== -1 && currentIndex < allArticles.length - 1
      ? allArticles[currentIndex + 1]
      : allArticles[0];
  const nextArticle = nextRawArticle
    ? getLocalizedJournalArticle(nextRawArticle, language)
    : null;

  const uiTexts = {
    fr: {
      back: 'Retour au Journal',
      by: 'Par',
      archive: 'Photographie d’archives — Maison FOEG Paris',
      next: 'Chronique Suivante',
      all: 'Toutes les Chroniques',
    },
    es: {
      back: 'Volver al Journal',
      by: 'Por',
      archive: 'Fotografía de archivos — Maison FOEG Paris',
      next: 'Siguiente Crónica',
      all: 'Todas las Crónicas',
    },
    en: {
      back: 'Back to Journal',
      by: 'By',
      archive: 'Archive photography — Maison FOEG Paris',
      next: 'Next Chronicle',
      all: 'All Chronicles',
    },
  }[language] || {
    back: 'Retour au Journal',
    by: 'Par',
    archive: 'Photographie d’archives — Maison FOEG Paris',
    next: 'Chronique Suivante',
    all: 'Toutes les Chroniques',
  };

  return (
    <article className="pt-28 md:pt-36 pb-32 px-6 md:px-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Botón de Retorno al Journal */}
      <div className="max-w-2xl mx-auto mb-10">
        <Link
          href="/journal"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black transition-colors font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1} />
          <span>{uiTexts.back}</span>
        </Link>
      </div>

      {/* Cabecera del Artículo */}
      <header className="max-w-2xl mx-auto text-left space-y-6 mb-12">
        <div className="flex items-center space-x-4 text-xs uppercase tracking-[0.2em] text-foeg-muted font-light">
          <span className="text-foeg-navy font-medium">{article.category}</span>
          <span>·</span>
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-foeg-black tracking-tight leading-[1.06]">
          {article.title}
        </h1>

        <p className="font-serif text-lg md:text-xl text-foeg-muted font-light italic leading-relaxed">
          {article.subtitle}
        </p>

        <div className="pt-2 text-[11px] uppercase tracking-[0.2em] text-foeg-black/80 font-light border-t border-foeg-border/60">
          {uiTexts.by} {article.author}
        </div>
      </header>

      {/* Imagen Destacada del Artículo */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-foeg-surface border border-foeg-border/60">
          <MediaBox
            src={article.image}
            alt={article.title}
            aspectRatio="full"
            priority={true}
            className="w-full h-full"
            imageClassName="w-full h-full object-cover transition-transform duration-700"
            sizes="(max-width: 1024px) 100vw, 896px"
          />
        </div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-foeg-muted text-right mt-2 font-light">
          {uiTexts.archive}
        </p>
      </div>

      {/* Cuerpo del Artículo */}
      <div className="max-w-2xl mx-auto space-y-8 text-base md:text-lg text-foeg-black/90 font-light leading-relaxed">
        {article.content.map((paragraph, idx) => (
          <p key={idx} className="first-letter:text-4xl first-letter:font-serif first-letter:mr-1">
            {paragraph}
          </p>
        ))}

        {/* Cita Editorial en Serif */}
        {article.pullQuote && (
          <blockquote className="my-12 py-8 px-6 border-l border-foeg-navy bg-foeg-surface/40">
            <p className="font-serif text-xl md:text-2xl italic text-foeg-black font-light leading-snug">
              {article.pullQuote}
            </p>
          </blockquote>
        )}
      </div>

      {/* Navegación al Siguiente Artículo */}
      {nextArticle && nextArticle.slug !== article.slug && (
        <div className="max-w-2xl mx-auto mt-24 pt-12 border-t border-foeg-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-light block">
              {uiTexts.next}
            </span>
            <Link
              href={`/journal/${nextArticle.slug}`}
              className="font-serif text-xl sm:text-2xl text-foeg-black hover:text-foeg-navy transition-colors font-light block"
            >
              {nextArticle.title}
            </Link>
          </div>

          <Link
            href={`/journal/${nextArticle.slug}`}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-navy hover:text-foeg-black transition-colors font-medium self-end sm:self-auto"
          >
            <span>{uiTexts.all}</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1} />
          </Link>
        </div>
      )}
    </article>
  );
}
