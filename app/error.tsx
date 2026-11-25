'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useLanguage();

  const uiTexts = {
    fr: {
      tag: 'Maison FOEG Paris · Échappée Silencieuse',
      title: 'Maison en Pause',
      desc: 'Une interruption momentanée est survenue dans l’atelier. Veuillez rafraîchir l’expérience ou regagner le salon d’accueil.',
      refresh: 'Rafraîchir',
      home: 'Retour à la Maison',
    },
    es: {
      tag: 'Maison FOEG Paris · Pausa del Atelier',
      title: 'Maison en Pausa',
      desc: 'Ha ocurrido una interrupción momentánea en el taller. Por favor actualice la página o regrese al inicio.',
      refresh: 'Actualizar',
      home: 'Volver al Inicio',
    },
    en: {
      tag: 'Maison FOEG Paris · Atelier Intermission',
      title: 'Maison on Pause',
      desc: 'A momentary intermission occurred in the atelier. Please refresh the experience or return to the welcome salon.',
      refresh: 'Refresh',
      home: 'Return to the Maison',
    },
  }[language] || {
    tag: 'Maison FOEG Paris · Échappée Silencieuse',
    title: 'Maison en Pause',
    desc: 'Une interruption momentanée est survenue dans l’atelier. Veuillez rafraîchir l’expérience ou regagner le salon d’accueil.',
    refresh: 'Rafraîchir',
    home: 'Retour à la Maison',
  };

  return (
    <main className="min-h-[85vh] bg-[#F7F5F0] text-[#1A1A1A] flex flex-col items-center justify-center px-6 text-center py-24 font-sans selection:bg-[#1B2A4A] selection:text-[#F7F5F0]">
      <div className="max-w-md mx-auto space-y-8 animate-fadeIn">
        {/* Cabecera Haute Couture */}
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#6E6B67] font-medium block">
          {uiTexts.tag}
        </span>

        {/* Título */}
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#1B2A4A] tracking-tight">
          {uiTexts.title}
        </h1>

        {/* Mensaje */}
        <p className="text-xs sm:text-sm text-[#6E6B67] font-light leading-relaxed max-w-sm mx-auto">
          {uiTexts.desc}
        </p>

        {/* Botones de Acción */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="inline-flex items-center space-x-2 bg-[#1B2A4A] hover:bg-[#1A1A1A] text-white py-3.5 px-6 text-xs uppercase tracking-[0.22em] font-medium transition-all shadow-subtle cursor-pointer active:scale-[0.99]"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{uiTexts.refresh}</span>
          </button>

          <Link
            href="/"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
            className="inline-flex items-center space-x-2 border border-[#E6E3DC] hover:border-[#1A1A1A] text-[#1A1A1A] py-3.5 px-6 text-xs uppercase tracking-[0.22em] font-medium transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{uiTexts.home}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
