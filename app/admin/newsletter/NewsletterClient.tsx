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
  Ticket,
  LayoutGrid,
  List,
  UserCheck,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import {
  NewsletterSubscriberItem,
  NewsletterCampaignItem,
  addAdminSubscriber,
  updateAdminSubscriber,
  deleteNewsletterSubscriber,
  sendNewsletterCampaign,
  deleteNewsletterCampaign,
  toggleSubscriberVipStatus,
  createVipCouponForSubscriber,
} from '@/lib/newsletter-actions';
import { useLanguage } from '@/lib/language-context';

interface NewsletterClientProps {
  initialSubscribers: NewsletterSubscriberItem[];
  initialCampaigns: NewsletterCampaignItem[];
  clientStats?: {
    registeredTotal: number;
    registeredVip: number;
    registeredNormal: number;
  };
}

export default function NewsletterClient({
  initialSubscribers,
  initialCampaigns,
  clientStats = { registeredTotal: 0, registeredVip: 0, registeredNormal: 0 },
}: NewsletterClientProps) {
  const { t, language } = useLanguage();

  // Estados principales
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers');
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberItem[]>(initialSubscribers);
  const [campaigns, setCampaigns] = useState<NewsletterCampaignItem[]>(initialCampaigns);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal Cupón Rápido VIP
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponTargetSubscriber, setCouponTargetSubscriber] = useState<NewsletterSubscriberItem | null>(null);
  const [couponForm, setCouponForm] = useState<{
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    expiresDays: number;
  }>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    expiresDays: 30,
  });

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
      (sub.userName && sub.userName.toLowerCase().includes(q)) ||
      (sub.notes && sub.notes.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (segmentFilter === 'VIP') {
      return (
        sub.source.toLowerCase().includes('vip') ||
        sub.source.toLowerCase().includes('cercle') ||
        Boolean(sub.isQualifiedVip)
      );
    }
    if (segmentFilter === 'REGISTERED') {
      return Boolean(sub.hasUserAccount);
    }
    if (segmentFilter === 'BUYER_VIP') {
      return (sub.totalSpent || 0) >= 1000;
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
    (s) =>
      s.source.toLowerCase().includes('vip') ||
      s.source.toLowerCase().includes('cercle') ||
      Boolean(s.isQualifiedVip)
  ).length;
  const registeredAccountCount = subscribers.filter((s) => Boolean(s.hasUserAccount)).length;
  const activeCount = subscribers.filter((s) => s.status === 'ACTIVE').length;
  const activeRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 100;

  // Alternar Estatus VIP en un Clic
  const handleToggleVip = async (sub: NewsletterSubscriberItem) => {
    const isCurrentlyVip =
      sub.source.toLowerCase().includes('vip') || sub.source.toLowerCase().includes('cercle');
    const newVip = !isCurrentlyVip;

    try {
      const res = await toggleSubscriberVipStatus(sub.id, newVip);
      if (res.success && res.subscriber) {
        setSubscribers((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, source: res.subscriber!.source, isQualifiedVip: newVip } : s))
        );
        setFeedback({
          type: 'success',
          message: newVip
            ? (language === 'es'
                ? `El cliente ${sub.email} ha sido promovido al Círculo Privado VIP.`
                : `Le client ${sub.email} a été promu au Cercle Privé VIP.`)
            : (language === 'es'
                ? `Estatus VIP retirado de ${sub.email}.`
                : `Statut VIP retiré pour ${sub.email}.`),
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erreur' });
      }
    } catch (_) {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour.' });
    }
  };

  // Abrir Modal de Cupón VIP
  const handleOpenCouponModal = (sub: NewsletterSubscriberItem) => {
    const safeName = (sub.userName || sub.email.split('@')[0])
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8);
    setCouponTargetSubscriber(sub);
    setCouponForm({
      code: `VIP-${safeName || 'FOEG'}-20`,
      discountType: 'PERCENTAGE',
      discountValue: 20,
      expiresDays: 30,
    });
    setCouponModalOpen(true);
  };

  // Guardar Cupón VIP
  const handleCreateVipCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponTargetSubscriber) return;

    setIsSubmitting(true);
    try {
      const res = await createVipCouponForSubscriber({
        email: couponTargetSubscriber.email,
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        expiresDays: Number(couponForm.expiresDays),
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message:
            language === 'es'
              ? `Cupón ${couponForm.code} creado con éxito para ${couponTargetSubscriber.email}.`
              : `Coupon ${couponForm.code} créé avec succès pour ${couponTargetSubscriber.email}.`,
        });
        setCouponModalOpen(false);
        setTimeout(() => setFeedback(null), 4500);
      } else {
        setFeedback({ type: 'error', message: res.error || 'Erreur' });
      }
    } catch (_) {
      setFeedback({ type: 'error', message: 'Erreur lors de la création du coupon.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          PESTAÑA 1: GESTIÓN DE SUSCRIPTORES Y CLIENTES CERCLE PRIVÉ
         ========================================================================= */}
      {activeTab === 'subscribers' && (
        <div className="space-y-6">
          {/* Métricas rápidas (KPIs Integrados con Neon DB) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* KPI 1: Suscriptores Boletín */}
            <div className="p-4 sm:p-5 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
              <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block">
                {t('admin.newsletter.totalSubscribers')}
              </span>
              <p className="font-serif text-3xl text-foeg-black">{totalCount}</p>
              <div className="flex items-center space-x-1.5 text-[10px] text-foeg-muted font-light">
                <span className="text-amber-800 font-medium">{vipCount} VIP</span>
                <span>·</span>
                <span>{totalCount - vipCount} Web</span>
              </div>
            </div>

            {/* KPI 2: Cuentas Registradas en Tienda */}
            <div className="p-4 sm:p-5 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block">
                  {language === 'es' ? 'Cuentas Registradas' : 'Registered Accounts'}
                </span>
                <Users className="w-3.5 h-3.5 text-foeg-navy" />
              </div>
              <p className="font-serif text-3xl text-foeg-black">{clientStats.registeredTotal}</p>
              <span className="text-[10px] text-foeg-muted font-light block">
                {clientStats.registeredNormal} {language === 'es' ? 'normales' : 'normals'} ·{' '}
                <strong className="text-amber-700 font-medium">{clientStats.registeredVip} VIP</strong>
              </span>
            </div>

            {/* KPI 3: Clientes VIP Calificados */}
            <div className="p-4 sm:p-5 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block">
                  {language === 'es' ? 'Compradores VIP (≥ 1.000€)' : 'Qualified VIP Buyers'}
                </span>
                <Crown className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <p className="font-serif text-3xl text-amber-800">{clientStats.registeredVip}</p>
              <span className="text-[10px] text-amber-900 font-light block">
                {language === 'es' ? 'Acceso a Cercle Privé' : 'Cercle Privé Access'}
              </span>
            </div>

            {/* KPI 4: Tasa Activa */}
            <div className="p-4 sm:p-5 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
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
          </div>

          {/* Filtros de Segmento + Selector de Vista + Barra de Búsqueda */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 border border-foeg-border/80 shadow-subtle">
            {/* Píldoras de segmento */}
            <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
              {[
                { id: 'ALL', label: t('admin.newsletter.filterAll'), count: subscribers.length },
                { id: 'VIP', label: t('admin.newsletter.filterVip'), count: vipCount },
                {
                  id: 'REGISTERED',
                  label: language === 'es' ? 'Con Cuenta Registrada' : 'Registered Accounts',
                  count: registeredAccountCount,
                },
                {
                  id: 'BUYER_VIP',
                  label: language === 'es' ? 'VIP Compradores (≥ 1.000€)' : 'VIP Buyers (≥ 1.000€)',
                  count: subscribers.filter((s) => (s.totalSpent || 0) >= 1000).length,
                },
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
                { id: 'ACTIVE', label: t('admin.newsletter.filterActive'), count: activeCount },
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

            {/* Herramientas derechas: Selector de vista + Input de búsqueda */}
            <div className="flex items-center gap-2.5">
              {/* Botón selector Vista Tabla / Vista Tarjetas (Móvil) */}
              <div className="flex items-center border border-foeg-border bg-foeg-surface/40 p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-foeg-navy shadow-xs' : 'text-foeg-muted hover:text-foeg-black'
                  }`}
                  title={language === 'es' ? 'Vista Tabla' : 'Table View'}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 transition-colors cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white text-foeg-navy shadow-xs' : 'text-foeg-muted hover:text-foeg-black'
                  }`}
                  title={language === 'es' ? 'Vista Tarjetas (Optimizado Móvil)' : 'Card View'}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Input de Búsqueda */}
              <div className="flex items-center bg-foeg-surface/40 border border-foeg-border px-3 py-1.5 w-full lg:w-auto min-w-0 lg:min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-foeg-muted mr-2 shrink-0" />
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
          </div>

          {/* VISTA 1: TABLA PRINCIPAL CON COLUMNAS OPTIMIZADAS Y SIN CORTES */}
          {viewMode === 'table' && (
            <div className="w-full overflow-x-auto border border-foeg-border/80 bg-white shadow-subtle scrollbar-thin scrollbar-thumb-gray-300">
              <table className="w-full text-left text-xs font-light whitespace-nowrap min-w-[860px]">
                <thead className="bg-foeg-surface/60 border-b border-foeg-border text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium">
                  <tr>
                    <th className="py-3.5 px-5">{t('admin.newsletter.thEmail')}</th>
                    <th className="py-3.5 px-4">{t('admin.newsletter.thSource')}</th>
                    <th className="py-3.5 px-3">{t('admin.newsletter.thStatus')}</th>
                    <th className="py-3.5 px-4">
                      {language === 'es' ? 'Cuenta & Compras' : 'Account & Orders'}
                    </th>
                    <th className="py-3.5 px-4">{t('admin.newsletter.thNotes')}</th>
                    <th className="py-3.5 px-4">{t('admin.newsletter.thDate')}</th>
                    <th className="py-3.5 px-4 text-center sticky right-0 bg-foeg-surface/90 backdrop-blur-xs min-w-[155px] border-l border-foeg-border/80 shadow-[-4px_0_10px_rgba(0,0,0,0.03)]">
                      {t('admin.newsletter.thAction')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foeg-border/60">
                  {filteredSubscribers.length > 0 ? (
                    filteredSubscribers.map((sub) => {
                      const isVip =
                        sub.source.toLowerCase().includes('vip') ||
                        sub.source.toLowerCase().includes('cercle') ||
                        Boolean(sub.isQualifiedVip);
                      const hasAccount = Boolean(sub.hasUserAccount);
                      const isBuyerVip = (sub.totalSpent || 0) >= 1000;

                      return (
                        <tr key={sub.id} className="hover:bg-foeg-surface/20 transition-colors">
                          {/* Email & Nombre */}
                          <td className="py-3.5 px-5 font-medium text-foeg-black">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-7 h-7 rounded-none bg-foeg-surface border border-foeg-border flex items-center justify-center shrink-0">
                                <Mail className="w-3.5 h-3.5 text-foeg-navy" />
                              </div>
                              <div>
                                <span className="block font-medium">{sub.email}</span>
                                <div className="flex items-center space-x-1.5 text-[10px] text-foeg-muted font-light font-mono">
                                  <span>ID: {sub.id.slice(0, 14)}</span>
                                  {sub.userName && <span>· {sub.userName}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Origen / Segmento */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-medium border ${
                                isVip
                                  ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                                  : 'bg-foeg-surface border-foeg-border text-foeg-black'
                              }`}
                            >
                              {isVip && <Crown className="w-3 h-3 mr-0.5 text-amber-700" />}
                              <span>{formatSourceLabel(sub.source)}</span>
                            </span>
                          </td>

                          {/* Estado */}
                          <td className="py-3.5 px-3">
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

                          {/* Cuenta en Tienda & Compras Acumuladas */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              {hasAccount ? (
                                <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 bg-blue-50 border border-blue-200 text-blue-900 text-[9px] uppercase tracking-wider font-medium">
                                  <UserCheck className="w-2.5 h-2.5 text-blue-700" />
                                  <span>{language === 'es' ? 'Cuenta Activa' : 'Registered'}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-foeg-muted font-light">
                                  {language === 'es' ? 'Solo Suscriptor' : 'Guest Subscriber'}
                                </span>
                              )}
                              {(sub.totalSpent || 0) > 0 && (
                                <div className="text-[10px] font-mono text-foeg-black">
                                  <span className={isBuyerVip ? 'text-amber-800 font-semibold' : 'text-foeg-muted'}>
                                    {(sub.totalSpent || 0).toLocaleString('fr-FR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}{' '}
                                    €
                                  </span>
                                  {isBuyerVip && <span className="ml-1 text-[9px] text-amber-700">★ VIP</span>}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Notas de Atelier */}
                          <td className="py-3.5 px-4 text-foeg-muted max-w-[180px] truncate">
                            {sub.notes ? (
                              <span className="text-[11px] text-foeg-black/80 italic font-serif">
                                «{sub.notes}»
                              </span>
                            ) : (
                              <span className="text-[10px] text-foeg-muted/50">—</span>
                            )}
                          </td>

                          {/* Fecha */}
                          <td className="py-3.5 px-4 text-foeg-muted whitespace-nowrap">
                            <span className="block text-[11px]">
                              {new Date(sub.createdAt).toLocaleDateString(
                                language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR',
                                { day: 'numeric', month: 'short', year: 'numeric' }
                              )}
                            </span>
                            <span className="block text-[9px] text-foeg-muted/60">
                              {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>

                          {/* Acciones CRUD + Herramientas VIP (Sticky & Completamente Visible) */}
                          <td className="py-3 px-4 text-center sticky right-0 bg-white/95 backdrop-blur-xs border-l border-foeg-border/80 shadow-[-4px_0_10px_rgba(0,0,0,0.03)] whitespace-nowrap">
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

                              {/* Alternar VIP (One-Click) */}
                              <button
                                type="button"
                                onClick={() => handleToggleVip(sub)}
                                className={`p-1.5 transition-colors cursor-pointer border ${
                                  isVip
                                    ? 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100'
                                    : 'text-foeg-muted border-transparent hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-800'
                                }`}
                                title={
                                  isVip
                                    ? language === 'es'
                                      ? 'Quitar estatus Cercle Privé VIP'
                                      : 'Remove VIP status'
                                    : language === 'es'
                                    ? 'Promover a Cercle Privé VIP'
                                    : 'Promote to VIP'
                                }
                              >
                                <Crown className="w-3.5 h-3.5" />
                              </button>

                              {/* Generar Cupón VIP */}
                              <button
                                type="button"
                                onClick={() => handleOpenCouponModal(sub)}
                                className="p-1.5 text-foeg-muted hover:text-emerald-700 transition-colors cursor-pointer border border-transparent hover:border-emerald-300 hover:bg-emerald-50/50"
                                title={language === 'es' ? 'Crear cupón descuento VIP' : 'Create VIP coupon'}
                              >
                                <Ticket className="w-3.5 h-3.5" />
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
                      <td colSpan={7} className="py-14 text-center text-foeg-muted font-light">
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
          )}

          {/* VISTA 2: TARJETAS RESPONSIVE (OPTIMIZADO PARA PANTALLAS MÓVILES Y TABLETS) */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((sub) => {
                  const isVip =
                    sub.source.toLowerCase().includes('vip') ||
                    sub.source.toLowerCase().includes('cercle') ||
                    Boolean(sub.isQualifiedVip);
                  const hasAccount = Boolean(sub.hasUserAccount);
                  const isBuyerVip = (sub.totalSpent || 0) >= 1000;

                  return (
                    <div
                      key={sub.id}
                      className="bg-white border border-foeg-border/80 p-5 space-y-4 shadow-subtle hover:border-foeg-navy transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Cabecera Tarjeta: Email + Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="font-medium text-xs text-foeg-black block break-all">
                              {sub.email}
                            </span>
                            {sub.userName && (
                              <span className="text-[11px] text-foeg-navy block font-serif">
                                {sub.userName}
                              </span>
                            )}
                            <span className="text-[10px] text-foeg-muted font-mono block">
                              ID: {sub.id.slice(0, 16)}
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold border shrink-0 ${
                              isVip
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-foeg-surface text-foeg-black border-foeg-border'
                            }`}
                          >
                            {isVip && <Crown className="w-3 h-3 text-amber-700 mr-0.5" />}
                            <span>{formatSourceLabel(sub.source)}</span>
                          </span>
                        </div>

                        {/* Detalles: Cuenta & Gasto */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 bg-foeg-surface/40 border border-foeg-border/60 text-[10px]">
                          <div>
                            <span className="text-foeg-muted uppercase tracking-wider block text-[9px]">
                              {language === 'es' ? 'Cuenta Tienda' : 'Store Account'}
                            </span>
                            <span className="font-medium text-foeg-black">
                              {hasAccount ? '✓ Registrado' : 'Solo Suscriptor'}
                            </span>
                          </div>
                          <div>
                            <span className="text-foeg-muted uppercase tracking-wider block text-[9px]">
                              {language === 'es' ? 'Gasto Acumulado' : 'Total Purchases'}
                            </span>
                            <span className={`font-mono font-medium ${isBuyerVip ? 'text-amber-800' : 'text-foeg-black'}`}>
                              {(sub.totalSpent || 0).toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              €
                            </span>
                          </div>
                        </div>

                        {/* Notas */}
                        {sub.notes && (
                          <p className="text-[11px] text-foeg-black/80 font-serif italic border-l-2 border-foeg-navy/30 pl-2.5">
                            «{sub.notes}»
                          </p>
                        )}

                        <span className="text-[10px] text-foeg-muted font-light block">
                          {language === 'es' ? 'Inscrito el: ' : 'Subscribed: '}
                          {new Date(sub.createdAt).toLocaleDateString(
                            language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR',
                            { day: 'numeric', month: 'long', year: 'numeric' }
                          )}
                        </span>
                      </div>

                      {/* Botonera Móvil de Acciones con Iconos y Texto Claro */}
                      <div className="pt-3 border-t border-foeg-border/80 grid grid-cols-4 gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSubscriber(sub)}
                          className="py-2 px-1 text-center bg-foeg-surface hover:bg-foeg-surface/80 text-foeg-black border border-foeg-border flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
                          title={t('admin.newsletter.edit')}
                        >
                          <Pencil className="w-3.5 h-3.5 text-foeg-muted" />
                          <span className="text-[9px] uppercase tracking-wider">Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleVip(sub)}
                          className={`py-2 px-1 text-center border flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
                            isVip
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-foeg-surface text-foeg-black border-foeg-border hover:bg-amber-50'
                          }`}
                          title="Alternar VIP"
                        >
                          <Crown className={`w-3.5 h-3.5 ${isVip ? 'text-amber-700' : 'text-foeg-muted'}`} />
                          <span className="text-[9px] uppercase tracking-wider">{isVip ? 'Es VIP' : '+ VIP'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenCouponModal(sub)}
                          className="py-2 px-1 text-center bg-foeg-surface hover:bg-emerald-50 text-foeg-black hover:text-emerald-800 border border-foeg-border hover:border-emerald-300 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
                          title="Generar cupón"
                        >
                          <Ticket className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-[9px] uppercase tracking-wider">Cupón</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirmTarget({
                              type: 'subscriber',
                              id: sub.id,
                              label: sub.email,
                            })
                          }
                          className="py-2 px-1 text-center bg-foeg-surface hover:bg-red-50 text-foeg-muted hover:text-red-700 border border-foeg-border hover:border-red-300 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors"
                          title={t('admin.newsletter.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[9px] uppercase tracking-wider">Borrar</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-foeg-muted font-light bg-white border border-foeg-border">
                  <Mail className="w-8 h-8 text-foeg-muted/40 mx-auto mb-2" />
                  <p>{language === 'es' ? 'No se encontraron suscriptores.' : 'No subscribers found.'}</p>
                </div>
              )}
            </div>
          )}
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
          MODAL 4: GENERAR CUPÓN PRIVILEGIO VIP PARA SUSCRIPTOR / CLIENTE
         ========================================================================= */}
      {couponModalOpen && couponTargetSubscriber && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-foeg-border shadow-floating w-full max-w-lg p-6 sm:p-7 space-y-6">
            <div className="flex items-start justify-between border-b border-foeg-border/80 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900">
                  <Ticket className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-amber-800 font-semibold block">
                    {language === 'es' ? 'Atelier Privilegios VIP' : 'VIP Privilege Atelier'}
                  </span>
                  <h3 className="font-serif text-xl text-foeg-black font-light">
                    {language === 'es' ? 'Crear Cupón de Descuento Exclusivo' : 'Create Exclusive VIP Coupon'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCouponModalOpen(false)}
                className="text-gray-400 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ficha rápida del cliente destino */}
            <div className="p-3 bg-foeg-surface/50 border border-foeg-border/70 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-foeg-muted text-[10px] uppercase tracking-wider">
                  {language === 'es' ? 'Destinatario:' : 'Recipient:'}
                </span>
                <span className="font-medium text-foeg-black font-mono">
                  {couponTargetSubscriber.email}
                </span>
              </div>
              {couponTargetSubscriber.userName && (
                <div className="flex items-center justify-between">
                  <span className="text-foeg-muted text-[10px] uppercase tracking-wider">
                    {language === 'es' ? 'Cliente Titular:' : 'Account Holder:'}
                  </span>
                  <span className="text-foeg-navy font-serif">
                    {couponTargetSubscriber.userName}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleCreateVipCoupon} className="space-y-4 text-left">
              {/* Código */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {language === 'es' ? 'Código Promocional VIP *' : 'VIP Promo Code *'}
                </label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="VIP-CLAIRE-20"
                  className="w-full bg-white border border-foeg-border text-xs text-foeg-black p-3 font-mono font-medium tracking-wider focus:outline-none focus:border-foeg-navy"
                />
              </div>

              {/* Tipo y Valor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                    {language === 'es' ? 'Tipo de Beneficio' : 'Discount Type'}
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discountType: e.target.value as 'PERCENTAGE' | 'FIXED',
                      })
                    }
                    className="w-full bg-white border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy cursor-pointer"
                  >
                    <option value="PERCENTAGE">
                      {language === 'es' ? 'Porcentaje (%)' : 'Percentage (%)'}
                    </option>
                    <option value="FIXED">
                      {language === 'es' ? 'Monto Fijo (€ EUR)' : 'Fixed Amount (€)'}
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                    {language === 'es' ? 'Valor del Descuento' : 'Discount Value'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      required
                      min={1}
                      max={couponForm.discountType === 'PERCENTAGE' ? 100 : 5000}
                      value={couponForm.discountValue}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })
                      }
                      className="w-full bg-white border border-foeg-border text-xs text-foeg-black p-3 pr-8 font-mono focus:outline-none focus:border-foeg-navy"
                    />
                    <span className="absolute right-3 text-xs text-foeg-muted font-mono pointer-events-none">
                      {couponForm.discountType === 'PERCENTAGE' ? '%' : '€'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Días de validez */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {language === 'es' ? 'Validez (Días de vigencia)' : 'Validity (Days)'}
                </label>
                <select
                  value={couponForm.expiresDays}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, expiresDays: Number(e.target.value) })
                  }
                  className="w-full bg-white border border-foeg-border text-xs text-foeg-black p-3 focus:outline-none focus:border-foeg-navy cursor-pointer"
                >
                  <option value={7}>{language === 'es' ? '7 días (Preventa relámpago)' : '7 days'}</option>
                  <option value={15}>{language === 'es' ? '15 días (Avant-Première)' : '15 days'}</option>
                  <option value={30}>{language === 'es' ? '30 días (Mes de Atelier)' : '30 days'}</option>
                  <option value={90}>{language === 'es' ? '90 días (Temporada)' : '90 days'}</option>
                  <option value={365}>{language === 'es' ? '1 año (Permanente anual)' : '1 year'}</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-foeg-border/80">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2.5 border border-foeg-border text-foeg-black hover:bg-foeg-surface/50 text-xs uppercase tracking-wider cursor-pointer"
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-foeg-navy text-white hover:bg-black transition-colors text-xs uppercase tracking-[0.18em] font-medium cursor-pointer shadow-subtle disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting
                      ? language === 'es'
                        ? 'Creando...'
                        : 'Creating...'
                      : language === 'es'
                      ? 'Activar Cupón VIP'
                      : 'Activate VIP Coupon'}
                  </span>
                </button>
              </div>
            </form>
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
