'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram, Facebook, MapPin, Check, Loader2, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { useCurrency } from '@/lib/currency-context';
import { subscribeNewsletter } from '@/lib/newsletter-actions';
import { getGlobalSettings } from '@/lib/settings-actions';

export default function Footer() {
  const { t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState('');
  const [newsletterError, setNewsletterError] = useState('');

  const [settings, setSettings] = useState({
    instagram: 'https://www.instagram.com/foegparis/',
    facebook: 'https://www.facebook.com/profile.php?id=61569466776955',
    whatsapp: '+33 6 12 34 56 78',
    email: 'concierge@foeg-paris.com',
  });

  useEffect(() => {
    getGlobalSettings()
      .then((s) => {
        setSettings({
          instagram: s.social_instagram || 'https://www.instagram.com/foegparis/',
          facebook: s.social_facebook || 'https://www.facebook.com/profile.php?id=61569466776955',
          whatsapp: s.contact_whatsapp || '+33 6 12 34 56 78',
          email: s.contact_email || 'concierge@foeg-paris.com',
        });
      })
      .catch(() => {});
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterLoading(true);
    setNewsletterError('');
    setNewsletterSuccess('');

    const res = await subscribeNewsletter(newsletterEmail, 'Pied de page (Footer)');
    setNewsletterLoading(false);
    if (res.success) {
      setNewsletterSuccess(res.message || 'Merci pour votre inscription.');
      setNewsletterEmail('');
    } else {
      setNewsletterError(res.error || 'Erreur lors de l’inscription.');
    }
  };
  return (
    <footer suppressHydrationWarning className="bg-foeg-white border-t border-foeg-border text-foeg-black">
      {/* Contenedor Principal de Columnas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 lg:gap-12">
          
          {/* COLUMNA 1: Logo, Dirección & Redes Sociales */}
          <div className="space-y-6">
            <span className="font-serif text-2xl font-normal tracking-[0.28em] text-foeg-black uppercase block">
              FOEG
            </span>
            <p className="text-xs leading-relaxed text-foeg-muted max-w-xs font-light">
              {t('footer.brandDesc')}
            </p>

            {/* Dirección Física de la Maison */}
            <div className="pt-1 text-xs text-foeg-muted font-light space-y-1">
              <span className="text-[10px] uppercase tracking-[0.22em] text-foeg-black font-medium block">
                {t('footer.addressTitle')}
              </span>
              <p className="flex items-start space-x-1.5 text-xs text-foeg-black/80">
                <MapPin className="w-3.5 h-3.5 text-foeg-navy shrink-0 mt-0.5" strokeWidth={1} />
                <span>{t('footer.address')}</span>
              </p>
            </div>

            {/* Redes Sociales Oficiales */}
            <div className="pt-2 space-y-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-foeg-black font-medium block">
                {t('footer.joinMaison')}
              </span>
              <div className="flex items-center space-x-4">
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-foeg-border hover:border-foeg-navy text-foeg-black hover:text-foeg-navy transition-all duration-200"
                  aria-label="Instagram de FOEG Paris"
                >
                  <Instagram className="w-4 h-4" strokeWidth={1} />
                </a>
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-foeg-border hover:border-foeg-navy text-foeg-black hover:text-foeg-navy transition-all duration-200"
                  aria-label="Facebook de FOEG Paris"
                >
                  <Facebook className="w-4 h-4" strokeWidth={1} />
                </a>
                {settings.whatsapp && (
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-foeg-border hover:border-emerald-600 text-foeg-black hover:text-emerald-700 transition-all duration-200"
                    aria-label="WhatsApp Conciergerie FOEG Paris"
                    title="Conciergerie WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" strokeWidth={1} />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-foeg-black block mb-2 font-medium">
                {t('footer.privateEdition')}
              </span>
              <p className="text-xs text-foeg-muted font-light mb-3">
                {t('footer.privateEditionDesc')}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-2">
                <div className="flex border-b border-foeg-black/40 focus-within:border-foeg-navy transition-colors pb-1">
                  <input
                    suppressHydrationWarning
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder={t('footer.emailPlaceholder')}
                    required
                    className="bg-transparent text-xs text-foeg-black placeholder:text-foeg-muted/70 focus:outline-none w-full py-1 font-light"
                    aria-label={t('footer.emailPlaceholder')}
                  />
                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={newsletterLoading}
                    className="text-[11px] uppercase tracking-[0.2em] text-foeg-black hover:text-foeg-navy transition-colors px-2 font-normal cursor-pointer flex items-center space-x-1"
                  >
                    {newsletterLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>{t('footer.subscribe')}</span>}
                  </button>
                </div>
                {newsletterSuccess && (
                  <p className="text-[11px] text-emerald-800 font-light flex items-center space-x-1 pt-1 animate-fadeIn">
                    <Check className="w-3 h-3" />
                    <span>{newsletterSuccess}</span>
                  </p>
                )}
                {newsletterError && (
                  <p className="text-[11px] text-red-700 font-light pt-1 animate-fadeIn">
                    {newsletterError}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* COLUMNA 2: Servicio al Cliente */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.22em] text-foeg-black font-medium">
              {t('footer.clientService')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contacto"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email || 'concierge@foeg-paris.com'}`}
                  className="text-xs text-foeg-navy font-light hover:underline underline-offset-4 transition-colors duration-200"
                  title="Contact Conciergerie FOEG Paris"
                >
                  {settings.email || 'concierge@foeg-paris.com'}
                </a>
              </li>
              <li>
                <Link
                  href="/envios"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.shipping')}
                </Link>
              </li>
              <li>
                <Link
                  href="/devoluciones"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.returns')}
                </Link>
              </li>
              <li>
                <Link
                  href="/guia-tallas"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.sizing')}
                </Link>
              </li>
              <li>
                <Link
                  href="/cuidado-prendas"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.care')}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-xs text-foeg-navy font-medium hover:underline underline-offset-4 transition-colors duration-200"
                >
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: La Marca */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.22em] text-foeg-black font-medium">
              {t('footer.theBrand')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/boutique"
                  className="text-xs text-foeg-navy font-medium hover:underline underline-offset-4 transition-colors duration-200"
                >
                  {t('footer.boutique')}
                </Link>
              </li>
              <li>
                <Link
                  href="/manifiesto"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.manifesto')}
                </Link>
              </li>
              <li>
                <Link
                  href="/ateliers"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.craftsmanship')}
                </Link>
              </li>
              <li>
                <Link
                  href="/sostenibilidad"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.traceability')}
                </Link>
              </li>
              <li>
                <Link
                  href="/journal"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.journal')}
                </Link>
              </li>
              <li>
                <Link
                  href="/carreras"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.careers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: Legal */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.22em] text-foeg-black font-medium">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terminos"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new Event('open-cookie-settings'));
                    }
                  }}
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light cursor-pointer text-left"
                >
                  {t('footer.cookies')}
                </button>
              </li>
              <li>
                <Link
                  href="/aviso-legal"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link
                  href="/accesibilidad"
                  className="text-xs text-foeg-muted hover:text-foeg-black transition-colors duration-200 font-light"
                >
                  Declaración de Accesibilidad
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* FILA INFERIOR: Copyright & Región / Selector de Moneda */}
        <div className="mt-16 pt-8 border-t border-foeg-border/60 flex flex-col sm:flex-row justify-between items-center text-[11px] text-foeg-muted font-light space-y-4 sm:space-y-0">
          <p className="tracking-wide">
            {t('footer.rights')}
          </p>
          <div className="flex items-center space-x-6 tracking-widest uppercase text-[10px]">
            <div className="flex items-center space-x-1.5">
              <span>Devise :</span>
              {(['EUR', 'USD'] as const).map((curr, idx) => (
                <React.Fragment key={curr}>
                  {idx > 0 && <span className="opacity-30">/</span>}
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`cursor-pointer transition-colors ${
                      currency === curr
                        ? 'text-foeg-black font-semibold underline underline-offset-4'
                        : 'text-foeg-muted hover:text-foeg-black'
                    }`}
                    aria-label={`Devise ${curr}`}
                  >
                    {curr}
                  </button>
                </React.Fragment>
              ))}
            </div>
            <span className="opacity-40">·</span>
            <span>Édition Limitée · Paris</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
