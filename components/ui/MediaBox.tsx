'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface MediaBoxProps {
  src?: string | null;
  alt?: string;
  aspectRatio?: '3/4' | '16/9' | '9/16' | '1/1' | 'full' | 'auto' | string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v') ||
    url.includes('/video/upload/') ||
    url.includes('video/mp4') ||
    url.startsWith('data:video/')
  );
}

export default function MediaBox({
  src,
  alt = 'FOEG Paris',
  aspectRatio = '3/4',
  className,
  imageClassName,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
}: MediaBoxProps) {
  const [hasError, setHasError] = useState(false);

  // Réinitialiser l'état d'erreur immédiatement si la source média change
  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  // Manejo de la relación de aspecto elegante
  const aspectClass =
    aspectRatio === '3/4'
      ? 'aspect-[3/4]'
      : aspectRatio === '2/3'
      ? 'aspect-[2/3]'
      : aspectRatio === '9/16'
      ? 'aspect-[9/16]'
      : aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : aspectRatio === '1/1'
      ? 'aspect-square'
      : aspectRatio === 'full'
      ? 'w-full h-full'
      : '';

  const isDataOrBlob = src?.startsWith('data:') || src?.startsWith('blob:');
  const isVideo = isVideoUrl(src);
  const showMedia = src && src.trim() !== '' && !hasError;

  return (
    <div className={cn('relative overflow-hidden', aspectClass, className)}>
      {showMedia ? (
        isVideo ? (
          <video
            key={src}
            src={src!}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            playsInline
            controls={controls}
            preload="metadata"
            onError={() => {
              console.warn('[MediaBox video load failed for URL]:', src);
              setHasError(true);
            }}
            className={cn('w-full h-full object-cover object-center', imageClassName)}
          >
            <source src={src!} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={src!}
            alt={alt}
            fill
            priority={priority}
            unoptimized={isDataOrBlob}
            sizes={sizes}
            onError={() => setHasError(true)}
            className={cn('object-cover object-center', imageClassName)}
          />
        )
      ) : (
        // Respaldo (Fallback) elegante en tono arena sutil (#EBE7DF)
        <div className="w-full h-full min-h-[160px] bg-[#EBE7DF] flex items-center justify-center p-6 border border-foeg-border/50 text-center">
          <span className="text-[11px] uppercase tracking-[0.24em] text-foeg-muted font-light select-none">
            FOEG Paris · Haute Couture
          </span>
        </div>
      )}
    </div>
  );
}
