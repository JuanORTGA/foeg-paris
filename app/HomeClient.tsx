'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scissors,
  Leaf,
  Truck,
  RefreshCcw,
  ArrowRight,
  ArrowUpRight,
  X,
  Eye,
  Instagram,
  MapPin,
  Clock,
  Film,
  Volume2,
  VolumeX,
  GripHorizontal,
} from 'lucide-react';
import MediaBox from '@/components/ui/MediaBox';
import EditableText from '@/components/cms/EditableText';
import EditableImage from '@/components/cms/EditableImage';
import { useCmsEditor } from '@/lib/cms-context';
import { updateContentField } from '@/app/admin/cms/actions';
import { useLanguage } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { JOURNAL_ARTICLES, JournalArticle } from '@/lib/journal-data';
import { subscribeNewsletter } from '@/lib/newsletter-actions';

export interface ProductItem {
  id: string;
  name: string;
  subtitle: string;
  numericPrice: number;
  image: string;
  category: string;
  materials: string;
  sizes: string[];
}

export type CmsDictionary = Record<string, { fr: string; en: string; es: string }>;

interface HomeClientProps {
  cmsContent: CmsDictionary;
  initialProducts: ProductItem[];
  journalArticles?: JournalArticle[];
}

const INSTAGRAM_POSTS = [
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85',
    caption: 'Silhouette architectural · Paris 10ème',
  },
  {
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85',
    caption: 'L’art du drapé en plein biais',
  },
  {
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=85',
    caption: 'Dans le silence de l’atelier de confection',
  },
  {
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=85',
    caption: 'Double drap de cachemire mongol',
  },
  {
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=85',
    caption: 'Matières brutes et lignes essentielles',
  },
];

