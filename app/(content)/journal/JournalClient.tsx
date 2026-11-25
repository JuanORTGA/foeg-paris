'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import MediaBox from '@/components/ui/MediaBox';
import { JournalArticle, getLocalizedJournalArticle } from '@/lib/journal-data';
import { useLanguage } from '@/lib/language-context';

interface JournalClientProps {
  articles: JournalArticle[];
}

export default function JournalClient({ articles }: JournalClientProps) {
  const { language } = useLanguage();

  const localizedArticles = articles.map((art) =>
    getLocalizedJournalArticle(art, language)
  );

  const featuredArticle = localizedArticles[0] || null;
  const secondaryArticles = localizedArticles.slice(1);

  const uiTexts = {
    fr: {
      tag: 'Publications & Réflexions · Paris',
      title: 'Le Journal',
      desc: 'Chroniques de l’atelier, manifestes de la forme et exploration des matières nobles qui sculptent l’allure FOEG.',
      readFull: 'Lire l’article complet',
      recent: 'Chroniques Récentes',
      readMore: 'Lire la suite',
    },
    es: {
      tag: 'Publicaciones & Reflexiones · París',
      title: 'El Journal',
      desc: 'Crónicas del taller, manifiestos de la forma y exploración de las materias nobles que esculpen la silueta FOEG.',
      readFull: 'Leer el artículo completo',
      recent: 'Crónicas Recientes',
      readMore: 'Leer más',
    },
    en: {
      tag: 'Publications & Reflections · Paris',
      title: 'The Journal',
      desc: 'Chronicles of the atelier, manifestos of form and exploration of noble materials that sculpt the FOEG allure.',
      readFull: 'Read full article',
      recent: 'Recent Chronicles',
      readMore: 'Read more',
    },
  }[language] || {
    tag: 'Publications & Réflexions · Paris',
    title: 'Le Journal',
    desc: 'Chroniques de l’atelier, manifestes de la forme et exploration des matières nobles qui sculptent l’allure FOEG.',
    readFull: 'Lire l’article complet',
    recent: 'Chroniques Récentes',
    readMore: 'Lire la suite',
  };

  return (
    <div className="pt-28 md:pt-36 pb-32 px-6 md:px-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Cabecera Principal del Journal */}
      <header className="mb-14 pb-8 border-b border-foeg-border/80 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-foeg-muted block mb-2 font-medium">
            {uiTexts.tag}
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-foeg-black tracking-tight">
            {uiTexts.title}
          </h1>
        </div>
        <p className="text-xs text-foeg-muted font-light max-w-sm leading-relaxed">
          {uiTexts.desc}
        </p>
      </header>

      {/* =========================================================================
          ARTÍCULO DESTACADO (Hero de la Revista Editorial)
      ========================================================================= */}
      {featuredArticle && (
        <article className="mb-24 pb-16 border-b border-foeg-border/80 group">
          <Link href={`/journal/${featuredArticle.slug}`} className="block">
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden bg-foeg-surface border border-foeg-border/60 mb-8">
              <MediaBox
                src={featuredArticle.image}
                alt={featuredArticle.title}
                aspectRatio="full"
                priority={true}
                className="w-full h-full"
                imageClassName="transition-transform duration-700 ease-in-out group-hover:scale-105 filter grayscale contrast-[1.05]"
                sizes="100vw"
              />
            </div>

            <div className="max-w-3xl space-y-4">
              <div className="flex items-center space-x-4 text-[11px] uppercase tracking-[0.2em] text-foeg-muted font-light">
                <span className="text-foeg-navy font-medium">{featuredArticle.category}</span>
                <span>·</span>
                <span>{featuredArticle.date}</span>
                <span>·</span>
                <span>{featuredArticle.readTime}</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foeg-black tracking-tight group-hover:text-foeg-navy transition-colors leading-[1.08]">
                {featuredArticle.title}
              </h2>

              <p className="text-sm md:text-base text-foeg-muted font-light leading-relaxed">
                {featuredArticle.excerpt}
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-black group-hover:text-foeg-navy transition-colors font-medium">
                  <span>{uiTexts.readFull}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1} />
                </span>
              </div>
            </div>
          </Link>
        </article>
      )}

      {/* =========================================================================
          GRID DE 3 COLUMNAS: ÚLTIMOS ARTÍCULOS
      ========================================================================= */}
      <div>
        <div className="mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-foeg-black font-medium">
            {uiTexts.recent}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {secondaryArticles.map((article) => (
            <article key={article.id} className="group flex flex-col justify-between">
              <Link href={`/journal/${article.slug}`} className="block space-y-4">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-foeg-surface border border-foeg-border/50">
                  <MediaBox
                    src={article.image}
                    alt={article.title}
                    aspectRatio="full"
                    className="w-full h-full"
                    imageClassName="transition-transform duration-700 ease-in-out group-hover:scale-105 filter grayscale contrast-[1.05]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-light">
                    <span className="text-foeg-navy font-medium">{article.category}</span>
                    <span>·</span>
                    <span>{article.date}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-light text-foeg-black group-hover:text-foeg-navy transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-foeg-muted font-light line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-[0.2em] text-foeg-black group-hover:text-foeg-navy transition-colors font-medium">
                    <span>{uiTexts.readMore}</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" strokeWidth={1} />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
