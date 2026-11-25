'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2, Instagram, MessageCircle, Lock } from 'lucide-react';
import AnimatedBirdLogo from '@/components/ui/AnimatedBirdLogo';
import { subscribeNewsletter } from '@/lib/newsletter-actions';
import { useLanguage } from '@/lib/language-context';

export default function MaintenanceClient() {
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const activeLang = language || 'fr';
  const setActiveLang = (lang: 'fr' | 'es' | 'en') => setLanguage(lang);

  const content = {
    fr: {
      tag: "ÉDITION PRIVÉE · ATELIER PARIS",
      title: "Notre Atelier est en pause. Nous revenons très vite.",
      desc: "Dans le secret de notre atelier de la rue Lucien Sampaix, nous peaufinons les dernières pièces et coupes architecturales de la nouvelle collection.",
      invitation: "Laissez votre adresse courriel pour recevoir une invitation privilégiée en avant-première dès la réouverture de la boutique en ligne.",
      placeholder: "Votre adresse courriel personnelle...",
      btn: "Être Averti(e)",
      submitting: "Inscription...",
      success: "Merci. Votre invitation privée vous sera transmise en avant-première dès la réouverture.",
      location: "MAISON FOEG · RUE LUCIEN SAMPAIX · PARIS 75010",
      concierge: "Consergerie Privée",
      adminAccess: "Accès Privé Maison",
    },
    es: {
      tag: "EDICIÓN PRIVADA · ATELIER PARÍS",
      title: "Nuestro Atelier está en pausa. Volvemos muy pronto.",
      desc: "En el secreto de nuestro taller en la rue Lucien Sampaix, perfeccionamos los últimos cortes arquitectónicos y tejidos nobles de la nueva colección.",
      invitation: "Déjenos su correo electrónico para recibir una invitación privilegiada en exclusiva tan pronto como reabra la boutique en línea.",
      placeholder: "Su dirección de correo electrónico...",
      btn: "Ser Notificado(a)",
      submitting: "Guardando...",
      success: "Gracias. Recibirá una invitación privada en primicia al reabrir la boutique.",
      location: "MAISON FOEG · RUE LUCIEN SAMPAIX · PARÍS 75010",
      concierge: "Conserjería Privada",
      adminAccess: "Acceso Privado Maison",
    },
    en: {
      tag: "PRIVATE EDITION · PARIS ATELIER",
      title: "Our Atelier is paused. We will return very shortly.",
      desc: "In the discretion of our Parisian atelier on rue Lucien Sampaix, we are refining the architectural silhouettes and noble fabrics of the upcoming collection.",
      invitation: "Leave your email address to receive a private priority invitation as soon as the online boutique reopens.",
      placeholder: "Your personal email address...",
      btn: "Notify Me",
      submitting: "Submitting...",
      success: "Thank you. You will receive a private invitation before the official reopening.",
      location: "MAISON FOEG · RUE LUCIEN SAMPAIX · PARIS 75010",
      concierge: "Private Concierge",
      adminAccess: "Maison Private Access",
    },
  };

  const t = content[activeLang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg(activeLang === 'es' ? 'Por favor ingrese un correo válido.' : activeLang === 'en' ? 'Please enter a valid email address.' : 'Veuillez saisir une adresse courriel valide.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await subscribeNewsletter(email, 'Page Maintenance');
      if (res.success) {
        setIsSuccess(true);
        setEmail('');
      } else {
        setErrorMsg(res.error || 'Une erreur est survenue.');
      }
    } catch {
      setErrorMsg('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-foeg-black flex flex-col justify-between selection:bg-foeg-navy selection:text-white px-6 sm:px-12 py-10 relative overflow-hidden font-sans">
      {/* Texture subtile en filigrane */}
      <div className="absolute inset-0 bg-[radial-gradient(#1B2A4A_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      {/* Barre supérieure: Logo de la Maison & Sélecteur de langue */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AnimatedBirdLogo size={32} className="w-8 h-8 sm:w-9 sm:h-9 text-foeg-navy shrink-0" />
          <span className="font-serif text-2xl sm:text-3xl font-normal tracking-[0.25em] uppercase text-foeg-navy">
            FOEG
          </span>
        </div>

        {/* Sélecteur de langue discret */}
        <div className="flex items-center space-x-3 text-[11px] font-mono uppercase tracking-widest text-foeg-muted">
          {(['fr', 'es', 'en'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`transition-colors cursor-pointer ${
                activeLang === lang
                  ? 'text-foeg-navy font-semibold border-b border-foeg-navy pb-0.5'
                  : 'hover:text-foeg-black pb-0.5'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Centre: Message Editorial de Haute Couture */}
      <main className="relative z-10 max-w-2xl w-full mx-auto my-auto text-center py-16 space-y-8 animate-fadeIn">
        <div className="space-y-4">
          <span className="inline-block text-[10px] uppercase tracking-[0.3em] font-sans font-medium text-foeg-muted border-b border-foeg-border pb-1">
            {t.tag}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foeg-black tracking-tight leading-[1.15]">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-foeg-muted font-light leading-relaxed max-w-xl mx-auto pt-2">
            {t.desc}
          </p>
        </div>

        {/* Formulaire de capture d'email */}
        <div className="pt-4 max-w-md mx-auto">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-foeg-black/80 font-light tracking-wide">
                {t.invitation}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholder}
                  required
                  className="flex-1 bg-white border border-[#E5E0D8] px-4 py-3 text-xs text-foeg-black placeholder:text-foeg-muted/60 focus:outline-none focus:border-foeg-navy transition-colors rounded-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#1B2A4A] hover:bg-black text-white text-xs uppercase tracking-[0.2em] font-light transition-all duration-300 flex items-center justify-center space-x-2 rounded-none cursor-pointer disabled:opacity-50 shrink-0 shadow-subtle"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.btn}</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </>
                  )}
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 font-light text-left animate-fadeIn">
                  {errorMsg}
                </p>
              )}
            </form>
          ) : (
            <div className="p-5 bg-white border border-[#E5E0D8] shadow-subtle text-center space-y-2 animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto">
                <Check className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-foeg-black font-light tracking-wide">
                {t.success}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Pied de page: Mentions discrètes, Conciergerie & Accès Admin */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto pt-8 border-t border-[#E5E0D8] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-foeg-muted font-light tracking-widest uppercase">
        <p className="text-center sm:text-left font-mono">
          {t.location}
        </p>

        <div className="flex items-center space-x-6">
          <a
            href="https://www.instagram.com/foegparis/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foeg-navy transition-colors flex items-center space-x-1"
          >
            <Instagram className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Instagram</span>
          </a>
          <a
            href="https://wa.me/33612345678"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foeg-navy transition-colors flex items-center space-x-1"
          >
            <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{t.concierge}</span>
          </a>
          {/* Accès discret réservé à la direction */}
          <Link
            href="/admin"
            className="hover:text-foeg-navy transition-colors flex items-center space-x-1 opacity-40 hover:opacity-100"
            title={t.adminAccess}
          >
            <Lock className="w-3 h-3" strokeWidth={1.5} />
            <span className="hidden sm:inline">{t.adminAccess}</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
