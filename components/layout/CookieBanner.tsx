'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ShieldCheck, Sliders, Check, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  personalization: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  personalization: false,
};

export default function CookieBanner() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    try {
      // Limpiar versiones obsoletas de pruebas anteriores para que el usuario pueda verlo de inmediato
      localStorage.removeItem('foeg_cookie_consent');
      localStorage.removeItem('foeg_cookie_consent_v2');
      localStorage.removeItem('foeg_cookie_consent_v3');
      document.cookie = 'foeg_cookie_consent=; path=/; max-age=0';
      document.cookie = 'foeg_cookie_consent_v2=; path=/; max-age=0';
      document.cookie = 'foeg_cookie_consent_v3=; path=/; max-age=0';

      const searchParams = new URLSearchParams(window.location.search);
      const forceReset = searchParams.get('cookies') === '1' || searchParams.get('reset_cookies') === '1';

      if (forceReset) {
        localStorage.removeItem('foeg_cookie_consent_v4');
        document.cookie = 'foeg_cookie_consent_v4=; path=/; max-age=0';
        setIsVisible(true);
        return;
      }

      const savedConsentStorage = typeof window !== 'undefined' ? localStorage.getItem('foeg_cookie_consent_v4') : null;
      const cookieMatch = typeof document !== 'undefined' ? document.cookie.match(/(?:^|;\s*)foeg_cookie_consent_v4=([^;]+)/) : null;
      const savedConsent = savedConsentStorage || (cookieMatch ? cookieMatch[1] : null);

      const savedPrefs = typeof window !== 'undefined' ? localStorage.getItem('foeg_cookie_preferences_v4') : null;
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch (_) {}
      }

      // Si el visitante no ha aceptado formalmente v4, se muestra de inmediato en pantalla
      const hasAccepted = savedConsent === 'accepted' || savedConsent === 'custom';
      if (!hasAccepted) {
        setIsVisible(true);
      }
    } catch (_) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    // 2. Escuchar evento global para reabrir ajustes desde el footer
    const handleOpenSettings = () => {
      setIsVisible(true);
      setShowPreferences(true);
    };

    // 3. Soporte para cerrar temporalmente con tecla Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-cookie-settings', handleOpenSettings);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  // Cierre temporal (con botón X o Escape) sin bloquear permanentemente al visitante
  const handleDismiss = () => {
    setIsVisible(false);
    setShowPreferences(false);
  };

  // Guardado permanente cuando el cliente acepta o personaliza
  const saveAndClose = (consentStatus: 'accepted' | 'custom', customPrefs?: CookiePreferences) => {
    const prefsToSave = customPrefs || (consentStatus === 'accepted' ? { essential: true, analytics: true, personalization: true } : { essential: true, analytics: false, personalization: false });

    try {
      // Guardar en localStorage
      localStorage.setItem('foeg_cookie_consent_v4', consentStatus);
      localStorage.setItem('foeg_cookie_preferences_v4', JSON.stringify(prefsToSave));

      // Guardar también como cookie HTTP de larga duración (1 año)
      const oneYearSecs = 31536000;
      document.cookie = `foeg_cookie_consent_v4=${consentStatus}; path=/; max-age=${oneYearSecs}; SameSite=Lax`;
      document.cookie = `foeg_cookie_preferences_v4=${encodeURIComponent(JSON.stringify(prefsToSave))}; path=/; max-age=${oneYearSecs}; SameSite=Lax`;
    } catch (_) {}

    setPreferences(prefsToSave);
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="dialog"
      aria-live="polite"
      aria-label="Consentimiento de cookies FOEG Paris"
      className="fixed bottom-6 left-6 right-6 sm:right-auto sm:max-w-md z-50 transition-all duration-300 ease-out animate-fadeIn font-sans"
    >
      <div className="bg-foeg-navy text-foeg-white p-6 border border-white/20 shadow-floating relative rounded-none text-left">
        {/* Botón cierre discreto */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 text-white/60 hover:text-white transition-colors cursor-pointer p-1"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {!showPreferences ? (
          /* VISTA PRINCIPAL EXACTA FOEG (Elegancia Silenciosa) */
          <div className="space-y-4 pr-6">
            <p className="text-xs sm:text-[13px] leading-relaxed text-white/95 font-light">
              {language === 'es'
                ? 'FOEG utiliza cookies para ofrecerte una experiencia a medida.'
                : language === 'en'
                ? 'FOEG uses cookies to offer you a tailored experience.'
                : 'FOEG utilise des cookies pour vous offrir une expérience sur mesure.'}
            </p>

            <div className="pt-1 flex items-center space-x-4 text-xs uppercase tracking-[0.18em]">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="text-white/80 hover:text-white underline underline-offset-4 font-light cursor-pointer transition-colors"
              >
                {language === 'es' ? 'CONFIGURAR' : language === 'en' ? 'PREFERENCES' : 'CONFIGURER'}
              </button>

              <span className="text-white/30 font-light">|</span>

              <button
                type="button"
                onClick={() => saveAndClose('accepted')}
                className="text-white hover:text-white/80 underline underline-offset-4 font-normal cursor-pointer transition-colors"
              >
                {language === 'es' ? 'Aceptar todas' : language === 'en' ? 'Accept all' : 'Accepter tout'}
              </button>
            </div>
          </div>
        ) : (
          /* VUE DÉTAILLÉE : PANNEAU DE PERSONNALISATION GRANULAIRE RGPD */
          <div className="space-y-5 animate-fadeIn pr-2">
            <div className="border-b border-white/15 pb-3">
              <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-white/70">
                <Sliders className="w-3.5 h-3.5 text-white/80" />
                <span>
                  {language === 'es'
                    ? 'Preferencias de Privacidad RGPD'
                    : language === 'en'
                    ? 'GDPR Privacy Preferences'
                    : 'Paramètres de Confidentialité RGPD'}
                </span>
              </div>
              <p className="text-[11px] text-white/70 font-light mt-1">
                {language === 'es'
                  ? 'Ajuste el nivel de cookies según sus preferencias personales.'
                  : language === 'en'
                  ? 'Adjust your cookie settings according to your personal preferences.'
                  : 'Ajustez l’usage des traceurs selon vos préférences personnelles.'}
              </p>
            </div>

            {/* Catégories de Cookies */}
            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {/* 1. Cookies Essentiels (Obligatoires) */}
              <div className="p-3 bg-white/5 border border-white/10 flex items-start justify-between">
                <div className="space-y-1 pr-4">
                  <div className="font-medium text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <span>{language === 'es' ? 'Cookies Esenciales' : language === 'en' ? 'Essential Cookies' : 'Traceurs Essentiels'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-white/20 text-white font-mono lowercase">
                      {language === 'es' ? 'Obligatorio' : language === 'en' ? 'Required' : 'Requis'}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/70 font-light leading-relaxed">
                    {language === 'es'
                      ? 'Indispensables para el carrito, la autenticación segura y la persistencia de moneda.'
                      : language === 'en'
                      ? 'Required for shopping bag, secure checkout, and currency selection.'
                      : 'Indispensables au fonctionnement du panier, à l’authentification et à la devise.'}
                  </p>
                </div>
                <div className="w-5 h-5 rounded-none bg-white/20 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 2. Cookies de Mesure d'Audience (Analytiques) */}
              <div className="p-3 bg-white/5 border border-white/10 flex items-start justify-between">
                <div className="space-y-1 pr-4">
                  <div className="font-medium text-white text-[11px] uppercase tracking-wider">
                    {language === 'es' ? 'Análisis y Rendimiento' : language === 'en' ? 'Analytics & Performance' : 'Mesure d’Audience'}
                  </div>
                  <p className="text-[10px] text-white/70 font-light leading-relaxed">
                    {language === 'es'
                      ? 'Nos ayuda a medir de forma anónima la velocidad y fluidez de la boutique digital.'
                      : language === 'en'
                      ? 'Helps us anonymously evaluate browsing speed and boutique ergonomics.'
                      : 'Permet d’évaluer anonymement la fluidité et les temps de chargement du site.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="w-4 h-4 accent-white rounded-none cursor-pointer mt-1"
                />
              </div>

              {/* 3. Cookies de Personnalisation Haute Couture */}
              <div className="p-3 bg-white/5 border border-white/10 flex items-start justify-between">
                <div className="space-y-1 pr-4">
                  <div className="font-medium text-white text-[11px] uppercase tracking-wider">
                    {language === 'es' ? 'Personalización de Colecciones' : language === 'en' ? 'Styling Personalization' : 'Personnalisation du Vestiaire'}
                  </div>
                  <p className="text-[10px] text-white/70 font-light leading-relaxed">
                    {language === 'es'
                      ? 'Permite guardar selecciones de vestuario preferidas y sugerencias a medida.'
                      : language === 'en'
                      ? 'Enables bespoke garment curation and saved style preferences.'
                      : 'Permet d’adapter les suggestions de silhouettes selon vos essayages passés.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.personalization}
                  onChange={(e) => setPreferences({ ...preferences, personalization: e.target.checked })}
                  className="w-4 h-4 accent-white rounded-none cursor-pointer mt-1"
                />
              </div>
            </div>

            {/* Actions de sauvegarde des préférences */}
            <div className="pt-2 flex items-center justify-between border-t border-white/15 text-[11px] tracking-[0.16em] uppercase">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer text-[10px]"
              >
                ← {language === 'es' ? 'Atrás' : language === 'en' ? 'Back' : 'Retour'}
              </button>

              <button
                type="button"
                onClick={() => saveAndClose('custom', preferences)}
                className="bg-white text-foeg-navy px-5 py-2 font-medium hover:bg-white/90 transition-colors cursor-pointer text-[10px]"
              >
                {language === 'es' ? 'Guardar mi Selección' : language === 'en' ? 'Save Choices' : 'Enregistrer mes Choix'}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
