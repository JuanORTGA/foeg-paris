'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AnimatedBirdLogoProps {
  size?: number;
  className?: string;
}

export default function AnimatedBirdLogo({
  size = 36,
  className = '',
}: AnimatedBirdLogoProps) {
  const pathname = usePathname();
  const [animationId, setAnimationId] = useState(0);

  // Se reactiva únicamente al ingresar o retornar a la página
  useEffect(() => {
    setAnimationId((prev) => prev + 1);
  }, [pathname]);

  return (
    <div
      key={animationId}
      className={`relative rounded-full overflow-hidden bg-white shadow-subtle border border-current/20 flex items-center justify-center shrink-0 select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        maxWidth: `${size}px`,
        maxHeight: `${size}px`,
      }}
      aria-hidden="true"
    >
      {/* Contenedor del vuelo de frente, amortiguación y aterrizaje */}
      <div className="bird-flight-box">
        {/* Ala Izquierda (Left Wing) extendida en vuelo frontal */}
        <div className="bird-wing-left">
          <svg
            viewBox="0 0 1024 1024"
            style={{ width: '100%', height: '100%', display: 'block' }}
            aria-hidden="true"
          >
            <path
              d="M 490 420 C 440 330, 320 220, 180 160 L 260 230 L 190 220 L 280 300 L 220 300 C 320 370, 420 420, 490 440 Z"
              fill="#0C0C0C"
            />
          </svg>
        </div>

        {/* Cuerpo oficial de FOEG */}
        <div className="bird-body-layer">
          <img
            src="/bird-body.png"
            alt="FOEG"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* Ala Derecha (Right Wing) extendida simétrica en vuelo frontal */}
        <div className="bird-wing-right">
          <svg
            viewBox="0 0 1024 1024"
            style={{ width: '100%', height: '100%', display: 'block' }}
            aria-hidden="true"
          >
            <path
              d="M 590 420 C 640 330, 760 220, 900 160 L 820 230 L 890 220 L 800 300 L 860 300 C 760 370, 660 420, 590 440 Z"
              fill="#0C0C0C"
            />
          </svg>
        </div>

        {/* Cabeza que gira hacia la derecha contemplando a FOEG y regresa a la izquierda */}
        <div className="bird-head-layer">
          <img
            src="/bird-head.png"
            alt="FOEG"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
}
