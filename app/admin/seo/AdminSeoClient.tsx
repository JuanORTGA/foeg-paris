'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Save,
  Check,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { SeoSettings, updateSeoSettings } from '@/lib/settings-actions';
import { useLanguage } from '@/lib/language-context';

interface AdminSeoClientProps {
  initialSettings: SeoSettings;
}

export default function AdminSeoClient({ initialSettings }: AdminSeoClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<SeoSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'home' | 'femme' | 'homme'>('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateSeoSettings(formData);
    if (res.success) {
      showToast(t('admin.seo.savedSuccess'));
      startTransition(() => {
        router.refresh();
      });
    } else {
      alert(res.error || (language === 'es' ? 'Error al actualizar' : language === 'en' ? 'Error updating' : 'Erreur lors de la mise à jour'));
    }
  };

  const getPreviewData = () => {
    if (activeTab === 'home') {
      return {
        url: 'https://foeg-paris.com',
        title: formData.seo_home_title || 'FOEG Paris | Maison de Confection Française',
        desc:
          formData.seo_home_desc ||
          'Maison de confection française située rue Lucien Sampaix, Paris 75010.',
      };
    }
    if (activeTab === 'femme') {
      return {
        url: 'https://foeg-paris.com/mujer',
        title: formData.seo_femme_title || 'Vestiaire Femme | Maison FOEG Paris',
        desc:
          formData.seo_femme_desc ||
          'Découvrez les créations exclusives du vestiaire féminin FOEG Paris.',
      };
    }
    return {
      url: 'https://foeg-paris.com/hombre',
      title: formData.seo_homme_title || 'Vestiaire Homme | Maison FOEG Paris',
      desc:
        formData.seo_homme_desc ||
        'Explorez le vestiaire masculin de la Maison FOEG Paris.',
    };
  };

  const preview = getPreviewData();

  return (
    <div className="space-y-10 max-w-4xl relative">
      {/* Toast Flotante */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-foeg-navy text-foeg-white px-6 py-4 shadow-floating flex items-center space-x-3 text-xs uppercase tracking-[0.18em] animate-fadeIn border border-white/20">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
          </div>
          <div>
            <span className="font-medium text-white block">SEO</span>
            <span className="text-[10px] text-white/60 lowercase tracking-normal">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pb-6 border-b border-foeg-border/80">
        <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1">
          {t('admin.seo.tag')}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
          {t('admin.seo.title')}
        </h1>
        <p className="text-xs text-foeg-muted font-light mt-1 max-w-2xl">
          {t('admin.seo.subtitle')}
        </p>
      </div>

      {/* Selector de Pestañas por Sección */}
      <div className="flex border-b border-foeg-border/80 space-x-8 text-xs uppercase tracking-[0.2em] font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'home'
              ? 'border-b-2 border-foeg-navy text-foeg-navy font-semibold'
              : 'text-foeg-muted hover:text-foeg-black'
          }`}
        >
          {t('admin.seo.tabHome')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('femme')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'femme'
              ? 'border-b-2 border-foeg-navy text-foeg-navy font-semibold'
              : 'text-foeg-muted hover:text-foeg-black'
          }`}
        >
          {t('admin.seo.tabFemme')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('homme')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'homme'
              ? 'border-b-2 border-foeg-navy text-foeg-navy font-semibold'
              : 'text-foeg-muted hover:text-foeg-black'
          }`}
        >
          {t('admin.seo.tabHomme')}
        </button>
      </div>

      {/* VISTA PREVIA EN VIVO DE GOOGLE (SERP Snippet) */}
      <div className="bg-foeg-surface/50 border border-foeg-border/80 p-6 space-y-3 shadow-subtle">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-navy font-semibold flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5" />
            <span>{t('admin.seo.googlePreview')}</span>
          </span>
          <span className="text-[10px] text-foeg-muted font-mono">
            {activeTab.toUpperCase()}
          </span>
        </div>

        <div className="bg-white p-5 border border-foeg-border/60 max-w-2xl rounded-sm space-y-1 font-sans">
          <div className="flex items-center space-x-2 text-xs text-[#202124]">
            <div className="w-4 h-4 rounded-full bg-[#1A2836] flex items-center justify-center text-[9px] text-white font-serif">
              F
            </div>
            <div className="leading-tight">
              <span className="text-xs text-[#202124] block">FOEG Paris</span>
              <span className="text-[11px] text-[#4d5156] font-light block">{preview.url}</span>
            </div>
          </div>
          <h3 className="text-[#1a0dab] hover:underline cursor-pointer text-base sm:text-lg font-normal leading-snug line-clamp-1 pt-1">
            {preview.title}
          </h3>
          <p className="text-[#4d5156] text-xs leading-relaxed line-clamp-2 font-light">
            {preview.desc}
          </p>
        </div>
      </div>

      {/* FORMULARIO EDITABLE */}
      <form onSubmit={handleSubmit} className="bg-white border border-foeg-border/80 p-8 space-y-8 shadow-subtle">
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {t('admin.seo.metaTitleLabel')} — {t('admin.seo.tabHome')}
                </label>
                <span className={`text-[10px] font-mono ${formData.seo_home_title.length > 60 ? 'text-amber-700' : 'text-foeg-muted'}`}>
                  {formData.seo_home_title.length}/60 car.
                </span>
              </div>
              <input
                type="text"
                name="seo_home_title"
                required
                value={formData.seo_home_title}
                onChange={handleChange}
                placeholder="FOEG Paris | Maison de Confection Française"
                className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy rounded-none font-light"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {t('admin.seo.metaDescLabel')} — {t('admin.seo.tabHome')}
                </label>
                <span className={`text-[10px] font-mono ${formData.seo_home_desc.length > 160 ? 'text-amber-700' : 'text-foeg-muted'}`}>
                  {formData.seo_home_desc.length}/160 car.
                </span>
              </div>
              <textarea
                name="seo_home_desc"
                required
                rows={3}
                value={formData.seo_home_desc}
                onChange={handleChange}
                placeholder="Description concise du savoir-faire de la Maison..."
                className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy rounded-none font-light leading-relaxed resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                {t('admin.seo.ogImageLabel')}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="url"
                  name="seo_home_image"
                  value={formData.seo_home_image || ''}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy rounded-none font-light"
                />
                {formData.seo_home_image && (
                  <img
                    src={formData.seo_home_image}
                    alt="OG Preview"
                    className="w-12 h-10 object-cover border border-foeg-border shrink-0"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'femme' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {t('admin.seo.metaTitleLabel')} — {t('admin.seo.tabFemme')}
                </label>
                <span className={`text-[10px] font-mono ${formData.seo_femme_title.length > 60 ? 'text-amber-700' : 'text-foeg-muted'}`}>
                  {formData.seo_femme_title.length}/60 car.
                </span>
              </div>
              <input
                type="text"
                name="seo_femme_title"
                required
                value={formData.seo_femme_title}
                onChange={handleChange}
                placeholder="Vestiaire Femme | Maison FOEG Paris"
                className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy rounded-none font-light"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {t('admin.seo.metaDescLabel')} — {t('admin.seo.tabFemme')}
                </label>
                <span className={`text-[10px] font-mono ${formData.seo_femme_desc.length > 160 ? 'text-amber-700' : 'text-foeg-muted'}`}>
                  {formData.seo_femme_desc.length}/160 car.
                </span>
              </div>
              <textarea
                name="seo_femme_desc"
                required
                rows={3}
                value={formData.seo_femme_desc}
                onChange={handleChange}
                placeholder="Découvrez les pièces d'exception du vestiaire féminin..."
                className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy rounded-none font-light leading-relaxed resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                {t('admin.seo.ogImageLabel')}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="url"
                  name="seo_femme_image"
                  value={formData.seo_femme_image || ''}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy rounded-none font-light"
                />
                {formData.seo_femme_image && (
                  <img
                    src={formData.seo_femme_image}
                    alt="OG Preview"
                    className="w-12 h-10 object-cover border border-foeg-border shrink-0"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'homme' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {t('admin.seo.metaTitleLabel')} — {t('admin.seo.tabHomme')}
                </label>
                <span className={`text-[10px] font-mono ${formData.seo_homme_title.length > 60 ? 'text-amber-700' : 'text-foeg-muted'}`}>
                  {formData.seo_homme_title.length}/60 car.
                </span>
              </div>
              <input
                type="text"
                name="seo_homme_title"
                required
                value={formData.seo_homme_title}
                onChange={handleChange}
                placeholder="Vestiaire Homme | Maison FOEG Paris"
                className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy rounded-none font-light"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {t('admin.seo.metaDescLabel')} — {t('admin.seo.tabHomme')}
                </label>
                <span className={`text-[10px] font-mono ${formData.seo_homme_desc.length > 160 ? 'text-amber-700' : 'text-foeg-muted'}`}>
                  {formData.seo_homme_desc.length}/160 car.
                </span>
              </div>
              <textarea
                name="seo_homme_desc"
                required
                rows={3}
                value={formData.seo_homme_desc}
                onChange={handleChange}
                placeholder="Explorez les silhouettes d'exception du vestiaire masculin..."
                className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy rounded-none font-light leading-relaxed resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                {t('admin.seo.ogImageLabel')}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="url"
                  name="seo_homme_image"
                  value={formData.seo_homme_image || ''}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy rounded-none font-light"
                />
                {formData.seo_homme_image && (
                  <img
                    src={formData.seo_homme_image}
                    alt="OG Preview"
                    className="w-12 h-10 object-cover border border-foeg-border shrink-0"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTÓN DE GUARDAR */}
        <div className="pt-6 border-t border-foeg-border/80 flex items-center justify-between">
          <span className="text-[11px] text-foeg-muted font-light flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1.5} />
            <span>{language === 'es' ? 'Surte efecto inmediato en las etiquetas HTML <head>.' : language === 'en' ? 'Takes effect immediately on HTML <head> tags.' : 'Prend effet immédiatement sur le code source HTML (balises <head>).'}</span>
          </span>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center space-x-2 bg-foeg-navy hover:bg-foeg-black text-foeg-white py-4 px-8 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-200 rounded-none shadow-subtle cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('admin.seo.saving')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={1} />
                <span>{t('admin.seo.saveBtn')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