export default function HomeClient({ cmsContent, initialProducts, journalArticles }: HomeClientProps) {
  const { language, t } = useLanguage();
  const { addItem, openCart } = useCart();
  const { formatPrice } = useCurrency();
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('M');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [vipEmail, setVipEmail] = useState('');
  const [vipSent, setVipSent] = useState(false);
  const [activeMute, setActiveMute] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
  });

  const articlesToDisplay =
    journalArticles && journalArticles.length > 0
      ? journalArticles.slice(0, 3)
      : JOURNAL_ARTICLES.slice(0, 3);

  // Gestion du déplacement libre de la fenêtre du Banner (Cercle Privé)
  const { isEditing, liveOverrides, setLiveOverride, registerSaveStart, registerSaveEnd } = useCmsEditor();

  // Helper CMS dynamique avec fallback automatique
  const getCms = (key: string, fallback: string): string => {
    // 1. Si une valeur a été éditée en direct pendant la session active, priorité absolue
    if (liveOverrides && liveOverrides[key] !== undefined) {
      return liveOverrides[key];
    }
    const item = cmsContent[key];
    if (!item) return fallback;
    const val = language === 'en' ? item.en : language === 'es' ? item.es : item.fr;
    // Si l'utilisateur a supprimé le texte (chaîne vide), respecter la suppression sans remettre le fallback
    if (val !== undefined && val !== null) {
      return val;
    }
    return item.fr !== undefined && item.fr !== null ? item.fr : fallback;
  };

  // Detección reactiva de pantalla móvil vs escritorio para posiciones independientes
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentPosKey = isMobileScreen ? 'hero_banner_card_pos_mobile' : 'hero_banner_card_pos';
  const savedCardPosRaw = getCms(currentPosKey, '');
  const parsedSavedPos = React.useMemo(() => {
    try {
      if (savedCardPosRaw) {
        const parsed = JSON.parse(savedCardPosRaw);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          return parsed;
        }
      }
    } catch (_) { }
    return { x: 0, y: 0 };
  }, [savedCardPosRaw]);

  const [bannerCardPos, setBannerCardPos] = useState<{ x: number; y: number }>(parsedSavedPos);
  const isDraggingCard = React.useRef(false);
  const dragCardStartRef = React.useRef({ startMouseX: 0, startMouseY: 0, initialPosX: 0, initialPosY: 0 });

  React.useEffect(() => {
    setBannerCardPos(parsedSavedPos);
  }, [parsedSavedPos]);

  const handleBannerCardMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingCard.current = true;
    dragCardStartRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      initialPosX: bannerCardPos.x,
      initialPosY: bannerCardPos.y,
    };

    let latestPos = { x: bannerCardPos.x, y: bannerCardPos.y };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingCard.current) return;
      const dx = moveEvent.clientX - dragCardStartRef.current.startMouseX;
      const dy = moveEvent.clientY - dragCardStartRef.current.startMouseY;
      latestPos = {
        x: dragCardStartRef.current.initialPosX + dx,
        y: dragCardStartRef.current.initialPosY + dy,
      };
      setBannerCardPos(latestPos);
    };

    const handleMouseUp = async () => {
      if (!isDraggingCard.current) return;
      isDraggingCard.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // Sauvegarde persistante de la position PC en base de données Neon
      if (isEditing) {
        setLiveOverride('hero_banner_card_pos', JSON.stringify(latestPos));
        registerSaveStart('hero_banner_card_pos');
        try {
          const res = await updateContentField('hero_banner_card_pos', JSON.stringify(latestPos));
          if (res.success) {
            registerSaveEnd('hero_banner_card_pos', true);
          } else {
            registerSaveEnd('hero_banner_card_pos', false);
          }
        } catch (_) {
          registerSaveEnd('hero_banner_card_pos', false);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleBannerCardTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    isDraggingCard.current = true;
    dragCardStartRef.current = {
      startMouseX: touch.clientX,
      startMouseY: touch.clientY,
      initialPosX: bannerCardPos.x,
      initialPosY: bannerCardPos.y,
    };

    let latestPos = { x: bannerCardPos.x, y: bannerCardPos.y };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isDraggingCard.current || moveEvent.touches.length !== 1) return;
      const moveTouch = moveEvent.touches[0];
      const dx = moveTouch.clientX - dragCardStartRef.current.startMouseX;
      const dy = moveTouch.clientY - dragCardStartRef.current.startMouseY;
      // Seguridad móvil: evitar empujar hacia abajo de la pantalla
      const safeDy = Math.min(dy, 25);
      latestPos = {
        x: dragCardStartRef.current.initialPosX + dx,
        y: dragCardStartRef.current.initialPosY + safeDy,
      };
      setBannerCardPos(latestPos);
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!isDraggingCard.current) return;
      isDraggingCard.current = false;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);

      // Sauvegarde persistante de la position MOBILE en base de données Neon
      if (isEditing) {
        setLiveOverride('hero_banner_card_pos_mobile', JSON.stringify(latestPos));
        registerSaveStart('hero_banner_card_pos_mobile');
        try {
          const res = await updateContentField('hero_banner_card_pos_mobile', JSON.stringify(latestPos));
          if (res.success) {
            registerSaveEnd('hero_banner_card_pos_mobile', true);
          } else {
            registerSaveEnd('hero_banner_card_pos_mobile', false);
          }
        } catch (_) {
          registerSaveEnd('hero_banner_card_pos_mobile', false);
        }
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  };

  const handleResetBannerPos = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const zeroPos = { x: 0, y: 0 };
    setBannerCardPos(zeroPos);
    if (isEditing) {
      setLiveOverride(currentPosKey, JSON.stringify(zeroPos));
      registerSaveStart(currentPosKey);
      try {
        await updateContentField(currentPosKey, JSON.stringify(zeroPos));
        registerSaveEnd(currentPosKey, true);
      } catch (_) {
        registerSaveEnd(currentPosKey, false);
      }
    }
  };

  const fallbackCuratedProducts: ProductItem[] = [
    {
      id: 'le-manteau-en-cachemire',
      name: 'Le Manteau en Cachemire',
      subtitle: 'Double drap de cachemire peigné non teinté · Noir Carbone',
      numericPrice: 1850,
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
      category: 'Manteaux & Vestes',
      materials: '90% Cachemire de Mongolie, 10% Laine Vierge',
      sizes: ['S', 'M', 'L'],
    },
    {
      id: 'la-veste-structuree-laine',
      name: 'La Veste Structurée',
      subtitle: 'Laine froide peignée, épaulettes souples · Bleu Nuit',
      numericPrice: 1200,
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
      category: 'Vestes & Costumes',
      materials: '100% Laine Vierge peignée',
      sizes: ['48', '50', '52'],
    },
    {
      id: 'le-pantalon-tailleur-droit',
      name: 'Le Pantalon Tailleur Droit',
      subtitle: 'Tombé lourd, taille haute sans passant · Noir Carbone',
      numericPrice: 680,
      image: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=1200&q=85',
      category: 'Pantalons',
      materials: '100% Gabardine de Laine Vierge',
      sizes: ['S', 'M', 'L'],
    },
    {
      id: 'la-chemise-en-soie-peignee',
      name: 'La Chemise en Soie Peignée',
      subtitle: 'Crêpe de Chine 19 mommes, boutons de nacre · Écru',
      numericPrice: 490,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
      category: 'Chemises & Tops',
      materials: '100% Soie de mûrier',
      sizes: ['S', 'M', 'L'],
    },
    {
      id: 'le-pull-cachemire-col-rond',
      name: 'Le Pull Cachemire Col Rond',
      subtitle: 'Tricot jauge 12, finitions tubulaires · Gris Anthracite',
      numericPrice: 580,
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85',
      category: 'Mailles & Cachemires',
      materials: '100% Cachemire peigné',
      sizes: ['S', 'M', 'L', 'XL'],
    },
  ];

  // Produits réels de la base de données (si vide, fallback élégant de secours)
  const productsToDisplay = initialProducts.length > 0
    ? initialProducts.slice(0, 5)
    : fallbackCuratedProducts.slice(0, 5);

  const getDesktopGridClass = (count: number) => {
    switch (count) {
      case 1:
        return 'md:grid-cols-1 md:max-w-xs md:mx-auto';
      case 2:
        return 'md:grid-cols-2 md:max-w-2xl md:mx-auto';
      case 3:
        return 'md:grid-cols-3 md:max-w-5xl md:mx-auto';
      case 4:
        return 'md:grid-cols-4 md:max-w-6xl md:mx-auto';
      case 5:
      default:
        return 'md:grid-cols-5 md:w-full';
    }
  };

  const handleAddToCart = () => {
    if (!quickViewProduct) return;
    const matched = MOCK_PRODUCTS.find((p) => p.slug === quickViewProduct.id) || MOCK_PRODUCTS[0];
    addItem(matched, selectedSize, matched.variants?.[0]?.color || 'Noir Carbone', 1);
    setQuickViewProduct(null);
    openCart();
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      await subscribeNewsletter(newsletterEmail.trim(), 'Hero Accueil');
      setNewsletterSent(true);
      setTimeout(() => setNewsletterSent(false), 4000);
      setNewsletterEmail('');
    }
  };

  const handleVipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vipEmail.trim()) {
      await subscribeNewsletter(vipEmail.trim(), 'Cercle Privé VIP');
      setVipSent(true);
      setTimeout(() => setVipSent(false), 5000);
      setVipEmail('');
    }
  };

  return (
    <div className="bg-foeg-white text-foeg-black overflow-hidden">
      {/* =========================================================================
          1. HERO SECTION (Dynamisée avec le CMS Neon - Image ou Vidéo Cinématique)
      ========================================================================= */}
      {(() => {
        const heroVideo = getCms('hero_video', '');
        const heroImage = getCms('hero_image', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=85');
        const heroMedia = heroVideo && heroVideo.trim() !== '' ? heroVideo : heroImage;
        const heroKey = heroVideo && heroVideo.trim() !== '' ? 'hero_video' : 'hero_image';
        const isHeroGray = getCms('hero_image_grayscale', '') === 'true' || getCms('hero_video_grayscale', '') === 'true';

        return (
          <section className="relative min-h-[100dvh] h-auto lg:h-screen w-full flex items-end pt-24 pb-12 lg:pb-28 px-4 sm:px-6 md:px-16 overflow-hidden bg-black">
            <div className="absolute inset-0 pointer-events-auto">
              <EditableImage
                contentKey={heroKey}
                defaultSrc={heroMedia}
                defaultGrayscale={isHeroGray}
                alt="FOEG Collection Parisienne - Silhouette Haute Couture"
                aspectRatio="full"
                priority={true}
                className="w-full h-full object-cover"
                imageClassName="w-full h-full object-cover"
                sizes="100vw"
                label="Hero Principal (Foto o Vídeo)"
                heroControls={true}
              />
              {/* Overlay de luxe sombre et subtil (bg-black/25 + dégradé) pour garantir une lisibilité absolue */}
              <div className="absolute inset-0 bg-black/25 z-10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/55 z-10 pointer-events-none" />
            </div>

            {/* Contenu Hero dynamique - pointer-events-none sur le conteneur large pour libérer les clics de la photo */}
            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 lg:gap-12 pointer-events-none">
              <div className="space-y-3 sm:space-y-4 max-w-3xl text-left pointer-events-none">
                <div className="pointer-events-auto inline-block">
                  <EditableText
                    contentKey="hero_season"
                    defaultValue={getCms('hero_season', t('hero.season'))}
                    className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/90 font-light block"
                  />
                </div>
                <h1 className="font-serif text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-light text-white tracking-tight leading-[0.95] sm:leading-[0.92] pointer-events-none">
                  <span className="pointer-events-auto inline-block">
                    <EditableText
                      contentKey="hero_title_line1"
                      defaultValue={getCms('hero_title_line1', t('hero.titleLine1'))}
                      as="span"
                    />
                  </span>{' '}
                  <br />
                  <span className="pointer-events-auto inline-block">
                    <EditableText
                      contentKey="hero_title_line2"
                      defaultValue={getCms('hero_title_line2', t('hero.titleLine2'))}
                      as="span"
                      className="italic font-normal"
                    />
                  </span>
                </h1>
              </div>

              {/* Formulaire Flottant de Newsletter "Rejoignez le Cercle Privé" - Déplaçable / Draggable */}
              <div
                style={
                  bannerCardPos.x !== 0 || bannerCardPos.y !== 0
                    ? { transform: `translate3d(${bannerCardPos.x}px, ${bannerCardPos.y}px, 0)` }
                    : undefined
                }
                className={`w-full max-w-[calc(100vw-2.5rem)] sm:max-w-md lg:w-96 bg-black/75 sm:bg-black/50 backdrop-blur-md p-3.5 sm:p-6 md:p-8 border border-white/20 rounded-none shadow-floating pointer-events-auto relative mt-2 sm:mt-4 lg:mt-0 ${isEditing ? 'hover:border-white/50 transition-colors' : ''
                  }`}
              >
                {/* Poignée de déplacement supérieure (Mode Studio CMS) */}
                {isEditing && (
                  <div
                    onMouseDown={handleBannerCardMouseDown}
                    onTouchStart={handleBannerCardTouchStart}
                    className="flex items-center justify-between pb-2 mb-3 border-b border-white/20 cursor-move active:cursor-grabbing hover:bg-white/10 px-2 py-1 select-none transition-colors group/drag rounded-none touch-none"
                    title="Arrastre para mover esta ventana (Mouse o Dedo en móvil)"
                  >
                    <div className="flex items-center space-x-1.5 text-white/70 group-hover/drag:text-white">
                      <GripHorizontal className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[9px] uppercase tracking-widest font-mono truncate">
                        Déplacer la fenêtre
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {(bannerCardPos.x !== 0 || bannerCardPos.y !== 0) && (
                        <button
                          type="button"
                          onClick={handleResetBannerPos}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            handleResetBannerPos(e);
                          }}
                          className="text-[9px] uppercase tracking-wider text-amber-300 hover:text-white underline cursor-pointer px-1 py-0.5"
                          title="Restablecer posición inicial"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <EditableText
                  contentKey="hero_cercle_title"
                  defaultValue={getCms('hero_cercle_title', t('hero.cercleTitle'))}
                  className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white/90 block font-medium mb-1"
                />
                <EditableText
                  contentKey="hero_cercle_desc"
                  defaultValue={getCms('hero_cercle_desc', t('hero.cercleDesc'))}
                  as="p"
                  multiline={true}
                  className="text-[11px] sm:text-xs text-white/70 font-light leading-relaxed mb-3 sm:mb-4 block"
                />

                <form onSubmit={handleNewsletterSubmit} className="relative flex items-center" suppressHydrationWarning>
                  <input
                    type="email"
                    required
                    suppressHydrationWarning
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder={t('hero.emailPlaceholder')}
                    className="w-full bg-transparent border-b border-white py-1.5 sm:py-2 pr-8 text-[11px] sm:text-xs text-white placeholder:text-white/40 focus:outline-none transition-colors duration-200 font-light rounded-none"
                    aria-label="Adresse courriel pour le Cercle Privé"
                  />
                  <button
                    type="submit"
                    suppressHydrationWarning
                    className="absolute right-0 text-white hover:text-white/70 transition-colors duration-200 focus:outline-none p-1 cursor-pointer"
                    aria-label="Valider l'inscription"
                  >
                    <ArrowRight className="w-4 h-4" strokeWidth={1} />
                  </button>
                </form>

                {newsletterSent && (
                  <p className="mt-3 text-[11px] text-white/90 tracking-wide font-light">
                    {t('hero.submitted')}
                  </p>
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {/* =========================================================================
          2. BARRA DE VALORES
      ========================================================================= */}
      <section className="border-b border-foeg-border/80 bg-foeg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-8">
            <div className="space-y-4 text-left">
              <Scissors className="w-8 h-8 text-foeg-navy" strokeWidth={1} />
              <div>
                <EditableText
                  contentKey="values_atelier_title"
                  initialValue={getCms('values_atelier_title', t('values.atelierTitle'))}
                  as="h3"
                  className="text-xs uppercase tracking-[0.22em] text-foeg-black font-medium block"
                />
                <EditableText
                  contentKey="values_atelier_desc"
                  initialValue={getCms('values_atelier_desc', t('values.atelierDesc'))}
                  as="p"
                  className="mt-2 text-xs text-foeg-muted font-light leading-relaxed block"
                />
              </div>
            </div>

            <div className="space-y-4 text-left">
              <Leaf className="w-8 h-8 text-foeg-navy" strokeWidth={1} />
              <div>
                <EditableText
                  contentKey="values_fibers_title"
                  initialValue={getCms('values_fibers_title', t('values.fibersTitle'))}
                  as="h3"
                  className="text-xs uppercase tracking-[0.22em] text-foeg-black font-medium block"
                />
                <EditableText
                  contentKey="values_fibers_desc"
                  initialValue={getCms('values_fibers_desc', t('values.fibersDesc'))}
                  as="p"
                  className="mt-2 text-xs text-foeg-muted font-light leading-relaxed block"
                />
              </div>
            </div>

            <div className="space-y-4 text-left">
              <Truck className="w-8 h-8 text-foeg-navy" strokeWidth={1} />
              <div>
                <EditableText
                  contentKey="values_shipping_title"
                  initialValue={getCms('values_shipping_title', t('values.shippingTitle'))}
                  as="h3"
                  className="text-xs uppercase tracking-[0.22em] text-foeg-black font-medium block"
                />
                <EditableText
                  contentKey="values_shipping_desc"
                  initialValue={getCms('values_shipping_desc', t('values.shippingDesc'))}
                  as="p"
                  className="mt-2 text-xs text-foeg-muted font-light leading-relaxed block"
                />
              </div>
            </div>

            <div className="space-y-4 text-left">
              <RefreshCcw className="w-8 h-8 text-foeg-navy" strokeWidth={1} />
              <div>
                <EditableText
                  contentKey="values_returns_title"
                  initialValue={getCms('values_returns_title', t('values.returnsTitle'))}
                  as="h3"
                  className="text-xs uppercase tracking-[0.22em] text-foeg-black font-medium block"
                />
                <EditableText
                  contentKey="values_returns_desc"
                  initialValue={getCms('values_returns_desc', t('values.returnsDesc'))}
                  as="p"
                  className="mt-2 text-xs text-foeg-muted font-light leading-relaxed block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SÉLECTION ÉDITORIALE (Produits Réels depuis Neon)
      ========================================================================= */}
      <section className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-16 gap-4 sm:gap-6">
          <div className="space-y-2 text-left">
            <EditableText
              contentKey="iconic_tag"
              initialValue={getCms('iconic_tag', t('products.curatedSelection'))}
              as="span"
              className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block"
            />
            <EditableText
              contentKey="iconic_title"
              initialValue={getCms('iconic_title', t('products.iconicPieces'))}
              as="h2"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foeg-black tracking-tight block"
            />
          </div>
          <Link
            href="/hombre"
            className="text-xs uppercase tracking-[0.22em] text-foeg-black hover:text-foeg-navy font-medium transition-colors border-b border-foeg-black pb-1 self-start md:self-auto"
          >
            {t('products.discoverAll')} →
          </Link>
        </div>

        {/* CONTENEDOR AUTO-ADAPTABLE (UNA AL LADO DE LA OTRA EN PC Y CARRUSEL ALINEADO EN MÓVIL) */}
        <div className={`flex md:grid ${getDesktopGridClass(productsToDisplay.length)} gap-4 sm:gap-5 lg:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-px-4 scrollbar-none pb-4 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0`}>
          {productsToDisplay.slice(0, 5).map((product) => {
            const productImgKey = `iconic_product_image_${product.id}`;
            const productTitleKey = `iconic_product_title_${product.id}`;
            const isProdGray = getCms(`${productImgKey}_grayscale`, '') === 'true';

            return (
              <article
                key={product.id}
                className="w-[74vw] max-w-[270px] sm:w-[44vw] md:w-auto shrink-0 md:shrink snap-start group text-left flex flex-col justify-between bg-white/40 md:bg-transparent p-2.5 sm:p-0 border border-foeg-border/50 md:border-none shadow-2xs md:shadow-none"
              >
                <div className="relative overflow-hidden bg-foeg-surface aspect-[3/4] sm:aspect-[2/3] md:aspect-[2/3] border border-foeg-border/80">
                  <EditableImage
                    contentKey={productImgKey}
                    defaultSrc={getCms(productImgKey, product.image)}
                    defaultGrayscale={isProdGray}
                    alt={product.name}
                    aspectRatio="full"
                    className="w-full h-full"
                    imageClassName="group-hover:scale-105 transition-transform duration-700 ease-out object-cover"
                    sizes="(max-width: 768px) 75vw, 25vw"
                    label={`Image ${product.name}`}
                  />

                  {/* Acceso directo a detalle */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex gap-2 z-20">
                    <Link
                      href={`/producto/${product.id}`}
                      className="w-full bg-foeg-white/95 text-foeg-black hover:bg-foeg-navy hover:text-foeg-white py-2.5 sm:py-3 px-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 shadow-subtle border border-foeg-border/80 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={1} />
                      <span>{t('products.viewDetails')}</span>
                    </Link>
                  </div>
                </div>

                <div className="mt-3.5 sm:mt-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Título y Flecha con altura fija mínima para alineación estricta */}
                    <div className="flex items-start justify-between gap-2 min-h-[2.6rem] sm:min-h-[3rem]">
                      <h3 className="font-serif text-base sm:text-lg md:text-xl font-normal text-foeg-black group-hover:text-foeg-navy transition-colors leading-snug line-clamp-2">
                        <EditableText
                          contentKey={productTitleKey}
                          initialValue={getCms(productTitleKey, product.name)}
                          as="span"
                          className="inline-block"
                        />
                      </h3>
                      <Link
                        href={`/producto/${product.id}`}
                        className="group/arrow p-1 shrink-0 text-foeg-muted hover:text-foeg-navy group-hover:text-foeg-navy transition-all duration-200 cursor-pointer flex items-center justify-center rounded-full hover:bg-foeg-navy/10"
                        aria-label={`Voir ${product.name}`}
                      >
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover/arrow:translate-x-0.5 group-hover/arrow:-translate-y-0.5" strokeWidth={1.5} />
                      </Link>
                    </div>
                    {/* Subtítulo alineado a una sola línea */}
                    <p className="text-[11px] sm:text-xs text-foeg-muted font-light leading-relaxed mt-1 line-clamp-1 h-4">
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Precio alineado exactamente en la misma base */}
                  <div className="pt-2 sm:pt-3 border-t border-foeg-border/40 mt-2.5 sm:mt-3">
                    <span className="text-xs font-mono font-medium tracking-wider text-foeg-black block">
                      {formatPrice(product.numericPrice)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Indicador de desplazamiento sutil para móvil */}
        {productsToDisplay.length > 1 && (
          <div className="flex md:hidden items-center justify-center gap-1.5 mt-4">
            {productsToDisplay.slice(0, 5).map((_, i) => (
              <span
                key={`scroll-dot-${i}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === 0 ? 'w-5 bg-foeg-navy' : 'w-1.5 bg-foeg-border'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          4. SECCIÓN EDITORIAL (Bloque Azul Marino Dynamisé avec le CMS Neon)
      ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[680px] border-t border-b border-foeg-border">
        <div className="relative min-h-[380px] lg:min-h-full w-full overflow-hidden">
          <EditableImage
            contentKey="editorial_image"
            defaultSrc={getCms('editorial_image', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85')}
            defaultGrayscale={getCms('editorial_image_grayscale', '') === 'true'}
            alt="Atelier de confection et coupe de tissu noble - FOEG Paris"
            aspectRatio="full"
            className="w-full h-full min-h-[380px] lg:min-h-full"
            imageClassName="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            label="Foto Editorial y Filosofía"
          />
        </div>

        {/* LADO DERECHO: Azul Marino Profundo (Textos editables en /admin/contenido) */}
        <div className="bg-foeg-navy text-foeg-white p-10 sm:p-16 lg:p-24 flex flex-col justify-center">
          <div className="max-w-xl space-y-8">
            <div className="w-px h-16 bg-foeg-white/40" />

            <div className="space-y-4">
              <EditableText
                contentKey="philosophy_chapter"
                initialValue={getCms('philosophy_chapter', t('philosophy.chapter'))}
                as="span"
                className="text-[11px] uppercase tracking-[0.3em] text-foeg-white/70 block font-light"
              />
              <EditableText
                contentKey="philosophy_title"
                initialValue={getCms('philosophy_title', t('philosophy.title'))}
                as="h2"
                className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-[1.08] tracking-tight block"
              />
            </div>

            <EditableText
              contentKey="philosophy_desc"
              initialValue={getCms('philosophy_desc', t('philosophy.desc'))}
              as="p"
              className="text-xs sm:text-sm text-foeg-white/90 font-light leading-relaxed block"
            />

            <div className="pt-4">
              <Link
                href="/journal"
                className="inline-flex items-center space-x-3 text-xs uppercase tracking-[0.22em] text-white border border-white hover:bg-white hover:text-foeg-navy px-8 py-4 transition-all duration-300 rounded-none font-medium group"
              >
                <span>{t('philosophy.readJournal')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SECCIÓN REELS & VIDÉOS DE HAUTE COUTURE (L'Atelier en Mouvement)
      ========================================================================= */}
      {(() => {
        const reelsList = [
          {
            id: 1,
            video: getCms('reel_video_1', '/uploads/foeg-reel-1795374921080-pq4a2l.mp4'),
            caption: getCms('reel_caption_1', language === 'es' ? '01 · Silueta & Abrigo en Doble Drap' : language === 'en' ? '01 · Silhouette & Coat in Double Drap' : '01 · Allure & Manteau en Double Drap'),
            tag: 'DÉFILÉ PARIS',
          },
          {
            id: 2,
            video: getCms('reel_video_2', '/uploads/foeg-reel-1795374948315-nnop7w.mp4'),
            caption: getCms('reel_caption_2', language === 'es' ? '02 · Puntada Manual de Sastrería · Atelier París' : language === 'en' ? '02 · Hand-stitched Tailoring · Paris Atelier' : '02 · Point Sellier Main · Atelier Rue Lucien Sampaix'),
            tag: 'SAVOIR-FAIRE',
          },
          {
            id: 3,
            video: getCms('reel_video_3', '/uploads/foeg-reel-1795377196519-iu7ux8.mp4'),
            caption: getCms('reel_caption_3', language === 'es' ? '03 · Caída y Fluidez en Crepé de Seda Pura' : language === 'en' ? '03 · Flow & Drape in Pure Silk Crepe' : '03 · Fluidité & Tombé en Crêpe de Soie Pure'),
            tag: 'SOIE NOBLE',
          },
          {
            id: 4,
            video: getCms('reel_video_4', '/uploads/foeg-reel-1795377360845-811izo.mp4'),
            caption: getCms('reel_caption_4', language === 'es' ? '04 · Corte Arquitectónico · Edición Permanente' : language === 'en' ? '04 · Architectural Cut · Permanent Edition' : '04 · Coupe Architecturale · Édition Permanente'),
            tag: 'SILHOUETTE',
          },
        ];

        return (
          <section className="py-20 md:py-28 px-6 md:px-12 bg-[#F8F7F4] border-b border-foeg-border">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-foeg-border/80 pb-6">
                <div className="space-y-2 text-left">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block flex items-center space-x-2">
                    <Film className="w-3.5 h-3.5 text-foeg-navy" />
                    <span>{language === 'es' ? 'ALTA COSTURA EN VIVO & REELS' : language === 'en' ? 'LIVE HAUTE COUTURE & REELS' : 'HAUTE COUTURE EN DIRECT & REELS'}</span>
                  </span>
                  <EditableText
                    contentKey="reels_title"
                    initialValue={getCms('reels_title', language === 'es' ? "El Atelier en Movimiento" : language === 'en' ? "The Atelier in Motion" : "L'Atelier en Mouvement")}
                    as="h2"
                    className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foeg-black tracking-tight block"
                  />
                  <EditableText
                    contentKey="reels_subtitle"
                    initialValue={getCms('reels_subtitle', language === 'es' ? "Pasarela, caída de sedas nobles y backstage de la alta confección parisina." : language === 'en' ? "Runway, drape of noble silks and backstage of Parisian high confection." : "Défilé, tombé des soies et coulisses de la haute confection parisienne.")}
                    as="p"
                    className="text-xs text-foeg-muted font-light max-w-xl leading-relaxed mt-1 block"
                  />
                </div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-mono self-start md:self-auto">
                  PARIS · 75010
                </span>
              </div>

              <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                {reelsList.map((reel, idx) => (
                  <div
                    key={reel.id}
                    className="group relative w-[76vw] sm:w-auto shrink-0 snap-center aspect-[9/13] md:aspect-[2/3] bg-[#141414] overflow-hidden border border-black/10 shadow-subtle flex flex-col justify-between cursor-pointer"
                  >
                    <EditableImage
                      contentKey={`reel_video_${reel.id}`}
                      defaultSrc={reel.video}
                      defaultGrayscale={getCms(`reel_video_${reel.id}_grayscale`, '') === 'true'}
                      alt={reel.caption}
                      isVideo={true}
                      aspectRatio="full"
                      className="w-full h-full absolute inset-0"
                      imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      muted={activeMute[idx] ?? true}
                      label={`Reel Vídeo ${reel.id}`}
                    />

                    {/* Sombra sutil mínima en los extremos: Más del 92% de la superficie queda 100% limpia para el video */}
                    <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-black/30 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 pointer-events-none" />

                    {/* Header du Reel - Ultra compacto, nivelado exactamente a la misma altura */}
                    <div className="relative z-20 px-3 pt-3 pb-1 h-9 flex items-center justify-between">
                      <span className="text-[7.5px] uppercase tracking-[0.25em] text-white/80 font-mono bg-black/25 backdrop-blur-xs px-2 py-0.5 border border-white/10 select-none">
                        {reel.tag}
                      </span>
                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMute((prev) => ({ ...prev, [idx]: !prev[idx] }));
                        }}
                        className="w-5 h-5 rounded-full bg-black/25 hover:bg-black/50 backdrop-blur-xs text-white/75 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-300 cursor-pointer select-none"
                        title={activeMute[idx] ? "Activer le son" : "Couper le son"}
                        aria-label="Contrôle audio du reel"
                      >
                        {activeMute[idx] ? (
                          <VolumeX className="w-2.5 h-2.5" strokeWidth={1.5} />
                        ) : (
                          <Volume2 className="w-2.5 h-2.5" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>

                    {/* Footer du Reel - 100% "Rack con Rack" alineado con las tarjetas 2 y 3 */}
                    <div className="relative z-20 px-3 pb-3 pt-1 h-[48px] flex flex-col justify-end space-y-0.5 text-left">
                      <EditableText
                        contentKey={`reel_caption_${reel.id}`}
                        initialValue={reel.caption}
                        as="h3"
                        className="font-serif text-[11px] sm:text-[12px] text-white/95 font-light tracking-wide leading-tight truncate whitespace-nowrap overflow-hidden text-ellipsis block drop-shadow-xs"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[7px] uppercase tracking-[0.25em] text-white/45 font-sans block">
                          MAISON FOEG · PARIS
                        </span>
                        <span className="w-3.5 h-3.5 rounded-full bg-white/10 flex items-center justify-center text-white/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <ArrowUpRight className="w-2 h-2" strokeWidth={1.5} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* =========================================================================
          6. SECCIÓN GALERÍA DEL ATELIER & SILUETAS (100% Modificable en CMS)
      ========================================================================= */}
      {(() => {
        const galleryPosts = [
          {
            image: getCms('atelier_gallery_1', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85'),
            caption: 'Silhouette architecturale · Paris 10ème',
          },
          {
            image: getCms('atelier_gallery_2', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85'),
            caption: 'L’art du drapé en plein biais',
          },
          {
            image: getCms('atelier_gallery_3', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=85'),
            caption: 'Dans le silence de l’atelier de confection',
          },
          {
            image: getCms('atelier_gallery_4', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=85'),
            caption: 'Double drap de cachemire mongol',
          },
          {
            image: getCms('atelier_gallery_5', 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=85'),
            caption: 'Matières brutes et lignes essentielles',
          },
        ];

        return (
          <section className="py-20 md:py-28 px-6 md:px-12 border-b border-foeg-border bg-white">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <a
                  href="https://www.instagram.com/foegparis/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium hover:opacity-75 transition-opacity"
                >
                  {t('instagram.subtitle')}
                </a>
                <h2 className="font-serif text-3xl sm:text-4xl font-light text-foeg-black tracking-tight">
                  <a
                    href="https://www.instagram.com/foegparis/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foeg-navy transition-colors"
                  >
                    {t('instagram.title')}
                  </a>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {galleryPosts.map((post, idx) => {
                  const galleryKey = `atelier_gallery_${idx + 1}`;
                  const isGalleryGray = getCms(`${galleryKey}_grayscale`, '') === 'true';

                  return (
                    <div
                      key={idx}
                      className="group relative aspect-square overflow-hidden bg-foeg-surface border border-foeg-border/60"
                    >
                      <EditableImage
                        contentKey={galleryKey}
                        defaultSrc={post.image}
                        defaultGrayscale={isGalleryGray}
                        alt={post.caption}
                        aspectRatio="square"
                        className="w-full h-full"
                        imageClassName="group-hover:scale-105 transition-transform duration-500 object-cover"
                        sizes="(max-width: 640px) 50vw, 20vw"
                        label={`Foto Atelier ${idx + 1}`}
                      />

                      {/* Redirección fija a Instagram @foegparis en cada imagen */}
                      {!isEditing ? (
                        <a
                          href="https://www.instagram.com/foegparis/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-20 bg-black/0 hover:bg-black/35 transition-colors duration-300 flex items-center justify-center cursor-pointer"
                          aria-label="Visiter @foegparis sur Instagram"
                          title="Visiter @foegparis sur Instagram"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 shadow-subtle">
                            <Instagram className="w-5 h-5 text-white" strokeWidth={1.5} />
                          </div>
                        </a>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 text-center pointer-events-none">
                          <Instagram className="w-5 h-5 text-white" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

      {/* =========================================================================
          6. SECCIÓN CITATION (Cita de la Maison FOEG)
      ========================================================================= */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-foeg-white border-b border-foeg-border text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[10px] uppercase tracking-[0.35em] text-foeg-navy font-medium block">
            {t('manifesto.tag')}
          </span>
          <EditableText
            contentKey="quote_text"
            initialValue={getCms(
              'quote_text',
              language === 'es'
                ? "El verdadero lujo es vestir una prenda que no grita, sino que susurra excelencia."
                : language === 'en'
                ? "True luxury is wearing a piece that does not shout, but whispers excellence."
                : "Le vrai luxe est de porter une pièce qui ne crie pas, mais qui murmure l'excellence."
            )}
            as="blockquote"
            className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-foeg-black italic leading-[1.3] tracking-tight block max-w-3xl mx-auto"
          />
          <EditableText
            contentKey="quote_author"
            initialValue={getCms('quote_author', "— La Maison FOEG")}
            as="p"
            className="text-xs sm:text-sm font-sans tracking-[0.25em] uppercase text-foeg-muted font-light pt-2 block"
          />
        </div>
      </section>

      {/* =========================================================================
          7. SECCIÓN LE JOURNAL DE LA MAISON (Teaser du Blog)
      ========================================================================= */}
      <section className="py-20 md:py-32 px-6 md:px-12 bg-white border-b border-foeg-border">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-foeg-border/80 pb-6">
            <div className="space-y-2 text-left">
              <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block">
                {t('journal.publications')}
              </span>
              <EditableText
                contentKey="journal_title"
                initialValue={getCms(
                  'journal_title',
                  language === 'es' ? "El Diario de la Maison" : language === 'en' ? "The Maison Journal" : "Le Journal de la Maison"
                )}
                as="h2"
                className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foeg-black tracking-tight block"
              />
              <EditableText
                contentKey="journal_subtitle"
                initialValue={getCms(
                  'journal_subtitle',
                  language === 'es'
                    ? "Crónicas del atelier, manifiestos de la forma y exploración de las materias nobles que esculpen el estilo FOEG."
                    : language === 'en'
                    ? "Atelier chronicles, form manifestos, and exploration of noble fabrics sculpting the FOEG allure."
                    : "Chroniques de l’atelier, manifestes de la forme et exploration des matières nobles qui sculptent l’allure FOEG."
                )}
                as="p"
                className="text-xs text-foeg-muted font-light max-w-xl leading-relaxed mt-1 block"
              />
            </div>
            <Link
              href="/journal"
              className="text-xs uppercase tracking-[0.22em] text-foeg-black hover:text-foeg-navy font-medium transition-colors border-b border-foeg-black pb-1 self-start md:self-auto flex items-center space-x-1.5"
            >
              <span>{t('journal.discoverAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 text-left">
            {articlesToDisplay.map((art) => {
              const artImgKey = `journal_article_image_${art.slug}`;
              const artTitleKey = `journal_article_title_${art.slug}`;
              const isArtGray = getCms(`${artImgKey}_grayscale`, '') === 'true';

              return (
                <article key={art.id} className="group flex flex-col justify-between">
                  <div className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-foeg-surface border border-foeg-border/80 mb-5">
                      <EditableImage
                        contentKey={artImgKey}
                        defaultSrc={getCms(artImgKey, art.image)}
                        defaultGrayscale={isArtGray}
                        alt={art.title}
                        aspectRatio="full"
                        className="w-full h-full"
                        imageClassName="group-hover:scale-105 transition-transform duration-700 ease-out object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        label={`Image ${art.title}`}
                      />
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center space-x-3 text-[10px] uppercase tracking-wider text-foeg-muted font-light">
                        <span className="text-foeg-navy font-medium">{art.category}</span>
                        <span>·</span>
                        <span>{art.readTime}</span>
                      </div>

                      <EditableText
                        contentKey={artTitleKey}
                        initialValue={getCms(artTitleKey, art.title)}
                        as="h3"
                        className="font-serif text-xl sm:text-2xl font-light text-foeg-black group-hover:text-foeg-navy transition-colors leading-snug block"
                      />

                      <p className="text-xs text-foeg-muted font-light leading-relaxed line-clamp-2">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-foeg-border/40">
                    <Link
                      href={`/journal/${art.slug}`}
                      className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-black group-hover:text-foeg-navy font-medium transition-colors"
                    >
                      <span>{t('journal.readArticle')}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. SECCIÓN LA BOUTIQUE & ATELIER (Split Screen)
      ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-foeg-border">
        {/* Lado Izquierdo: Imagen de la Boutique (del CMS) */}
        <div className="relative min-h-[420px] lg:min-h-[580px] w-full overflow-hidden bg-foeg-surface">
          <EditableImage
            contentKey="boutique_image"
            defaultSrc={getCms('boutique_image', "https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=1600&q=85")}
            defaultGrayscale={getCms('boutique_image_grayscale', '') === 'true'}
            alt="Atelier & Boutique FOEG Paris - Rue Lucien Sampaix"
            aspectRatio="full"
            className="w-full h-full min-h-[420px] lg:min-h-[580px]"
            imageClassName="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            label="Foto Atelier y Boutique París"
          />
        </div>

        {/* Lado Derecho: Dirección & Cita */}
        <div className="bg-foeg-white p-10 sm:p-16 lg:p-24 flex flex-col justify-center text-left">
          <div className="max-w-xl space-y-8">
            <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block">
              {t('boutique.presence')}
            </span>

            <div className="space-y-3">
              <EditableText
                contentKey="boutique_title"
                initialValue={getCms(
                  'boutique_title',
                  language === 'es' ? "Visitar nuestro Atelier" : language === 'en' ? "Visit our Atelier" : "Visiter notre Atelier"
                )}
                as="h2"
                className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight leading-[1.1] block"
              />
              <p className="text-xs text-foeg-muted font-light leading-relaxed">
                {language === 'es'
                  ? "Descubra nuestras colecciones en nuestro atelier parisino. Nuestros artesanos y asesores le reciben para pruebas privadas y pedidos a medida."
                  : language === 'en'
                  ? "Discover our collections at our Parisian atelier. Our artisans and advisors welcome you for private fittings and bespoke orders."
                  : "Découvrez nos collections au sein de notre atelier parisien. Nos artisans et conseillers vous accueillent pour des essayages privés et commandes sur-mesure."}
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-foeg-border/80">
              <div className="flex items-start space-x-3 text-xs font-light">
                <MapPin className="w-4 h-4 text-foeg-navy shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="font-medium text-foeg-black uppercase tracking-wider block">
                    {t('boutique.addressTitle')}
                  </span>
                  <EditableText
                    contentKey="boutique_address"
                    initialValue={getCms('boutique_address', "48 Rue Lucien Sampaix, 75010 Paris")}
                    as="span"
                    className="text-foeg-muted block"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs font-light">
                <Clock className="w-4 h-4 text-foeg-navy shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <span className="font-medium text-foeg-black uppercase tracking-wider block">
                    {t('boutique.hoursTitle')}
                  </span>
                  <EditableText
                    contentKey="boutique_hours"
                    initialValue={getCms(
                      'boutique_hours',
                      language === 'es'
                        ? "De Martes a Sábado · 11:00 – 19:30"
                        : language === 'en'
                        ? "Tuesday to Saturday · 11:00 AM – 7:30 PM"
                        : "Du Mardi au Samedi · 11h00 – 19h30"
                    )}
                    as="span"
                    className="text-foeg-muted block"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="mailto:concierge@foeg-paris.com?subject=Demande%20de%20Rendez-vous%20Atelier%20FOEG"
                className="inline-flex items-center space-x-3 bg-foeg-navy hover:bg-foeg-black text-white px-8 py-4 text-xs uppercase tracking-[0.22em] font-medium transition-colors shadow-subtle cursor-pointer"
              >
                <span>
                  {getCms(
                    'boutique_button',
                    language === 'es' ? "Reservar Cita" : language === 'en' ? "Book an Appointment" : "Prendre Rendez-vous"
                  )}
                </span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. SECCIÓN LE CERCLE PRIVÉ (Suscripción VIP Haute Couture)
      ========================================================================= */}
      <section className="py-24 md:py-36 px-6 md:px-12 bg-foeg-navy text-foeg-white text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-8 relative z-10">
          <div className="w-px h-12 bg-white/40 mx-auto" />

          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.35em] text-white/70 font-light block">
              {t('vip.confidential')}
            </span>
            <EditableText
              contentKey="vip_title"
              initialValue={getCms(
                'vip_title',
                language === 'es' ? "Únase al Círculo Privado" : language === 'en' ? "Join the Private Circle" : "Rejoignez le Cercle Privé"
              )}
              as="h2"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight block"
            />
            <EditableText
              contentKey="vip_subtitle"
              initialValue={getCms(
                'vip_subtitle',
                language === 'es'
                  ? "Acceso prioritario a nuevas colecciones, ventas privadas e invitaciones exclusivas."
                  : language === 'en'
                  ? "Priority access to upcoming collections, private sales, and exclusive previews."
                  : "Accès prioritaire aux nouvelles collections, ventes privées et invitations exclusives."
              )}
              as="p"
              className="text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-lg mx-auto block"
            />
          </div>

          <form onSubmit={handleVipSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex border-b border-white/60 focus-within:border-white transition-colors pb-1">
              <input
                type="email"
                required
                placeholder={language === 'es' ? "Su correo electrónico personal..." : language === 'en' ? "Your personal email address..." : "Votre adresse électronique..."}
                suppressHydrationWarning
                value={vipEmail}
                onChange={(e) => setVipEmail(e.target.value)}
                className="w-full bg-transparent text-white placeholder-white/40 text-xs font-light tracking-wider focus:outline-none py-3 px-1"
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="text-xs uppercase tracking-[0.25em] text-white hover:text-white/80 font-medium px-4 py-3 cursor-pointer shrink-0 transition-colors"
              >
                {getCms('vip_button', language === 'es' ? "Registrarse" : language === 'en' ? "Subscribe" : "S'inscrire")} →
              </button>
            </div>

            {vipSent && (
              <p className="text-xs text-emerald-400 font-light pt-1 animate-fadeIn">
                {t('vip.welcome')}
              </p>
            )}

            <div className="pt-3">
              <Link
                href="/cercle-prive"
                className="text-[10px] uppercase tracking-[0.22em] text-white/60 hover:text-white transition-colors underline underline-offset-4 decoration-white/30 inline-block font-light"
              >
                {language === 'es'
                  ? 'Descubra los privilegios de la membresía →'
                  : language === 'en'
                    ? 'Discover membership privileges →'
                    : 'Découvrir les privilèges du Cercle →'}
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
