'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Copy,
  Check,
  Upload,
  Search,
  Plus,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import MediaBox from '@/components/ui/MediaBox';
import ImageUpload from '@/components/admin/ImageUpload';
import { MediaItem, addMediaItem } from './actions';
import { useLanguage } from '@/lib/language-context';

interface AdminMediaClientProps {
  initialMedia: MediaItem[];
}

export default function AdminMediaClient({ initialMedia }: AdminMediaClientProps) {
  const { t, language } = useLanguage();
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const categories = [
    { key: 'all', label: t('admin.media.catAll'), raw: 'Toutes' },
    { key: 'products', label: t('admin.media.catProducts'), raw: 'Produits' },
    { key: 'cms', label: t('admin.media.catCms'), raw: 'CMS & Éditorial' },
    { key: 'uploads', label: t('admin.media.catUploads'), raw: 'Téléversements' },
  ];

  const filtered = mediaList.filter((m) => {
    const activeCatObj = categories.find((c) => c.key === selectedCategory);
    const matchesCat =
      selectedCategory === 'all' ||
      m.category === activeCatObj?.raw ||
      m.category === activeCatObj?.label;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setToastMessage(t('admin.media.copyToast'));
    setTimeout(() => setCopiedId(null), 2500);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNewUploadSuccess = async (url: string) => {
    const res = await addMediaItem(url, 'Nouvelle Photographie Atelier');
    if (res.success && res.item) {
      setMediaList([res.item, ...mediaList]);
      setIsUploadOpen(false);
      setToastMessage(t('admin.media.uploadSuccessToast'));
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const currentIndex = previewItem ? filtered.findIndex((m) => m.id === previewItem.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < filtered.length - 1;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasPrev) {
      setPreviewItem(filtered[currentIndex - 1]);
      setZoomLevel(1);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasNext) {
      setPreviewItem(filtered[currentIndex + 1]);
      setZoomLevel(1);
    }
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(1);
  };

  const toggleImageZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => (prev === 1 ? 1.75 : 1));
  };

  useEffect(() => {
    if (!previewItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewItem(null);
        setZoomLevel(1);
      } else if (e.key === 'ArrowLeft') {
        const curIdx = filtered.findIndex((m) => m.id === previewItem.id);
        if (curIdx > 0) {
          setPreviewItem(filtered[curIdx - 1]);
          setZoomLevel(1);
        }
      } else if (e.key === 'ArrowRight') {
        const curIdx = filtered.findIndex((m) => m.id === previewItem.id);
        if (curIdx < filtered.length - 1) {
          setPreviewItem(filtered[curIdx + 1]);
          setZoomLevel(1);
        }
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3));
      } else if (e.key === '-') {
        setZoomLevel((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
      } else if (e.key === '0') {
        setZoomLevel(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewItem, filtered]);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-foeg-navy text-white px-5 py-3.5 shadow-floating text-xs uppercase tracking-wider flex items-center space-x-3 border border-white/20 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-foeg-border/80 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1 font-medium">
            {t('admin.media.tag')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
            {t('admin.media.title')}
          </h1>
          <p className="text-xs text-foeg-muted font-light mt-1">
            {t('admin.media.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(!isUploadOpen)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-foeg-navy text-white hover:bg-black transition-colors text-xs uppercase tracking-[0.2em] font-medium cursor-pointer self-start sm:self-auto shadow-subtle"
        >
          {isUploadOpen ? <X className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
          <span>{isUploadOpen ? t('admin.media.closeUpload') : t('admin.media.uploadBtn')}</span>
        </button>
      </div>

      {/* Zone de Téléversement Direct */}
      {isUploadOpen && (
        <div className="p-6 bg-white border border-foeg-navy shadow-subtle max-w-xl animate-fadeIn space-y-4">
          <div className="flex items-center justify-between border-b border-foeg-border pb-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-foeg-navy font-semibold">
              {language === 'es' ? 'Agregar una nueva foto a la mediateca' : language === 'en' ? 'Add a new image to the media library' : 'Ajouter une nouvelle image à la photothèque'}
            </h3>
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="text-xs text-foeg-muted hover:text-foeg-black"
            >
              {language === 'es' ? 'Cerrar' : language === 'en' ? 'Close' : 'Fermer'}
            </button>
          </div>
          <p className="text-xs text-foeg-muted font-light">
            {language === 'es' ? 'Suba una foto desde su ordenador. Quedará almacenada y disponible de inmediato en su galería.' : language === 'en' ? 'Upload a photo from your computer. It will be stored and available immediately in your gallery.' : 'Téléversez une photo depuis votre ordinateur. Elle sera stockée et disponible immédiatement dans votre galerie.'}
          </p>
          <ImageUpload
            onUploadSuccess={handleNewUploadSuccess}
            label={t('admin.media.uploadBtn')}
          />
        </div>
      )}

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filtres par Catégorie */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${selectedCategory === cat.key
                ? 'bg-foeg-navy text-white font-medium'
                : 'bg-white border border-foeg-border text-foeg-muted hover:text-foeg-black'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Champ de Recherche */}
        <div className="flex items-center bg-white border border-foeg-border px-3.5 py-2 w-full sm:w-72">
          <Search className="w-4 h-4 text-foeg-muted mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.media.searchPlaceholder')}
            className="w-full text-xs text-foeg-black placeholder:text-gray-400 focus:outline-none bg-transparent font-light"
          />
        </div>
      </div>

      {/* Grid des Images */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map((item) => {
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="group relative bg-white border border-foeg-border/80 shadow-subtle overflow-hidden flex flex-col justify-between hover:border-foeg-navy transition-all duration-300"
              >
                {/* Visualisation de l'Image (Aspect Ratio 3/4) */}
                <div
                  onClick={() => {
                    setPreviewItem(item);
                    setZoomLevel(1);
                  }}
                  className="relative aspect-[3/4] bg-foeg-surface overflow-hidden cursor-pointer"
                  title={t('admin.media.enlarge')}
                >
                  <MediaBox
                    src={item.url}
                    alt={item.title}
                    aspectRatio="full"
                    className="w-full h-full"
                    imageClassName="transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Boutons au Survol (Hover) */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-3 space-y-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(item);
                      }}
                      className={`w-full py-2.5 px-3 text-xs uppercase tracking-wider font-medium flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg ${isCopied
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white text-foeg-black hover:bg-foeg-navy hover:text-white'
                        }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>{t('admin.media.copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t('admin.media.copyUrl')}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem(item);
                        setZoomLevel(1);
                      }}
                      className="text-[10px] uppercase tracking-widest text-white/90 hover:text-white underline underline-offset-4 flex items-center space-x-1.5 cursor-pointer py-1"
                      title={t('admin.media.enlarge')}
                    >
                      <span>{t('admin.media.enlarge')}</span>
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Métadonnées de l'Image */}
                <div className="p-3 space-y-1 bg-white border-t border-foeg-border/60">
                  <p className="text-xs text-foeg-black font-medium truncate" title={item.title}>
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-foeg-muted font-light">
                    <span>{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center border border-foeg-border/60 bg-foeg-surface/20 space-y-4">
          <ImageIcon className="w-8 h-8 mx-auto text-foeg-navy stroke-[1.2]" />
          <p className="font-serif text-xl text-foeg-black font-light">
            {language === 'es' ? 'Ninguna imagen coincide con su búsqueda' : language === 'en' ? 'No image matches your search' : 'Aucune image ne correspond à votre recherche'}
          </p>
          <p className="text-xs text-foeg-muted font-light max-w-sm mx-auto">
            {language === 'es' ? 'Suba nuevas fotos o restablezca los filtros para mostrar la fototeca completa.' : language === 'en' ? 'Upload new photos or reset filters to display the complete photo library.' : 'Téléversez de nouvelles photos ou réinitialisez vos filtres pour afficher l’ensemble de la photothèque.'}
          </p>
        </div>
      )}

      {/* MODAL LIGHTBOX / VISOR MINIMALISTA: FOTO SOLA CON LA X EN LA ESQUINA SUPERIOR DERECHA */}
      {previewItem && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setPreviewItem(null);
            setZoomLevel(1);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-[1px] animate-fadeIn select-none"
        >
          {/* Botón X en la esquina superior derecha */}
          <button
            type="button"
            onClick={() => {
              setPreviewItem(null);
              setZoomLevel(1);
            }}
            className="fixed top-5 right-5 sm:top-7 sm:right-7 z-50 p-2.5 bg-foeg-navy/90 hover:bg-black text-white hover:text-white border border-white/20 shadow-floating transition-all cursor-pointer rounded-none group"
            title={`${t('admin.media.closePreview')} (Esc)`}
          >
            <X className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.8} />
          </button>

          {/* Fotografía SOLA (Sin recuadros, fondos ni barras que opaquen) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center animate-scaleIn"
          >
            {/* Flecha Anterior Flotante */}
            {hasPrev && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute -left-4 sm:-left-12 z-20 p-2.5 bg-foeg-navy/85 hover:bg-black text-white border border-white/20 transition-all cursor-pointer backdrop-blur-xs shadow-xl rounded-none"
                title={t('admin.media.prevImage')}
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
              </button>
            )}

            {/* Imagen limpia sin ningún fondo */}
            <div className="relative group overflow-hidden shadow-2xl border border-white/20 bg-transparent">
              <img
                src={previewItem.url}
                alt={previewItem.title}
                onClick={toggleImageZoom}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
                className={`max-h-[85vh] max-w-[88vw] w-auto h-auto object-contain block shadow-2xl transition-transform ${zoomLevel === 1 ? 'cursor-zoom-in' : 'cursor-zoom-out'
                  }`}
              />

              {/* Botón flotante discreto de Copiar URL al pasar el ratón por la foto */}
              <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewItem)}
                  className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium bg-black/80 hover:bg-black text-white border border-white/20 backdrop-blur-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                  title={t('admin.media.copyUrl')}
                >
                  {copiedId === previewItem.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span>{t('admin.media.copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{t('admin.media.copyUrl')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Flecha Siguiente Flotante */}
            {hasNext && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute -right-4 sm:-right-12 z-20 p-2.5 bg-foeg-navy/85 hover:bg-black text-white border border-white/20 transition-all cursor-pointer backdrop-blur-xs shadow-xl rounded-none"
                title={t('admin.media.nextImage')}
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
