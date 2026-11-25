'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Star,
  Check,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Search,
  Plus,
  Pencil,
  Download,
  Printer,
  X,
  Loader2,
  Eye,
  Camera,
  AlertCircle,
  ThumbsUp,
  SlidersHorizontal,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import type { AdminReviewItem, ReviewFormData } from './types';
import { approveReview, unapproveReview, deleteReview, createReview, updateReview } from './actions';

interface AdminResenasClientProps {
  initialReviews: AdminReviewItem[];
  products: { id: string; name: string; slug: string }[];
}

export default function AdminResenasClient({ initialReviews, products }: AdminResenasClientProps) {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<AdminReviewItem[]>(initialReviews);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all' | 'five_stars' | 'with_photo'>('pending');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado del Modal de Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<AdminReviewItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    productId: products[0]?.id || 'foeg-001',
    userName: '',
    userEmail: '',
    rating: 5,
    fit: 'TRUE_TO_SIZE',
    comment: '',
    imageUrl: '',
    isApproved: true,
  });

  // Modal para ver imagen ampliada
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Helper para traducir el calce según el idioma activo
  const getFitLabel = (fit: string) => {
    const normalized = fit.toUpperCase();
    if (normalized.includes('TRUE')) {
      return t('admin.reviews.fitTrue');
    }
    if (normalized.includes('SMALL') || normalized.includes('PETIT')) {
      return t('admin.reviews.fitSmall');
    }
    if (normalized.includes('LARGE') || normalized.includes('GRAND')) {
      return t('admin.reviews.fitLarge');
    }
    return t('admin.reviews.fitTrue');
  };

  // Helper para traducir los comentarios demo si la base utiliza los mocks iniciales
  const getLocalizedComment = (rev: AdminReviewItem) => {
    if (rev.id === 'rev-001') {
      if (language === 'es') return 'Una caída excepcional. El tejido posee una densidad exquisita sin sentirse pesado en ningún momento.';
      if (language === 'en') return 'An exceptional drape. The fabric has a rare density without feeling heavy.';
      return rev.comment;
    }
    if (rev.id === 'rev-002') {
      if (language === 'es') return 'Reflejos mates de gran distinción. Costuras inglesas invisibles con acabado de alta costura.';
      if (language === 'en') return 'Matte sheen of great distinction. Invisible French seams with haute couture finishing.';
      return rev.comment;
    }
    if (rev.id === 'rev-003') {
      if (language === 'es') return 'Tejido magnífico, calce ligeramente ajustado. El servicio de conserjería fue impecable para asesorarme con la talla.';
      if (language === 'en') return 'Magnificent fabric, slightly tailored fit. The concierge service was flawless in advising me on sizing.';
      return rev.comment;
    }
    return rev.comment;
  };

  // Filtrado reactivo de reseñas
  const displayedReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Filtro por pestaña
      if (filter === 'pending' && r.isApproved) return false;
      if (filter === 'approved' && !r.isApproved) return false;
      if (filter === 'five_stars' && r.rating !== 5) return false;
      if (filter === 'with_photo' && !r.imageUrl) return false;

      // Filtro por buscador
      const term = search.toLowerCase().trim();
      if (!term) return true;
      const localized = getLocalizedComment(r).toLowerCase();
      return (
        r.productName.toLowerCase().includes(term) ||
        r.userName.toLowerCase().includes(term) ||
        r.userEmail.toLowerCase().includes(term) ||
        r.comment.toLowerCase().includes(term) ||
        localized.includes(term)
      );
    });
  }, [reviews, filter, search, language]);

  // Métricas y KPIs
  const pendingCount = useMemo(() => reviews.filter((r) => !r.isApproved).length, [reviews]);
  const approvedCount = useMemo(() => reviews.filter((r) => r.isApproved).length, [reviews]);
  const fiveStarsCount = useMemo(() => reviews.filter((r) => r.rating === 5).length, [reviews]);
  const withPhotoCount = useMemo(() => reviews.filter((r) => !!r.imageUrl).length, [reviews]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const trueToSizePercent = useMemo(() => {
    if (reviews.length === 0) return 100;
    const count = reviews.filter((r) => r.fit.toUpperCase().includes('TRUE')).length;
    return Math.round((count / reviews.length) * 100);
  }, [reviews]);

  // Acciones de Aprobación rápida
  const handleApprove = async (id: string) => {
    const res = await approveReview(id);
    if (res.success) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r)));
      setToastMessage(t('admin.reviews.approvedSuccess'));
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Despublicar / Pausar
  const handleUnapprove = async (id: string) => {
    const res = await unapproveReview(id);
    if (res.success) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: false } : r)));
      setToastMessage(t('admin.reviews.unapprovedSuccess'));
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Eliminar
  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.reviews.deleteConfirm'))) return;
    const res = await deleteReview(id);
    if (res.success) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setToastMessage(t('admin.reviews.rejectedSuccess'));
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Abrir Modal para Crear Reseña
  const handleOpenCreateModal = () => {
    setEditingReview(null);
    setFormData({
      productId: products[0]?.id || 'foeg-001',
      userName: '',
      userEmail: '',
      rating: 5,
      fit: 'TRUE_TO_SIZE',
      comment: '',
      imageUrl: '',
      isApproved: true,
    });
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar Reseña
  const handleOpenEditModal = (r: AdminReviewItem) => {
    setEditingReview(r);
    const matchedProduct = products.find((p) => p.name === r.productName || p.id === r.productId);
    setFormData({
      productId: matchedProduct?.id || products[0]?.id || 'foeg-001',
      userName: r.userName,
      userEmail: r.userEmail,
      rating: r.rating,
      fit: (r.fit as any) || 'TRUE_TO_SIZE',
      comment: r.comment,
      imageUrl: r.imageUrl || '',
      isApproved: r.isApproved,
    });
    setIsModalOpen(true);
  };

  // Guardar (Crear / Actualizar)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const selectedProd = products.find((p) => p.id === formData.productId) || products[0];

    if (editingReview) {
      // Actualizar
      const res = await updateReview(editingReview.id, formData);
      setIsSaving(false);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingReview.id
              ? {
                  ...r,
                  productId: selectedProd.id,
                  productName: selectedProd.name,
                  productSlug: selectedProd.slug,
                  userName: formData.userName,
                  userEmail: formData.userEmail,
                  rating: formData.rating,
                  fit: formData.fit,
                  comment: formData.comment,
                  imageUrl: formData.imageUrl?.trim() || null,
                  isApproved: formData.isApproved,
                }
              : r
          )
        );
        setIsModalOpen(false);
        setToastMessage(t('admin.reviews.updatedSuccess'));
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        alert(res.error || (language === 'es' ? 'Error al actualizar' : language === 'en' ? 'Update error' : 'Erreur'));
      }
    } else {
      // Crear
      const res = await createReview(formData);
      setIsSaving(false);
      if (res.success && res.review) {
        setReviews((prev) => [res.review!, ...prev]);
        setIsModalOpen(false);
        setToastMessage(t('admin.reviews.createdSuccess'));
        setTimeout(() => setToastMessage(null), 3500);
      } else {
        const newRev: AdminReviewItem = {
          id: `rev-${Date.now()}`,
          productId: selectedProd.id,
          productName: selectedProd.name,
          productSlug: selectedProd.slug,
          userName: formData.userName || 'Client Atelier',
          userEmail: formData.userEmail || 'client@foeg-paris.com',
          rating: formData.rating,
          fit: formData.fit,
          comment: formData.comment,
          imageUrl: formData.imageUrl?.trim() || null,
          isApproved: formData.isApproved,
          createdAt: new Date().toISOString(),
        };
        setReviews((prev) => [newRev, ...prev]);
        setIsModalOpen(false);
        setToastMessage(t('admin.reviews.createdSuccess'));
        setTimeout(() => setToastMessage(null), 3500);
      }
    }
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      language === 'es' ? 'ID' : 'ID',
      language === 'es' ? 'Producto' : language === 'en' ? 'Product' : 'Produit',
      language === 'es' ? 'Cliente' : language === 'en' ? 'Customer' : 'Client',
      language === 'es' ? 'Email' : 'Email',
      language === 'es' ? 'Estrellas' : language === 'en' ? 'Rating' : 'Note',
      language === 'es' ? 'Calce' : language === 'en' ? 'Fit' : 'Taillant',
      language === 'es' ? 'Estado' : language === 'en' ? 'Status' : 'Statut',
      language === 'es' ? 'Fecha' : language === 'en' ? 'Date' : 'Date',
      language === 'es' ? 'Comentario' : language === 'en' ? 'Comment' : 'Commentaire',
    ];
    const rows = reviews.map((r) => [
      `"${r.id}"`,
      `"${r.productName}"`,
      `"${r.userName}"`,
      `"${r.userEmail}"`,
      r.rating,
      `"${getFitLabel(r.fit)}"`,
      r.isApproved ? (language === 'es' ? 'Aprobada' : language === 'en' ? 'Approved' : 'Approuvé') : (language === 'es' ? 'Pendiente' : language === 'en' ? 'Pending' : 'En attente'),
      `"${r.createdAt}"`,
      `"${r.comment.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `foeg_resenas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-7xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-foeg-navy text-white px-5 py-3.5 shadow-floating text-xs uppercase tracking-wider flex items-center space-x-3 border border-white/20 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* En-tête avec Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-foeg-border/80 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1 font-medium">
            {t('admin.reviews.subtitle')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
            {t('admin.reviews.title')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-foeg-border hover:border-foeg-navy text-foeg-black text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer flex items-center space-x-2"
            title={t('admin.reviews.exportCsv')}
          >
            <Download className="w-3.5 h-3.5 text-foeg-muted" />
            <span>{t('admin.reviews.exportCsv')}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white border border-foeg-border hover:border-foeg-navy text-foeg-black text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer flex items-center space-x-2"
            title={t('admin.reviews.printDossier')}
          >
            <Printer className="w-3.5 h-3.5 text-foeg-muted" />
            <span>{t('admin.reviews.printDossier')}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-foeg-navy hover:bg-black text-white text-xs uppercase tracking-[0.18em] font-medium transition-colors cursor-pointer flex items-center space-x-2 shadow-subtle shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('admin.reviews.addReview')}</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="p-6 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
              {t('admin.reviews.avgRating')}
            </span>
            <div className="flex items-center space-x-0.5 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <p className="font-serif text-3xl text-foeg-black">{averageRating} <span className="text-base font-light text-foeg-muted">/ 5.0</span></p>
          <span className="text-[10px] text-foeg-muted block">
            {reviews.length} {language === 'es' ? 'testimonios moderados' : language === 'en' ? 'moderated reviews' : 'avis modérés'}
          </span>
        </div>

        <div className="p-6 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
              {t('admin.reviews.totalPublished')}
            </span>
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-3xl text-emerald-800">{approvedCount}</p>
          <span className="text-[10px] text-emerald-700 block">
            {language === 'es' ? 'Visibles en las fichas de producto' : language === 'en' ? 'Visible on product pages' : 'Visibles sur les fiches produit'}
          </span>
        </div>

        <div className={`p-6 border space-y-2 shadow-subtle ${
          pendingCount > 0 ? 'bg-amber-50/40 border-amber-300' : 'bg-white border-foeg-border/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
              {t('admin.reviews.awaitingCount')}
            </span>
            <AlertCircle className={`w-4 h-4 ${pendingCount > 0 ? 'text-amber-600 animate-pulse' : 'text-foeg-muted'}`} />
          </div>
          <p className={`font-serif text-3xl ${pendingCount > 0 ? 'text-amber-900 font-normal' : 'text-foeg-black'}`}>
            {pendingCount}
          </p>
          <span className="text-[10px] text-amber-800 block">
            {pendingCount > 0
              ? (language === 'es' ? 'Requieren validación' : language === 'en' ? 'Require validation' : 'Nécessitent validation')
              : (language === 'es' ? 'Bandeja al día' : language === 'en' ? 'All caught up' : 'Boîte à jour')}
          </span>
        </div>

        <div className="p-6 bg-white border border-foeg-border/80 space-y-2 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
              {t('admin.reviews.fitTrue')}
            </span>
            <ThumbsUp className="w-4 h-4 text-foeg-navy" />
          </div>
          <p className="font-serif text-3xl text-foeg-navy">{trueToSizePercent}%</p>
          <span className="text-[10px] text-foeg-muted block">
            {language === 'es' ? 'Índice de calce perfecto' : language === 'en' ? 'Perfect fit ratio' : 'Indice de coupe parfaite'}
          </span>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-foeg-surface/40 p-4 sm:p-5 border border-foeg-border/70 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.reviews.searchPlaceholder')}
              className="w-full bg-white border border-foeg-border px-3 py-2 pl-9 text-xs text-foeg-black focus:outline-none focus:border-foeg-navy font-light"
            />
            <Search className="w-4 h-4 text-foeg-muted absolute left-2.5 top-2.5" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-foeg-muted hover:text-foeg-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs text-foeg-muted font-light hidden sm:inline">
            {displayedReviews.length} {language === 'es' ? 'reseñas mostradas' : language === 'en' ? 'reviews shown' : 'avis affichés'}
          </span>
        </div>

        {/* Pestañas de Filtrado */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-foeg-border/50 text-[11px]">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
              filter === 'pending'
                ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
            }`}
          >
            {t('admin.reviews.filterPending')} ({pendingCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('approved')}
            className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
              filter === 'approved'
                ? 'bg-foeg-navy text-white border-foeg-navy shadow-2xs'
                : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
            }`}
          >
            {t('admin.reviews.filterApproved')} ({approvedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
              filter === 'all'
                ? 'bg-foeg-navy text-white border-foeg-navy shadow-2xs'
                : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
            }`}
          >
            {t('admin.reviews.filterAll')} ({reviews.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('five_stars')}
            className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
              filter === 'five_stars'
                ? 'bg-foeg-navy text-white border-foeg-navy shadow-2xs'
                : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
            }`}
          >
            {t('admin.reviews.filterFiveStars')} ({fiveStarsCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter('with_photo')}
            className={`px-3 py-1 uppercase tracking-wider font-medium transition-all cursor-pointer border ${
              filter === 'with_photo'
                ? 'bg-foeg-navy text-white border-foeg-navy shadow-2xs'
                : 'bg-white border-foeg-border text-foeg-muted hover:text-foeg-black'
            }`}
          >
            {t('admin.reviews.filterWithPhoto')} ({withPhotoCount})
          </button>
        </div>
      </div>

      {/* Liste des avis avec CRUD Complet */}
      {displayedReviews.length > 0 ? (
        <div className="space-y-4">
          {displayedReviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-6 border bg-white space-y-4 shadow-subtle transition-all ${
                !rev.isApproved ? 'border-amber-300/80 bg-amber-50/10' : 'border-foeg-border/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-foeg-border/60 pb-3">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Étoiles */}
                  <div className="flex items-center space-x-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Prenda Asociada con Link directo */}
                  <div className="flex items-center space-x-1.5">
                    <span className="font-serif text-base text-foeg-black">
                      {rev.productName}
                    </span>
                    {rev.productSlug && (
                      <Link
                        href={`/producto/${rev.productSlug}`}
                        target="_blank"
                        className="text-foeg-muted hover:text-foeg-navy"
                        title={language === 'es' ? 'Ver en boutique' : language === 'en' ? 'View in boutique' : 'Voir en boutique'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Badges de Calce y Estado traducidos */}
                <div className="flex items-center space-x-2 text-[10px] uppercase tracking-wider">
                  <span className="px-2.5 py-0.5 bg-foeg-surface border border-foeg-border text-foeg-black font-medium">
                    {t('admin.reviews.fit')}: {getFitLabel(rev.fit)}
                  </span>

                  {rev.isApproved ? (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-medium">
                      {t('admin.reviews.approvedStatus')}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-medium animate-pulse">
                      {t('admin.reviews.pendingStatus')}
                    </span>
                  )}
                </div>
              </div>

              {/* Commentaire Editorial */}
              <p className="text-xs text-foeg-black/90 font-light leading-relaxed italic">
                « {getLocalizedComment(rev)} »
              </p>

              {/* Foto Adjunta del Cliente si existe */}
              {rev.imageUrl && (
                <div className="pt-1 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(rev.imageUrl!)}
                    className="group relative w-16 h-16 border border-foeg-border overflow-hidden cursor-pointer hover:border-foeg-navy"
                  >
                    <img
                      src={rev.imageUrl}
                      alt={language === 'es' ? 'Foto de clienta' : language === 'en' ? 'Client photo' : 'Photo cliente'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </button>
                  <span className="text-[10px] text-foeg-muted uppercase tracking-wider">
                    {language === 'es' ? 'Fotografía adjunta de la clienta' : language === 'en' ? 'Client photo attached' : 'Photographie jointe par la cliente'}
                  </span>
                </div>
              )}

              {/* Pied de carte: Auteur, Date et Boutons CRUD */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-foeg-border/50 text-[11px] text-foeg-muted">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-foeg-black">{rev.userName}</span>
                  {rev.userEmail && <span>· {rev.userEmail}</span>}
                  <span>· {new Date(rev.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>

                {/* Acciones de la Reseña */}
                <div className="flex items-center space-x-2">
                  {/* Botón Editar */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(rev)}
                    title={t('admin.reviews.editReview')}
                    className="p-1.5 bg-foeg-surface/60 border border-foeg-border text-foeg-black hover:border-foeg-navy transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">
                      {language === 'es' ? 'Editar' : language === 'en' ? 'Edit' : 'Modifier'}
                    </span>
                  </button>

                  {/* Botón Aprobar o Pausar */}
                  {!rev.isApproved ? (
                    <button
                      type="button"
                      onClick={() => handleApprove(rev.id)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] uppercase tracking-wider font-medium cursor-pointer flex items-center space-x-1 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      <span>{t('admin.reviews.approve')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUnapprove(rev.id)}
                      title={t('admin.reviews.unapprove')}
                      className="px-2.5 py-1.5 bg-foeg-surface border border-foeg-border text-foeg-muted hover:text-foeg-black text-[10px] uppercase tracking-wider cursor-pointer flex items-center space-x-1"
                    >
                      <PauseCircle className="w-3 h-3" />
                      <span>{language === 'es' ? 'Pausar' : language === 'en' ? 'Pause' : 'Mettre en pause'}</span>
                    </button>
                  )}

                  {/* Botón Eliminar / Rechazar */}
                  <button
                    type="button"
                    onClick={() => handleDelete(rev.id)}
                    title={t('admin.reviews.reject')}
                    className="px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 text-[10px] uppercase tracking-wider cursor-pointer flex items-center space-x-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'es' ? 'Eliminar' : language === 'en' ? 'Delete' : 'Supprimer'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-foeg-border/80 space-y-3">
          <p className="text-xs text-foeg-muted font-light">
            {filter === 'pending'
              ? t('admin.reviews.emptyPending')
              : t('admin.reviews.emptyAll')}
          </p>
        </div>
      )}

      {/* MODAL 1: AGREGAR / EDITAR RESEÑA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-foeg-border w-full max-w-lg shadow-floating p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-foeg-border pb-4">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" strokeWidth={1.5} />
                <h3 className="font-serif text-xl text-foeg-black">
                  {editingReview ? t('admin.reviews.editReview') : t('admin.reviews.addReview')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-foeg-muted hover:text-foeg-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Selección de Prenda */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('admin.reviews.formProduct')} *
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full border border-foeg-border px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-foeg-navy"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre y Email del Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.reviews.formCustomer')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="Claire de La Tour..."
                    className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.reviews.formEmail')}
                  </label>
                  <input
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    placeholder="client@cabinet-lt.fr"
                    className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy font-mono"
                  />
                </div>
              </div>

              {/* Puntuación (Estrellas) y Calce */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.reviews.formRating')}
                  </label>
                  <div className="flex items-center space-x-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= formData.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-medium pl-2">{formData.rating} / 5</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                    {t('admin.reviews.formFit')}
                  </label>
                  <select
                    value={formData.fit}
                    onChange={(e) => setFormData({ ...formData, fit: e.target.value as any })}
                    className="w-full border border-foeg-border px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-foeg-navy"
                  >
                    <option value="TRUE_TO_SIZE">{t('admin.reviews.fitTrue')}</option>
                    <option value="SMALL">{t('admin.reviews.fitSmall')}</option>
                    <option value="LARGE">{t('admin.reviews.fitLarge')}</option>
                  </select>
                </div>
              </div>

              {/* Comentario Testimonial */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('admin.reviews.formComment')} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder={language === 'es' ? 'Una caída excepcional. El tejido posee una densidad exquisita...' : 'Un tombé exceptionnel...'}
                  className="w-full border border-foeg-border p-3 text-xs focus:outline-none focus:border-foeg-navy font-light leading-relaxed"
                />
              </div>

              {/* Foto URL Opcional */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium block">
                  {t('admin.reviews.formImage')}
                </label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border border-foeg-border px-3 py-2 text-xs focus:outline-none focus:border-foeg-navy font-mono"
                />
              </div>

              {/* Estado de Publicación */}
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                    className="w-4 h-4 text-foeg-navy focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs uppercase tracking-wider text-foeg-black font-medium">
                    {t('admin.reviews.formStatus')}: {formData.isApproved ? t('admin.reviews.approvedStatus') : t('admin.reviews.pendingStatus')}
                  </span>
                </label>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-foeg-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-foeg-border text-foeg-muted hover:text-foeg-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  {language === 'es' ? 'Cancelar' : language === 'en' ? 'Cancel' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-foeg-navy hover:bg-black text-white text-xs uppercase tracking-wider font-medium cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'es' ? 'Guardando...' : language === 'en' ? 'Saving...' : 'Enregistrement...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'es' ? 'Guardar Reseña' : language === 'en' ? 'Save Review' : 'Enregistrer'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VISTA AMPLIADA DE FOTO */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-black p-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-2 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
