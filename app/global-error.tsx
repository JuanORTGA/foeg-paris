'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Détection sécurisée de la langue pour la page d'erreur fatale
  let lang = 'fr';
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/foeg_lang=(fr|en|es)/);
    if (match) lang = match[1];
  }

  const texts = {
    fr: {
      title: 'Interruption Momentanée',
      desc: 'Une anomalie critique est survenue dans l’atelier. Veuillez rafraîchir l’application.',
      btn: 'Rafraîchir',
    },
    es: {
      title: 'Interrupción Momentánea',
      desc: 'Ha ocurrido una anomalía en el taller. Por favor recargue la aplicación.',
      btn: 'Recargar',
    },
    en: {
      title: 'Momentary Interruption',
      desc: 'A critical anomaly occurred in the atelier. Please reload the application.',
      btn: 'Reload',
    },
  }[lang] || {
    title: 'Interruption Momentanée',
    desc: 'Une anomalie critique est survenue dans l’atelier. Veuillez rafraîchir l’application.',
    btn: 'Rafraîchir',
  };

  return (
    <html lang={lang}>
      <body style={{ margin: 0, fontFamily: 'serif, sans-serif', backgroundColor: '#F7F5F0', color: '#1A1A1A' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '0.5rem', color: '#1B2A4A' }}>{texts.title}</h2>
          <p style={{ fontSize: '0.875rem', color: '#6E6B67', marginBottom: '1.5rem', maxWidth: '380px', lineHeight: 1.6 }}>
            {texts.desc}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#1B2A4A',
              color: '#ffffff',
              padding: '0.75rem 1.75rem',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {texts.btn}
          </button>
        </div>
      </body>
    </html>
  );
}
