'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  Plus,
  MapPin,
  Clock,
  Phone,
  Mail,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  AlertCircle,
  X,
  Loader2,
  Navigation,
  ShoppingBag,
} from 'lucide-react';
import { Boutique } from '@/lib/boutiques-types';
import {
  saveBoutique,
  deleteBoutique,
  toggleBoutiqueActive,
  toggleBoutiquePickup,
} from '@/lib/boutiques-actions';
import { useLanguage } from '@/lib/language-context';

interface AdminBoutiquesClientProps {
  initialBoutiques: Boutique[];
}

export default function AdminBoutiquesClient({ initialBoutiques }: AdminBoutiquesClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  const [boutiques, setBoutiques] = useState<Boutique[]>(initialBoutiques);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoutique, setEditingBoutique] = useState<Partial<Boutique> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingBoutique({
      name: '',
      tag: 'Boutique & Salon Privé',
      city: '',
      country: '',
      address: '',
      postalCode: '',
      addressNotes: '',
      hoursWeekday: 'Lundi — Samedi : 10h00 — 19h00',
      hoursWeekend: 'Dimanche : Sur rendez-vous privé',
      phone: '',
      whatsapp: '',
      email: 'concierge@foeg-paris.com',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
      googleMapsUrl: '',
      isActive: true,
      enablePickup: true,
      orderIndex: boutiques.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (boutique: Boutique) => {
    setEditingBoutique({ ...boutique });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBoutique(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoutique?.name || !editingBoutique?.city || !editingBoutique?.country) {
      showToast('Veuillez renseigner le nom, la ville et le pays.', 'error');
      return;
    }

    setIsSaving(true);
    const res = await saveBoutique(editingBoutique as any);
    setIsSaving(false);

    if (res.success) {
      showToast(res.message || 'Boutique enregistrée.');
      setIsModalOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } else {
      showToast(res.error || 'Erreur lors de l’enregistrement.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${t('admin.boutiques.confirmDelete')} (${name})`)) {
      return;
    }

    const res = await deleteBoutique(id);
    if (res.success) {
      showToast(res.message || 'Boutique supprimée.');
      setBoutiques((prev) => prev.filter((b) => b.id !== id));
      startTransition(() => {
        router.refresh();
      });
    } else {
      showToast(res.error || 'Erreur lors de la suppression.', 'error');
    }
  };

  const handleToggleActive = async (id: string) => {
    setBoutiques((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    await toggleBoutiqueActive(id);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleTogglePickup = async (id: string) => {
    setBoutiques((prev) =>
      prev.map((b) => (b.id === id ? { ...b, enablePickup: !b.enablePickup } : b))
    );
    await toggleBoutiquePickup(id);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-10 p-6 sm:p-10 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 border shadow-floating text-xs uppercase tracking-wider font-medium flex items-center space-x-2 animate-fadeIn ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-700" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-700" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* En-tête Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-foeg-black pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.28em] text-foeg-muted block">
            Réseau Physique · Maison FOEG
          </span>
          <h1 className="font-serif text-3xl font-light text-foeg-black mt-1">
            {t('admin.boutiques.title')}
          </h1>
          <p className="text-xs text-foeg-muted font-light mt-1">
            {t('admin.boutiques.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="bg-foeg-navy hover:bg-foeg-black text-white px-5 py-3 text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer flex items-center space-x-2 shadow-subtle shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.boutiques.newBtn')}</span>
        </button>
      </div>

      {/* Liste des Boutiques Enregistrées */}
      <div className="space-y-6">
        {boutiques.length === 0 ? (
          <div className="p-12 text-center bg-white border border-foeg-border/80 space-y-3">
            <Store className="w-8 h-8 text-foeg-muted mx-auto stroke-1" />
            <h3 className="font-serif text-lg text-foeg-black">{t('admin.boutiques.emptyTitle')}</h3>
            <p className="text-xs text-foeg-muted font-light">
              {t('admin.boutiques.emptyDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {boutiques.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-foeg-border/80 shadow-xs flex flex-col justify-between overflow-hidden group hover:border-foeg-navy/60 transition-all"
              >
                {/* En-tête de la Carte */}
                <div>
                  <div className="relative aspect-[16/9] w-full bg-foeg-surface overflow-hidden border-b border-foeg-border/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.imageUrl}
                      alt={b.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      <span className="bg-white/95 text-foeg-navy text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 border border-foeg-border/60 shadow-xs">
                        {b.city} · {b.country}
                      </span>
                      <span className="bg-foeg-black/80 text-white text-[10px] font-mono px-2 py-1">
                        #{b.orderIndex}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(b.id)}
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium border cursor-pointer transition-colors ${
                          b.isActive
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                        }`}
                      >
                        {b.isActive ? t('admin.boutiques.active') : t('admin.boutiques.hidden')}
                      </button>
                    </div>
                  </div>

                  {/* Corps de la Carte */}
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                        {b.tag}
                      </span>
                      <h3 className="font-serif text-xl font-normal text-foeg-black mt-0.5">
                        {b.name}
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs font-light text-foeg-black/80 divide-y divide-foeg-border/40">
                      {/* Adresse */}
                      <div className="flex items-start space-x-2.5 pt-1">
                        <MapPin className="w-4 h-4 text-foeg-navy shrink-0 mt-0.5" strokeWidth={1} />
                        <div>
                          <p className="font-medium">{b.address || 'Adresse'}</p>
                          {b.postalCode && <p className="text-foeg-muted">{b.postalCode} {b.city}</p>}
                          {b.addressNotes && (
                            <p className="text-[11px] text-foeg-muted italic mt-0.5 leading-relaxed">
                              {b.addressNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Horaires */}
                      <div className="flex items-start space-x-2.5 pt-2">
                        <Clock className="w-4 h-4 text-foeg-navy shrink-0 mt-0.5" strokeWidth={1} />
                        <div className="text-[11px] text-foeg-muted">
                          <p><strong className="text-foeg-black font-medium">{t('boutique.weekday')} :</strong> {b.hoursWeekday}</p>
                          <p><strong className="text-foeg-black font-medium">{t('boutique.weekend')} :</strong> {b.hoursWeekend}</p>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="flex items-center justify-between pt-2 text-[11px] text-foeg-muted">
                        <div className="flex items-center space-x-3">
                          {b.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-foeg-navy" /> {b.phone}
                            </span>
                          )}
                          {b.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-foeg-navy" /> {b.email}
                            </span>
                          )}
                        </div>

                        {b.googleMapsUrl && (
                          <a
                            href={b.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foeg-navy hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre d'Actions Inférieure */}
                <div className="p-4 bg-foeg-surface/40 border-t border-foeg-border/60 flex items-center justify-between text-xs">
                  {/* Toggle Retrait Click & Collect */}
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={b.enablePickup}
                      onChange={() => handleTogglePickup(b.id)}
                      className="accent-foeg-navy w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[11px] uppercase tracking-wider text-foeg-black font-medium flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-foeg-navy" />
                      {t('admin.boutiques.pickupAvailable')}
                    </span>
                  </label>

                  {/* Boutons Modifier & Supprimer */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(b)}
                      className="px-3 py-1.5 border border-foeg-border hover:border-foeg-navy text-foeg-black hover:text-foeg-navy transition-colors text-[11px] uppercase tracking-wider font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{t('admin.boutiques.edit')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id, b.name)}
                      className="p-1.5 text-foeg-muted hover:text-red-700 transition-colors cursor-pointer"
                      title={t('admin.boutiques.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALE D'AJOUT / MODIFICATION D'UNE BOUTIQUE (CRUD COMPLET)
      ========================================================================= */}
      {isModalOpen && editingBoutique && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-foeg-border shadow-floating max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Titre Modal */}
            <div className="flex items-center justify-between border-b border-foeg-border pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-navy font-semibold block">
                  {t('admin.boutiques.modalTag')}
                </span>
                <h2 className="font-serif text-2xl font-light text-foeg-black">
                  {editingBoutique.id ? t('admin.boutiques.modalEditTitle') : t('admin.boutiques.modalAddTitle')}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 text-foeg-muted hover:text-foeg-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
              {/* Nom & Sous-Titre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBoutique.name || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, name: e.target.value })}
                    placeholder="Ex. FOEG Paris, FOEG Caracas..."
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formTag')}
                  </label>
                  <input
                    type="text"
                    value={editingBoutique.tag || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, tag: e.target.value })}
                    placeholder="Ex. Boutique & Salon Privé, Atelier..."
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Ville & Pays */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formCity')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBoutique.city || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, city: e.target.value })}
                    placeholder="Ex. Paris, Caracas, Madrid..."
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formCountry')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBoutique.country || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, country: e.target.value })}
                    placeholder="Ex. France, Venezuela, Espagne..."
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formPostal')}
                  </label>
                  <input
                    type="text"
                    value={editingBoutique.postalCode || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, postalCode: e.target.value })}
                    placeholder="Ex. 75010, 1060..."
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Adresse Physique */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                  {t('admin.boutiques.formAddress')}
                </label>
                <input
                  type="text"
                  value={editingBoutique.address || ''}
                  onChange={(e) => setEditingBoutique({ ...editingBoutique, address: e.target.value })}
                  placeholder="Ex. 48 Rue Lucien Sampaix..."
                  className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                />
              </div>

              {/* Notes d'adresse (pour adresses confidentielles ou à venir) */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                  {t('admin.boutiques.formNotes')}
                </label>
                <textarea
                  rows={2}
                  value={editingBoutique.addressNotes || ''}
                  onChange={(e) => setEditingBoutique({ ...editingBoutique, addressNotes: e.target.value })}
                  placeholder="Ex. L'adresse exacte sera communiquée..."
                  className="w-full bg-transparent border border-foeg-border/80 focus:border-foeg-navy p-2 text-xs text-foeg-black focus:outline-none font-light"
                />
              </div>

              {/* Horaires */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formWeekday')}
                  </label>
                  <input
                    type="text"
                    value={editingBoutique.hoursWeekday || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, hoursWeekday: e.target.value })}
                    placeholder="Ex. Mardi — Samedi : 11h00 — 19h30"
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formWeekend')}
                  </label>
                  <input
                    type="text"
                    value={editingBoutique.hoursWeekend || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, hoursWeekend: e.target.value })}
                    placeholder="Ex. Dimanche : Sur rendez-vous privé"
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Contact : Téléphone, WhatsApp & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formPhone')}
                  </label>
                  <input
                    type="text"
                    value={editingBoutique.phone || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, phone: e.target.value })}
                    placeholder="+33 1 42 68 55 00"
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formWhatsapp')}
                  </label>
                  <input
                    type="text"
                    value={editingBoutique.whatsapp || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, whatsapp: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formEmail')}
                  </label>
                  <input
                    type="email"
                    value={editingBoutique.email || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, email: e.target.value })}
                    placeholder="concierge@foeg-paris.com"
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Médias & Liens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formImage')}
                  </label>
                  <input
                    type="url"
                    value={editingBoutique.imageUrl || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formMaps')}
                  </label>
                  <input
                    type="url"
                    value={editingBoutique.googleMapsUrl || ''}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-transparent border-b border-foeg-border/80 focus:border-foeg-navy py-2 text-xs text-foeg-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Options & Toggles */}
              <div className="p-4 bg-foeg-surface/60 border border-foeg-border/60 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingBoutique.isActive}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, isActive: e.target.checked })}
                    className="accent-foeg-navy w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] uppercase tracking-wider text-foeg-black font-medium">
                    {t('admin.boutiques.formVisible')}
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingBoutique.enablePickup}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, enablePickup: e.target.checked })}
                    className="accent-foeg-navy w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] uppercase tracking-wider text-foeg-black font-medium">
                    {t('admin.boutiques.formPickup')}
                  </span>
                </label>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-foeg-muted font-medium mb-1">
                    {t('admin.boutiques.formOrder')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={editingBoutique.orderIndex || 1}
                    onChange={(e) => setEditingBoutique({ ...editingBoutique, orderIndex: Number(e.target.value) })}
                    className="w-20 bg-white border border-foeg-border px-2 py-1 text-xs text-foeg-black focus:outline-none focus:border-foeg-navy"
                  />
                </div>
              </div>

              {/* Boutons Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-foeg-border">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-xs uppercase tracking-wider font-medium text-foeg-muted hover:text-foeg-black transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-foeg-navy hover:bg-foeg-black text-white px-7 py-3 text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer flex items-center space-x-2 shadow-subtle disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBoutique.id ? t('admin.actions.update') : t('common.save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
