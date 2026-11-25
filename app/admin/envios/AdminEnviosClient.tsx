'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  Save,
  Check,
  Globe,
  ShieldAlert,
  Euro,
  Clock,
  PackageCheck,
  Loader2,
  Sliders,
  Calculator,
  Search,
  Building2,
  CheckCircle2,
  AlertCircle,
  Compass,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  X,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react';
import {
  type ShippingSettings,
  type ShippingCountry,
  SHIPPING_COUNTRIES,
  calculateShipping,
  DEFAULT_SHIPPING_TEXTS,
} from '@/lib/shipping';
import { updateShippingSettings } from '@/lib/shipping-actions';
import { useLanguage } from '@/lib/language-context';

interface AdminEnviosClientProps {
  initialSettings: ShippingSettings;
}

export default function AdminEnviosClient({ initialSettings }: AdminEnviosClientProps) {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<ShippingSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lista viva de países administrables (persiste en BD junto con settings)
  const [countries, setCountries] = useState<ShippingCountry[]>(
    initialSettings.countries && initialSettings.countries.length > 0
      ? initialSettings.countries
      : SHIPPING_COUNTRIES
  );

  // Pestaña principal activa: 'rates' | 'countries' | 'simulator'
  const [activeTab, setActiveTab] = useState<'rates' | 'countries' | 'simulator'>('rates');

  // Idioma de edición de textos (sincronizado inicialmente con el selector general)
  const [contentLang, setContentLang] = useState<'fr' | 'en' | 'es'>(
    language === 'es' ? 'es' : language === 'en' ? 'en' : 'fr'
  );

  // Sincronizar automáticamente si el usuario cambia el idioma general desde la cabecera
  useEffect(() => {
    if (language === 'es' || language === 'en' || language === 'fr') {
      setContentLang(language);
    }
  }, [language]);

  // Filtros y búsqueda en pestaña de países
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<'all' | 'eu' | 'intl' | 'active' | 'disabled'>('all');

  // Modal para Añadir / Editar País
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<ShippingCountry | null>(null);
  const [countryForm, setCountryForm] = useState({
    code: '',
    nameEs: '',
    nameEn: '',
    nameFr: '',
    isEu: true,
    enabled: true,
  });
  const [isSavingCountry, setIsSavingCountry] = useState(false);

  // Estado del Simulador
  const [simCountryCode, setSimCountryCode] = useState<string>(
    language === 'es' ? 'ES' : language === 'en' ? 'US' : 'FR'
  );
  const [simSubtotal, setSimSubtotal] = useState<number>(160);
  const [simIsPickup, setSimIsPickup] = useState<boolean>(false);

  // Helpers para obtener y actualizar textos localizados
  const getLocalizedText = (
    field: 'euDeliveryEstimate' | 'intlDeliveryEstimate' | 'customsNoticeText' | 'pickupEstimate',
    lang: 'fr' | 'en' | 'es'
  ): string => {
    const key = `${field}_${lang}` as keyof ShippingSettings;
    const val = settings[key] as string | undefined;
    if (val && val.trim() !== '') return val;

    if (lang !== 'fr' && settings[field] === DEFAULT_SHIPPING_TEXTS.fr[field]) {
      return DEFAULT_SHIPPING_TEXTS[lang][field];
    }

    return (settings[field] as string) || DEFAULT_SHIPPING_TEXTS[lang][field];
  };

  const setLocalizedText = (
    field: 'euDeliveryEstimate' | 'intlDeliveryEstimate' | 'customsNoticeText' | 'pickupEstimate',
    val: string,
    lang: 'fr' | 'en' | 'es'
  ) => {
    const key = `${field}_${lang}` as keyof ShippingSettings;
    setSettings((prev) => ({
      ...prev,
      [key]: val,
      ...(lang === contentLang ? { [field]: val } : {}),
    }));
  };

  // Guardado centralizado de la lista de países en BD Neon
  const persistCountries = async (updatedCountries: ShippingCountry[], message: string) => {
    setCountries(updatedCountries);
    const updatedSettings = { ...settings, countries: updatedCountries };
    setSettings(updatedSettings);

    const res = await updateShippingSettings(updatedSettings);
    if (res.success) {
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      alert(res.error || 'Error al guardar países');
    }
  };

  // Abrir modal para Crear País
  const handleOpenAddModal = () => {
    setEditingCountry(null);
    setCountryForm({
      code: '',
      nameEs: '',
      nameEn: '',
      nameFr: '',
      isEu: true,
      enabled: true,
    });
    setIsCountryModalOpen(true);
  };

  // Abrir modal para Editar País
  const handleOpenEditModal = (c: ShippingCountry) => {
    setEditingCountry(c);
    setCountryForm({
      code: c.code,
      nameEs: c.nameEs,
      nameEn: c.nameEn,
      nameFr: c.nameFr,
      isEu: c.isEu,
      enabled: c.enabled !== false,
    });
    setIsCountryModalOpen(true);
  };

  // Guardar país desde el modal
  const handleSaveCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = countryForm.code.trim().toUpperCase();
    if (!code || code.length < 2 || code.length > 3) {
      alert(language === 'es' ? 'El código ISO debe tener 2 o 3 caracteres.' : 'Code ISO invalide.');
      return;
    }
    if (!countryForm.nameEs || !countryForm.nameEn || !countryForm.nameFr) {
      alert(language === 'es' ? 'Por favor ingrese el nombre del país en todos los idiomas.' : 'Veuillez saisir les noms dans toutes les langues.');
      return;
    }

    setIsSavingCountry(true);
    let updatedCountries: ShippingCountry[];

    if (editingCountry) {
      // Editar existente
      updatedCountries = countries.map((c) =>
        c.code === editingCountry.code
          ? {
              ...c,
              code,
              nameEs: countryForm.nameEs.trim(),
              nameEn: countryForm.nameEn.trim(),
              nameFr: countryForm.nameFr.trim(),
              isEu: countryForm.isEu,
              enabled: countryForm.enabled,
            }
          : c
      );
    } else {
      // Agregar nuevo (verificar que no exista)
      const exists = countries.some((c) => c.code === code);
      if (exists) {
        alert(language === 'es' ? `El código ${code} ya existe en la lista.` : `Le code ${code} existe déjà.`);
        setIsSavingCountry(false);
        return;
      }
      const newCountry: ShippingCountry = {
        code,
        nameEs: countryForm.nameEs.trim(),
        nameEn: countryForm.nameEn.trim(),
        nameFr: countryForm.nameFr.trim(),
        isEu: countryForm.isEu,
        enabled: countryForm.enabled,
      };
      updatedCountries = [...countries, newCountry];
    }

    await persistCountries(
      updatedCountries,
      editingCountry ? t('admin.envios.countryUpdatedSuccess') : t('admin.envios.countryAddedSuccess')
    );
    setIsSavingCountry(false);
    setIsCountryModalOpen(false);
  };

  // Eliminar País
  const handleDeleteCountry = async (code: string) => {
    if (confirm(t('admin.envios.deleteCountryConfirm'))) {
      const updatedCountries = countries.filter((c) => c.code !== code);
      await persistCountries(updatedCountries, t('admin.envios.countryDeletedSuccess'));
    }
  };

  // Conmutar Estado Activo / Desactivado con 1 clic
  const handleToggleCountryStatus = async (code: string) => {
    const updatedCountries = countries.map((c) => {
      if (c.code === code) {
        const isCurrentActive = c.enabled !== false;
        return { ...c, enabled: !isCurrentActive };
      }
      return c;
    });
    const target = updatedCountries.find((c) => c.code === code);
    const statusMsg = target?.enabled
      ? (language === 'es' ? `Destino ${code} activado` : `Destination ${code} activée`)
      : (language === 'es' ? `Destino ${code} desactivado` : `Destination ${code} désactivée`);
    await persistCountries(updatedCountries, statusMsg);
  };

  // Filtrado de Países
  const filteredCountries = useMemo(() => {
    return countries.filter((c) => {
      // Filtro por pestaña
      if (countryFilter === 'eu' && !c.isEu) return false;
      if (countryFilter === 'intl' && c.isEu) return false;
      if (countryFilter === 'active' && c.enabled === false) return false;
      if (countryFilter === 'disabled' && c.enabled !== false) return false;

      // Filtro por texto
      const term = countrySearch.toLowerCase().trim();
      if (!term) return true;
      const name = (contentLang === 'es' ? c.nameEs : contentLang === 'en' ? c.nameEn : c.nameFr).toLowerCase();
      return (
        name.includes(term) ||
        c.code.toLowerCase().includes(term) ||
        c.nameEs.toLowerCase().includes(term) ||
        c.nameEn.toLowerCase().includes(term) ||
        c.nameFr.toLowerCase().includes(term)
      );
    });
  }, [countries, countryFilter, countrySearch, contentLang]);

  // Contadores para las pestañas de países
  const countryCounts = useMemo(() => {
    const all = countries.length;
    const eu = countries.filter((c) => c.isEu).length;
    const intl = countries.filter((c) => !c.isEu).length;
    const active = countries.filter((c) => c.enabled !== false).length;
    const disabled = countries.filter((c) => c.enabled === false).length;
    return { all, eu, intl, active, disabled };
  }, [countries]);

  // Cálculo en vivo del Simulador
  const simResult = useMemo(() => {
    return calculateShipping(
      simCountryCode,
      simSubtotal,
      simIsPickup,
      { ...settings, countries },
      contentLang
    );
  }, [simCountryCode, simSubtotal, simIsPickup, settings, countries, contentLang]);

  const selectedCountryObj = useMemo(() => {
    return countries.find((c) => c.code === simCountryCode) || countries[0] || SHIPPING_COUNTRIES[0];
  }, [countries, simCountryCode]);

  // Ventana de fechas calculada en tiempo real para el simulador
  const estimatedDateWindow = useMemo(() => {
    if (simIsPickup) {
      return contentLang === 'es'
        ? 'Listo para retirar hoy en el Atelier'
        : contentLang === 'en'
        ? 'Ready for pickup today at the Atelier'
        : 'Prêt à être retiré aujourd’hui à l’Atelier';
    }
    const today = new Date();
    const minDays = selectedCountryObj?.isEu ? 2 : 3;
    const maxDays = selectedCountryObj?.isEu ? 4 : 5;

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    const locale = contentLang === 'es' ? 'es-ES' : contentLang === 'en' ? 'en-US' : 'fr-FR';
    const opt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

    return `${minDate.toLocaleDateString(locale, opt)} — ${maxDate.toLocaleDateString(locale, opt)}`;
  }, [simIsPickup, selectedCountryObj, contentLang]);

  // Diferencia para envío gratuito en el simulador
  const thresholdDifference = useMemo(() => {
    if (selectedCountryObj?.isEu && !simIsPickup) {
      const remaining = settings.freeShippingThreshold - simSubtotal;
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  }, [selectedCountryObj, simIsPickup, settings.freeShippingThreshold, simSubtotal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: Partial<ShippingSettings> = {
      ...settings,
      countries,
      euDeliveryEstimate: getLocalizedText('euDeliveryEstimate', contentLang),
      intlDeliveryEstimate: getLocalizedText('intlDeliveryEstimate', contentLang),
      customsNoticeText: getLocalizedText('customsNoticeText', contentLang),
      pickupEstimate: getLocalizedText('pickupEstimate', contentLang),

      euDeliveryEstimate_fr: getLocalizedText('euDeliveryEstimate', 'fr'),
      euDeliveryEstimate_en: getLocalizedText('euDeliveryEstimate', 'en'),
      euDeliveryEstimate_es: getLocalizedText('euDeliveryEstimate', 'es'),

      intlDeliveryEstimate_fr: getLocalizedText('intlDeliveryEstimate', 'fr'),
      intlDeliveryEstimate_en: getLocalizedText('intlDeliveryEstimate', 'en'),
      intlDeliveryEstimate_es: getLocalizedText('intlDeliveryEstimate', 'es'),

      customsNoticeText_fr: getLocalizedText('customsNoticeText', 'fr'),
      customsNoticeText_en: getLocalizedText('customsNoticeText', 'en'),
      customsNoticeText_es: getLocalizedText('customsNoticeText', 'es'),

      pickupEstimate_fr: getLocalizedText('pickupEstimate', 'fr'),
      pickupEstimate_en: getLocalizedText('pickupEstimate', 'en'),
      pickupEstimate_es: getLocalizedText('pickupEstimate', 'es'),
    };

    const res = await updateShippingSettings(payload);
    setIsSaving(false);

    if (res.success && res.settings) {
      setSettings(res.settings);
      setToastMessage(t('admin.envios.savedSuccess'));
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      alert(
        res.error ||
          (language === 'es'
            ? 'Error al actualizar.'
            : language === 'en'
            ? 'Error updating.'
            : 'Erreur lors de la mise à jour.')
      );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-5xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-foeg-navy text-white px-5 py-3.5 shadow-floating text-xs uppercase tracking-wider flex items-center space-x-3 border border-white/20 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-foeg-border/80 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1 font-medium">
            {t('admin.envios.tag')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
            {t('admin.envios.title')}
          </h1>
          <p className="text-xs text-foeg-muted font-light mt-1">
            {t('admin.envios.subtitle')}
          </p>
        </div>
      </div>

      {/* Pestañas Principales del Módulo de Envíos */}
      <div className="flex flex-wrap items-center gap-2 border-b border-foeg-border/70 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('rates')}
          className={`px-4 py-2 text-xs uppercase tracking-[0.18em] transition-all cursor-pointer font-medium border ${
            activeTab === 'rates'
              ? 'bg-foeg-navy text-white border-foeg-navy shadow-xs'
              : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black hover:border-foeg-navy/50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>{t('admin.envios.tabSettings')}</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('countries')}
          className={`px-4 py-2 text-xs uppercase tracking-[0.18em] transition-all cursor-pointer font-medium border ${
            activeTab === 'countries'
              ? 'bg-foeg-navy text-white border-foeg-navy shadow-xs'
              : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black hover:border-foeg-navy/50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Globe className="w-3.5 h-3.5" />
            <span>{t('admin.envios.tabCountries')}</span>
            <span className="text-[10px] opacity-75 font-mono">({countries.length})</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 text-xs uppercase tracking-[0.18em] transition-all cursor-pointer font-medium border ${
            activeTab === 'simulator'
              ? 'bg-foeg-navy text-white border-foeg-navy shadow-xs'
              : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black hover:border-foeg-navy/50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Calculator className="w-3.5 h-3.5 text-foeg-gold" />
            <span>{t('admin.envios.tabSimulator')}</span>
          </div>
        </button>
      </div>

      {/* CONTENIDO 1: TARIFAS Y REGLAS GENERALES */}
      {activeTab === 'rates' && (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
          {/* Barra de Selección de Idioma para los Textos Editoriales */}
          <div className="bg-foeg-surface/40 border border-foeg-border/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-foeg-black font-medium">
                {t('admin.envios.langLabel')}
              </span>
              <span className="text-[11px] text-foeg-muted">
                ({contentLang === 'es' ? 'Español' : contentLang === 'en' ? 'English' : 'Français'})
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              {(['es', 'en', 'fr'] as const).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => setContentLang(lng)}
                  className={`px-3 py-1 text-xs uppercase tracking-wider font-medium transition-all cursor-pointer border ${
                    contentLang === lng
                      ? 'bg-foeg-navy text-white border-foeg-navy shadow-2xs'
                      : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
                  }`}
                >
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CARTE 1: Union Européenne */}
            <div className="bg-white border border-foeg-border/80 p-6 sm:p-8 space-y-6 shadow-subtle">
              <div className="flex items-center space-x-3 border-b border-foeg-border/60 pb-4">
                <PackageCheck className="w-5 h-5 text-foeg-navy shrink-0" strokeWidth={1.5} />
                <div>
                  <h2 className="font-serif text-xl text-foeg-black font-normal">
                    {t('admin.envios.euCardTitle')}
                  </h2>
                  <span className="text-[10px] uppercase tracking-wider text-foeg-muted">
                    {t('admin.envios.euCardSubtitle')}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-light">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.envios.standardEuCost')}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={settings.standardEuCost}
                      onChange={(e) =>
                        setSettings({ ...settings, standardEuCost: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full border border-foeg-border px-3 py-2.5 text-xs focus:outline-none focus:border-foeg-navy font-mono"
                    />
                    <span className="absolute right-3 text-xs text-foeg-muted">EUR (€)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.envios.freeShippingThreshold')}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={settings.freeShippingThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          freeShippingThreshold: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-foeg-border px-3 py-2.5 text-xs focus:outline-none focus:border-foeg-navy font-mono"
                    />
                    <span className="absolute right-3 text-xs text-foeg-muted">EUR (€)</span>
                  </div>
                  <p className="text-[10px] text-foeg-muted italic">
                    {t('admin.envios.freeShippingHint')}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                      {t('admin.envios.euDeliveryEstimate')}
                    </label>
                    <span className="text-[10px] uppercase tracking-wider text-foeg-navy font-medium">
                      [{contentLang.toUpperCase()}]
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={getLocalizedText('euDeliveryEstimate', contentLang)}
                    onChange={(e) =>
                      setLocalizedText('euDeliveryEstimate', e.target.value, contentLang)
                    }
                    placeholder={t('admin.envios.euDeliveryPlaceholder')}
                    className="w-full border border-foeg-border px-3 py-2.5 text-xs focus:outline-none focus:border-foeg-navy"
                  />
                </div>
              </div>
            </div>

            {/* CARTE 2: Reste du Monde / International */}
            <div className="bg-white border border-foeg-border/80 p-6 sm:p-8 space-y-6 shadow-subtle">
              <div className="flex items-center space-x-3 border-b border-foeg-border/60 pb-4">
                <Globe className="w-5 h-5 text-foeg-navy shrink-0" strokeWidth={1.5} />
                <div>
                  <h2 className="font-serif text-xl text-foeg-black font-normal">
                    {t('admin.envios.intlCardTitle')}
                  </h2>
                  <span className="text-[10px] uppercase tracking-wider text-foeg-muted">
                    {t('admin.envios.intlCardSubtitle')}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-light">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.envios.expressIntlCost')}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={settings.expressIntlCost}
                      onChange={(e) =>
                        setSettings({ ...settings, expressIntlCost: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full border border-foeg-border px-3 py-2.5 text-xs focus:outline-none focus:border-foeg-navy font-mono"
                    />
                    <span className="absolute right-3 text-xs text-foeg-muted">EUR (€)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                      {t('admin.envios.intlDeliveryEstimate')}
                    </label>
                    <span className="text-[10px] uppercase tracking-wider text-foeg-navy font-medium">
                      [{contentLang.toUpperCase()}]
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={getLocalizedText('intlDeliveryEstimate', contentLang)}
                    onChange={(e) =>
                      setLocalizedText('intlDeliveryEstimate', e.target.value, contentLang)
                    }
                    placeholder={t('admin.envios.intlDeliveryPlaceholder')}
                    className="w-full border border-foeg-border px-3 py-2.5 text-xs focus:outline-none focus:border-foeg-navy"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                      {t('admin.envios.customsNoticeText')}
                    </label>
                    <span className="text-[10px] uppercase tracking-wider text-foeg-navy font-medium">
                      [{contentLang.toUpperCase()}]
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={getLocalizedText('customsNoticeText', contentLang)}
                    onChange={(e) =>
                      setLocalizedText('customsNoticeText', e.target.value, contentLang)
                    }
                    className="w-full border border-foeg-border p-3 text-xs focus:outline-none focus:border-foeg-navy"
                  />
                  <p className="text-[10px] text-foeg-muted italic">
                    {t('admin.envios.customsNoticeHint')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CARTE 3: Retrait en Boutique / Atelier Paris (Click & Collect) */}
          <div className="bg-white border border-foeg-border/80 p-6 sm:p-8 space-y-6 shadow-subtle">
            <div className="flex items-center justify-between border-b border-foeg-border/60 pb-4">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-foeg-navy shrink-0" strokeWidth={1.5} />
                <div>
                  <h2 className="font-serif text-xl text-foeg-black font-normal">
                    {t('admin.envios.pickupCardTitle')}
                  </h2>
                  <span className="text-[10px] uppercase tracking-wider text-foeg-muted">
                    {t('admin.envios.pickupCardSubtitle')}
                  </span>
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pickupEnabled ?? true}
                  onChange={(e) =>
                    setSettings({ ...settings, pickupEnabled: e.target.checked })
                  }
                  className="w-4 h-4 text-foeg-navy focus:ring-0 cursor-pointer"
                />
                <span className="text-xs uppercase tracking-wider text-foeg-black font-medium">
                  {t('admin.envios.pickupEnabled')}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-light">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.envios.pickupEstimate')}
                  </label>
                  <span className="text-[10px] uppercase tracking-wider text-foeg-navy font-medium">
                    [{contentLang.toUpperCase()}]
                  </span>
                </div>
                <input
                  type="text"
                  value={getLocalizedText('pickupEstimate', contentLang)}
                  onChange={(e) =>
                    setLocalizedText('pickupEstimate', e.target.value, contentLang)
                  }
                  placeholder={t('admin.envios.pickupEstimatePlaceholder')}
                  className="w-full border border-foeg-border px-3 py-2.5 text-xs focus:outline-none focus:border-foeg-navy"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {language === 'es' ? 'Tarifa del Servicio' : language === 'en' ? 'Service Fee' : 'Tarif du Service'}
                </label>
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 font-medium text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t('admin.envios.pickupCost')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aperçu Dynamique des Règles Actives */}
          <div className="bg-foeg-surface/40 border border-foeg-border/80 p-6 space-y-3 text-xs font-light">
            <div className="flex items-center space-x-2 text-foeg-navy font-medium text-[11px] uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>{t('admin.envios.livePreviewTitle')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-3 bg-white border border-foeg-border/60 space-y-1">
                <span className="font-medium text-foeg-black block">{t('admin.envios.zoneFrance')}</span>
                <p className="text-foeg-muted">
                  {settings.standardEuCost} € ({t('admin.envios.freeFrom')} {settings.freeShippingThreshold} €)
                </p>
                <p className="text-[10px] text-emerald-800">
                  {t('admin.envios.delay')} {getLocalizedText('euDeliveryEstimate', contentLang)}
                </p>
              </div>
              <div className="p-3 bg-white border border-foeg-border/60 space-y-1">
                <span className="font-medium text-foeg-black block">{t('admin.envios.zoneEu')}</span>
                <p className="text-foeg-muted">
                  {settings.standardEuCost} € ({t('admin.envios.freeFrom')} {settings.freeShippingThreshold} €)
                </p>
                <p className="text-[10px] text-emerald-800">
                  {t('admin.envios.delay')} {getLocalizedText('euDeliveryEstimate', contentLang)}
                </p>
              </div>
              <div className="p-3 bg-white border border-foeg-border/60 space-y-1">
                <span className="font-medium text-foeg-black block">{t('admin.envios.zoneIntl')}</span>
                <p className="text-foeg-muted">{settings.expressIntlCost} € (DHL Express)</p>
                <p className="text-[10px] text-foeg-navy">
                  {t('admin.envios.delay')} {getLocalizedText('intlDeliveryEstimate', contentLang)}
                </p>
              </div>
            </div>
          </div>

          {/* Bouton de Sauvegarde */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3.5 bg-foeg-navy hover:bg-black text-white text-xs uppercase tracking-[0.22em] font-medium transition-colors cursor-pointer flex items-center space-x-2 shadow-subtle disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('admin.envios.saving')}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('admin.envios.saveBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* CONTENIDO 2: PAÍSES Y ZONAS HABILITADAS (CRUD COMPLETO) */}
      {activeTab === 'countries' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Barra de Filtros, Búsqueda y Botón de Añadir */}
          <div className="bg-foeg-surface/40 p-4 sm:p-5 border border-foeg-border/70 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Buscador */}
              <div className="relative flex-1 sm:max-w-md">
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder={t('admin.envios.searchCountry')}
                  className="w-full bg-white border border-foeg-border px-3 py-2 pl-9 text-xs text-foeg-black focus:outline-none focus:border-foeg-navy"
                />
                <Search className="w-4 h-4 text-foeg-muted absolute left-2.5 top-2.5" />
                {countrySearch && (
                  <button
                    type="button"
                    onClick={() => setCountrySearch('')}
                    className="absolute right-2.5 top-2.5 text-foeg-muted hover:text-foeg-black cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Botón de Agregar Nuevo País */}
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-foeg-navy hover:bg-black text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-subtle shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('admin.envios.addCountry')}</span>
              </button>
            </div>

            {/* Pestañas de Filtrado Rápido */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-foeg-border/50 text-[11px]">
              <button
                type="button"
                onClick={() => setCountryFilter('all')}
                className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
                  countryFilter === 'all'
                    ? 'bg-foeg-navy text-white border-foeg-navy'
                    : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
                }`}
              >
                {t('admin.envios.filterAll')} ({countryCounts.all})
              </button>

              <button
                type="button"
                onClick={() => setCountryFilter('eu')}
                className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
                  countryFilter === 'eu'
                    ? 'bg-foeg-navy text-white border-foeg-navy'
                    : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
                }`}
              >
                {t('admin.envios.zoneEuLabel')} ({countryCounts.eu})
              </button>

              <button
                type="button"
                onClick={() => setCountryFilter('intl')}
                className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
                  countryFilter === 'intl'
                    ? 'bg-foeg-navy text-white border-foeg-navy'
                    : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
                }`}
              >
                {t('admin.envios.zoneIntlLabel')} ({countryCounts.intl})
              </button>

              <button
                type="button"
                onClick={() => setCountryFilter('active')}
                className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
                  countryFilter === 'active'
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
                }`}
              >
                {t('admin.envios.filterActive')} ({countryCounts.active})
              </button>

              <button
                type="button"
                onClick={() => setCountryFilter('disabled')}
                className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
                  countryFilter === 'disabled'
                    ? 'bg-neutral-700 text-white border-neutral-700'
                    : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
                }`}
              >
                {t('admin.envios.filterDisabled')} ({countryCounts.disabled})
              </button>
            </div>
          </div>

          {/* Tabla de Países con Acciones CRUD */}
          <div className="bg-white border border-foeg-border shadow-subtle overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-foeg-border bg-foeg-surface/30 text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium">
                  <th className="py-3.5 px-6">{t('admin.envios.thCountry')}</th>
                  <th className="py-3.5 px-4">{t('admin.envios.thCode')}</th>
                  <th className="py-3.5 px-4">{t('admin.envios.thZone')}</th>
                  <th className="py-3.5 px-4">{t('admin.envios.thCarrier')}</th>
                  <th className="py-3.5 px-4">{t('admin.envios.thRate')}</th>
                  <th className="py-3.5 px-4 text-center">{t('admin.envios.formCountryStatus')}</th>
                  <th className="py-3.5 px-6 text-right">{t('admin.envios.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foeg-border/60 font-light">
                {filteredCountries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-foeg-muted italic">
                      {language === 'es'
                        ? 'No se encontraron países con este filtro.'
                        : language === 'en'
                        ? 'No countries found with this filter.'
                        : 'Aucun pays trouvé avec ce filtre.'}
                    </td>
                  </tr>
                ) : (
                  filteredCountries.map((c) => {
                    const countryName =
                      contentLang === 'es' ? c.nameEs : contentLang === 'en' ? c.nameEn : c.nameFr;
                    const isActive = c.enabled !== false;

                    return (
                      <tr
                        key={c.code}
                        className={`hover:bg-foeg-surface/20 transition-colors ${
                          !isActive ? 'opacity-50 bg-neutral-50/50' : ''
                        }`}
                      >
                        <td className="py-3.5 px-6 font-medium text-foeg-black">
                          <div className="flex items-center space-x-2">
                            <span>{countryName}</span>
                            {c.nameFr !== countryName && (
                              <span className="text-[10px] text-foeg-muted font-normal hidden md:inline">
                                ({c.nameFr})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-foeg-navy font-medium">
                          {c.code}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
                              c.isEu
                                ? 'bg-blue-50 text-blue-900 border border-blue-200'
                                : 'bg-amber-50 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {c.isEu ? t('admin.envios.zoneEuLabel') : t('admin.envios.zoneIntlLabel')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-foeg-black text-[11px]">
                          {c.isEu ? 'Colissimo / Chronopost Privé' : 'DHL Express Worldwide'}
                        </td>
                        <td className="py-3.5 px-4 text-foeg-muted font-mono text-[11px]">
                          {c.isEu ? (
                            <span>
                              {settings.standardEuCost} € ({t('admin.envios.freeFrom')}{' '}
                              {settings.freeShippingThreshold} €)
                            </span>
                          ) : (
                            <span>{settings.expressIntlCost} €</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleCountryStatus(c.code)}
                            title={isActive ? t('admin.envios.statusActive') : t('admin.envios.statusDisabled')}
                            className="inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                          >
                            {isActive ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] uppercase tracking-wider font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
                                <span>{t('admin.envios.statusActive')}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-neutral-100 text-neutral-600 border border-neutral-300 text-[10px] uppercase tracking-wider font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 inline-block"></span>
                                <span>{t('admin.envios.statusDisabled')}</span>
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(c)}
                              title={t('admin.envios.editCountry')}
                              className="p-1.5 text-foeg-muted hover:text-foeg-navy hover:bg-foeg-surface/60 transition-colors cursor-pointer border border-transparent hover:border-foeg-border"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCountry(c.code)}
                              title={t('admin.envios.deleteCountry')}
                              className="p-1.5 text-foeg-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Modal de Crear / Editar País */}
          {isCountryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white border border-foeg-border w-full max-w-lg shadow-floating p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-foeg-border pb-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-foeg-navy" strokeWidth={1.5} />
                    <h3 className="font-serif text-xl text-foeg-black">
                      {editingCountry ? t('admin.envios.editCountry') : t('admin.envios.addCountry')}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCountryModalOpen(false)}
                    className="text-foeg-muted hover:text-foeg-black cursor-pointer p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveCountry} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                        {t('admin.envios.formCountryCode')} *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={3}
                        value={countryForm.code}
                        onChange={(e) =>
                          setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })
                        }
                        placeholder="FR, US, ES, MX..."
                        className="w-full border border-foeg-border px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-foeg-navy"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                        {t('admin.envios.formCountryZone')} *
                      </label>
                      <select
                        value={countryForm.isEu ? 'eu' : 'intl'}
                        onChange={(e) =>
                          setCountryForm({ ...countryForm, isEu: e.target.value === 'eu' })
                        }
                        className="w-full border border-foeg-border px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-foeg-navy"
                      >
                        <option value="eu">{t('admin.envios.zoneEuLabel')}</option>
                        <option value="intl">{t('admin.envios.zoneIntlLabel')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                      {t('admin.envios.formCountryNameEs')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={countryForm.nameEs}
                      onChange={(e) => setCountryForm({ ...countryForm, nameEs: e.target.value })}
                      placeholder="España, Francia, Estados Unidos..."
                      className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                      {t('admin.envios.formCountryNameFr')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={countryForm.nameFr}
                      onChange={(e) => setCountryForm({ ...countryForm, nameFr: e.target.value })}
                      placeholder="Espagne, France, États-Unis..."
                      className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                      {t('admin.envios.formCountryNameEn')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={countryForm.nameEn}
                      onChange={(e) => setCountryForm({ ...countryForm, nameEn: e.target.value })}
                      placeholder="Spain, France, United States..."
                      className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={countryForm.enabled}
                        onChange={(e) =>
                          setCountryForm({ ...countryForm, enabled: e.target.checked })
                        }
                        className="w-4 h-4 text-foeg-navy focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs uppercase tracking-wider text-foeg-black font-medium">
                        {t('admin.envios.formCountryStatus')}: {countryForm.enabled ? t('admin.envios.statusActive') : t('admin.envios.statusDisabled')}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-foeg-border">
                    <button
                      type="button"
                      onClick={() => setIsCountryModalOpen(false)}
                      className="px-4 py-2 border border-foeg-border text-foeg-muted hover:text-foeg-black text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {language === 'es' ? 'Cancelar' : language === 'en' ? 'Cancel' : 'Annuler'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingCountry}
                      className="px-6 py-2 bg-foeg-navy hover:bg-black text-white text-xs uppercase tracking-wider font-medium cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isSavingCountry ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{t('admin.envios.saving')}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{language === 'es' ? 'Guardar País' : language === 'en' ? 'Save Country' : 'Enregistrer'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO 3: SIMULADOR DE ENVÍOS EN VIVO */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-foeg-border p-6 sm:p-8 space-y-6 shadow-subtle">
            <div className="flex items-center space-x-3 border-b border-foeg-border/60 pb-4">
              <Calculator className="w-5 h-5 text-foeg-navy shrink-0" strokeWidth={1.5} />
              <div>
                <h2 className="font-serif text-xl text-foeg-black font-normal">
                  {t('admin.envios.simTitle')}
                </h2>
                <p className="text-xs text-foeg-muted font-light mt-0.5">
                  {t('admin.envios.simSubtitle')}
                </p>
              </div>
            </div>

            {/* Parámetros de prueba del Simulador */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-light">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('admin.envios.simCountry')}
                </label>
                <select
                  value={simCountryCode}
                  onChange={(e) => setSimCountryCode(e.target.value)}
                  className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy bg-white cursor-pointer"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {contentLang === 'es' ? c.nameEs : contentLang === 'en' ? c.nameEn : c.nameFr} ({c.code})
                      {c.enabled === false ? ` [${t('admin.envios.statusDisabled')}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('admin.envios.simSubtotal')}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={simSubtotal}
                    onChange={(e) => setSimSubtotal(parseFloat(e.target.value) || 0)}
                    className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy font-mono"
                  />
                  <span className="absolute right-3 text-xs text-foeg-muted">EUR (€)</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('admin.envios.simMethod')}
                </label>
                <select
                  value={simIsPickup ? 'pickup' : 'shipping'}
                  onChange={(e) => setSimIsPickup(e.target.value === 'pickup')}
                  className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy bg-white cursor-pointer"
                >
                  <option value="shipping">{t('admin.envios.simDeliveryStandard')}</option>
                  <option value="pickup">{t('admin.envios.simDeliveryPickup')}</option>
                </select>
              </div>
            </div>

            {/* Presets Rápidos de Monto */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-foeg-border/40 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium">
                {t('admin.envios.simPresets')}
              </span>
              {[
                { label: '50 € (Boutique)', val: 50 },
                { label: `${settings.freeShippingThreshold} € (Umbral)`, val: settings.freeShippingThreshold },
                { label: '350 € (Prêt-à-Porter)', val: 350 },
                { label: '1.200 € (Haute Couture)', val: 1200 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setSimSubtotal(p.val)}
                  className={`px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer border ${
                    simSubtotal === p.val
                      ? 'bg-foeg-navy text-white border-foeg-navy'
                      : 'bg-foeg-surface/60 border-foeg-border text-foeg-black hover:border-foeg-navy'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Resultado del Cálculo en Tiempo Real */}
            <div className="bg-foeg-surface/40 border border-foeg-border/80 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-foeg-border/60 pb-3">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-foeg-navy" strokeWidth={1.5} />
                  <span className="font-serif text-base text-foeg-black">
                    {language === 'es'
                      ? 'Resultado para el Cliente'
                      : language === 'en'
                      ? 'Customer Checkout Output'
                      : 'Résultat pour le Client'}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{t('admin.envios.simPass')}</span>
                </div>
              </div>

              {/* Indicador de Umbral si aplica */}
              {thresholdDifference > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      {t('admin.envios.simThresholdRemaining').replace('{amount}', thresholdDifference.toFixed(2))}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSimSubtotal(settings.freeShippingThreshold)}
                    className="underline text-[11px] font-medium hover:text-black cursor-pointer"
                  >
                    {language === 'es' ? 'Alcanzar umbral' : 'Atteindre le seuil'}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-white p-3.5 border border-foeg-border/60 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">
                    {t('admin.envios.simResultCarrier')}
                  </span>
                  <p className="font-medium text-foeg-black text-sm">
                    {simResult.carrier}
                  </p>
                  <p className="text-[10px] text-foeg-muted">{simResult.serviceName}</p>
                </div>

                <div className="bg-white p-3.5 border border-foeg-border/60 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">
                    {t('admin.envios.simResultCost')}
                  </span>
                  <p className="font-serif text-xl font-medium text-foeg-navy">
                    {simResult.isFree ? '0,00 €' : `${simResult.cost.toFixed(2)} €`}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    {simResult.isFree ? t('admin.envios.simResultFree') : t('admin.envios.simResultStandard')}
                  </p>
                </div>

                <div className="bg-white p-3.5 border border-foeg-border/60 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">
                    {t('admin.envios.simDeliveryWindow')}
                  </span>
                  <p className="font-medium text-foeg-black text-xs flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-foeg-navy shrink-0" strokeWidth={1.5} />
                    <span>{estimatedDateWindow}</span>
                  </p>
                  <p className="text-[10px] text-foeg-muted">
                    {contentLang === 'es'
                      ? selectedCountryObj?.nameEs
                      : contentLang === 'en'
                      ? selectedCountryObj?.nameEn
                      : selectedCountryObj?.nameFr}
                  </p>
                </div>

                <div className="bg-white p-3.5 border border-foeg-border/60 space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-foeg-muted block">
                    {t('admin.envios.simResultCustoms')}
                  </span>
                  <p className="font-medium text-xs">
                    {simResult.isNonEu ? (
                      <span className="text-amber-800 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        {t('admin.envios.simYes')}
                      </span>
                    ) : (
                      <span className="text-foeg-muted">{t('admin.envios.simNo')}</span>
                    )}
                  </p>
                  {simResult.customsNotice && (
                    <p className="text-[10px] text-foeg-muted italic truncate" title={simResult.customsNotice}>
                      {simResult.customsNotice}
                    </p>
                  )}
                </div>
              </div>

              {/* Detalle de Itinerario Logístico */}
              <div className="pt-3 border-t border-foeg-border/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-foeg-muted gap-2">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-foeg-navy" strokeWidth={1.5} />
                  <span>
                    <strong className="text-foeg-black font-medium">{t('admin.envios.simRoute')}:</strong>{' '}
                    {t('admin.envios.simOrigin')} ➔{' '}
                    {contentLang === 'es'
                      ? selectedCountryObj?.nameEs
                      : contentLang === 'en'
                      ? selectedCountryObj?.nameEn
                      : selectedCountryObj?.nameFr}
                  </span>
                </div>

                <span className="text-[10px] uppercase tracking-wider text-foeg-navy font-mono">
                  {selectedCountryObj?.isEu ? 'Schengen / Colissimo Europe' : 'DHL Express Worldwide Protocol'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
