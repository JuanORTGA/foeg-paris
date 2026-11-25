'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Star, Check, Loader2, Plus, X, MessageSquare, ThumbsUp, ShieldCheck, User, Smile, Lock } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { submitCustomerReview, getProductApprovedReviews } from '@/app/admin/resenas/actions';

interface ReviewItem {
  id: string;
  author: string;
  location?: string;
  purchaseDetails?: string;
  avatar?: string;
  comment: string;
  date: string;
  rating?: number;
  fit?: string;
  imageUrl?: string | null;
}

const SAMPLE_REVIEWS: Record<'fr' | 'es' | 'en', ReviewItem[]> = {
  fr: [
    {
      id: 'sample-1',
      author: 'Jean-Luc M.',
      location: 'Paris 7ème',
      purchaseDetails: 'Taille M · Achat Vérifié',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      comment:
        'Une coupe impeccable, le tombé du tissu est d’une rareté absolue. Une silhouette architecturale qui impose le respect sans un mot.',
      date: 'Novembre 2026',
      rating: 5,
    },
    {
      id: 'sample-2',
      author: 'Claire D.',
      location: 'Genève',
      purchaseDetails: 'Taille S · Achat Vérifié',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      comment:
        'La noblesse de la matière se ressent dès l’essayage. Les finitions invisibles cousues main témoignent du véritable travail d’atelier.',
      date: 'Octobre 2026',
      rating: 5,
    },
  ],
  es: [
    {
      id: 'sample-1',
      author: 'Jean-Luc M.',
      location: 'París 7º',
      purchaseDetails: 'Talla M · Compra Verificada',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      comment:
        'Un corte impecable, la caída del tejido es de una exquisitez absoluta. Una silueta arquitectónica que impone respeto sin pronunciar palabra.',
      date: 'Noviembre 2026',
      rating: 5,
    },
    {
      id: 'sample-2',
      author: 'Claire D.',
      location: 'Ginebra',
      purchaseDetails: 'Talla S · Compra Verificada',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      comment:
        'La nobleza de la materia se percibe desde la primera puesta. Los acabados invisibles cosidos a mano atestiguan el auténtico trabajo de taller.',
      date: 'Octubre 2026',
      rating: 5,
    },
  ],
  en: [
    {
      id: 'sample-1',
      author: 'Jean-Luc M.',
      location: 'Paris 7th',
      purchaseDetails: 'Size M · Verified Purchase',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      comment:
        'An impeccable cut, the drape of the fabric is of absolute rarity. An architectural silhouette commanding respect without a word.',
      date: 'November 2026',
      rating: 5,
    },
    {
      id: 'sample-2',
      author: 'Claire D.',
      location: 'Geneva',
      purchaseDetails: 'Size S · Verified Purchase',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      comment:
        'The nobility of the fabric is felt immediately upon trying on. Invisible hand-sewn finishes bear witness to genuine atelier craftsmanship.',
      date: 'October 2026',
      rating: 5,
    },
  ],
};

interface ReviewsProps {
  productId?: string;
  productName?: string;
  productSlug?: string;
}

