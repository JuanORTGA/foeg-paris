'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Star,
  Link as LinkIcon,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import MediaBox from '@/components/ui/MediaBox';

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  helperText?: string;
}

export default function MultiImageUpload({
  images = [],
  onChange,
  label = 'Galerie de Photographies (Haute Couture)',
  helperText = 'Sélectionnez des photos depuis votre ordinateur. La première photo servira de couverture.',
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compression côté client pour les photos lourdes
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

  const uploadFiles = async (filesList: FileList | File[]) => {
    if (!filesList || filesList.length === 0) return;
    setUploading(true);
    setErrorMessage(null);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const fileToUpload = await compressImageIfNeeded(file);
        const formData = new FormData();
        formData.append('file', fileToUpload);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.secure_url) {
            uploadedUrls.push(data.secure_url);
            continue;
          }
        }
        throw new Error('Fallback local');
      } catch {
        // En cas de problème réseau, lecture directe en Data URL pour affichage immédiat
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            if (base64) {
              uploadedUrls.push(base64);
            }
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(file);
        });
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
    } else {
      setErrorMessage('Aucune image valide n’a pu être chargée.');
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNativeClick = () => {
    // Déclenche directement la boîte de dialogue native de Windows
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualUrl.trim();
    if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/'))) {
      onChange([...images, trimmed]);
      setManualUrl('');
      setShowUrlInput(false);
      setErrorMessage(null);
    } else {
      setErrorMessage('Veuillez saisir une URL valide commençant par http:// ou https://');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    if (indexToPrimary === 0) return;
    const target = images[indexToPrimary];
    const filtered = images.filter((_, idx) => idx !== indexToPrimary);
    onChange([target, ...filtered]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      {/* Input natif caché pour déclencher la boîte de dialogue Windows */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-navy block font-medium">
            {label}
          </label>
          <p className="text-[10px] text-foeg-muted font-light mt-0.5">{helperText}</p>
        </div>
        <span className="text-[10px] font-mono text-foeg-muted">
          {images.length} {images.length > 1 ? 'photos' : 'photo'}
        </span>
      </div>

      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-[11px] animate-fadeIn">
          {errorMessage}
        </div>
      )}

      {/* Grid des photos existantes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((imgUrl, idx) => {
            const isPrimary = idx === 0;
            return (
              <div
                key={`gallery-item-${idx}`}
                className={`relative group aspect-[3/4] bg-foeg-surface border transition-all ${
                  isPrimary
                    ? 'border-foeg-navy shadow-xs ring-1 ring-foeg-navy/20'
                    : 'border-foeg-border hover:border-foeg-black/40'
                }`}
              >
                <MediaBox
                  src={imgUrl}
                  alt={`Vue ${idx + 1}`}
                  aspectRatio="full"
                  className="w-full h-full"
                  imageClassName="object-cover object-center"
                />

                {/* Badge d'ordre / Portada */}
                <div className="absolute top-2 left-2 z-10 flex items-center space-x-1">
                  {isPrimary ? (
                    <span className="bg-foeg-navy text-white text-[8px] uppercase tracking-wider px-1.5 py-0.5 font-medium flex items-center space-x-1 shadow-2xs">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      <span>Portada</span>
                    </span>
                  ) : (
                    <span className="bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5">
                      #{idx + 1}
                    </span>
                  )}
                </div>

                {/* Contrôles au survol */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end space-x-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 bg-white/90 hover:bg-red-600 hover:text-white text-foeg-black transition-colors rounded-none cursor-pointer"
                      title="Supprimer cette vue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="px-2 py-1 bg-white/95 text-foeg-navy hover:bg-foeg-navy hover:text-white text-[9px] uppercase tracking-wider font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                        title="Définir comme photo principale"
                      >
                        <Star className="w-2.5 h-2.5" />
                        <span>Portada</span>
                      </button>
                    )}

                    <div className="flex space-x-1 ml-auto">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1 bg-white/90 hover:bg-white text-foeg-black transition-colors cursor-pointer"
                          title="Déplacer vers la gauche"
                        >
                          <ArrowUp className="w-3 h-3 rotate-[-90deg]" />
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1 bg-white/90 hover:bg-white text-foeg-black transition-colors cursor-pointer"
                          title="Déplacer vers la droite"
                        >
                          <ArrowDown className="w-3 h-3 rotate-[-90deg]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zone de Drag & Drop + Déclencheur Windows direct */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={handleNativeClick}
        className={`border-2 border-dashed p-5 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-foeg-navy bg-foeg-surface/80'
            : 'border-foeg-border hover:border-foeg-navy/60 bg-foeg-surface/20'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <Loader2 className="w-7 h-7 text-foeg-navy animate-spin" />
          ) : (
            <FolderOpen className="w-7 h-7 text-foeg-navy" strokeWidth={1.5} />
          )}

          <div>
            <span className="text-xs font-medium text-foeg-black block">
              {uploading
                ? 'Chargement des images...'
                : 'Cliquez ici pour ouvrir vos dossiers Windows'}
            </span>
            <span className="text-[11px] text-foeg-muted block mt-0.5">
              Glissez-déposez vos fichiers ou sélectionnez plusieurs photos à la fois (JPG, PNG, WEBP)
            </span>
          </div>

          <button
            type="button"
            disabled={uploading}
            className="mt-1 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-foeg-navy hover:bg-foeg-black text-white text-[10px] uppercase tracking-wider font-medium transition-colors pointer-events-none"
          >
            <Plus className="w-3 h-3" />
            <span>Parcourir l’ordinateur</span>
          </button>
        </div>
      </div>

      {/* Option alternative : Ajouter via URL directe */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="inline-flex items-center space-x-1.5 text-[11px] text-foeg-muted hover:text-foeg-navy transition-colors cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Masquer URL' : 'Ou ajouter par lien URL web'}</span>
        </button>
      </div>

      {showUrlInput && (
        <form onSubmit={handleAddManualUrl} className="flex gap-2 pt-1 animate-fadeIn">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-1 border border-foeg-border p-2 text-xs focus:outline-none focus:border-foeg-navy bg-white"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-foeg-navy text-white text-xs font-medium hover:bg-foeg-black transition-colors shrink-0 cursor-pointer"
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="px-2 py-2 text-foeg-muted hover:text-foeg-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
