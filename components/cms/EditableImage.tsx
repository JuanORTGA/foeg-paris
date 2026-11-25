'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Video,
  UploadCloud,
  X,
  Check,
  Loader2,
  Link as LinkIcon,
  GripHorizontal,
} from 'lucide-react';
import MediaBox, { isVideoUrl } from '@/components/ui/MediaBox';
import { useCmsEditor } from '@/lib/cms-context';
import { updateContentField, updateImageGrayscale } from '@/app/admin/cms/actions';

export interface EditableMediaProps {
  contentKey: string;
  defaultSrc: string;
  defaultGrayscale?: boolean;
  alt?: string;
  aspectRatio?: '3/4' | '16/9' | '9/16' | '1/1' | 'full' | 'auto' | string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  label?: string;
  sizes?: string;
  muted?: boolean;
  isVideo?: boolean;
  heroControls?: boolean;
}

export default function EditableImage({
  contentKey,
  defaultSrc,
  defaultGrayscale = false,
  alt = 'FOEG Paris',
  aspectRatio = '3/4',
  className = '',
  imageClassName = '',
  priority = false,
  label = 'Média',
  sizes,
  muted = true,
  isVideo: isVideoProp = false,
  heroControls = false,
}: EditableMediaProps) {
  const router = useRouter();
  const { isEditing, registerSaveStart, registerSaveEnd } = useCmsEditor();
  const [currentSrc, setCurrentSrc] = useState(defaultSrc);
  const [isGrayscale, setIsGrayscale] = useState(defaultGrayscale);
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Valeurs temporaires lors de l'édition dans le modal
  const [tempSrc, setTempSrc] = useState(defaultSrc);
  const [tempGrayscale, setTempGrayscale] = useState(defaultGrayscale);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Fenêtre modale déplaçable (Draggable Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPos, setModalPos] = useState<{ x: number; y: number }>({ x: 30, y: 15 });
  const [mounted, setMounted] = useState(false);
  const isDraggingModal = useRef(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 30, initialY: 15 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasUserUploaded = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!hasUserUploaded.current) {
      setCurrentSrc(defaultSrc);
      setTempSrc(defaultSrc);
    }
  }, [defaultSrc]);

  useEffect(() => {
    setIsGrayscale(defaultGrayscale);
    setTempGrayscale(defaultGrayscale);
  }, [defaultGrayscale]);

  // Si no está en modo de edición, renderizamos MediaBox directamente con el estilo de tienda pública
  const effectiveGrayscaleClass = isGrayscale ? 'grayscale contrast-[1.05]' : '';
  const combinedImageClassName = `${imageClassName} ${effectiveGrayscaleClass}`.trim();

  if (!isEditing) {
    return (
      <MediaBox
        src={currentSrc}
        alt={alt}
        aspectRatio={aspectRatio}
        className={className}
        imageClassName={combinedImageClassName}
        priority={priority}
        sizes={sizes}
        muted={muted}
      />
    );
  }

  // Ouverture du modal avec synchronisation des états temporaires
  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTempSrc(currentSrc);
    setTempGrayscale(isGrayscale);
    setErrorMsg(null);
    setModalPos((prev) => ({
      x: prev.x !== 30 ? prev.x : Math.max(15, Math.min(30, window.innerWidth - 440)),
      y: Math.min(prev.y, 15),
    }));
    setIsModalOpen(true);
  };

  // Fermeture du modal sans enregistrer
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowUrlInput(false);
    setErrorMsg(null);
  };

  // Glisser-déposer de la boîte modale par sa barre d'en-tête
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingModal.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: modalPos.x,
      initialY: modalPos.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingModal.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;
      const nextX = Math.max(10, Math.min(window.innerWidth - 420, dragStartRef.current.initialX + dx));
      const nextY = Math.max(5, Math.min(window.innerHeight - 80, dragStartRef.current.initialY + dy));
      setModalPos({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      isDraggingModal.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleHeaderTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    isDraggingModal.current = true;
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: modalPos.x,
      initialY: modalPos.y,
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isDraggingModal.current || moveEvent.touches.length !== 1) return;
      const moveTouch = moveEvent.touches[0];
      const dx = moveTouch.clientX - dragStartRef.current.startX;
      const dy = moveTouch.clientY - dragStartRef.current.startY;
      const nextX = Math.max(5, Math.min(window.innerWidth - 300, dragStartRef.current.initialX + dx));
      const nextY = Math.max(5, Math.min(window.innerHeight - 80, dragStartRef.current.initialY + dy));
      setModalPos({ x: nextX, y: nextY });
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      isDraggingModal.current = false;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  };

  // Téléversement de fichier (Image ou Vidéo)
  const handleUploadFile = async (file: File) => {
    setUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors du téléversement.');
      }

      const uploadedUrl = data.secure_url;
      setTempSrc(uploadedUrl);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors du téléversement');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!manualUrl.trim()) return;
    setTempSrc(manualUrl.trim());
    setManualUrl('');
    setShowUrlInput(false);
  };

  // PASO 3: Appliquer les modifications et enregistrer en base de données Neon
  const handleApplyAllModifications = async () => {
    registerSaveStart(contentKey);
    setUploading(true);
    setErrorMsg(null);

    try {
      // 1. Sauvegarde de la nouvelle source si elle a changé
      if (tempSrc !== currentSrc) {
        hasUserUploaded.current = true;
        setCurrentSrc(tempSrc);
        const saveRes = await updateContentField(contentKey, tempSrc);
        if (!saveRes.success) {
          throw new Error(saveRes.error || 'Erreur de sauvegarde média.');
        }
      }

      // 2. Sauvegarde du filtre Noir & Blanc si modifié
      if (tempGrayscale !== isGrayscale) {
        setIsGrayscale(tempGrayscale);
        const grayRes = await updateImageGrayscale(contentKey, tempGrayscale);
        if (!grayRes.success) {
          throw new Error(grayRes.error || 'Erreur de sauvegarde filtre.');
        }
      }

      setIsSaved(true);
      registerSaveEnd(contentKey, true);
      setIsModalOpen(false);
      setTimeout(() => setIsSaved(false), 3000);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur lors de l’enregistrement');
      registerSaveEnd(contentKey, false);
    } finally {
      setUploading(false);
    }
  };

  const isVideo = isVideoProp || isVideoUrl(tempSrc || currentSrc) || contentKey.includes('video') || contentKey.includes('reel');

  // =========================================================================
  // MODAL DE LUXE MINIMALISTE (FOND BLANC CASSÉ #F7F5F0 · BORDURES RECTILIGNES)
  // =========================================================================
  const modalContent = isModalOpen && mounted ? (
    <>
      {/* Fond sombre translucide subtil - clic en dehors pour fermer sans quitter le CMS */}
      <div
        className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[2px] transition-opacity animate-fadeIn"
        onClick={handleCloseModal}
      />

      {/* Fenêtre modale arrastrable Haute Couture */}
      <div
        style={{ top: `${modalPos.y}px`, left: `${modalPos.x}px` }}
        className="fixed z-[9999] w-[390px] sm:w-[430px] max-w-[94vw] max-h-[calc(100vh-25px)] flex flex-col bg-[#F7F5F0] text-foeg-black border border-[#E5E0D8] shadow-[0_20px_50px_rgba(0,0,0,0.25)] rounded-none overflow-hidden select-none animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre d'en-tête (Grip Header Arrastrable) */}
        <div
          onMouseDown={handleHeaderMouseDown}
          onTouchStart={handleHeaderTouchStart}
          className="shrink-0 flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 bg-[#EFECE6] border-b border-[#E5E0D8] cursor-move select-none touch-none"
          title="Arrastre para mover esta ventana (Mouse o Dedo en móvil)"
        >
          <div className="flex items-center space-x-2">
            <GripHorizontal className="w-3.5 h-3.5 text-foeg-muted" strokeWidth={1.5} />
            <span className="font-serif text-xs uppercase tracking-[0.25em] text-foeg-black font-normal">
              Média · Éditeur
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <span className="text-[9px] uppercase tracking-wider font-mono text-foeg-muted truncate max-w-[120px]">
              {contentKey}
            </span>
            <button
              type="button"
              onClick={handleCloseModal}
              className="text-foeg-muted hover:text-foeg-black p-1 transition-colors cursor-pointer"
              title="Fermer sans enregistrer"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Corps du modal défilable pour écrans compacts ou zoom */}
        <div className="p-4 sm:p-5 space-y-3 text-left overflow-y-auto flex-1">
          {/* PASO 1 (Subida): Zone Dropzone Minimaliste */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingFile(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleUploadFile(f);
            }}
            className={`border border-dashed p-3.5 sm:p-4 text-center transition-all cursor-pointer ${
              isDraggingFile
                ? 'border-foeg-navy bg-white shadow-xs'
                : 'border-[#D5D0C5] hover:border-foeg-navy bg-white/70 hover:bg-white'
            }`}
          >
            <UploadCloud className="w-5 h-5 text-foeg-navy/70 mx-auto mb-1.5" strokeWidth={1.2} />
            <p className="text-xs uppercase tracking-wider text-foeg-black font-light">
              Glisser-déposer un fichier ici
            </p>
            <p className="text-[10px] text-foeg-muted font-light mt-0.5">
              ou cliquer pour sélectionner depuis votre ordinateur
            </p>
            <span className="inline-block mt-1.5 text-[9px] text-foeg-navy uppercase tracking-widest font-mono border-b border-foeg-navy/30 pb-0.5">
              Sélectionner un fichier
            </span>
          </div>

          {/* PASO 2 (Vista Previa et Finition N&B) */}
          <div className="space-y-2.5">
            {/* Aperçu miniature */}
            <div className="relative w-full h-28 sm:h-32 bg-[#EFECE6] overflow-hidden border border-[#E5E0D8] flex items-center justify-center">
              <MediaBox
                src={tempSrc}
                alt="Aperçu"
                aspectRatio="full"
                className="w-full h-full"
                imageClassName={`object-cover ${tempGrayscale ? 'grayscale contrast-[1.05]' : ''}`}
                muted={true}
              />
              {uploading && (
                <div className="absolute inset-0 bg-[#F7F5F0]/85 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-10">
                  <Loader2 className="w-5 h-5 text-foeg-navy animate-spin" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase tracking-widest text-foeg-navy font-light">
                    Téléversement en cours...
                  </span>
                </div>
              )}
            </div>

            {/* Interruptor Haute Couture: Couleur / Noir & Blanc */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white border border-[#E5E0D8]">
              <div className="space-y-0.5">
                <span className="text-xs uppercase tracking-wider font-normal text-foeg-black block">
                  Finition Visuelle
                </span>
                <span className="text-[10px] text-foeg-muted font-light block">
                  {tempGrayscale ? 'Noir & Blanc (Monochrome)' : 'Couleur (Naturelle)'}
                </span>
              </div>

              {/* Bouton double état */}
              <div className="flex items-center bg-[#EFECE6] p-0.5 border border-[#E5E0D8] text-[10px] uppercase tracking-wider font-mono">
                <button
                  type="button"
                  onClick={() => setTempGrayscale(false)}
                  className={`px-3 py-1.5 transition-all cursor-pointer ${
                    !tempGrayscale
                      ? 'bg-white text-foeg-navy font-semibold shadow-xs'
                      : 'text-foeg-muted hover:text-foeg-black'
                  }`}
                >
                  Couleur
                </button>
                <button
                  type="button"
                  onClick={() => setTempGrayscale(true)}
                  className={`px-3 py-1.5 transition-all cursor-pointer ${
                    tempGrayscale
                      ? 'bg-white text-foeg-navy font-semibold shadow-xs'
                      : 'text-foeg-muted hover:text-foeg-black'
                  }`}
                >
                  Noir & Blanc
                </button>
              </div>
            </div>
          </div>

          {/* Option secondaire discrète pour coller une URL */}
          <div className="pt-0.5">
            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="text-[9px] uppercase tracking-wider text-foeg-muted hover:text-foeg-black underline decoration-foeg-muted/40 transition-colors"
              >
                + Ou saisir une URL directe
              </button>
            ) : (
              <div className="flex gap-2 animate-fadeIn">
                <input
                  type="url"
                  placeholder="https://... (.jpg, .png, .mp4)"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="flex-1 bg-white border border-[#E5E0D8] px-3 py-1 text-xs text-foeg-black placeholder:text-foeg-muted focus:outline-none focus:border-foeg-navy"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="bg-[#1B2A4A] text-white text-[10px] uppercase tracking-wider px-3 py-1 font-light hover:bg-black transition-colors"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          {/* Message d'erreur éventuel */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] px-3 py-2 font-light">
              {errorMsg}
            </div>
          )}

          {/* PASO 3: Bouton de confirmation en bleu marine FOEG */}
          <div className="pt-1.5">
            <button
              type="button"
              onClick={handleApplyAllModifications}
              disabled={uploading}
              className="w-full py-3 bg-[#1B2A4A] hover:bg-black text-white text-xs uppercase tracking-[0.22em] font-light transition-all shadow-subtle flex items-center justify-center space-x-2 cursor-pointer rounded-none disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
              )}
              <span>Appliquer les modifications</span>
            </button>
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className={`relative group/editable-media ${className}`}>
      {/* Contenu visuel interactif */}
      <MediaBox
        src={currentSrc}
        alt={alt}
        aspectRatio={aspectRatio}
        className="w-full h-full"
        imageClassName={`${combinedImageClassName} transition-opacity duration-300 ${uploading ? 'opacity-40' : 'opacity-100'}`}
        priority={priority}
        sizes={sizes}
        muted={muted}
      />

      {/* Input de type file masqué pour sélection locale */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime,video/mov"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* =========================================================================
          TAREA 1: DISPARADOR MINIMALISTE DE LUJO SILENCIOSO
          Petit cercle blanc semi-transparent avec blur et icône strokeWidth={1.5}
      ========================================================================= */}
      {/* Cercle flottant centré qui apparaît en douceur au survol (hover) */}
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center p-4">
        <button
          type="button"
          onClick={handleOpenModal}
          className="pointer-events-auto opacity-0 group-hover/editable-media:opacity-100 transition-all duration-300 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/85 hover:bg-white text-foeg-navy shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/80 backdrop-blur-md flex items-center justify-center cursor-pointer transform scale-95 group-hover/editable-media:scale-100 hover:scale-105 active:scale-90"
          title={`${label} · Cliquer pour modifier`}
          aria-label={`${label} · Cliquer pour modifier`}
        >
          {isVideo ? (
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-foeg-navy" strokeWidth={1.5} />
          ) : (
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-foeg-navy" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Bouton d'accès d'angle discret au survol (garantit 100% cliquable hors texte) */}
      <div className="absolute top-3 right-3 z-30 pointer-events-none">
        <button
          type="button"
          onClick={handleOpenModal}
          className="pointer-events-auto opacity-0 group-hover/editable-media:opacity-90 hover:opacity-100 transition-opacity duration-300 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-foeg-navy shadow-subtle border border-white/60 backdrop-blur-xs flex items-center justify-center cursor-pointer"
          title={`${label} · Cliquer pour modifier`}
        >
          {isVideo ? (
            <Video className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1.5} />
          ) : (
            <Camera className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Badge Succès Haute Couture discret */}
      {isSaved && (
        <div className="absolute bottom-3 left-3 z-30 bg-[#1B2A4A] text-white text-[9px] uppercase tracking-widest px-3 py-1.5 flex items-center space-x-1.5 shadow-floating animate-fadeIn font-light border border-white/20">
          <Check className="w-3 h-3 text-emerald-400" strokeWidth={1.5} />
          <span>Modifications appliquées</span>
        </div>
      )}

      {/* Modal Déplaçable Portal (attaché à document.body pour ne jamais être tronqué) */}
      {mounted && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null}
    </div>
  );
}

// Alias officiel EditableMedia pour usage universel
export const EditableMedia = EditableImage;
