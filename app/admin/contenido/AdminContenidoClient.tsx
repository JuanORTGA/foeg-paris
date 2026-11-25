'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Save,
  Check,
  RefreshCcw,
  Languages,
  Globe,
  Image as ImageIcon,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  RotateCw,
  Loader2,
  Eye,
  Maximize2,
  Minimize2,
  Columns,
  LayoutTemplate,
  Wifi,
  Battery,
  Signal,
  Minus,
  Plus,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import {
  updateSiteContent,
  initDefaultContentAction,
  autoTranslateContentAction,
} from './actions';
import { useLanguage } from '@/lib/language-context';

export interface SiteContentItem {
  id: string;
  key: string;
  section: string;
  valueFr: string;
  valueEn: string;
  valueEs: string;
}

interface AdminContenidoClientProps {
  initialContent: SiteContentItem[];
}

export default function AdminContenidoClient({ initialContent }: AdminContenidoClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const [contentList, setContentList] = useState<SiteContentItem[]>(initialContent);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [lastEditedLang, setLastEditedLang] = useState<Record<string, 'fr' | 'en' | 'es'>>({});
  const [selectedSection, setSelectedSection] = useState<
    'all' | 'hero' | 'philosophy' | 'quote' | 'journal' | 'vip' | 'boutique' | 'trust' | 'announcement' | 'footer' | 'images' | 'reels'
  >('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [translatingKey, setTranslatingKey] = useState<string | null>(null);

  // Configuration de Vue (Split 50/50, Solo Editor, Solo Vista Previa)
  const [viewLayout, setViewLayout] = useState<'split' | 'editor' | 'preview'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Configuration Iframe Preview Permanente (0ms de latence au changement d'appareil)
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(800);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(1);
  const [previewPath, setPreviewPath] = useState('/');

  // Contrôle de Zoom Manuel (null = Auto-fit réactif à l'écran)
  const [manualZoom, setManualZoom] = useState<number | null>(null);

  // Mesure dynamique continue du conteneur
  useEffect(() => {
    const targetEl = previewViewportRef.current;
    if (!targetEl) return;

    const measure = () => {
      const rect = targetEl.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportWidth(rect.width);
        setViewportHeight(rect.height);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(targetEl);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isFullscreen, viewLayout, previewDevice]);

  // Échapper au plein écran avec la touche Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshPreview = () => {
    setPreviewKey((k) => k + 1);
  };

  const handleInputChange = (
    id: string,
    field: 'valueFr' | 'valueEn' | 'valueEs',
    newValue: string
  ) => {
    const langCode = field === 'valueEs' ? 'es' : field === 'valueEn' ? 'en' : 'fr';
    setLastEditedLang((prev) => ({ ...prev, [id]: langCode }));

    setContentList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: newValue } : item))
    );
  };

  // Traduire intelligemment à partir de n'importe quelle boîte modifiée vers les autres langues
  const handleAutoTranslateItem = async (item: SiteContentItem) => {
    const preferredLang =
      lastEditedLang[item.id] || (language === 'es' ? 'es' : language === 'en' ? 'en' : 'fr');

    let sourceText = '';
    let sourceLang: 'fr' | 'en' | 'es' = 'fr';

    if (preferredLang === 'es' && item.valueEs?.trim()) {
      sourceText = item.valueEs.trim();
      sourceLang = 'es';
    } else if (preferredLang === 'en' && item.valueEn?.trim()) {
      sourceText = item.valueEn.trim();
      sourceLang = 'en';
    } else if (preferredLang === 'fr' && item.valueFr?.trim()) {
      sourceText = item.valueFr.trim();
      sourceLang = 'fr';
    } else {
      if (item.valueEs?.trim()) {
        sourceText = item.valueEs.trim();
        sourceLang = 'es';
      } else if (item.valueFr?.trim()) {
        sourceText = item.valueFr.trim();
        sourceLang = 'fr';
      } else if (item.valueEn?.trim()) {
        sourceText = item.valueEn.trim();
        sourceLang = 'en';
      }
    }

    if (!sourceText) {
      const emptyAlert =
        language === 'es'
          ? 'Por favor escribe un texto en cualquiera de las 3 casillas para traducirlo a los otros idiomas.'
          : language === 'en'
            ? 'Please enter text in any of the 3 boxes to translate into other languages.'
            : 'Veuillez saisir un texte dans l’une des 3 cases pour le traduire.';
      alert(emptyAlert);
      return;
    }

    setTranslatingKey(item.id);
    try {
      const res = await autoTranslateContentAction(sourceText, sourceLang);
      if (res.success && 'fr' in res && 'en' in res && 'es' in res) {
        setContentList((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                ...it,
                valueFr: (res as any).fr || it.valueFr,
                valueEn: (res as any).en || it.valueEn,
                valueEs: (res as any).es || it.valueEs,
              }
              : it
          )
        );
        const translatedToast =
          language === 'es'
            ? `« ${item.key} » traducido a los 3 idiomas con éxito.`
            : language === 'en'
              ? `"${item.key}" successfully translated into all 3 languages.`
              : `« ${item.key} » traduit avec succès dans les 3 langues.`;
        showToast(translatedToast);
      } else {
        alert(
          res.error ||
          (language === 'es'
            ? 'Error al traducir los textos.'
            : 'Erreur lors de la traduction.')
        );
      }
    } catch (err) {
      alert(language === 'es' ? 'Error durante la traducción.' : 'Erreur lors de la traduction.');
    } finally {
      setTranslatingKey(null);
    }
  };

  const handleSaveItem = async (item: SiteContentItem) => {
    setSavingKey(item.id);
    try {
      const res = await updateSiteContent(
        item.id,
        item.valueFr,
        item.valueEn,
        item.valueEs,
        false
      );
      if (!res.success) {
        alert(res.error || (language === 'es' ? 'Error al actualizar.' : 'Erreur de mise à jour.'));
        setSavingKey(null);
        return;
      }

      const savedToast =
        language === 'es'
          ? `« ${item.key} » guardado con éxito en los 3 idiomas.`
          : language === 'en'
            ? `"${item.key}" successfully saved in all 3 languages.`
            : `« ${item.key} » enregistré avec succès dans les 3 langues.`;

      showToast(savedToast);
      refreshPreview();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      alert(language === 'es' ? 'Error al guardar.' : 'Erreur lors de la sauvegarde.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleInitDefaults = async () => {
    const confirmPrompt =
      language === 'es'
        ? '¿Desea restablecer todos los textos a los valores oficiales de la Maison FOEG?'
        : language === 'en'
          ? 'Do you want to reset all texts to Maison FOEG standards?'
          : 'Voulez-vous synchroniser les textes par défaut de la Maison FOEG ?';

    if (!confirm(confirmPrompt)) {
      return;
    }
    try {
      const res = await initDefaultContentAction();
      if (res.success) {
        showToast(t('admin.cms.resetSuccess'));
        refreshPreview();
        startTransition(() => {
          router.refresh();
        });
      } else {
        alert(res.error || 'Erreur');
      }
    } catch (err) {
      alert(language === 'es' ? 'Error de inicialización.' : 'Erreur lors de l’initialisation.');
    }
  };

  const isMediaKey = (key: string) => {
    return (
      key.includes('image') ||
      key.includes('video') ||
      key.startsWith('reel_video') ||
      key === 'hero_video'
    );
  };

  const filteredContent = contentList.filter((item) => {
    if (selectedSection === 'all') return true;
    if (selectedSection === 'images') {
      return item.section === 'media' || isMediaKey(item.key) || item.key.includes('reel');
    }
    if (selectedSection === 'reels') {
      return item.key.includes('reel') || item.key.includes('video');
    }
    return item.section === selectedSection;
  });

  const getLabelForKey = (key: string) => {
    const labels: Record<string, { fr: string; en: string; es: string }> = {
      hero_season: {
        fr: 'Saison / Collection (Haut du Hero)',
        en: 'Season / Collection (Top Hero)',
        es: 'Temporada / Colección (Encabezado Hero)',
      },
      hero_title_line1: {
        fr: 'Titre Principal - Ligne 1',
        en: 'Main Title - Line 1',
        es: 'Título Principal - Línea 1',
      },
      hero_title_line2: {
        fr: 'Titre Principal - Ligne 2 (Italique)',
        en: 'Main Title - Line 2 (Italic)',
        es: 'Título Principal - Línea 2 (Itálica)',
      },
      hero_cercle_title: {
        fr: 'Titre du Cercle Privé (Newsletter Hero)',
        en: 'Private Circle Title (Hero Newsletter)',
        es: 'Título del Círculo Privado (Boletín Hero)',
      },
      hero_cercle_desc: {
        fr: 'Description du Cercle Privé (Hero)',
        en: 'Private Circle Description (Hero)',
        es: 'Descripción del Círculo Privado (Hero)',
      },
      hero_image: {
        fr: 'Photographie Principale du Hero (Couverture Haute Couture)',
        en: 'Hero Main Photography (Haute Couture Cover)',
        es: 'Fotografía Principal del Hero (Portada de Alta Costura)',
      },
      hero_video: {
        fr: 'Vidéo Cinématographique du Hero (Fond en boucle plein écran)',
        en: 'Hero Cinematic Video (Fullscreen loop background)',
        es: 'Vídeo Cinematográfico del Hero (Fondo en bucle pantalla completa)',
      },
      editorial_image: {
        fr: 'Photographie Éditoriale de la Philosophie (Section Atelier & Coupe)',
        en: 'Philosophy Editorial Photography (Atelier & Craft Section)',
        es: 'Fotografía Editorial de Filosofía (Sección Atelier y Confección)',
      },
      boutique_caracas_image: {
        fr: 'Photographie Boutique Caracas (San Román)',
        en: 'Caracas Boutique Photography (San Román)',
        es: 'Fotografía Boutique Caracas (San Román)',
      },
      vip_banner_image: {
        fr: 'Visuel d’Arrière-plan Cercle Privé VIP',
        en: 'VIP Private Circle Background Visual',
        es: 'Imagen de Fondo Círculo Privado VIP',
      },
      atelier_gallery_1: {
        fr: 'Galerie Atelier 1 · Allure & Architecture Paris 10e',
        en: 'Atelier Gallery 1 · Allure & Architecture Paris 10th',
        es: 'Galería Atelier 1 · Silueta y Arquitectura París 10',
      },
      atelier_gallery_2: {
        fr: 'Galerie Atelier 2 · L’art du drapé en plein biais',
        en: 'Atelier Gallery 2 · The art of bias draping',
        es: 'Galería Atelier 2 · El arte del drapeado al bies',
      },
      atelier_gallery_3: {
        fr: 'Galerie Atelier 3 · Tables de coupe et silence de l’atelier',
        en: 'Atelier Gallery 3 · Cutting tables & atelier silence',
        es: 'Galería Atelier 3 · Mesas de corte y silencio del atelier',
      },
      atelier_gallery_4: {
        fr: 'Galerie Atelier 4 · Double drap de cachemire mongol',
        en: 'Atelier Gallery 4 · Double Mongolian cashmere cloth',
        es: 'Galería Atelier 4 · Doble paño de cachemira mongola',
      },
      atelier_gallery_5: {
        fr: 'Galerie Atelier 5 · Matières brutes et lignes essentielles',
        en: 'Atelier Gallery 5 · Raw fibers & essential lines',
        es: 'Galería Atelier 5 · Materias nobles y líneas esenciales',
      },
      reels_title: {
        fr: 'Titre de la Section Vidéos / Reels en Direct',
        en: 'Reels / Live Atelier Section Title',
        es: 'Título de la Sección Vídeos / Reels en Vivo',
      },
      reels_subtitle: {
        fr: 'Sous-titre de la Section Vidéos / Reels',
        en: 'Reels Section Subtitle',
        es: 'Subtítulo de la Sección Vídeos / Reels',
      },
      reel_video_1: {
        fr: 'Reel 1 (Vidéo Verticale 9:16) · Défilé & Manteau Cachemire',
        en: 'Reel 1 (Vertical Video 9:16) · Runway & Cashmere Overcoat',
        es: 'Reel 1 (Vídeo Vertical 9:16) · Pasarela y Abrigo de Cachemira',
      },
      reel_caption_1: {
        fr: 'Reel 1 · Légende & Détail de la Pièce',
        en: 'Reel 1 · Caption & Garment Detail',
        es: 'Reel 1 · Leyenda y Detalle de la Prenda',
      },
      reel_video_2: {
        fr: 'Reel 2 (Vidéo Verticale 9:16) · Confection Manuelle en Atelier',
        en: 'Reel 2 (Vertical Video 9:16) · Hand Tailoring in Atelier',
        es: 'Reel 2 (Vídeo Vertical 9:16) · Confección Manual en Atelier París',
      },
      reel_caption_2: {
        fr: 'Reel 2 · Légende & Détail de la Pièce',
        en: 'Reel 2 · Caption & Garment Detail',
        es: 'Reel 2 · Leyenda y Detalle de la Prenda',
      },
      reel_video_3: {
        fr: 'Reel 3 (Vidéo Verticale 9:16) · Tombé & Fluidité de la Soie',
        en: 'Reel 3 (Vertical Video 9:16) · Pure Silk Drape & Fluidity',
        es: 'Reel 3 (Vídeo Vertical 9:16) · Caída y Fluidez de Seda Pura',
      },
      reel_caption_3: {
        fr: 'Reel 3 · Légende & Détail de la Pièce',
        en: 'Reel 3 · Caption & Garment Detail',
        es: 'Reel 3 · Leyenda y Detalle de la Prenda',
      },
      reel_video_4: {
        fr: 'Reel 4 (Vidéo Verticale 9:16) · Silhouette & Allure FOEG',
        en: 'Reel 4 (Vertical Video 9:16) · Silhouette & FOEG Allure',
        es: 'Reel 4 (Vídeo Vertical 9:16) · Silueta y Porte Arquitectónico',
      },
      reel_caption_4: {
        fr: 'Reel 4 · Légende & Détail de la Pièce',
        en: 'Reel 4 · Caption & Garment Detail',
        es: 'Reel 4 · Leyenda y Detalle de la Prenda',
      },
      philosophy_chapter: {
        fr: 'Numéro de Chapitre Éditorial',
        en: 'Editorial Chapter Number',
        es: 'Número de Capítulo Editorial',
      },
      philosophy_title: {
        fr: 'Titre de la Philosophie (Section Bleu Nuit)',
        en: 'Philosophy Title (Midnight Navy Section)',
        es: 'Título de la Filosofía (Sección Azul Noche)',
      },
      philosophy_desc: {
        fr: 'Texte du Manifeste (Section Bleu Nuit)',
        en: 'Manifesto Text (Midnight Navy Section)',
        es: 'Texto del Manifiesto (Sección Azul Noche)',
      },
      quote_text: {
        fr: 'Texte de la Citation de la Maison (Grand Serif Italic)',
        en: 'Maison Quote Text (Large Serif Italic)',
        es: 'Texto de la Cita de la Marca (Gran Serif Itálica)',
      },
      quote_author: {
        fr: 'Signature de la Citation de la Maison',
        en: 'Signature of the Maison Quote',
        es: 'Firma de la Cita de la Marca',
      },
      journal_title: {
        fr: 'Titre de la Section Le Journal (Accueil)',
        en: 'The Journal Section Title (Home)',
        es: 'Título de la Sección El Diario (Inicio)',
      },
      journal_subtitle: {
        fr: 'Sous-titre explicatif du Journal (Accueil)',
        en: 'The Journal Subtitle (Home)',
        es: 'Subtítulo explicativo de El Diario (Inicio)',
      },
      vip_title: {
        fr: 'Titre du Cercle Privé VIP (Encadré Sombre)',
        en: 'VIP Private Circle Title (Dark Container)',
        es: 'Título del Círculo Privado VIP (Caja Oscura)',
      },
      vip_subtitle: {
        fr: 'Description des Privilèges VIP (Encadré Sombre)',
        en: 'VIP Privileges Description (Dark Container)',
        es: 'Descripción de Privilegios VIP (Caja Oscura)',
      },
      vip_button: {
        fr: 'Texte du Bouton d’Adhésion VIP',
        en: 'VIP Membership Button Text',
        es: 'Texto del Botón de Suscripción VIP',
      },
      boutique_title: {
        fr: 'Titre de la Section Boutique & Atelier',
        en: 'Boutique & Atelier Section Title',
        es: 'Título de la Sección Boutique y Atelier',
      },
      boutique_address: {
        fr: 'Adresse Physique de l’Atelier Parisien',
        en: 'Paris Atelier Physical Address',
        es: 'Dirección Física del Atelier de París',
      },
      boutique_hours: {
        fr: 'Horaires d’Accueil du Public',
        en: 'Public Opening Hours',
        es: 'Horarios de Atención al Público',
      },
      boutique_button: {
        fr: 'Texte du Bouton Rendez-vous / Conciergerie',
        en: 'Appointment / Concierge Button Text',
        es: 'Texto del Botón de Cita / Conciergerie',
      },
      boutique_image: {
        fr: 'Photographie de l’Atelier & Boutique (Façade & Intérieur)',
        en: 'Atelier & Boutique Photography (Facade & Interior)',
        es: 'Fotografía del Atelier y Boutique (Fachada e Interior)',
      },
      topbar_text: {
        fr: 'Bandeau d’Annonce Supérieur (En-tête de la boutique)',
        en: 'Top Announcement Banner (Header Notification)',
        es: 'Barra de Anuncio Superior (Cabecera de la tienda)',
      },
      values_atelier_title: {
        fr: 'Pilier 1 · Titre Atelier Français',
        en: 'Pillar 1 · French Atelier Title',
        es: 'Pilar 1 · Título Atelier Francés',
      },
      values_atelier_desc: {
        fr: 'Pilier 1 · Description Atelier Français',
        en: 'Pillar 1 · French Atelier Description',
        es: 'Pilar 1 · Descripción Atelier Francés',
      },
      values_fibers_title: {
        fr: 'Pilier 2 · Titre Fibres Responsables',
        en: 'Pillar 2 · Responsible Fibers Title',
        es: 'Pilar 2 · Título Fibras Responsables',
      },
      values_fibers_desc: {
        fr: 'Pilier 2 · Description Fibres Responsables',
        en: 'Pillar 2 · Responsible Fibers Description',
        es: 'Pilar 2 · Descripción Fibras Responsables',
      },
      values_shipping_title: {
        fr: 'Pilier 3 · Titre Livraison Signature',
        en: 'Pillar 3 · Signature Shipping Title',
        es: 'Pilar 3 · Título Envío Signature',
      },
      values_shipping_desc: {
        fr: 'Pilier 3 · Description Livraison Signature',
        en: 'Pillar 3 · Signature Shipping Description',
        es: 'Pilar 3 · Descripción Envío Signature',
      },
      values_returns_title: {
        fr: 'Pilier 4 · Titre Essais Privés & Retours',
        en: 'Pillar 4 · Private Fittings & Returns Title',
        es: 'Pilar 4 · Título Pruebas Privadas y Devoluciones',
      },
      values_returns_desc: {
        fr: 'Pilier 4 · Description Essais Privés & Retours',
        en: 'Pillar 4 · Private Fittings & Returns Description',
        es: 'Pilar 4 · Descripción Pruebas Privadas y Devoluciones',
      },
      footer_tagline: {
        fr: 'Pied de page · Slogan & Manifeste',
        en: 'Footer · Tagline & Manifesto',
        es: 'Pie de página · Eslogan y Manifiesto',
      },
      footer_contact_email: {
        fr: 'Pied de page · Courriel Conciergerie',
        en: 'Footer · Concierge Email Address',
        es: 'Pie de página · Correo de Conciergerie',
      },
    };

    if (labels[key]) {
      return labels[key][language] || labels[key].fr;
    }
    return key;
  };

  // Pestañas minimalistas idénticas al estilo de la tienda (Captura 2)
  const sectionTabs = [
    {
      id: 'all',
      label: language === 'es' ? 'Todo' : language === 'en' ? 'All' : 'Tout',
    },
    {
      id: 'hero',
      label: 'Hero',
    },
    {
      id: 'philosophy',
      label: language === 'es' ? 'Filosofía' : language === 'en' ? 'Philosophy' : 'Philosophie',
    },
    {
      id: 'quote',
      label: language === 'es' ? 'Cita' : language === 'en' ? 'Quote' : 'Citation',
    },
    {
      id: 'journal',
      label: 'Journal',
    },
    {
      id: 'vip',
      label: language === 'es' ? 'Círculo VIP' : language === 'en' ? 'VIP Circle' : 'Cercle VIP',
    },
    {
      id: 'boutique',
      label: 'Atelier',
    },
    {
      id: 'trust',
      label: language === 'es' ? 'Pilares' : language === 'en' ? 'Pillars' : 'Piliers',
    },
    {
      id: 'announcement',
      label: language === 'es' ? 'Anuncio' : language === 'en' ? 'Announcement' : 'Annonce',
    },
    {
      id: 'footer',
      label: language === 'es' ? 'Pie de Página' : language === 'en' ? 'Footer' : 'Pied de page',
    },
    {
      id: 'images',
      label: language === 'es' ? 'Fotografías & Medios' : language === 'en' ? 'Photos & Media' : 'Photographies & Médias',
    },
    {
      id: 'reels',
      label: language === 'es' ? 'Vídeos & Reels' : language === 'en' ? 'Videos & Reels' : 'Vidéos & Reels',
    },
  ];

  // =========================================================================
  // CALCULS D'ÉMULATION ULTRA-RAPIDE (0ms DE LATENCE, AUCUN RECHARGEMENT)
  // =========================================================================
  const deviceConfigs = {
    desktop: {
      width: 1280,
      minHeight: 850,
      label: language === 'es' ? 'Ordenador' : language === 'en' ? 'Desktop' : 'Bureau',
      tag: '1280px',
    },
    tablet: {
      width: 768,
      minHeight: 1024,
      label: language === 'es' ? 'Tableta' : language === 'en' ? 'Tablet' : 'Tablette',
      tag: '768px',
    },
    mobile: {
      width: 440, // 440px: Format Pro Max élargi selon la demande utilisateur
      minHeight: 880,
      label: language === 'es' ? 'Móvil' : language === 'en' ? 'Mobile' : 'Mobile',
      tag: '440px',
    },
  };

  const availW = Math.max(280, viewportWidth - (previewDevice === 'mobile' ? 36 : 24));
  const availH = Math.max(300, viewportHeight - (previewDevice === 'mobile' ? 60 : 24));

  let autoScale = 1;
  if (previewDevice === 'desktop') {
    autoScale = Math.min(1, availW / 1280);
  } else if (previewDevice === 'tablet') {
    autoScale = Math.min(1, availW / 768, availH / 1024);
  } else {
    autoScale = Math.min(1, availW / 440, availH / 880);
  }

  // Échelle effective (manuelle ou auto)
  const effectiveScale = manualZoom !== null ? manualZoom : autoScale;
  const percentZoom = Math.round(effectiveScale * 100);

  // Hauteur interne calculée pour l'iframe de bureau
  const desktopScaledHeight = Math.max(600, (viewportHeight - 20) / effectiveScale);

  // Fonctions de Zoom
  const handleZoomIn = () => {
    const current = manualZoom !== null ? manualZoom : autoScale;
    setManualZoom(Math.min(2.0, Math.round((current + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    const current = manualZoom !== null ? manualZoom : autoScale;
    setManualZoom(Math.max(0.3, Math.round((current - 0.1) * 10) / 10));
  };

  const handleResetZoom = () => {
    setManualZoom(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-foeg-navy text-foeg-white px-5 py-3.5 shadow-floating text-xs uppercase tracking-wider flex items-center space-x-3 border border-white/20 animate-fadeIn">
          <Check className="w-4 h-4 text-white" strokeWidth={2} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* En-tête de la page avec Commutateur de Mise en Page (Split / Éditeur / Aperçu) */}
      <div className="border-b border-foeg-border/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1 font-medium">
            {t('admin.contenido.tag')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-foeg-black tracking-tight">
            {t('admin.contenido.title')}
          </h1>
          <p className="text-xs text-foeg-muted font-light mt-1">
            {t('admin.contenido.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Sélecteur de Mode d'Affichage (Dividido / Solo Editor / Solo Vista Previa) */}
          <div className="hidden sm:flex items-center border border-foeg-border bg-white text-xs p-0.5">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setViewLayout('split')}
              title={t('admin.cms.viewSplit')}
              className={`px-3 py-1.5 uppercase tracking-wider text-[10px] transition-colors cursor-pointer flex items-center space-x-1.5 ${viewLayout === 'split' ? 'bg-foeg-navy text-white font-medium' : 'text-foeg-muted hover:text-foeg-black'
                }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{t('admin.cms.viewSplit')}</span>
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setViewLayout('editor')}
              title={t('admin.cms.viewEditor')}
              className={`px-3 py-1.5 uppercase tracking-wider text-[10px] transition-colors cursor-pointer ${viewLayout === 'editor' ? 'bg-foeg-navy text-white font-medium' : 'text-foeg-muted hover:text-foeg-black'
                }`}
            >
              <span>{t('admin.cms.viewEditor')}</span>
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setViewLayout('preview')}
              title={t('admin.cms.viewPreview')}
              className={`px-3 py-1.5 uppercase tracking-wider text-[10px] transition-colors cursor-pointer ${viewLayout === 'preview' ? 'bg-foeg-navy text-white font-medium' : 'text-foeg-muted hover:text-foeg-black'
                }`}
            >
              <span>{t('admin.cms.viewPreview')}</span>
            </button>
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={handleInitDefaults}
            className="inline-flex items-center justify-center space-x-2 bg-white border border-foeg-border hover:border-foeg-navy text-foeg-black px-4 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1.5} />
            <span>{t('admin.cms.reset')}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PESTAÑAS ESTILO HAUTE COUTURE (IDÉNTICAS A LA CAPTURA 2, SIN SCROLLBAR FEO)
      ========================================================================= */}
      <nav
        className="flex items-center space-x-6 sm:space-x-10 overflow-x-auto pb-0 mb-6 border-b border-foeg-border/80 scrollbar-none no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Sections du CMS"
      >
        {sectionTabs.map((tab) => {
          const isActive = selectedSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              suppressHydrationWarning
              onClick={() => setSelectedSection(tab.id as any)}
              className={`py-2.5 transition-colors duration-200 cursor-pointer whitespace-nowrap text-xs tracking-[0.16em] ${isActive
                ? 'text-foeg-black font-medium border-b-2 border-foeg-black'
                : 'text-foeg-muted hover:text-foeg-black font-light border-b-2 border-transparent'
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* =========================================================================
          LAYOUT EXPANDIDO RESPONSIVE (SPLIT SCREEN / SOLO EDITOR / SOLO APERÇU)
      ========================================================================= */}
      <div
        className={`grid gap-8 items-start ${viewLayout === 'split'
          ? 'grid-cols-1 lg:grid-cols-2'
          : viewLayout === 'editor'
            ? 'grid-cols-1 max-w-4xl mx-auto'
            : 'grid-cols-1'
          }`}
      >
        {/* COLUMNA FORMULARIOS DE EDICIÓN */}
        {viewLayout !== 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-foeg-muted pb-2">
              <span>
                {filteredContent.length} {t('admin.cms.itemsCount')}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-foeg-navy bg-foeg-surface px-2.5 py-1 border border-foeg-border font-medium flex items-center space-x-1.5">
                <Globe className="w-3 h-3 text-foeg-navy" strokeWidth={1.5} />
                <span>FR · EN · ES</span>
              </span>
            </div>

            <div className="space-y-6">
              {filteredContent.map((item) => {
                const isMedia = isMediaKey(item.key);
                const isSaving = savingKey === item.id;
                const isTranslating = translatingKey === item.id;
                const isVideoField = item.key.includes('video') || item.key.includes('reel');

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-foeg-border/80 p-6 space-y-5 shadow-subtle hover:border-foeg-navy/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-foeg-border/60 pb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1.5">
                          <span className="text-[9px] uppercase tracking-[0.25em] text-foeg-navy font-semibold px-2 py-0.5 bg-foeg-surface border border-foeg-border inline-block">
                            {item.section} · {item.key}
                          </span>
                          {isVideoField && (
                            <span className="text-[9px] uppercase tracking-widest bg-foeg-navy text-white px-2 py-0.5 font-mono">
                              VÍDEO / REEL
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-lg text-foeg-black font-normal">
                          {getLabelForKey(item.key)}
                        </h3>
                      </div>

                      {!isMedia && (
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => handleAutoTranslateItem(item)}
                          disabled={isTranslating}
                          title={t('admin.cms.translate3')}
                          className="inline-flex items-center space-x-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1.5 border border-foeg-border hover:border-foeg-navy text-foeg-navy hover:bg-foeg-navy hover:text-white transition-all cursor-pointer shrink-0"
                        >
                          {isTranslating ? (
                            <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.5} />
                          ) : (
                            <Languages className="w-3.5 h-3.5" strokeWidth={1.5} />
                          )}
                          <span>{isTranslating ? t('admin.cms.translating') : t('admin.cms.translate3')}</span>
                        </button>
                      )}
                    </div>

                    {isMedia ? (
                      /* Media Uploader (Images & Videos / Reels) */
                      <div className="space-y-3">
                        <ImageUpload
                          value={item.valueFr}
                          allowVideo={true}
                          aspectRatio={isVideoField ? '9/16' : 'portrait'}
                          onUploadSuccess={(url: string) => {
                            handleInputChange(item.id, 'valueFr', url);
                            handleInputChange(item.id, 'valueEn', url);
                            handleInputChange(item.id, 'valueEs', url);
                          }}
                          label={
                            isVideoField
                              ? language === 'es'
                                ? 'Cargar vídeo o reel vertical (MP4, WEBM, MOV)'
                                : language === 'en'
                                  ? 'Upload vertical video or reel (MP4, WEBM, MOV)'
                                  : 'Téléverser une vidéo ou reel vertical (MP4, WEBM, MOV)'
                              : language === 'es'
                                ? 'Cargar fotografía de alta resolución'
                                : language === 'en'
                                  ? 'Upload high-resolution editorial photograph'
                                  : 'Téléverser une image de haute confection'
                          }
                        />
                      </div>
                    ) : (
                      /* Editor Multilingüe (FR, EN, ES) */
                      <div className="space-y-4">
                        {/* Français (Langue Source) */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-foeg-navy font-semibold flex items-center justify-between">
                            <span>{t('admin.cms.frLang')}</span>
                            <span className="text-[9px] text-foeg-muted font-normal">FR</span>
                          </label>
                          {item.valueFr.length > 80 ? (
                            <textarea
                              rows={3}
                              suppressHydrationWarning
                              value={item.valueFr}
                              onChange={(e) => handleInputChange(item.id, 'valueFr', e.target.value)}
                              className="w-full text-xs font-light text-foeg-black p-3 border border-foeg-border focus:border-foeg-navy focus:outline-none bg-foeg-surface/20"
                            />
                          ) : (
                            <input
                              type="text"
                              suppressHydrationWarning
                              value={item.valueFr}
                              onChange={(e) => handleInputChange(item.id, 'valueFr', e.target.value)}
                              className="w-full text-xs font-light text-foeg-black p-2.5 border border-foeg-border focus:border-foeg-navy focus:outline-none bg-foeg-surface/20"
                            />
                          )}
                        </div>

                        {/* Anglais */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium flex items-center justify-between">
                            <span>{t('admin.cms.enLang')}</span>
                            <span className="text-[9px] text-foeg-muted font-normal">EN</span>
                          </label>
                          {item.valueEn.length > 80 ? (
                            <textarea
                              rows={2}
                              suppressHydrationWarning
                              value={item.valueEn}
                              onChange={(e) => handleInputChange(item.id, 'valueEn', e.target.value)}
                              className="w-full text-xs font-light text-foeg-black p-3 border border-foeg-border focus:border-foeg-navy focus:outline-none bg-white"
                            />
                          ) : (
                            <input
                              type="text"
                              suppressHydrationWarning
                              value={item.valueEn}
                              onChange={(e) => handleInputChange(item.id, 'valueEn', e.target.value)}
                              className="w-full text-xs font-light text-foeg-black p-2.5 border border-foeg-border focus:border-foeg-navy focus:outline-none bg-white"
                            />
                          )}
                        </div>

                        {/* Espagnol */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium flex items-center justify-between">
                            <span>{t('admin.cms.esLang')}</span>
                            <span className="text-[9px] text-foeg-muted font-normal">ES</span>
                          </label>
                          {item.valueEs.length > 80 ? (
                            <textarea
                              rows={2}
                              suppressHydrationWarning
                              value={item.valueEs}
                              onChange={(e) => handleInputChange(item.id, 'valueEs', e.target.value)}
                              className="w-full text-xs font-light text-foeg-black p-3 border border-foeg-border focus:border-foeg-navy focus:outline-none bg-white"
                            />
                          ) : (
                            <input
                              type="text"
                              suppressHydrationWarning
                              value={item.valueEs}
                              onChange={(e) => handleInputChange(item.id, 'valueEs', e.target.value)}
                              className="w-full text-xs font-light text-foeg-black p-2.5 border border-foeg-border focus:border-foeg-navy focus:outline-none bg-white"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bouton de sauvegarde par élément */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        suppressHydrationWarning
                        disabled={isSaving}
                        onClick={() => handleSaveItem(item)}
                        className="px-5 py-2.5 bg-foeg-navy text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-colors cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                            <span>{t('admin.cms.saving')}</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>{t('admin.cms.save')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            PANEL DE VISTA PREVIA PERMANENTE (DISEÑO HAUTE COUTURE FOEG PARIS)
        ========================================================================= */}
        {viewLayout !== 'editor' && (
          <div
            className={`transition-all duration-300 ${isFullscreen
              ? 'fixed inset-0 z-50 bg-[#0E172A]/98 backdrop-blur-xl flex flex-col p-4 sm:p-6 select-none'
              : viewLayout === 'preview'
                ? 'h-[calc(100vh-140px)] w-full flex flex-col border border-foeg-border/80 bg-neutral-900 shadow-subtle overflow-hidden'
                : 'hidden lg:flex sticky top-24 h-[calc(100vh-140px)] w-full flex flex-col border border-foeg-border/80 bg-neutral-900 shadow-subtle overflow-hidden'
              }`}
          >
            {/* Barra de Control Haute Couture Organizada en 2 Niveles — Cero Scrollbars, Geometría Arquitectónica FOEG */}
            <div className="bg-[#1B2A4A] text-white border-b border-white/15 shrink-0 overflow-hidden divide-y divide-white/10 select-none">
              {/* FILA 1: Identidad de Marca & Acciones de Ventana / Tienda */}
              <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
                {/* Lado Izquierdo: Ojo + Título + Resolución / Zoom */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-7 h-7 bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <Eye className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="truncate">
                    <span className="font-serif text-xs sm:text-sm tracking-[0.2em] uppercase font-normal block leading-tight text-white truncate">
                      {isFullscreen ? 'Studio Maison FOEG Paris' : t('admin.cms.previewTitle')}
                    </span>
                    <span className="text-[10px] text-white/50 font-light block leading-tight tracking-wider uppercase mt-0.5 truncate">
                      {deviceConfigs[previewDevice].label} ({deviceConfigs[previewDevice].tag}) · Zoom {percentZoom}%
                    </span>
                  </div>
                </div>

                {/* Lado Derecho: Acciones de Control (Recargar, Pantalla Completa, Abrir Tienda) */}
                <div className="flex items-center space-x-2 shrink-0">
                  {/* Recargar tienda */}
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={refreshPreview}
                    title={language === 'es' ? 'Recargar tienda' : 'Recharger la boutique'}
                    className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer rounded-none"
                  >
                    <RotateCw className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>

                  {/* Salir / Entrar Pantalla Completa */}
                  {isFullscreen ? (
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setIsFullscreen(false)}
                      title={t('admin.cms.exitFullscreen')}
                      className="h-8 px-3 sm:px-4 border border-white/30 hover:border-white text-white hover:bg-white hover:text-foeg-navy rounded-none text-[10px] uppercase tracking-[0.2em] font-medium flex items-center space-x-2 transition-all duration-200 cursor-pointer shadow-subtle shrink-0"
                    >
                      <Minimize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span className="hidden sm:inline">{t('admin.cms.exitFullscreen')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setIsFullscreen(true)}
                      title={t('admin.cms.fullscreen')}
                      className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer rounded-none"
                    >
                      <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  )}

                  {!isFullscreen && (
                    <a
                      href={previewPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={language === 'es' ? 'Abrir en pestaña nueva' : 'Ouvrir dans un nouvel onglet'}
                      className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer rounded-none"
                    >
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </a>
                  )}
                </div>
              </div>

              {/* FILA 2 (DEBAJO BIEN ORGANIZADO): Selector de Dispositivos & Herramientas de Zoom */}
              <div className="px-4 sm:px-6 py-2 bg-[#14213B] flex flex-wrap items-center justify-between gap-2.5">
                {/* Selector de Dispositivos Editorial FOEG (Ordenador / Tableta / Móvil) */}
                <div className="flex items-center border border-white/20 bg-black/30 divide-x divide-white/20 rounded-none shrink-0 shadow-sm">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 sm:px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] flex items-center space-x-1.5 sm:space-x-2 transition-colors cursor-pointer rounded-none ${previewDevice === 'desktop'
                      ? 'bg-white text-foeg-navy font-semibold shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10 font-light'
                      }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>{deviceConfigs.desktop.label}</span>
                  </button>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setPreviewDevice('tablet')}
                    className={`px-3 sm:px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] flex items-center space-x-1.5 sm:space-x-2 transition-colors cursor-pointer rounded-none ${previewDevice === 'tablet'
                      ? 'bg-white text-foeg-navy font-semibold shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10 font-light'
                      }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span>{deviceConfigs.tablet.label}</span>
                  </button>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 sm:px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] flex items-center space-x-1.5 sm:space-x-2 transition-colors cursor-pointer rounded-none ${previewDevice === 'mobile'
                      ? 'bg-white text-foeg-navy font-semibold shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10 font-light'
                      }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{deviceConfigs.mobile.label}</span>
                  </button>
                </div>

                {/* Cluster de Zoom Editorial Haute Couture */}
                <div className="flex items-center border border-white/20 bg-black/30 divide-x divide-white/20 rounded-none text-xs shrink-0 shadow-sm">
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleZoomOut}
                    title="Reducir zoom (-10%)"
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer rounded-none"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleResetZoom}
                    title="Restablecer zoom a Auto-fit"
                    className="px-2.5 sm:px-3 py-1 text-[10px] font-mono tracking-widest text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer rounded-none font-medium"
                  >
                    {percentZoom}%
                  </button>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={handleZoomIn}
                    title="Aumentar zoom (+10%)"
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer rounded-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {/* Presets Rápidos en Rectángulos Finos */}
                  <div className="flex items-center divide-x divide-white/20">
                    {(['auto', 75, 100, 125] as const).map((z) => {
                      const isSelected = z === 'auto' ? manualZoom === null : manualZoom === z / 100;
                      return (
                        <button
                          key={String(z)}
                          type="button"
                          suppressHydrationWarning
                          onClick={() => {
                            if (z === 'auto') setManualZoom(null);
                            else setManualZoom(z / 100);
                          }}
                          className={`px-2 sm:px-2.5 py-1 text-[9px] uppercase font-mono tracking-wider transition-colors cursor-pointer rounded-none ${isSelected
                            ? 'bg-white text-foeg-navy font-semibold shadow-sm'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                        >
                          {z === 'auto' ? 'Auto' : `${z}%`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Viewport de Prévisualisation Permanente — Fond Studio Haute Couture */}
            <div
              ref={previewViewportRef}
              className="flex-1 bg-[#0A0E17] flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none relative"
            >
              {!isMounted ? (
                <div className="flex flex-col items-center justify-center space-y-3 text-white/50 py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                  <span className="text-[10px] uppercase tracking-widest font-mono">
                    Chargement du Studio Aperçu...
                  </span>
                </div>
              ) : previewDevice === 'mobile' ? (
                /* Châssis Smartphone iPhone de Haute Confection - PLUS LARGE (440px) avec Barre iOS Dédiée */
                <div
                  style={{
                    width: `${440 * effectiveScale}px`,
                    height: `${880 * effectiveScale}px`,
                    transition: 'width 0.2s ease-out, height 0.2s ease-out',
                  }}
                  className="relative bg-neutral-950 rounded-[48px] p-[10px] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.95)] border-[2.5px] border-[#222B3D] flex flex-col overflow-hidden my-auto shrink-0"
                >
                  <div className="w-full h-full rounded-[38px] overflow-hidden bg-white relative flex flex-col">
                    {/* Barre de Statut iOS Dédiée (Empêche l'encoche d'obstruer le logo FOEG) */}
                    <div
                      style={{ height: `${42 * effectiveScale}px` }}
                      className="w-full bg-[#161616] text-white flex items-center justify-between px-6 shrink-0 relative z-30 select-none overflow-hidden"
                    >
                      <span
                        style={{ fontSize: `${Math.max(9, 13 * effectiveScale)}px` }}
                        className="font-medium tracking-tight text-white/95"
                      >
                        9:41
                      </span>

                      {/* Île Dynamique (Pilule Noire Réaliste) */}
                      <div
                        style={{
                          width: `${115 * effectiveScale}px`,
                          height: `${24 * effectiveScale}px`,
                        }}
                        className="bg-black rounded-full border border-white/10 shadow-inner flex items-center justify-end pr-2.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-700" />
                      </div>

                      {/* Indicateurs Réseau, Wifi et Batterie */}
                      <div
                        style={{ fontSize: `${Math.max(9, 12 * effectiveScale)}px` }}
                        className="flex items-center space-x-1.5 text-white/90"
                      >
                        <Signal style={{ width: `${13 * effectiveScale}px`, height: `${13 * effectiveScale}px` }} />
                        <Wifi style={{ width: `${13 * effectiveScale}px`, height: `${13 * effectiveScale}px` }} />
                        <Battery style={{ width: `${15 * effectiveScale}px`, height: `${15 * effectiveScale}px` }} />
                      </div>
                    </div>

                    {/* Conteneur de l'Iframe Mobile - Largeur 440px */}
                    <div className="flex-1 relative overflow-hidden bg-white">
                      <iframe
                        ref={iframeRef}
                        key={previewKey}
                        src={`${previewPath}?preview=true&v=${previewKey}`}
                        title="Aperçu Mobile FOEG Paris"
                        style={{
                          width: '440px',
                          height: `${880 - 42 - 20}px`,
                          transform: `scale(${effectiveScale})`,
                          transformOrigin: 'top left',
                        }}
                        className="border-0 absolute top-0 left-0"
                      />
                    </div>

                    {/* Barre d'accueil inférieure iOS */}
                    <div
                      style={{ height: `${20 * effectiveScale}px` }}
                      className="w-full bg-white flex items-center justify-center shrink-0 z-20 pointer-events-none"
                    >
                      <div
                        style={{
                          width: `${135 * effectiveScale}px`,
                          height: `${4 * effectiveScale}px`,
                        }}
                        className="bg-neutral-800/40 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ) : previewDevice === 'tablet' ? (
                /* Châssis Tablette (iPad Pro 768px) */
                <div
                  style={{
                    width: `${768 * effectiveScale}px`,
                    height: `${1024 * effectiveScale}px`,
                    transition: 'width 0.2s ease-out, height 0.2s ease-out',
                  }}
                  className="relative bg-neutral-900 rounded-[24px] p-[10px] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.95)] border-2 border-[#222B3D] flex flex-col overflow-hidden my-auto shrink-0"
                >
                  <div className="w-full h-full rounded-[16px] overflow-hidden bg-white relative">
                    <iframe
                      ref={iframeRef}
                      key={previewKey}
                      src={`${previewPath}?preview=true&v=${previewKey}`}
                      title="Aperçu Tablette FOEG Paris"
                      style={{
                        width: '768px',
                        height: '1024px',
                        transform: `scale(${effectiveScale})`,
                        transformOrigin: 'top left',
                      }}
                      className="border-0 absolute top-0 left-0"
                    />
                  </div>
                </div>
              ) : (
                /* Émulation Ordinateur Bureau PC Réel (1280px) */
                <div
                  style={{
                    width: `${1280 * effectiveScale}px`,
                    height: '100%',
                    minHeight: `${desktopScaledHeight * effectiveScale}px`,
                    transition: 'width 0.2s ease-out',
                  }}
                  className="relative bg-white shadow-2xl overflow-hidden border border-neutral-700/50 flex flex-col"
                >
                  <iframe
                    ref={iframeRef}
                    key={previewKey}
                    src={`${previewPath}?preview=true&v=${previewKey}`}
                    title="Aperçu Bureau PC FOEG Paris"
                    style={{
                      width: '1280px',
                      height: `${desktopScaledHeight}px`,
                      transform: `scale(${effectiveScale})`,
                      transformOrigin: 'top left',
                    }}
                    className="border-0 absolute top-0 left-0 w-[1280px]"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
