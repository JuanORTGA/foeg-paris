'use client';

import React, { useState, useEffect } from 'react';
import AnimatedBirdLogo from '@/components/ui/AnimatedBirdLogo';

interface PageLoaderProps {
  title?: string;
  subtitle?: string;
  durationMs?: number;
  onFinish?: () => void;
}

export default function PageLoader({
  title = 'FOEG',
  subtitle = "VÉRIFICATION DE L'ACCÈS ATELIER...",
  durationMs = 3600,
  onFinish,
}: PageLoaderProps) {
  const [fading, setFading] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Iniciar desvanecimiento tras la animación del ave
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, durationMs - 500);

    // Ocultar y desmontar
    const finishTimer = setTimeout(() => {
      setRemoved(true);
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  if (removed) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-foeg-white flex flex-col items-center justify-center p-6 transition-opacity duration-500 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Chargement de l'Atelier FOEG"
    >
      <div className="flex flex-col items-center justify-center space-y-5 text-center animate-fadeIn">
        {/* Medallón con el ave que llega volando, se posa y mira a "FOEG" */}
        <div className="flex items-center space-x-3.5">
          <AnimatedBirdLogo size={58} />
          <span className="font-serif text-3xl sm:text-4xl font-light tracking-[0.28em] text-foeg-black uppercase leading-none">
            {title}
          </span>
        </div>

        {/* Texto idéntico a la segunda captura del usuario */}
        <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted font-light">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
