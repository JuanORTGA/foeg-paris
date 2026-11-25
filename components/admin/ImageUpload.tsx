'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Check, Loader2, Image as ImageIcon, Video as VideoIcon, SlidersHorizontal, Link as LinkIcon } from 'lucide-react';
import MediaBox, { isVideoUrl } from '@/components/ui/MediaBox';

interface ImageUploadProps {
  value?: string;
  onUploadSuccess: (url: string) => void;
  label?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'full' | '9/16' | string;
  allowVideo?: boolean;
}

declare global {
  interface Window {
    cloudinary?: any;
  }
}

export default function ImageUpload({
  value,
  onUploadSuccess,
  label = 'Photographie ou Vidéo Éditoriale (Haute Couture)',
  aspectRatio = 'portrait',
  allowVideo = true,
}: ImageUploadProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(value || '');
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setCurrentUrl(value);
    }
  }, [value]);

  // Chargement du script officiel du Cloudinary Widget
  useEffect(() => {
    if (!document.getElementById('cloudinary-widget-script')) {
      const script = document.createElement('script');
      script.id = 'cloudinary-widget-script';
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Compression côté client pour les images lourdes
  const compressImageIfNeeded = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/') || file.size < 1.5 * 1024 * 1024) {
      return file;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxWidth = 2200;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleFileProcess = async (file: File) => {
    const isImg = file.type.startsWith('image/');
    const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);

    if (!isImg && !isVid) {
      setErrorMessage('Format non supporté. Veuillez sélectionner une image (JPG, PNG, WEBP) ou une vidéo/reel (MP4, WEBM, MOV).');
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    try {
      const fileToUpload = isImg ? await compressImageIfNeeded(file) : file;
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors du traitement du fichier.');
      }

      const uploadedUrl = data.secure_url;
      setCurrentUrl(uploadedUrl);
      onUploadSuccess(uploadedUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur de téléversement.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleApplyManualUrl = () => {
    if (!manualUrl.trim()) return;
    setCurrentUrl(manualUrl.trim());
    onUploadSuccess(manualUrl.trim());
    setManualUrl('');
  };

  const handleRemoveMedia = () => {
    setCurrentUrl('');
    onUploadSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isCurrentVideo = isVideoUrl(currentUrl);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium flex items-center space-x-2">
          <span>{label}</span>
          {isCurrentVideo && (
            <span className="bg-foeg-navy text-white text-[9px] px-2 py-0.5 uppercase tracking-widest font-mono">
              VÍDEO / REEL
            </span>
          )}
        </label>
        <div className="flex space-x-2 text-[10px] uppercase tracking-wider">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setMode('upload')}
            className={`cursor-pointer transition-colors ${
              mode === 'upload' ? 'text-foeg-navy font-medium underline underline-offset-4' : 'text-foeg-muted hover:text-foeg-black'
            }`}
          >
            Fichier PC
          </button>
          <span className="text-foeg-border">|</span>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setMode('url')}
            className={`cursor-pointer transition-colors ${
              mode === 'url' ? 'text-foeg-navy font-medium underline underline-offset-4' : 'text-foeg-muted hover:text-foeg-black'
            }`}
          >
            Lien URL
          </button>
        </div>
      </div>

      {/* Input de type file masqué */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowVideo ? "image/*,video/mp4,video/webm,video/quicktime,video/mov" : "image/*"}
        suppressHydrationWarning
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Mode Upload / Drag & Drop */}
      {mode === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed p-5 text-center transition-all cursor-pointer relative ${
            isDragOver
              ? 'border-foeg-navy bg-foeg-surface/60'
              : 'border-foeg-border hover:border-foeg-navy/60 bg-foeg-surface/20'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-foeg-navy" />
              <span className="text-xs font-light text-foeg-black">
                Téléversement et optimisation du média en cours...
              </span>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-foeg-navy/5 flex items-center justify-center text-foeg-navy">
                <UploadCloud className="w-5 h-5" strokeWidth={1.5} />
              </div>

              <div>
                <span className="text-xs font-medium text-foeg-black block">
                  Glissez-déposez votre photo ou vidéo / reel ici, ou cliquez pour parcourir
                </span>
                <span className="text-[10px] text-foeg-muted font-light block mt-1">
                  Formats acceptés : JPG, PNG, WEBP, MP4, WEBM, MOV (Reels et vidéos en boucle pris en charge)
                </span>
              </div>

              <div className="pt-1 flex items-center justify-center space-x-3">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="bg-foeg-navy text-white px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-medium hover:bg-foeg-black transition-colors cursor-pointer"
                >
                  Téléverser un média (Photo ou Vidéo)
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mode Lien URL Manuel */
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="url"
              placeholder="https://... (URL directe d’image ou vidéo mp4 / reel)"
              suppressHydrationWarning
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="w-full border border-foeg-border p-2 pl-8 text-xs focus:outline-none focus:border-foeg-navy rounded-none"
            />
            <LinkIcon className="w-3.5 h-3.5 text-foeg-muted absolute left-2.5 top-2.5" />
          </div>
          <button
            type="button"
            suppressHydrationWarning
            onClick={handleApplyManualUrl}
            className="bg-foeg-navy text-white px-4 py-2 text-xs uppercase tracking-wider font-medium hover:bg-foeg-black transition-colors cursor-pointer"
          >
            Appliquer
          </button>
        </div>
      )}

      {errorMessage && (
        <p className="text-[11px] text-red-600 font-light">{errorMessage}</p>
      )}

      {/* Aperçu Haute Couture du Média sélectionné (Image ou Vidéo Reel) */}
      {currentUrl && (
        <div className="p-3 bg-white border border-foeg-border flex items-center space-x-4 animate-fadeIn">
          <div className="w-20 h-24 bg-foeg-surface border border-foeg-border/80 shrink-0 relative overflow-hidden flex items-center justify-center">
            {isCurrentVideo ? (
              <video
                src={currentUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <MediaBox
                src={currentUrl}
                alt="Aperçu sélection"
                aspectRatio="portrait"
                className="w-full h-full"
                imageClassName="object-cover"
                sizes="80px"
              />
            )}
          </div>

          <div className="flex-1 min-w-0 text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-800 font-medium text-[11px]">
              <Check className="w-3.5 h-3.5" />
              <span>{isCurrentVideo ? 'Vidéo / Reel prêt pour la boutique' : 'Image prête pour la boutique'}</span>
            </div>
            <p className="text-[10px] text-foeg-muted truncate font-mono mt-0.5">
              {currentUrl}
            </p>
            <span className="text-[10px] text-foeg-muted/80 block mt-0.5 font-light">
              Synchronisé en direct avec la Maison FOEG.
            </span>
          </div>

          <button
            type="button"
            suppressHydrationWarning
            onClick={handleRemoveMedia}
            className="p-1.5 text-foeg-muted hover:text-red-700 transition-colors cursor-pointer"
            title="Retirer le média"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}