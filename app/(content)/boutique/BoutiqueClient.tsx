'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Navigation,
  Phone,
  Mail,
  Store,
  ShoppingBag,
} from 'lucide-react';
import MediaBox from '@/components/ui/MediaBox';
import { Boutique } from '@/lib/boutiques-types';
import { useLanguage } from '@/lib/language-context';

interface BoutiqueClientProps {
  boutiques: Boutique[];
}

export default function BoutiqueClient({ boutiques }: BoutiqueClientProps) {
  const { t, language } = useLanguage();
  const [selectedId, setSelectedId] = useState<string>(
    boutiques[0]?.id || 'boutique-paris'
  );

  const currentBoutique = boutiques.find((b) => b.id === selectedId) || boutiques[0];

  return (
    <div className="pt-28 md:pt-40 pb-32 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
      {/* Retorno */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black transition-colors font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1} />
          <span>{t('common.back')}</span>
        </Link>
      </div>

      {/* En-tête Éditorial */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-foeg-navy font-semibold block">
          {t('boutique.heroTag')}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-foeg-black tracking-tight leading-tight">
          {t('boutique.heroTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-foeg-muted font-light leading-relaxed max-w-2xl mx-auto">
          {t('boutique.heroDesc')}
        </p>

        {/* Sélecteur Dynamique de Boutiques */}
        {boutiques.length > 1 && (
          <div className="inline-flex flex-wrap justify-center gap-1 p-1 bg-foeg-surface border border-foeg-border mt-4 max-w-full">
            {boutiques.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedId(b.id)}
                className={`px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-all cursor-pointer ${
                  selectedId === b.id
                    ? 'bg-foeg-navy text-white shadow-subtle'
                    : 'text-foeg-muted hover:text-foeg-black'
                }`}
              >
                {b.city} · {b.country}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Détail de la Boutique Sélectionnée */}
      {currentBoutique && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center animate-fadeIn">
          {/* Photographie */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-foeg-surface border border-foeg-border/80 shadow-subtle">
              <MediaBox
                src={currentBoutique.imageUrl}
                alt={currentBoutique.name}
                aspectRatio="full"
                priority={true}
                className="w-full h-full"
                imageClassName="object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="bg-foeg-white/95 text-foeg-navy text-[10px] uppercase tracking-[0.25em] px-3 py-1 font-medium border border-foeg-border/60">
                  {currentBoutique.city} · {currentBoutique.tag || 'Boutique Privée'}
                </span>
              </div>
            </div>
          </div>

          {/* Informations Détaillées */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3 border-b border-foeg-border/80 pb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block">
                {currentBoutique.tag}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light text-foeg-black tracking-tight">
                {currentBoutique.name}
              </h2>
              <p className="text-xs sm:text-sm text-foeg-muted font-light leading-relaxed pt-2">
                {language === 'es'
                  ? 'Un espacio íntimo y refinado dedicado a la experimentación táctil de nuestras creaciones de alta confección, cortes puros y materiales nobles.'
                  : language === 'en'
                  ? 'An intimate, serene salon dedicated to the tactile discovery of our haute couture garments, architectural silhouettes, and noble fibers.'
                  : 'Un espace intime et feutré dédié à l’expérimentation tactile de nos pièces de haute confection, coupes pures et matières nobles.'}
              </p>
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-foeg-black font-medium flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-foeg-navy" strokeWidth={1} />
                <span>{t('boutique.address')}</span>
              </span>
              <div className="pl-6 space-y-1">
                <p className="text-sm font-serif text-foeg-black leading-snug">
                  {currentBoutique.address || 'Adresse à confirmer'}
                </p>
                {currentBoutique.postalCode && (
                  <p className="text-xs text-foeg-muted font-light">
                    {currentBoutique.postalCode} {currentBoutique.city} · {currentBoutique.country}
                  </p>
                )}
                {currentBoutique.addressNotes && (
                  <div className="pt-2 p-3 bg-foeg-surface/80 border border-foeg-border/60 text-xs text-foeg-black font-light leading-relaxed">
                    <span className="font-medium text-foeg-navy block uppercase text-[10px] tracking-wider mb-0.5">
                      📍 {language === 'es' ? 'Indicaciones de acceso :' : language === 'en' ? 'Access details :' : 'Précisions d’accès :'}
                    </span>
                    {currentBoutique.addressNotes}
                  </div>
                )}
              </div>

              {currentBoutique.googleMapsUrl && (
                <div className="pl-6 pt-2">
                  <a
                    href={currentBoutique.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-foeg-navy hover:bg-foeg-black text-foeg-white px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors shadow-subtle rounded-none cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" strokeWidth={1} />
                    <span>{t('boutique.routeMaps')}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Horaires */}
            <div className="space-y-2 pt-2 border-t border-foeg-border/60">
              <span className="text-[11px] uppercase tracking-[0.2em] text-foeg-black font-medium flex items-center space-x-2">
                <Clock className="w-4 h-4 text-foeg-navy" strokeWidth={1} />
                <span>{t('boutique.openingHours')}</span>
              </span>
              <div className="text-xs text-foeg-muted font-light space-y-1.5 pl-6 pt-1">
                <div className="flex justify-between max-w-xs">
                  <span className="text-foeg-black">{t('boutique.weekday')}</span>
                  <span>{currentBoutique.hoursWeekday}</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span className="text-foeg-black">{t('boutique.weekend')}</span>
                  <span className="italic text-foeg-navy">{currentBoutique.hoursWeekend}</span>
                </div>
              </div>
            </div>

            {/* Conciergerie & Cita */}
            <div className="space-y-3 pt-2 border-t border-foeg-border/60">
              <span className="text-[11px] uppercase tracking-[0.2em] text-foeg-black font-medium flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-foeg-navy" strokeWidth={1} />
                <span>{t('boutique.fittingTitle')}</span>
              </span>
              <p className="text-xs text-foeg-muted font-light leading-relaxed pl-6">
                {t('boutique.fittingDesc')}
              </p>
              <div className="pl-6 flex flex-wrap gap-3 pt-1 text-xs">
                {currentBoutique.whatsapp && (
                  <a
                    href={`https://wa.me/${currentBoutique.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-foeg-navy hover:bg-foeg-black text-white px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors shadow-subtle"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Conciergerie</span>
                  </a>
                )}
                {currentBoutique.email && (
                  <a
                    href={`mailto:${currentBoutique.email}`}
                    className="inline-flex items-center space-x-1.5 border border-foeg-border hover:border-foeg-navy px-4 py-2.5 text-[11px] uppercase tracking-wider text-foeg-black transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-foeg-navy" />
                    <span>{currentBoutique.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION INFORMATIVE : CLICK & COLLECT
      ========================================================================= */}
      <div className="border-t border-foeg-border/80 pt-16">
        <div className="bg-foeg-surface/60 border border-foeg-border p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-navy font-semibold flex items-center justify-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {language === 'es'
                  ? 'Servicio Privilegiado FOEG'
                  : language === 'en'
                  ? 'FOEG Privileged Service'
                  : 'Service Privilège FOEG'}
              </span>
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-light text-foeg-black">
              {t('boutique.howItWorks')}
            </h3>
            <p className="text-xs text-foeg-muted font-light leading-relaxed">
              {t('boutique.howItWorksDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-white p-6 border border-foeg-border/60 space-y-3">
              <span className="font-serif text-2xl text-foeg-navy font-light">01</span>
              <h4 className="text-xs uppercase tracking-wider font-medium text-foeg-black">
                {t('boutique.step1Title')}
              </h4>
              <p className="text-xs text-foeg-muted font-light leading-relaxed">
                {t('boutique.step1Desc')}
              </p>
            </div>

            <div className="bg-white p-6 border border-foeg-border/60 space-y-3">
              <span className="font-serif text-2xl text-foeg-navy font-light">02</span>
              <h4 className="text-xs uppercase tracking-wider font-medium text-foeg-black">
                {t('boutique.step2Title')}
              </h4>
              <p className="text-xs text-foeg-muted font-light leading-relaxed">
                {t('boutique.step2Desc')}
              </p>
            </div>

            <div className="bg-white p-6 border border-foeg-border/60 space-y-3">
              <span className="font-serif text-2xl text-foeg-navy font-light">03</span>
              <h4 className="text-xs uppercase tracking-wider font-medium text-foeg-black">
                {t('boutique.step3Title')}
              </h4>
              <p className="text-xs text-foeg-muted font-light leading-relaxed">
                {t('boutique.step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