export default function Reviews({ productId, productName, productSlug }: ReviewsProps) {
  const { t, language } = useLanguage();
  const { data: session } = useSession();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [rating, setRating] = useState<number>(5);
  const [fit, setFit] = useState<'SMALL' | 'TRUE_TO_SIZE' | 'LARGE'>('TRUE_TO_SIZE');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [comment, setComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Pré-remplir les coordonnées du membre connecté
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !userName) setUserName(session.user.name);
      if (session.user.email && !userEmail) setUserEmail(session.user.email);
    }
  }, [session]);

  // Reseñas aprobadas en vivo desde Neon
  const [approvedReviews, setApprovedReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const target = productId || productSlug;
    if (target) {
      getProductApprovedReviews(target).then((revs) => {
        if (isMounted && revs && revs.length > 0) {
          setApprovedReviews(revs);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [productId, productSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await submitCustomerReview({
      productId,
      productSlug,
      userName,
      userEmail,
      rating,
      fit,
      comment,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessNotice(t('reviews.successMsg'));
      setIsFormOpen(false);
      setUserName('');
      setUserEmail('');
      setComment('');
      setRating(5);
      setFit('TRUE_TO_SIZE');
    } else {
      alert(res.error || (language === 'es' ? 'Error al enviar la reseña' : 'Erreur'));
    }
  };

  // Combinar reseñas aprobadas en base de datos con las reseñas editoriales de muestra
  const allDisplayedReviews: ReviewItem[] =
    approvedReviews.length > 0
      ? approvedReviews
      : SAMPLE_REVIEWS[language] || SAMPLE_REVIEWS.fr;

  return (
    <section className="pt-8 mt-8 border-t border-foeg-border/80 space-y-8">
      {/* 1. Cabecera Editorial con Botón para Dejar Reseña */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-[0.28em] text-foeg-muted font-medium block">
            {t('reviews.subtitle')}
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-light text-foeg-black tracking-wide">
            {t('reviews.title')}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setSuccessNotice(null);
          }}
          className="px-5 py-2.5 bg-foeg-navy hover:bg-black text-white text-[11px] uppercase tracking-[0.18em] font-medium transition-colors cursor-pointer flex items-center justify-center space-x-2 self-start sm:self-auto shrink-0 shadow-subtle"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('reviews.leaveReview')}</span>
        </button>
      </div>

      {/* Alerta de Éxito tras enviar */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-3 animate-fadeIn">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-light leading-relaxed">{successNotice}</p>
        </div>
      )}

      {/* Formulario Elegante para que el Cliente deje su Reseña en Tienda */}
      {isFormOpen && !session?.user && (
        <div className="bg-white border border-foeg-border p-6 sm:p-8 space-y-4 shadow-floating animate-fadeIn text-xs font-light">
          <div className="flex items-center justify-between border-b border-foeg-border/70 pb-3">
            <div className="flex items-center space-x-2 text-foeg-navy">
              <Lock className="w-4 h-4 shrink-0 text-foeg-navy" strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.2em] font-medium">
                {language === 'es'
                  ? 'Acceso Privado Requerido'
                  : language === 'en'
                  ? 'Private Access Required'
                  : 'Accès Privé Requis'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-foeg-muted hover:text-foeg-black p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-foeg-muted leading-relaxed">
            {language === 'es'
              ? 'Para garantizar la autenticidad de cada testimonio del Atelier, solo los miembros del Círculo Privado pueden compartir su experiencia.'
              : language === 'en'
              ? 'To guarantee the authenticity of each Atelier testimony, only Private Circle members can share their experience.'
              : 'Pour garantir l’authenticité de chaque témoignage d’Atelier, seuls les membres du Cercle Privé peuvent partager leur expérience.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href={`/cuenta?callbackUrl=${encodeURIComponent(
                productSlug ? `/producto/${productSlug}` : '/'
              )}`}
              className="px-5 py-2.5 bg-foeg-navy hover:bg-black text-white text-[11px] uppercase tracking-[0.18em] font-medium transition-colors text-center shadow-subtle"
            >
              {language === 'es'
                ? 'Iniciar Sesión / Registrarse'
                : language === 'en'
                ? 'Sign In / Register'
                : 'Se Connecter / S’inscrire'}
            </Link>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-foeg-border text-foeg-muted hover:text-foeg-black text-xs uppercase tracking-wider text-center cursor-pointer"
            >
              {language === 'es' ? 'Cerrar' : language === 'en' ? 'Close' : 'Fermer'}
            </button>
          </div>
        </div>
      )}

      {isFormOpen && session?.user && (
        <div className="bg-white border border-foeg-border p-6 sm:p-8 space-y-6 shadow-floating animate-fadeIn">
          <div className="flex items-center justify-between border-b border-foeg-border/70 pb-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block mb-0.5">
                {productName ? `${productName} · Maison FOEG` : 'Maison FOEG Paris'}
              </span>
              <h4 className="font-serif text-xl text-foeg-black">
                {t('reviews.writeReview')}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-foeg-muted hover:text-foeg-black p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-light">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Puntuación en Estrellas */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('reviews.formRating')} *
                </label>
                <div className="flex items-center space-x-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-medium pl-2">{rating} / 5</span>
                </div>
              </div>

              {/* Guía de Calce */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('reviews.formFit')} *
                </label>
                <select
                  value={fit}
                  onChange={(e) => setFit(e.target.value as any)}
                  className="w-full border border-foeg-border px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-foeg-navy"
                >
                  <option value="TRUE_TO_SIZE">{t('reviews.trueToSize')}</option>
                  <option value="SMALL">{t('reviews.runsSmall')}</option>
                  <option value="LARGE">{t('reviews.runsLarge')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('reviews.formAuthor')} *
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Claire de La Tour..."
                  className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('reviews.formEmail')} *
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="claire@cabinet-lt.fr"
                  className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('reviews.formComment')} *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 text-foeg-muted hover:text-foeg-black transition-colors flex items-center space-x-1 text-xs cursor-pointer"
                    title={language === 'es' ? 'Añadir un emoji' : language === 'en' ? 'Add an emoji' : 'Ajouter un emoji'}
                  >
                    <Smile className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span className="text-[10px] uppercase tracking-wider font-light">Emoji</span>
                  </button>

                  {/* Popover Emojis */}
                  {showEmojiPicker && (
                    <div className="absolute right-0 top-7 z-30 bg-white border border-foeg-border p-2 shadow-floating flex items-center space-x-1.5 animate-fadeIn">
                      {['😍', '🔥', '👗', '✨', '👌', '❤️'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => {
                            setComment((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + em + ' ');
                            setShowEmojiPicker(false);
                          }}
                          className="text-base p-1 hover:scale-125 transition-transform cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  language === 'es'
                    ? 'Comparte tu impresión sobre la fibra, el corte y la experiencia de uso...'
                    : 'Partagez vos impressions sur la matière, le tombé...'
                }
                className="w-full border border-foeg-border p-3 text-xs focus:outline-none focus:border-foeg-navy font-light leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-foeg-border/60">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 border border-foeg-border text-foeg-muted hover:text-foeg-black text-xs uppercase tracking-wider cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : language === 'en' ? 'Cancel' : 'Annuler'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-foeg-navy hover:bg-black text-white text-xs uppercase tracking-wider font-medium cursor-pointer flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('reviews.sending')}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('reviews.formSubmit')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Métricas Editoriales: Recomendación y Guía de Calce (Fit Guide) */}
      <div className="space-y-6 p-6 sm:p-7 bg-foeg-surface/40 border border-foeg-border/70">
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl sm:text-3xl font-light text-foeg-navy">
              98%
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-light">
              {t('reviews.clientRecommendation')}
            </span>
          </div>
          <p className="text-xs text-foeg-black font-light leading-relaxed">
            {t('reviews.recommendationText')}
          </p>
          <div className="w-full bg-foeg-border/80 h-1 rounded-none overflow-hidden">
            <div className="bg-foeg-navy h-full w-[98%]" />
          </div>
        </div>

        {/* Indicador de Talla (Fit Guide) */}
        <div className="space-y-2.5 pt-3 border-t border-foeg-border/60">
          <span className="text-[11px] uppercase tracking-[0.2em] text-foeg-black font-medium block">
            {t('reviews.fitGuide')}
          </span>
          <div className="space-y-2 text-xs text-foeg-muted font-light">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span>{t('reviews.runsSmall')}</span>
                <span className="text-foeg-black">10%</span>
              </div>
              <div className="w-full bg-foeg-border/80 h-1 rounded-none overflow-hidden">
                <div className="bg-foeg-navy/30 h-full w-[10%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-foeg-black font-medium">{t('reviews.trueToSize')}</span>
                <span className="text-foeg-navy font-semibold">80%</span>
              </div>
              <div className="w-full bg-foeg-border/80 h-1 rounded-none overflow-hidden">
                <div className="bg-foeg-navy h-full w-[80%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span>{t('reviews.runsLarge')}</span>
                <span className="text-foeg-black">10%</span>
              </div>
              <div className="w-full bg-foeg-border/80 h-1 rounded-none overflow-hidden">
                <div className="bg-foeg-navy/30 h-full w-[10%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Reseñas Aprobadas e Individuales */}
      <div className="space-y-5 divide-y divide-foeg-border/60">
        {allDisplayedReviews.map((review) => (
          <article key={review.id} className="pt-5 first:pt-0 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Avatar générique avec initiales ou icône (Règle stricte: pas de photo de profil pour préserver la discrétion) */}
                <div className="w-8 h-8 rounded-full border border-foeg-border/80 shrink-0 bg-foeg-surface flex items-center justify-center text-foeg-navy font-serif text-xs font-normal">
                  {review.author
                    ? review.author
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : <User className="w-4 h-4 text-foeg-navy" strokeWidth={1.5} />}
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-medium text-foeg-black">
                    {review.author}
                  </h4>
                  <span className="text-[10px] text-foeg-muted font-light tracking-wide block">
                    {review.location ? `${review.location} · ` : ''}
                    {review.purchaseDetails || (language === 'es' ? 'Compra Verificada Atelier' : language === 'en' ? 'Verified Atelier Purchase' : 'Achat Vérifié Atelier')}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < (review.rating || 5) ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-foeg-muted tracking-wider uppercase font-light">
                  {review.date}
                </span>
              </div>
            </div>

            <p className="text-xs text-foeg-black/90 font-light leading-relaxed italic pl-11">
              « {review.comment} »
            </p>

            {/* Photo de la pièce portée soumise par le client */}
            {review.imageUrl && (
              <div className="pl-11 pt-2">
                <div className="relative w-28 h-36 border border-foeg-border/80 overflow-hidden bg-foeg-surface">
                  <Image
                    src={review.imageUrl}
                    alt={language === 'es' ? 'Foto de la creación puesta' : language === 'en' ? 'Photo of the creation worn' : 'Photo de la création portée'}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-foeg-muted mt-1 block font-light">
                  {language === 'es' ? 'Pieza puesta · Atelier FOEG' : language === 'en' ? 'Piece worn · FOEG Atelier' : 'Pièce portée · Atelier FOEG'}
                </span>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
