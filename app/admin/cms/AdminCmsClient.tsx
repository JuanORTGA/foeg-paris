'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Check,
  Loader2,
  Eye,
  Edit3,
  ArrowLeft,
  Feather,
  Maximize,
  Minimize,
} from 'lucide-react';
import { CmsEditorProvider, useCmsEditor } from '@/lib/cms-context';
import { useLanguage } from '@/lib/language-context';
import HomeClient, { CmsDictionary, ProductItem } from '@/app/HomeClient';
import { JournalArticle } from '@/lib/journal-data';
import { publishAllCmsAction } from './actions';

interface AdminCmsClientProps {
  cmsContent: CmsDictionary;
  initialProducts: ProductItem[];
  journalArticles: JournalArticle[];
}

function CmsEditorToolbar() {
  const { isEditing, setIsEditing, activeLanguage, setActiveLanguage, savingCount, lastSavedKey } =
    useCmsEditor();
  const { t, language, setLanguage } = useLanguage();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleLangChange = (lang: 'fr' | 'en' | 'es') => {
    setActiveLanguage(lang);
    setLanguage(lang);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await publishAllCmsAction();
    setIsPublishing(false);
    setToastMessage(t('admin.publish_toast') || 'Tous les changements éditoriaux et multimédias sont publiés en direct.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <>
      {/* Toast de publication */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-[100] bg-[#1B2A4A] text-[#F7F5F0] px-5 py-3 shadow-[0_15px_35px_rgba(0,0,0,0.45)] text-xs uppercase tracking-widest flex items-center space-x-3 border border-white/20 animate-fadeIn font-light">
          <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barre Supérieure Studio Créatif Haute Couture */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-[#1B2A4A] text-white border-b border-white/10 px-6 sm:px-8 flex items-center justify-between shadow-[0_4px_25px_rgba(0,0,0,0.3)] select-none">
        {/* Lado Izquierdo: Botón Atrás + Título Editorial */}
        <div className="flex items-center space-x-4 sm:space-x-5">
          <Link
            href="/admin"
            className="p-1.5 -ml-1 text-white/50 hover:text-white transition-colors duration-300 rounded-none cursor-pointer flex items-center justify-center hover:bg-white/5"
            title="Retour au tableau de bord d'administration"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </Link>

          <div className="flex items-center space-x-3">
            <span className="p-1.5 bg-white/5 border border-white/10 text-white/80 hidden sm:flex items-center justify-center">
              <Feather className="w-3.5 h-3.5 text-[#F7F5F0]" strokeWidth={1.5} />
            </span>
            <div>
              <h1 className="font-serif text-sm sm:text-base tracking-[0.2em] uppercase font-normal text-[#F7F5F0] leading-none">
                Studio Créatif
              </h1>
              <p className="text-[10px] tracking-widest uppercase text-white/60 font-light mt-1">
                Maison FOEG · Édition en Direct
              </p>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Controles Editoriales */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Selector de idioma FR / EN / ES Editorial */}
          <div className="flex items-center space-x-3">
            {(['fr', 'en', 'es'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                suppressHydrationWarning
                onClick={() => handleLangChange(lang)}
                className={`text-[11px] font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                  activeLanguage === lang
                    ? 'text-white border-b border-white pb-0.5 font-medium'
                    : 'text-white/40 hover:text-white/80 pb-0.5'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="hidden sm:block w-px h-3.5 bg-white/15" />

          {/* Botón Modo Edición */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-1.5 text-xs uppercase tracking-widest font-light flex items-center space-x-2 border transition-all duration-300 cursor-pointer rounded-none ${
              isEditing
                ? 'bg-white/15 text-white border-white/40 shadow-xs'
                : 'bg-transparent text-white/70 border-white/20 hover:text-white hover:border-white/40 hover:bg-white/5'
            }`}
          >
            {isEditing ? (
              <Edit3 className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
            ) : (
              <Eye className="w-3.5 h-3.5 text-white/70" strokeWidth={1.5} />
            )}
            <span className="hidden sm:inline">
              {isEditing ? t('admin.mode_edit') : t('admin.mode_preview')}
            </span>
          </button>

          {/* CRÍTICO - Botón Publicar en Vivo (Blanco roto + Azul marino) */}
          <button
            type="button"
            suppressHydrationWarning
            disabled={isPublishing}
            onClick={handlePublish}
            className="px-4 py-1.5 bg-[#F7F5F0] hover:bg-white text-foeg-navy border border-[#E5DECF] text-xs uppercase tracking-widest font-medium transition-all duration-300 shadow-subtle cursor-pointer flex items-center space-x-2 rounded-none disabled:opacity-60"
          >
            {isPublishing ? (
              <Loader2 className="w-3.5 h-3.5 text-foeg-navy animate-spin" strokeWidth={1.5} />
            ) : (
              <Check className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1.5} />
            )}
            <span className="hidden sm:inline">
              {isPublishing ? 'Publication...' : t('admin.publish_live')}
            </span>
          </button>

          {/* Botón Pantalla Completa */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 border border-white/20 hover:border-white/50 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer rounded-none hidden sm:flex items-center justify-center"
            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5" strokeWidth={1.5} />
            ) : (
              <Maximize className="w-3.5 h-3.5" strokeWidth={1.5} />
            )}
          </button>

          {/* Botón Ver Tienda Pública en Vivo */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-white/20 hover:border-white/50 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer rounded-none flex items-center justify-center"
            title="Ouvrir la boutique publique en direct"
          >
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
          </a>
        </div>
      </header>
    </>
  );
}

function CmsCanvasWrapper({ children }: { children: React.ReactNode }) {
  const { isEditing } = useCmsEditor();
  const { language } = useLanguage();
  const [navWarning, setNavWarning] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isEditing) return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a');
      if (!link) return;

      // Si le lien est dans la barre d'outils supérieure du CMS (<header>), on laisse passer la navigation
      if (link.closest('header')) {
        return;
      }

      // Interception du clic pour éviter toute redirection accidentelle en mode édition
      e.preventDefault();
      e.stopPropagation();

      const msg =
        language === 'es'
          ? "Modo Edición : Haz clic en el icono de lápiz o cámara para modificar, o desactiva el modo edición para navegar."
          : language === 'en'
          ? "Edit Mode: Click on the pencil or camera icon to modify, or switch to preview mode to navigate."
          : "Mode Édition : Cliquez sur l'icône crayon pour modifier, ou désactivez le mode édition pour naviguer.";

      setNavWarning(msg);
      setTimeout(() => setNavWarning(null), 4500);
    };

    // Capture phase pour intercepter avant tout router Next.js
    document.addEventListener('click', handleLinkClick, true);
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [isEditing, language]);

  return (
    <div className="relative">
      {navWarning && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#1B2A4A] text-[#F4F1EA] px-6 py-3.5 shadow-[0_15px_35px_rgba(0,0,0,0.5)] text-xs uppercase tracking-widest border border-amber-400/50 flex items-center space-x-3 animate-fadeIn select-none font-light">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          <span>{navWarning}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export default function AdminCmsClient({
  cmsContent,
  initialProducts,
  journalArticles,
}: AdminCmsClientProps) {
  return (
    <CmsEditorProvider initialEditing={true} initialLanguage="fr">
      <div className="min-h-screen bg-foeg-white text-foeg-black">
        <CmsEditorToolbar />
        <CmsCanvasWrapper>
          <div className="pt-16">
            <HomeClient
              cmsContent={cmsContent}
              initialProducts={initialProducts}
              journalArticles={journalArticles}
            />
          </div>
        </CmsCanvasWrapper>
      </div>
    </CmsEditorProvider>
  );
}
