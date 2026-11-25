'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { DICTIONARIES, Language } from './i18n';

export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({
  children,
  initialLanguage = 'fr',
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Synchronisation côté client au montage
  useEffect(() => {
    try {
      // 1. Lire depuis localStorage
      const saved = localStorage.getItem('foeg_lang') as Language | null;
      if (saved && (saved === 'fr' || saved === 'en' || saved === 'es')) {
        setLanguageState(saved);
        // S'assurer que le cookie est également synchronisé pour le prochain SSR
        document.cookie = `foeg_lang=${saved}; path=/; max-age=31536000; SameSite=Lax`;
        document.documentElement.lang = saved;
      } else {
        // Enregistrer la langue initiale dans cookie et localStorage
        localStorage.setItem('foeg_lang', initialLanguage);
        document.cookie = `foeg_lang=${initialLanguage}; path=/; max-age=31536000; SameSite=Lax`;
        document.documentElement.lang = initialLanguage;
      }
    } catch {}
  }, [initialLanguage]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('foeg_lang', lang);
      document.cookie = `foeg_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    } catch {}
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = DICTIONARIES[language] || DICTIONARIES.fr;
      return dict[key] || DICTIONARIES.fr[key] || key;
    },
    [language]
  );

  const contextValue = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
