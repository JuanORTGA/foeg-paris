'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Save,
  Check,
  Bell,
  Sliders,
  Mail,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { GlobalSettings, updateGlobalSettings } from '@/lib/settings-actions';
import { useLanguage } from '@/lib/language-context';

interface AdminAjustesClientProps {
  initialSettings: GlobalSettings;
}

export default function AdminAjustesClient({ initialSettings }: AdminAjustesClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<GlobalSettings>(initialSettings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateGlobalSettings(formData);
    if (res.success) {
      showToast(t('admin.ajustes.savedSuccess'));
      startTransition(() => {
        router.refresh();
      });
    } else {
      alert(res.error || (language === 'es' ? 'Error al guardar los ajustes' : 'Error saving settings'));
    }
  };

  return (
    <div className="space-y-10 max-w-4xl relative">
      {/* Toast Flotante */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-foeg-navy text-foeg-white px-6 py-4 shadow-floating flex items-center space-x-3 text-xs uppercase tracking-[0.18em] animate-fadeIn border border-white/20">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
          </div>
          <div>
            <span className="font-medium text-white block">
              {language === 'es'
                ? 'Ajustes de la Maison'
                : language === 'en'
                ? 'Maison Settings'
                : 'Paramètres de la Maison'}
            </span>
            <span className="text-[10px] text-white/80 lowercase tracking-normal">
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pb-6 border-b border-foeg-border/80">
        <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1">
          {t('admin.ajustes.tag')}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
          {t('admin.ajustes.title')}
        </h1>
        <p className="text-xs text-foeg-muted font-light mt-1 max-w-2xl">
          {t('admin.ajustes.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-foeg-border/80 p-8 space-y-10 shadow-subtle">
        {/* SECCIÓN 1: COORDONNÉES DE L'ATELIER & CONCIERGERIE */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-foeg-border/60 pb-3">
            <Mail className="w-4 h-4 text-foeg-navy" strokeWidth={1} />
            <h2 className="font-serif text-xl font-normal text-foeg-black">
              {t('admin.ajustes.sec1Title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                {t('admin.ajustes.emailLabel')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="contact_email"
                  required
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="concierge@foeg-paris.com"
                  className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 pl-9 focus:outline-none focus:border-foeg-navy rounded-none font-light"
                />
                <Mail className="w-3.5 h-3.5 text-foeg-muted absolute left-3 top-3.5" />
              </div>
              <span className="text-[10px] text-foeg-muted block font-light">
                {t('admin.ajustes.emailHint')}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                {t('admin.ajustes.phoneLabel')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="+33 1 42 68 55 00"
                  className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 pl-9 focus:outline-none focus:border-foeg-navy rounded-none font-light"
                />
                <Phone className="w-3.5 h-3.5 text-foeg-muted absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                {t('admin.ajustes.whatsappLabel')}
              </label>
              <div className="relative max-w-md">
                <input
                  type="text"
                  name="contact_whatsapp"
                  value={formData.contact_whatsapp}
                  onChange={handleChange}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 pl-9 focus:outline-none focus:border-foeg-navy rounded-none font-light"
                />
                <MessageCircle className="w-3.5 h-3.5 text-foeg-muted absolute left-3 top-3.5" />
              </div>
              <span className="text-[10px] text-foeg-muted block font-light">
                {t('admin.ajustes.whatsappHint')}
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: RÉSEAUX SOCIAUX OFFICIELS */}
        <div className="space-y-6 pt-4 border-t border-foeg-border/60">
          <div className="flex items-center space-x-2 border-b border-foeg-border/60 pb-3">
            <Instagram className="w-4 h-4 text-foeg-navy" strokeWidth={1} />
            <h2 className="font-serif text-xl font-normal text-foeg-black">
              {t('admin.ajustes.sec2Title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                {t('admin.ajustes.instagramLabel')}
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="social_instagram"
                  value={formData.social_instagram}
                  onChange={handleChange}
                  placeholder="https://www.instagram.com/foegparis/"
                  className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 pl-9 focus:outline-none focus:border-foeg-navy rounded-none font-light"
                />
                <Instagram className="w-3.5 h-3.5 text-foeg-muted absolute left-3 top-3.5" />
              </div>
              <span className="text-[10px] text-foeg-muted block font-light">
                {t('admin.ajustes.instagramHint')}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                {t('admin.ajustes.facebookLabel')}
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="social_facebook"
                  value={formData.social_facebook}
                  onChange={handleChange}
                  placeholder="https://www.facebook.com/..."
                  className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 pl-9 focus:outline-none focus:border-foeg-navy rounded-none font-light"
                />
                <Facebook className="w-3.5 h-3.5 text-foeg-muted absolute left-3 top-3.5" />
              </div>
              <span className="text-[10px] text-foeg-muted block font-light">
                {t('admin.ajustes.facebookHint')}
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: RÈGLES COMMERCIALES & ALERTES */}
        <div className="space-y-6 pt-4 border-t border-foeg-border/60">
          <div className="flex items-center space-x-2 border-b border-foeg-border/60 pb-3">
            <Sliders className="w-4 h-4 text-foeg-navy" strokeWidth={1} />
            <h2 className="font-serif text-xl font-normal text-foeg-black">
              {t('admin.ajustes.sec3Title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                {t('admin.ajustes.shippingThresholdLabel')}
              </label>
              <input
                type="number"
                name="shipping_threshold"
                value={formData.shipping_threshold}
                onChange={handleChange}
                className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy rounded-none font-light"
              />
              <span className="text-[10px] text-foeg-muted block font-light">
                {t('admin.ajustes.shippingThresholdHint')}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                {t('admin.ajustes.stockWarningLabel')}
              </label>
              <input
                type="number"
                name="low_stock_warning"
                value={formData.low_stock_warning}
                onChange={handleChange}
                className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy rounded-none font-light"
              />
              <span className="text-[10px] text-foeg-muted block font-light">
                {t('admin.ajustes.stockWarningHint')}
              </span>
            </div>
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <div className="pt-6 border-t border-foeg-border/80 flex items-center justify-between">
          <span className="text-[11px] text-foeg-muted font-light flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-foeg-navy" />
            <span>{t('admin.ajustes.syncNotice')}</span>
          </span>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center space-x-2 bg-foeg-navy hover:bg-foeg-black text-foeg-white py-4 px-8 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-200 rounded-none shadow-subtle cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('admin.ajustes.saving')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={1} />
                <span>{t('admin.ajustes.saveBtn')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
