'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ShieldCheck,
  Crown,
  Sparkles,
  ArrowRight,
  Clock,
  Scissors,
  Bookmark,
  MessageCircle,
  CheckCircle2,
  Lock,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { subscribeNewsletter } from '@/lib/newsletter-actions';

export default function CerclePriveClient() {
  const { data: session } = useSession();
  const { language } = useLanguage();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMember = Boolean(session?.user);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await subscribeNewsletter(email.trim(), 'Cercle Privé VIP');
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMessage(res.error || 'Erreur lors de la demande d’admission.');
      }
    } catch (_) {
      setErrorMessage('Erreur de transmission avec l’Atelier.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 md:pt-40 pb-32 text-foeg-black animate-fadeIn">
      {/* 1. HERO PRINCIPAL — AMBIANCE HAUTE COUTURE CONFIDENTIELLE */}
      <section className="relative px-6 md:px-12 max-w-5xl mx-auto text-center space-y-6 pb-20 border-b border-foeg-border/70">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-foeg-navy/5 text-foeg-navy text-[10px] uppercase tracking-[0.3em] font-medium border border-foeg-navy/15">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>
            {language === 'es'
              ? 'Membresía Confidencial · Maison FOEG'
              : language === 'en'
              ? 'Confidential Membership · Maison FOEG'
              : 'Adhésion Confidentielle · Maison FOEG'}
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-foeg-black tracking-tight leading-tight max-w-4xl mx-auto">
          {language === 'es'
            ? 'El Círculo Privado de la Maison'
            : language === 'en'
            ? 'The Private Circle of the Maison'
            : 'Le Cercle Privé de la Maison'}
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-foeg-muted font-light leading-relaxed max-w-2xl mx-auto">
          {language === 'es'
            ? 'Un club de iniciados concebido para los amantes del lujo silencioso, la pureza de corte y los tejidos más nobles de Europa. Una experiencia a medida en el corazón de París.'
            : language === 'en'
            ? 'An exclusive society dedicated to patrons of quiet luxury, architectural silhouettes, and Europe’s noblest fibers. A bespoke journey at the heart of Paris.'
            : 'Un salon confidentiel dédié aux passionnés de l’épure tailleur, des soies et cachemires les plus nobles d’Europe. Une expérience sur-mesure au cœur de Paris.'}
        </p>

        {/* CARNET DE MEMBRE EN VIVO SI ESTÁ AUTENTICADO */}
        {isMember ? (
          <div className="pt-8 max-w-lg mx-auto">
            <div className="bg-foeg-navy text-white p-8 border border-white/20 shadow-floating text-left relative overflow-hidden rounded-none">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <span className="font-serif text-9xl">FOEG</span>
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start border-b border-white/20 pb-4">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.3em] text-white/70 block">
                      CARTE OFFICIELLE DE MEMBRE
                    </span>
                    <h3 className="font-serif text-2xl font-light tracking-wide text-white mt-1">
                      {session?.user?.name || 'Client Privilège'}
                    </h3>
                  </div>
                  <span className="text-[9px] px-2.5 py-1 bg-white/20 text-white font-mono uppercase tracking-widest border border-white/30">
                    ACTIF · VIP
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] uppercase tracking-[0.18em] text-white/80 font-light">
                  <div>
                    <span className="text-white/50 block text-[9px]">COURRIEL PRIVÉ</span>
                    <span className="font-mono text-white text-[11px] truncate block">{session?.user?.email}</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[9px]">RANG ATELIER</span>
                    <span className="text-white">Cercle Privé Haute Confection</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/15 flex justify-between items-center text-[10px] text-white/60">
                  <span>ATELIER 48 RUE LUCIEN SAMPAIX · 75010 PARIS</span>
                  <span className="font-mono text-[9px] text-white/80">№ FOEG-{session?.user?.email?.slice(0, 4).toUpperCase()}-2026</span>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-center">
              <Link
                href="/colecciones"
                className="inline-flex items-center space-x-2 px-8 py-3.5 bg-foeg-navy text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-foeg-black transition-colors rounded-none shadow-subtle"
              >
                <span>{language === 'es' ? 'Acceder a las Colecciones Privadas' : 'Accéder aux Collections Privées'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      {/* 2. LOS 4 PRIVILEGIOS DE ALTA COSTURA */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block">
            {language === 'es' ? 'Beneficios Exclusivos de la Membresía' : 'Privilèges Réservés aux Membres'}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-foeg-black">
            {language === 'es' ? 'Los Cuatro Privilegios de la Maison' : 'Les Quatre Privilèges de l’Atelier'}
          </h2>
          <div className="w-12 h-px bg-foeg-navy/40 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Privilegio 1 */}
          <div className="p-8 bg-white border border-foeg-border/80 space-y-4 hover:border-foeg-navy transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-foeg-surface text-foeg-navy flex items-center justify-center">
              <Clock className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium block">
                01 · Avant-Première
              </span>
              <h3 className="font-serif text-xl font-normal text-foeg-black">
                {language === 'es' ? 'Acceso Anticipado 48h' : 'Accès Anticipé 48h'}
              </h3>
            </div>
            <p className="text-xs text-foeg-muted font-light leading-relaxed">
              {language === 'es'
                ? 'Reserva de piezas y selección de talla dos días antes del lanzamiento público de cada colección cápsula.'
                : 'Réservation exclusive de vos coupes et tailles deux jours avant l’ouverture au public des nouvelles créations.'}
            </p>
          </div>

          {/* Privilegio 2 */}
          <div className="p-8 bg-white border border-foeg-border/80 space-y-4 hover:border-foeg-navy transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-foeg-surface text-foeg-navy flex items-center justify-center">
              <Scissors className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium block">
                02 · Personnalisation
              </span>
              <h3 className="font-serif text-xl font-normal text-foeg-black">
                {language === 'es' ? 'Bordado de Monograma' : 'Monogramme d’Atelier'}
              </h3>
            </div>
            <p className="text-xs text-foeg-muted font-light leading-relaxed">
              {language === 'es'
                ? 'Bordado a mano de sus iniciales en hilo de seda tono sobre tono en el interior de abrigos y sacos sin coste adicional.'
                : 'Broderie manuelle de vos initiales au fil de soie ton sur ton dans les doublures de vos manteaux et tailleurs.'}
            </p>
          </div>

          {/* Privilegio 3 */}
          <div className="p-8 bg-white border border-foeg-border/80 space-y-4 hover:border-foeg-navy transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-foeg-surface text-foeg-navy flex items-center justify-center">
              <Bookmark className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium block">
                03 · Rareté
              </span>
              <h3 className="font-serif text-xl font-normal text-foeg-black">
                {language === 'es' ? 'Piezas Numeradas' : 'Pièces Numérotées'}
              </h3>
            </div>
            <p className="text-xs text-foeg-muted font-light leading-relaxed">
              {language === 'es'
                ? 'Acceso prioritario a prendas en series estrictas de 10 a 20 ejemplares numerados con certificado del taller.'
                : 'Accès réservé aux séries limitées de 10 à 20 exemplaires façonnés au monde, accompagnés de leur certificat d’authenticité.'}
            </p>
          </div>

          {/* Privilegio 4 */}
          <div className="p-8 bg-white border border-foeg-border/80 space-y-4 hover:border-foeg-navy transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-foeg-surface text-foeg-navy flex items-center justify-center">
              <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium block">
                04 · Conciergerie
              </span>
              <h3 className="font-serif text-xl font-normal text-foeg-black">
                {language === 'es' ? 'Salón y Cita Privada' : 'Salon & Cita Privée'}
              </h3>
            </div>
            <p className="text-xs text-foeg-muted font-light leading-relaxed">
              {language === 'es'
                ? 'Línea directa con el maestro sastre para citas privadas en París y servicio de conserjería confidencial permanente.'
                : 'Ligne directe avec nos tailleurs pour essayages privés au salon de l’Atelier et assistance de consergerie dédiée.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. FORMULARIO DE ADMISIÓN SI NO ES MIEMBRO */}
      {!isMember && (
        <section className="py-20 px-6 md:px-12 bg-foeg-surface/60 border-y border-foeg-border max-w-4xl mx-auto">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block">
              {language === 'es' ? 'Solicitud de Ingreso Confidencial' : 'Demande d’Admission Confidentielle'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-foeg-black">
              {language === 'es' ? 'Únase al Círculo Privado FOEG' : 'Rejoindre le Cercle Privé FOEG'}
            </h2>
            <p className="text-xs text-foeg-muted font-light leading-relaxed">
              {language === 'es'
                ? 'Complete sus coordenadas para recibir su confirmación oficial y habilitar sus privilegios en la boutique y en el taller.'
                : 'Renseignez vos coordonnées pour recevoir votre confirmation officielle et activer vos accès réservés.'}
            </p>

            {success ? (
              <div className="p-8 bg-white border border-emerald-300 space-y-3 animate-fadeIn">
                <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" strokeWidth={1.5} />
                <h3 className="font-serif text-xl font-normal text-foeg-black">
                  {language === 'es' ? 'Admisión Confirmada' : 'Admission Confirmée'}
                </h3>
                <p className="text-xs text-foeg-muted font-light max-w-sm mx-auto leading-relaxed">
                  {language === 'es'
                    ? 'Le hemos transmitido su carta de bienvenida por correo electrónico. Puede crear su cuenta o iniciar sesión para acceder a su expediente de miembro.'
                    : 'Votre confirmation vous a été transmise par courriel. Vous pouvez vous connecter pour accéder à votre espace.'}
                </p>
                <div className="pt-2">
                  <Link
                    href="/cuenta"
                    className="inline-block px-6 py-2.5 bg-foeg-navy text-white text-[10px] uppercase tracking-[0.2em] font-medium"
                  >
                    {language === 'es' ? 'Acceder a mi Cuenta' : 'Accéder à mon Compte'}
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4 text-left max-w-md mx-auto animate-fadeIn">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-foeg-muted block font-medium">
                    {language === 'es' ? 'Correo Electrónico' : 'Adresse Courriel'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="claire.delatour@paris.fr"
                    className="w-full bg-white border border-foeg-border text-xs text-foeg-black p-3 rounded-none font-light focus:outline-none focus:border-foeg-navy"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-foeg-navy hover:bg-foeg-black text-white text-xs uppercase tracking-[0.22em] font-medium transition-all duration-200 flex items-center justify-center space-x-2 rounded-none cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'es' ? 'Procesando admisión...' : 'Validation en cours...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'es' ? 'Solicitar mi Membresía' : 'Demander mon Adhésion'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-foeg-muted font-light pt-2">
                  {language === 'es' ? '¿Ya tiene cuenta registrada? ' : 'Déjà titulaire d’un compte ? '}
                  <Link href="/cuenta" className="underline hover:text-foeg-navy font-medium">
                    {language === 'es' ? 'Inicie sesión aquí' : 'Connectez-vous ici'}
                  </Link>
                </p>
              </form>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
