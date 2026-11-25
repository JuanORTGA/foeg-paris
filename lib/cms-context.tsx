'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface CmsEditorContextType {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  activeLanguage: 'fr' | 'en' | 'es';
  setActiveLanguage: (lang: 'fr' | 'en' | 'es') => void;
  savingCount: number;
  lastSavedKey: string | null;
  registerSaveStart: (key: string) => void;
  registerSaveEnd: (key: string, success: boolean) => void;
  liveOverrides: Record<string, string>;
  setLiveOverride: (key: string, value: string) => void;
}

const CmsEditorContext = createContext<CmsEditorContextType>({
  isEditing: false,
  setIsEditing: () => {},
  activeLanguage: 'fr',
  setActiveLanguage: () => {},
  savingCount: 0,
  lastSavedKey: null,
  registerSaveStart: () => {},
  registerSaveEnd: () => {},
  liveOverrides: {},
  setLiveOverride: () => {},
});

export function CmsEditorProvider({
  children,
  initialEditing = false,
  initialLanguage = 'fr',
}: {
  children: React.ReactNode;
  initialEditing?: boolean;
  initialLanguage?: 'fr' | 'en' | 'es';
}) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [activeLanguage, setActiveLanguage] = useState<'fr' | 'en' | 'es'>(initialLanguage);
  const [savingCount, setSavingCount] = useState(0);
  const [lastSavedKey, setLastSavedKey] = useState<string | null>(null);
  const [liveOverrides, setLiveOverrides] = useState<Record<string, string>>({});

  const registerSaveStart = useCallback((key: string) => {
    setSavingCount((prev) => prev + 1);
  }, []);

  const registerSaveEnd = useCallback((key: string, success: boolean) => {
    setSavingCount((prev) => Math.max(0, prev - 1));
    if (success) {
      setLastSavedKey(key);
      setTimeout(() => {
        setLastSavedKey((current) => (current === key ? null : current));
      }, 3000);
    }
  }, []);

  const setLiveOverride = useCallback((key: string, value: string) => {
    setLiveOverrides((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <CmsEditorContext.Provider
      value={{
        isEditing,
        setIsEditing,
        activeLanguage,
        setActiveLanguage,
        savingCount,
        lastSavedKey,
        registerSaveStart,
        registerSaveEnd,
        liveOverrides,
        setLiveOverride,
      }}
    >
      {children}
    </CmsEditorContext.Provider>
  );
}

export function useCmsEditor() {
  return useContext(CmsEditorContext);
}
