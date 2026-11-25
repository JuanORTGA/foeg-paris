'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function NotFound() {
  const { language } = useLanguage();

  const uiTexts = {
    fr: {
      tag: 'Maison FOEG Paris · Échappée Silencieuse',
      title: 'Cette pièce semble introuvable.',
      desc: 'La silhouette ou l’archive recherchée n’existe plus ou a été déplacée dans nos réserves privées.',
      btn: 'Retour à la Maison',
      femme: 'Femme',
      homme: 'Homme',
      collections: 'Collections',
    },
    es: {
      tag: 'Maison FOEG Paris · Escapada Silenciosa',
      title: 'Esta prenda parece no encontrarse.',
      desc: 'La silueta o el archivo buscado ya no existe o se ha trasladado a nuestras reservas privadas de la Maison.',
      btn: 'Volver a la Maison',
      femme: 'Mujer',
      homme: 'Hombre',
      collections: 'Colecciones',
    },
    en: {
      tag: 'Maison FOEG Paris · Silent Escape',
      title: 'This piece seems to be missing.',
      desc: 'The requested silhouette or archive no longer exists or has been relocated to our private reserves.',
      btn: 'Return to the Maison',
      femme: 'Women',
      homme: 'Men',
      collections: 'Collections',
    },
  }[language] || {
    tag: 'Maison FOEG Paris · Échappée Silencieuse',
    title: 'Cette pièce semble introuvable.',
    desc: 'La silhouette ou l’archive recherchée n’existe plus ou a été déplacée dans nos réserves privées.',
    btn: 'Retour à la Maison',
    femme: 'Femme',
    homme: 'Homme',
    collections: 'Collections',
  };

  return (
    <main className="min-h-[85vh] bg-[#F7F5F0] text-[#1A1A1A] flex flex-col items-center justify-center px-6 text-center py-24 font-sans selection:bg-[#1B2A4A] selection:text-[#F7F5F0]">
      <div className="max-w-lg mx-auto space-y-8 animate-fadeIn">
        {/* Cabecera Haute Couture */}
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#6E6B67] font-medium block">
          {uiTexts.tag}
        </span>

        {/* Número 404 Serif */}
        <h1 className="font-serif text-8xl sm:text-9xl font-light text-[#1B2A4A] tracking-tight select-none">
          404
        </h1>

        {/* Subtítulo */}
        <div className="space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A]">
            {uiTexts.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6B67] font-light leading-relaxed max-w-sm mx-auto">
            {uiTexts.desc}
          </p>
        </div>

        {/* Botón Principal "Retour à la Maison" */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-[#1B2A4A] hover:bg-[#1A1A1A] text-white py-4 px-8 text-xs uppercase tracking-[0.22em] font-medium transition-all shadow-subtle group active:scale-[0.99]"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" strokeWidth={1} />
            <span>{uiTexts.btn}</span>
          </Link>
        </div>

        {/* Enlaces de Exploración Rápida */}
        <div className="pt-8 border-t border-[#E6E3DC] flex items-center justify-center space-x-8 text-xs uppercase tracking-[0.18em] text-[#6E6B67] font-light">
          <Link href="/mujer" className="hover:text-[#1A1A1A] transition-colors">
            {uiTexts.femme}
          </Link>
          <span>·</span>
          <Link href="/hombre" className="hover:text-[#1A1A1A] transition-colors">
            {uiTexts.homme}
          </Link>
          <span>·</span>
          <Link href="/colecciones" className="hover:text-[#1A1A1A] transition-colors">
            {uiTexts.collections}
          </Link>
        </div>
      </div>
    </main>
  );
}
