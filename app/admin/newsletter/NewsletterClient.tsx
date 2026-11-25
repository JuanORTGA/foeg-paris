'use client';

import React, { useState } from 'react';
import {
  Mail,
  Download,
  Trash2,
  Search,
  Check,
  AlertCircle,
  Plus,
  Pencil,
  Send,
  Printer,
  Eye,
  X,
  Users,
  ShieldCheck,
  Crown,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  NewsletterSubscriberItem,
  NewsletterCampaignItem,
  addAdminSubscriber,
  updateAdminSubscriber,
  deleteNewsletterSubscriber,
  sendNewsletterCampaign,
  deleteNewsletterCampaign,
} from '@/lib/newsletter-actions';
import { useLanguage } from '@/lib/language-context';

interface NewsletterClientProps {
  initialSubscribers: NewsletterSubscriberItem[];
  initialCampaigns: NewsletterCampaignItem[];
}

export default function NewsletterClient({
  initialSubscribers,
  initialCampaigns,
}: NewsletterClientProps) {
  const { t, language } = useLanguage();

  // Estados principales
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers');
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberItem[]>(initialSubscribers);
  const [campaigns, setCampaigns] = useState<NewsletterCampaignItem[]>(initialCampaigns);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modales
  const [subscriberModalOpen, setSubscriberModalOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<NewsletterSubscriberItem | null>(null);
  const [subscriberForm, setSubscriberForm] = useState<{
    email: string;
    source: string;
    status: 'ACTIVE' | 'PAUSED' | 'UNSUBSCRIBED';
    notes: string;
  }>({
    email: '',
    source: 'Cercle Privé VIP',
    status: 'ACTIVE',
    notes: '',
  });

  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [campaignForm, setCampaignForm] = useState<{
    subject: string;
    targetAudience: 'ALL' | 'VIP' | 'WEB' | 'BOUTIQUE';
    previewText: string;
    content: string;
    ctaText: string;
    ctaUrl: string;
  }>({
    subject: 'Aperçu Exclusif · Nouvelle Collection Maison FOEG',
    targetAudience: 'ALL',
    previewText: 'Invitation privée pour les membres du Cercle FOEG...',
    content: `Chers membres et amis de la Maison FOEG,\n\nNous avons le plaisir de vous présenter les nouvelles créations exclusives conçues au sein de notre Atelier parisien.\n\nChaque silhouette incarne l'alliance parfaite entre l'artisanat d'exception, les matières les plus nobles et la précision intemporelle de nos coupes de haute confection.\n\nVotre accès privilégié est dès à présent disponible sur notre boutique en ligne.`,
    ctaText: 'Découvrir la Collection Privée',
    ctaUrl: '/colecciones',
  });

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'subscriber' | 'campaign';
    id: string;
    label: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper de traducción de orígenes / fuentes
  const formatSourceLabel = (source: string) => {
    const s = (source || '').toLowerCase();
    if (s.includes('vip') || s.includes('cercle')) {
      return language === 'es' ? 'Círculo Privado VIP' : language === 'en' ? 'VIP Private Circle' : 'Cercle Privé VIP';
    }
    if (s.includes('pied') || s.includes('footer')) {
      return language === 'es' ? 'Pie de Página (Web)' : language === 'en' ? 'Footer (Web)' : 'Pied de page (Web)';
    }
    if (s.includes('hero') || s.includes('accueil')) {
      return language === 'es' ? 'Página de Inicio (Hero)' : language === 'en' ? 'Homepage (Hero)' : 'Page d’Accueil (Hero)';
    }
    if (s.includes('atelier')) {
      return language === 'es' ? 'Atelier Privado París' : language === 'en' ? 'Private Atelier Paris' : 'Atelier Privé Paris';
    }
    if (s.includes('boutique')) {
      return language === 'es' ? 'Boutique Física' : language === 'en' ? 'Physical Boutique' : 'Boutique Physique';
    }
    return source;
  };

  const formatStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return language === 'es' ? 'Activo' : language === 'en' ? 'Active' : 'Actif';
      case 'PAUSED':
        return language === 'es' ? 'En Pausa' : language === 'en' ? 'Paused' : 'En Pause';
      case 'UNSUBSCRIBED':
        return language === 'es' ? 'Desuscrito' : language === 'en' ? 'Unsubscribed' : 'Désinscrit';
      default:
        return status;
    }
  };

  const formatAudienceLabel = (aud: string) => {
    switch (aud) {
      case 'ALL':
        return language === 'es' ? 'Todos los Suscriptores' : language === 'en' ? 'All Subscribers' : 'Tous les Abonnés';
      case 'VIP':
        return language === 'es' ? 'Solo Círculo Privado VIP' : language === 'en' ? 'VIP Private Circle Only' : 'Cercle Privé VIP Uniquement';
      case 'WEB':
        return language === 'es' ? 'Suscriptores Web (Footer)' : language === 'en' ? 'Web Subscribers (Footer)' : 'Abonnés Web (Pied de page)';
      case 'BOUTIQUE':
        return language === 'es' ? 'Atelier & Boutique' : language === 'en' ? 'Atelier & Boutique' : 'Atelier & Boutique';
      default:
        return aud;
    }
  };

  // Filtrado de suscriptores
  const filteredSubscribers = subscribers.filter((sub) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      sub.email.toLowerCase().includes(q) ||
      sub.source.toLowerCase().includes(q) ||
      (sub.notes && sub.notes.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (segmentFilter === 'VIP') {
      return sub.source.toLowerCase().includes('vip') || sub.source.toLowerCase().includes('cercle');
    }
    if (segmentFilter === 'WEB') {
      return (
        sub.source.toLowerCase().includes('pied') ||
        sub.source.toLowerCase().includes('footer') ||
        sub.source.toLowerCase().includes('hero')
      );
    }
    if (segmentFilter === 'BOUTIQUE') {
      return sub.source.toLowerCase().includes('boutique') || sub.source.toLowerCase().includes('atelier');
    }
    if (segmentFilter === 'ACTIVE') {
      return sub.status === 'ACTIVE';
    }
    if (segmentFilter === 'PAUSED') {
      return sub.status === 'PAUSED' || sub.status === 'UNSUBSCRIBED';
    }

    return true;
  });

  // Métricas
  const totalCount = subscribers.length;
  const vipCount = subscribers.filter(
    (s) => s.source.toLowerCase().includes('vip') || s.source.toLowerCase().includes('cercle')
  ).length;
  const activeCount = subscribers.filter((s) => s.status === 'ACTIVE').length;
  const activeRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 100;

  // Acciones CRUD Suscriptor
  const handleOpenAddSubscriber = () => {
    setEditingSubscriber(null);
    setSubscriberForm({
      email: '',
      source: 'Cercle Privé VIP',
      status: 'ACTIVE',
      notes: '',
    });
    setSubscriberModalOpen(true);
  };

  const handleOpenEditSubscriber = (sub: NewsletterSubscriberItem) => {
    setEditingSubscriber(sub);
    setSubscriberForm({
      email: sub.email,
      source: sub.source,
      status: sub.status || 'ACTIVE',
      notes: sub.notes || '',
    });
    setSubscriberModalOpen(true);
  };

  const handleSaveSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberForm.email.trim() || !subscriberForm.email.includes('@')) {
      setFeedback({
        type: 'error',
        message: language === 'es' ? 'Por favor ingrese un correo válido.' : 'Please enter a valid email address.',
      });
      return;
    }

    setIsSubmitting(true);
    if (editingSubscriber) {
      // UPDATE
      const res = await updateAdminSubscriber(editingSubscriber.id, subscriberForm);
      if (res.success && res.subscriber) {
        setSubscribers((prev) => prev.map((s) => (s.id === editingSubscriber.id ? res.subscriber! : s)));
        setSubscriberModalOpen(false);
        setFeedback({
          type: 'success',
          message:
            language === 'es'
              ? 'Suscriptor actualizado con éxito.'
              : language === 'en'
              ? 'Subscriber updated successfully.'
              : 'Abonné mis à jour avec succès.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Error al actualizar el suscriptor.',
        });
      }
    } else {
      // CREATE
      const res = await addAdminSubscriber(subscriberForm);
      if (res.success && res.subscriber) {
        setSubscribers((prev) => [res.subscriber!, ...prev]);
        setSubscriberModalOpen(false);
        setFeedback({
          type: 'success',
          message:
            language === 'es'
              ? 'Nuevo suscriptor registrado con éxito.'
              : language === 'en'
              ? 'New subscriber registered successfully.'
              : 'Nouvel abonné enregistré avec succès.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Error al agregar el suscriptor.',
        });
      }
    }
    setIsSubmitting(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsSubmitting(true);

    if (deleteConfirmTarget.type === 'subscriber') {
      const res = await deleteNewsletterSubscriber(deleteConfirmTarget.id);
      if (res.success) {
        setSubscribers((prev) => prev.filter((s) => s.id !== deleteConfirmTarget.id));
        setFeedback({
          type: 'success',
          message:
            language === 'es'
              ? 'Suscriptor eliminado de la lista.'
              : language === 'en'
              ? 'Subscriber removed from list.'
              : 'Abonné supprimé de la liste.',
        });
      }
    } else {
      const res = await deleteNewsletterCampaign(deleteConfirmTarget.id);
      if (res.success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== deleteConfirmTarget.id));
        setFeedback({
          type: 'success',
          message:
            language === 'es'
              ? 'Campaña eliminada del historial.'
              : language === 'en'
              ? 'Campaign removed from history.'
              : 'Campagne supprimée de l’historique.',
        });
      }
    }

    setIsSubmitting(false);
    setDeleteConfirmTarget(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Envío de Campaña
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.subject.trim() || !campaignForm.content.trim()) {
      setFeedback({
        type: 'error',
        message:
          language === 'es'
            ? 'El asunto y el contenido del comunicado son requeridos.'
            : 'Subject and message content are required.',
      });
      return;
    }

    setIsSubmitting(true);
    const res = await sendNewsletterCampaign(campaignForm);
    if (res.success && res.campaign) {
      setCampaigns((prev) => [res.campaign!, ...prev]);
      setCampaignModalOpen(false);
      setPreviewMode(false);
      setActiveTab('campaigns');
      setFeedback({
        type: 'success',
        message:
          language === 'es'
            ? '¡Comunicado oficial transmitido con éxito y registrado en el historial!'
            : language === 'en'
            ? 'Official newsletter dispatched successfully and recorded!'
            : 'Communiqué officiel transmis avec succès et archivé !',
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Error al transmitir el comunicado.',
      });
    }
    setIsSubmitting(false);
    setTimeout(() => setFeedback(null), 5000);
  };

  // Exportar CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert(
        language === 'es'
          ? 'No hay suscriptores para exportar.'
          : language === 'en'
          ? 'No subscribers to export.'
          : 'Aucun abonné à exporter.'
      );
      return;
    }

    const headers = ['ID', 'Email', 'Segmento_Origen', 'Estado', 'Notas', 'Fecha_Registro'];
    const rows = subscribers.map((s) => [
      s.id,
      `"${s.email}"`,
      `"${formatSourceLabel(s.source)}"`,
      `"${formatStatusLabel(s.status || 'ACTIVE')}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(s.createdAt).toLocaleString(
        language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR'
      )}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `foeg_newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Imprimir Dossier
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* =========================================================================
          1. CABECERA HAUTE COUTURE Y ACCIONES RÁPIDAS
         ========================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between pb-6 border-b border-foeg-border/80 gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1">
            {t('admin.newsletter.tag')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
            {t('admin.newsletter.title')}
          </h1>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
          <button
            type="button"
            onClick={handleOpenAddSubscriber}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-foeg-navy text-white hover:bg-black transition-colors text-xs uppercase tracking-[0.18em] font-medium cursor-pointer shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('admin.newsletter.addSubscriber')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewMode(false);
              setCampaignModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-foeg-navy text-foeg-navy hover:bg-foeg-navy hover:text-white transition-colors text-xs uppercase tracking-[0.18em] font-medium cursor-pointer shadow-subtle"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('admin.newsletter.composeCampaign')}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 bg-white border border-foeg-border/80 text-foeg-black hover:bg-foeg-surface/60 transition-colors text-xs uppercase tracking-[0.18em] font-medium cursor-pointer"
              title={t('admin.newsletter.printDossier')}
            >
              <Printer className="w-3.5 h-3.5 text-foeg-muted" />
              <span>{t('admin.newsletter.printDossier')}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 bg-white border border-foeg-border/80 text-foeg-black hover:bg-foeg-surface/60 transition-colors text-xs uppercase tracking-[0.18em] font-medium cursor-pointer"
              title={t('admin.newsletter.exportCsv')}
            >
              <Download className="w-3.5 h-3.5 text-foeg-muted" />
              <span>{t('admin.newsletter.exportCsv')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-3.5 flex items-center justify-between text-xs border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-700" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-700" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          2. NAVEGACIÓN POR PESTAÑAS (SUSCRIPTORES vs CAMPAÑAS)
         ========================================================================= */}
      <div className="flex border-b border-foeg-border/80 space-x-6 sm:space-x-8 text-xs uppercase tracking-[0.2em] overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('subscribers')}
          className={`pb-3 font-medium transition-colors cursor-pointer border-b-2 flex items-center space-x-2 ${
            activeTab === 'subscribers'
              ? 'border-foeg-navy text-foeg-navy'
              : 'border-transparent text-foeg-muted hover:text-foeg-black'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t('admin.newsletter.tabSubscribers')}</span>
          <span className="ml-1 px-1.5 py-0.5 bg-foeg-surface border border-foeg-border text-[10px]">
            {subscribers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 font-medium transition-colors cursor-pointer border-b-2 flex items-center space-x-2 ${
            activeTab === 'campaigns'
              ? 'border-foeg-navy text-foeg-navy'
              : 'border-transparent text-foeg-muted hover:text-foeg-black'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{t('admin.newsletter.tabCampaigns')}</span>
          <span className="ml-1 px-1.5 py-0.5 bg-foeg-surface border border-foeg-border text-[10px]">
            {campaigns.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          PESTAÑA 1: GESTIÓN DE SUSCRIPTORES
         ========================================================================= */}
      {activeTab === 'subscribers' && (
        <div className="space-y-6">
          {/* Métricas rápidas (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
              <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block">
                {t('admin.newsletter.totalSubscribers')}
              </span>
              <p className="font-serif text-3xl text-foeg-black">{totalCount}</p>
              <span className="text-[10px] text-foeg-muted font-light block">
                {language === 'es' ? 'Contactos en la base de datos' : 'Registered in database'}
              </span>
            </div>

            <div className="p-5 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block">
                  {t('admin.newsletter.vipCircle')}
                </span>
                <Crown className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <p className="font-serif text-3xl text-foeg-navy">{vipCount}</p>
              <span className="text-[10px] text-amber-800 font-light block">
                {language === 'es' ? 'Acceso a colecciones privadas' : 'Private collections access'}
              </span>
            </div>

            <div className="p-5 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block">
                  {t('admin.newsletter.activeRate')}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <p className="font-serif text-3xl text-emerald-800">{activeRate}%</p>
              <span className="text-[10px] text-emerald-700 font-light block">
                {activeCount} {language === 'es' ? 'suscriptores activos' : 'active subscribers'}
              </span>
            </div>

            <div className="p-5 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
              <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block">
                {t('admin.newsletter.lastSubscription')}
              </span>
              <p className="font-serif text-2xl text-foeg-black pt-1">
                {subscribers.length > 0
                  ? new Date(subscribers[0].createdAt).toLocaleDateString(
                      language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }
                    )
                  : '—'}
              </p>
              <span className="text-[10px] text-foeg-muted font-light block">
                {subscribers.length > 0
                  ? new Date(subscribers[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </span>
            </div>
          </div>

          {/* Filtros de Segmento + Barra de Búsqueda */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 border border-foeg-border/80 shadow-subtle">
            {/* Píldoras de segmento */}
            <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar whitespace-nowrap pb-1 lg:pb-0">
              {[
                { id: 'ALL', label: t('admin.newsletter.filterAll'), count: subscribers.length },
                { id: 'VIP', label: t('admin.newsletter.filterVip'), count: vipCount },
                {
                  id: 'WEB',
                  label: t('admin.newsletter.filterWeb'),
                  count: subscribers.filter(
                    (s) =>
                      s.source.toLowerCase().includes('pied') ||
                      s.source.toLowerCase().includes('footer') ||
                      s.source.toLowerCase().includes('hero')
                  ).length,
                },
                {
                  id: 'BOUTIQUE',
                  label: t('admin.newsletter.filterBoutique'),
                  count: subscribers.filter(
                    (s) => s.source.toLowerCase().includes('boutique') || s.source.toLowerCase().includes('atelier')
                  ).length,
                },
                { id: 'ACTIVE', label: t('admin.newsletter.filterActive'), count: activeCount },
                {
                  id: 'PAUSED',
                  label: t('admin.newsletter.filterPaused'),
                  count: subscribers.filter((s) => s.status === 'PAUSED' || s.status === 'UNSUBSCRIBED').length,
                },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setSegmentFilter(btn.id)}
                  className={`px-3 py-1.5 uppercase tracking-wider text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer border shrink-0 ${
                    segmentFilter === btn.id
                      ? 'bg-foeg-navy text-white border-foeg-navy'
                      : 'bg-white text-foeg-muted border-foeg-border/80 hover:border-foeg-navy hover:text-foeg-black'
                  }`}
                >
                  {btn.label} <span className="opacity-70 ml-1">({btn.count})</span>
                </button>
              ))}
            </div>

            {/* Input de Búsqueda */}
            <div className="flex items-center bg-foeg-surface/40 border border-foeg-border px-3.5 py-2 w-full lg:w-auto min-w-0 lg:min-w-[260px]">
              <Search className="w-3.5 h-3.5 text-foeg-muted mr-2.5 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('admin.newsletter.searchPlaceholder')}
                className="w-full text-xs text-foeg-black placeholder:text-gray-400 focus:outline-none font-light bg-transparent"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-gray-400 hover:text-black ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Suscriptores con CRUD */}
          <div className="bg-white border border-foeg-border/80 overflow-x-auto no-scrollbar shadow-subtle">
            <table className="w-full text-left text-xs font-light whitespace-nowrap min-w-[650px]">
              <thead className="bg-foeg-surface/60 border-b border-foeg-border text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium">
                <tr>
                  <th className="py-3.5 px-6">{t('admin.newsletter.thEmail')}</th>
                  <th className="py-3.5 px-6">{t('admin.newsletter.thSource')}</th>
                  <th className="py-3.5 px-6">{t('admin.newsletter.thStatus')}</th>
                  <th className="py-3.5 px-6">{t('admin.newsletter.thNotes')}</th>
                  <th className="py-3.5 px-6">{t('admin.newsletter.thDate')}</th>
                  <th className="py-3.5 px-6 text-right">{t('admin.newsletter.thAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foeg-border/60">
                {filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((sub) => {
                    const isVip =
                      sub.source.toLowerCase().includes('vip') || sub.source.toLowerCase().includes('cercle');

                    return (
                      <tr key={sub.id} className="hover:bg-foeg-surface/20 transition-colors">
                        {/* Email */}
                        <td className="py-4 px-6 font-medium text-foeg-black">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-none bg-foeg-surface border border-foeg-border flex items-center justify-center shrink-0">
                              <Mail className="w-3.5 h-3.5 text-foeg-navy" />
                            </div>
                            <div>
                              <span className="block font-medium">{sub.email}</span>
                              <span className="text-[10px] text-foeg-muted font-light font-mono">
                                ID: {sub.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Origen / Segmento */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium border ${
                              isVip
                                ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                                : 'bg-foeg-surface border-foeg-border text-foeg-black'
                            }`}
                          >
                            {isVip && <Crown className="w-3 h-3 mr-0.5 text-amber-700" />}
                            <span>{formatSourceLabel(sub.source)}</span>
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium border ${
                              sub.status === 'ACTIVE'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : sub.status === 'PAUSED'
                                ? 'bg-amber-50 border-amber-300 text-amber-800'
                                : 'bg-gray-100 border-gray-300 text-gray-700'
                            }`}
                          >
                            {formatStatusLabel(sub.status || 'ACTIVE')}
                          </span>
                        </td>

                        {/* Notas / Atelier */}
                        <td className="py-4 px-6 text-foeg-muted max-w-[200px] truncate">
                          {sub.notes ? (
                            <span className="text-[11px] text-foeg-black/80 italic font-serif">
                              «{sub.notes}»
                            </span>
                          ) : (
                            <span className="text-[10px] text-foeg-muted/50">—</span>
                          )}
                        </td>

                        {/* Fecha */}
                        <td className="py-4 px-6 text-foeg-muted whitespace-nowrap">
                          {new Date(sub.createdAt).toLocaleDateString(
                            language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }
                          )}
                          <span className="block text-[10px] text-foeg-muted/60">
                            {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Acciones CRUD */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center space-x-1.5">
                            {/* Editar */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditSubscriber(sub)}
                              className="p-1.5 text-foeg-muted hover:text-foeg-navy transition-colors cursor-pointer border border-transparent hover:border-foeg-border hover:bg-foeg-surface/50"
                              title={t('admin.newsletter.edit')}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Eliminar */}
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirmTarget({
                                  type: 'subscriber',
                                  id: sub.id,
                                  label: sub.email,
                                })
                              }
                              className="p-1.5 text-foeg-muted hover:text-red-700 transition-colors cursor-pointer border border-transparent hover:border-red-200 hover:bg-red-50/50"
                              title={t('admin.newsletter.delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-foeg-muted font-light">
                      <Mail className="w-8 h-8 text-foeg-muted/40 mx-auto mb-2" />
                      <p>
                        {language === 'es'
                          ? 'No se encontraron suscriptores con los criterios especificados.'
                          : language === 'en'
                          ? 'No subscribers matching search criteria.'
                          : 'Aucun abonné correspondant aux critères.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          PESTAÑA 2: HISTORIAL DE COMUNICADOS Y BOLETINES ENVIADOS
         ========================================================================= */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-foeg-border/80 shadow-subtle">
            <div>
              <h2 className="font-serif text-lg text-foeg-black font-light">
                {language === 'es'
                  ? 'Archivo de Comunicados Oficiales'
                  : language === 'en'
                  ? 'Official Dispatches Archive'
                  : 'Archives des Communiqués Officiels'}
              </h2>
              <p className="text-[11px] text-foeg-muted font-light">
                {language === 'es'
                  ? 'Registro histórico de boletines transmitidos a las clientas y miembros del Círculo Privado.'
                  : 'Historical register of newsletters dispatched to clientele and VIP members.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPreviewMode(false);
                setCampaignModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-foeg-navy text-white hover:bg-black transition-colors text-xs uppercase tracking-[0.18em] font-medium cursor-pointer shadow-subtle self-start sm:self-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('admin.newsletter.composeCampaign')}</span>
            </button>
          </div>

          <div className="bg-white border border-foeg-border/80 overflow-x-auto shadow-subtle">
            <table className="w-full text-left text-xs font-light">
              <thead className="bg-foeg-surface/60 border-b border-foeg-border text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium">
                <tr>
                  <th className="py-3.5 px-6">
                    {language === 'es' ? 'Asunto / Título' : 'Subject / Title'}
                  </th>
                  <th className="py-3.5 px-6">
                    {language === 'es' ? 'Audiencia Destino' : 'Target Audience'}
                  </th>
                  <th className="py-3.5 px-6">
                    {language === 'es' ? 'Destinatarios' : 'Recipients'}
                  </th>
                  <th className="py-3.5 px-6">
                    {language === 'es' ? 'Fecha de Envío' : 'Dispatch Date'}
                  </th>
                  <th className="py-3.5 px-6">
                    {language === 'es' ? 'Estado' : 'Status'}
                  </th>
                  <th className="py-3.5 px-6 text-right">
                    {t('admin.newsletter.thAction')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foeg-border/60">
                {campaigns.length > 0 ? (
                  campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-foeg-surface/20 transition-colors">
                      <td className="py-4 px-6 font-medium text-foeg-black max-w-[280px]">
                        <div className="flex items-start space-x-2.5">
                          <FileText className="w-4 h-4 text-foeg-navy shrink-0 mt-0.5" />
                          <div>
                            <span className="block font-medium truncate">{camp.subject}</span>
                            {camp.previewText && (
                              <span className="text-[10px] text-foeg-muted font-light truncate block">
                                {camp.previewText}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-foeg-surface border border-foeg-border text-[10px] uppercase tracking-wider font-medium">
                          {formatAudienceLabel(camp.targetAudience)}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono text-foeg-black">
                        {camp.recipientCount} {language === 'es' ? 'destinatarios' : 'recipients'}
                      </td>

                      <td className="py-4 px-6 text-foeg-muted whitespace-nowrap">
                        {new Date(camp.sentAt).toLocaleDateString(
                          language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )}
                        <span className="block text-[10px] text-foeg-muted/60">
                          {new Date(camp.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] uppercase tracking-wider font-medium">
                          {language === 'es' ? 'Transmitido con Éxito' : 'Successfully Dispatched'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirmTarget({
                              type: 'campaign',
                              id: camp.id,
                              label: camp.subject,
                            })
                          }
                          className="p-1.5 text-foeg-muted hover:text-red-700 transition-colors cursor-pointer border border-transparent hover:border-red-200 hover:bg-red-50/50"
                          title={t('admin.newsletter.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-foeg-muted font-light">
                      {language === 'es'
                        ? 'No se han transmitido comunicados aún.'
                        : 'No dispatched campaigns yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: AGREGAR O EDITAR SUSCRIPTOR (CRUD COMPLETO)
         ========================================================================= */}
      {subscriberModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-foeg-border shadow-floating w-full max-w-lg p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-foeg-border/80 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted block mb-0.5">
                  {t('admin.newsletter.tag')}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-foeg-black font-light">
                  {editingSubscriber
                    ? t('admin.newsletter.modalEditTitle')
                    : t('admin.newsletter.modalAddTitle')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSubscriberModalOpen(false)}
                className="text-foeg-muted hover:text-black p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubscriber} className="space-y-4 text-xs font-light">
              {/* Correo Electrónico */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium mb-1.5">
                  {t('admin.newsletter.thEmail')} *
                </label>
                <input
                  type="email"
                  required
                  value={subscriberForm.email}
                  onChange={(e) => setSubscriberForm({ ...subscriberForm, email: e.target.value })}
                  placeholder="ejemplo@haute-couture.fr"
                  className="w-full border border-foeg-border px-3.5 py-2 text-foeg-black focus:outline-none focus:border-foeg-navy bg-foeg-surface/20"
                />
              </div>

              {/* Origen / Segmento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium mb-1.5">
                    {t('admin.newsletter.thSource')}
                  </label>
                  <select
                    value={subscriberForm.source}
                    onChange={(e) => setSubscriberForm({ ...subscriberForm, source: e.target.value })}
                    className="w-full border border-foeg-border px-3 py-2 text-foeg-black focus:outline-none focus:border-foeg-navy bg-white"
                  >
                    <option value="Cercle Privé VIP">
                      {language === 'es' ? 'Círculo Privado VIP' : 'Cercle Privé VIP'}
                    </option>
                    <option value="Pied de page (Footer)">
                      {language === 'es' ? 'Pie de página (Web)' : 'Pied de page (Footer)'}
                    </option>
                    <option value="Hero Accueil">
                      {language === 'es' ? 'Página Principal (Hero)' : 'Hero Accueil'}
                    </option>
                    <option value="Atelier Privé Paris">
                      {language === 'es' ? 'Atelier Privé París' : 'Atelier Privé Paris'}
                    </option>
                    <option value="Boutique Physique">
                      {language === 'es' ? 'Boutique Física' : 'Boutique Physique'}
                    </option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium mb-1.5">
                    {t('admin.newsletter.thStatus')}
                  </label>
                  <select
                    value={subscriberForm.status}
                    onChange={(e) =>
                      setSubscriberForm({
                        ...subscriberForm,
                        status: e.target.value as 'ACTIVE' | 'PAUSED' | 'UNSUBSCRIBED',
                      })
                    }
                    className="w-full border border-foeg-border px-3 py-2 text-foeg-black focus:outline-none focus:border-foeg-navy bg-white"
                  >
                    <option value="ACTIVE">{t('admin.newsletter.statusActive')}</option>
                    <option value="PAUSED">{t('admin.newsletter.statusPaused')}</option>
                    <option value="UNSUBSCRIBED">{t('admin.newsletter.statusUnsubscribed')}</option>
                  </select>
                </div>
              </div>

              {/* Notas de Conserjería / Atelier */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium mb-1.5">
                  {t('admin.newsletter.thNotes')}
                </label>
                <textarea
                  rows={2}
                  value={subscriberForm.notes}
                  onChange={(e) => setSubscriberForm({ ...subscriberForm, notes: e.target.value })}
                  placeholder={
                    language === 'es'
                      ? 'Notas privadas para la conserjería (ej. Invitada a desfile privado, afín al terciopelo)...'
                      : 'Private concierge notes...'
                  }
                  className="w-full border border-foeg-border p-3 text-foeg-black focus:outline-none focus:border-foeg-navy bg-foeg-surface/20"
                />
              </div>

              {/* Botones de acción del modal */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-foeg-border/80">
                <button
                  type="button"
                  onClick={() => setSubscriberModalOpen(false)}
                  className="px-4 py-2 border border-foeg-border text-foeg-black hover:bg-foeg-surface/50 text-xs uppercase tracking-wider cursor-pointer"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-foeg-navy text-white hover:bg-black transition-colors text-xs uppercase tracking-[0.18em] font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? language === 'es'
                      ? 'Guardando...'
                      : 'Saving...'
                    : language === 'es'
                    ? 'Guardar Suscriptor'
                    : 'Save Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: REDACTAR Y ENVIAR COMUNICADO / NEWSLETTER CAMPAIGN
         ========================================================================= */}
      {campaignModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-foeg-border shadow-floating w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-foeg-border/80 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-muted block mb-0.5">
                  {t('admin.newsletter.tag')}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-foeg-black font-light">
                  {t('admin.newsletter.modalCampaignTitle')}
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium border cursor-pointer ${
                    previewMode
                      ? 'bg-foeg-navy text-white border-foeg-navy'
                      : 'bg-white text-foeg-navy border-foeg-navy hover:bg-foeg-surface'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    {previewMode
                      ? language === 'es'
                        ? 'Editar Contenido'
                        : 'Edit Content'
                      : language === 'es'
                      ? 'Ver Maqueta del Email'
                      : 'Preview Email'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCampaignModalOpen(false)}
                  className="text-foeg-muted hover:text-black p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SI ESTAMOS EN MODO VISTA PREVIA (HAUTE COUTURE EMAIL PREVIEW) */}
            {previewMode ? (
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block">
                  {language === 'es'
                    ? 'Vista Previa en Vivo · Cómo lo recibirá el destinatario en su bandeja de entrada'
                    : 'Live Preview · How the subscriber receives it'}
                </span>

                <div className="border border-foeg-border/90 bg-[#FBF9F5] p-8 shadow-subtle max-w-xl mx-auto space-y-6 text-center">
                  {/* Membrete FOEG */}
                  <div className="space-y-1 border-b border-foeg-border/60 pb-5">
                    <span className="font-serif text-2xl tracking-[0.3em] font-normal uppercase text-foeg-black block">
                      FOEG
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.35em] text-foeg-muted block">
                      PARIS · HAUTE CONFECTION
                    </span>
                  </div>

                  {/* Asunto y Contenido */}
                  <div className="space-y-4 text-left">
                    <h3 className="font-serif text-xl text-foeg-black text-center font-light pt-2">
                      {campaignForm.subject}
                    </h3>

                    <div className="text-xs text-foeg-black/90 font-light leading-relaxed whitespace-pre-line pt-2 text-justify">
                      {campaignForm.content}
                    </div>

                    {campaignForm.ctaText && (
                      <div className="pt-4 text-center">
                        <span className="inline-block px-6 py-2.5 bg-foeg-navy text-white text-[10px] uppercase tracking-[0.25em] font-medium">
                          {campaignForm.ctaText}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pie de página institucional del correo */}
                  <div className="pt-6 border-t border-foeg-border/60 text-[9px] uppercase tracking-[0.2em] text-foeg-muted space-y-1">
                    <p>MAISON FOEG · 12 PLACE VENDÔME · 75001 PARIS</p>
                    <p className="text-foeg-muted/70">
                      {language === 'es'
                        ? 'Comunicación confidencial para clientes privilegiados.'
                        : 'Confidential communication for privileged clientele.'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className="px-4 py-2 border border-foeg-border text-xs uppercase tracking-wider hover:bg-foeg-surface cursor-pointer"
                  >
                    {language === 'es' ? 'Volver a la Edición' : 'Back to Editing'}
                  </button>
                </div>
              </div>
            ) : (
              /* FORMULARIO DE REDACCIÓN */
              <form onSubmit={handleSendCampaign} className="space-y-4 text-xs font-light">
                {/* Audiencia Destino */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium mb-1.5">
                      {language === 'es' ? 'Audiencia Destinataria *' : 'Target Audience *'}
                    </label>
                    <select
                      value={campaignForm.targetAudience}
                      onChange={(e) =>
                        setCampaignForm({
                          ...campaignForm,
                          targetAudience: e.target.value as any,
                        })
                      }
                      className="w-full border border-foeg-border px-3 py-2 text-foeg-black focus:outline-none focus:border-foeg-navy bg-white"
                    >
                      <option value="ALL">
                        {language === 'es'
                          ? `Todos los Suscriptores (${subscribers.length})`
                          : `All Subscribers (${subscribers.length})`}
                      </option>
                      <option value="VIP">
                        {language === 'es'
                          ? `Solo Círculo Privado VIP (${vipCount})`
                          : `VIP Private Circle Only (${vipCount})`}
                      </option>
                      <option value="WEB">
                        {language === 'es'
                          ? 'Suscriptores Web (Pie de Página)'
                          : 'Web Subscribers (Footer)'}
                      </option>
                      <option value="BOUTIQUE">
                        {language === 'es'
                          ? 'Clientes Atelier y Boutique Física'
                          : 'Atelier & Boutique Clients'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium mb-1.5">
                      {language === 'es' ? 'Texto Preheader (Vista previa bandeja)' : 'Preheader Text'}
                    </label>
                    <input
                      type="text"
                      value={campaignForm.previewText}
                      onChange={(e) => setCampaignForm({ ...campaignForm, previewText: e.target.value })}
                      placeholder="Breve avance que se lee en el buzón antes de abrir..."
                      className="w-full border border-foeg-border px-3.5 py-2 text-foeg-black focus:outline-none focus:border-foeg-navy bg-foeg-surface/20"
                    />
                  </div>
                </div>

                {/* Asunto */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium mb-1.5">
                    {language === 'es' ? 'Asunto del Comunicado *' : 'Newsletter Subject *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                    className="w-full border border-foeg-border px-3.5 py-2 text-foeg-black focus:outline-none focus:border-foeg-navy bg-white font-medium"
                  />
                </div>

                {/* Contenido / Cuerpo */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium mb-1.5">
                    {language === 'es' ? 'Mensaje Editorial del Boletín *' : 'Editorial Message *'}
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={campaignForm.content}
                    onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                    className="w-full border border-foeg-border p-3.5 text-foeg-black focus:outline-none focus:border-foeg-navy bg-foeg-surface/10 leading-relaxed font-serif text-sm"
                  />
                </div>

                {/* Botón CTA Opcional */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium mb-1.5">
                      {language === 'es' ? 'Texto Botón CTA' : 'CTA Button Text'}
                    </label>
                    <input
                      type="text"
                      value={campaignForm.ctaText}
                      onChange={(e) => setCampaignForm({ ...campaignForm, ctaText: e.target.value })}
                      placeholder="ej. Descubrir la Colección Privada"
                      className="w-full border border-foeg-border px-3.5 py-2 text-foeg-black focus:outline-none focus:border-foeg-navy bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-black font-medium mb-1.5">
                      {language === 'es' ? 'Enlace Destino (URL)' : 'CTA Link URL'}
                    </label>
                    <input
                      type="text"
                      value={campaignForm.ctaUrl}
                      onChange={(e) => setCampaignForm({ ...campaignForm, ctaUrl: e.target.value })}
                      placeholder="/colecciones"
                      className="w-full border border-foeg-border px-3.5 py-2 text-foeg-black focus:outline-none focus:border-foeg-navy bg-white"
                    />
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-5 border-t border-foeg-border/80">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className="inline-flex items-center space-x-1.5 text-xs text-foeg-navy hover:underline cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>
                      {language === 'es' ? 'Previsualizar Maqueta' : 'Preview Email'}
                    </span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setCampaignModalOpen(false)}
                      className="px-4 py-2 border border-foeg-border text-foeg-black hover:bg-foeg-surface/50 text-xs uppercase tracking-wider cursor-pointer"
                    >
                      {language === 'es' ? 'Cancelar' : 'Cancel'}
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center space-x-2 px-5 py-2 bg-foeg-navy text-white hover:bg-black transition-colors text-xs uppercase tracking-[0.18em] font-medium cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isSubmitting
                          ? language === 'es'
                            ? 'Transmitiendo...'
                            : 'Sending...'
                          : language === 'es'
                          ? 'Transmitir Comunicado'
                          : 'Dispatch Newsletter'}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CONFIRMACIÓN DE ELIMINACIÓN ELEGANTE
         ========================================================================= */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-foeg-border shadow-floating w-full max-w-md p-6 space-y-5">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-foeg-black font-normal">
                  {language === 'es' ? 'Confirmar Eliminación' : 'Confirm Deletion'}
                </h3>
                <p className="text-xs text-foeg-muted font-light leading-relaxed">
                  {deleteConfirmTarget.type === 'subscriber'
                    ? language === 'es'
                      ? `¿Está seguro de que desea eliminar al suscriptor "${deleteConfirmTarget.label}" de la lista de la Maison?`
                      : `Are you sure you want to remove "${deleteConfirmTarget.label}" from the subscriber list?`
                    : language === 'es'
                    ? `¿Está seguro de eliminar del registro el comunicado "${deleteConfirmTarget.label}"?`
                    : `Are you sure you want to delete "${deleteConfirmTarget.label}" from history?`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-foeg-border/80">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 border border-foeg-border text-foeg-black hover:bg-foeg-surface/50 text-xs uppercase tracking-wider cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-700 text-white hover:bg-red-800 transition-colors text-xs uppercase tracking-wider font-medium cursor-pointer"
              >
                {isSubmitting
                  ? language === 'es'
                    ? 'Eliminando...'
                    : 'Deleting...'
                  : language === 'es'
                  ? 'Sí, Eliminar'
                  : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
