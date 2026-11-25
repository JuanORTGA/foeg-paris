'use client';

import React, { useState, useTransition } from 'react';
import {
  Ticket,
  Plus,
  Trash2,
  Check,
  Percent,
  Calendar,
  AlertCircle,
  Loader2,
  Tag,
} from 'lucide-react';
import { createCoupon, toggleCouponActive, deleteCoupon, type CouponItem } from './actions';
import { useLanguage } from '@/lib/language-context';

interface AdminCuponesClientProps {
  initialCoupons: CouponItem[];
}

export default function AdminCuponesClient({ initialCoupons }: AdminCuponesClientProps) {
  const { t, language } = useLanguage();
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [isPending, startTransition] = useTransition();

  // Formulaire de création
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [expiresAt, setExpiresAt] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!code.trim()) {
      setErrorMsg(
        language === 'es'
          ? 'Por favor ingrese un código.'
          : language === 'en'
          ? 'Please enter a code.'
          : 'Veuillez renseigner un code.'
      );
      return;
    }

    startTransition(async () => {
      const res = await createCoupon({
        code,
        discountType,
        discountValue: Number(discountValue),
        expiresAt: expiresAt || null,
      });

      if (res.success) {
        setSuccessMsg(
          language === 'es'
            ? `Código privilegio "${code.toUpperCase()}" creado con éxito.`
            : language === 'en'
            ? `Privilege code "${code.toUpperCase()}" created successfully.`
            : `Code privilège "${code.toUpperCase()}" créé avec succès.`
        );
        setCoupons((prev) => [
          {
            id: 'temp-' + Date.now(),
            code: code.trim().toUpperCase(),
            discountType,
            discountValue: Number(discountValue),
            isActive: true,
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
            createdAt:
              language === 'es'
                ? 'Recién creado'
                : language === 'en'
                ? 'Just now'
                : 'À l’instant',
          },
          ...prev,
        ]);
        setCode('');
        setExpiresAt('');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || 'Erreur');
      }
    });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleCouponActive(id, !currentStatus);
      if (res.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (
      !confirm(
        language === 'es'
          ? '¿Desea eliminar este código de privilegio?'
          : language === 'en'
          ? 'Do you want to delete this privilege code?'
          : 'Voulez-vous supprimer ce code privilège ?'
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteCoupon(id);
      if (res.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    });
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-foeg-border/80 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1">
            Maison FOEG ·{' '}
            {language === 'es'
              ? 'Privilegios & Descuentos'
              : language === 'en'
              ? 'Privileges & Discounts'
              : 'Privilèges & Remises'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-foeg-black tracking-tight">
            {language === 'es'
              ? 'Códigos Privilegio & Cupones'
              : language === 'en'
              ? 'Privilege Codes & Coupons'
              : 'Codes Privilèges & Cupons'}
          </h1>
        </div>
        <div className="text-xs text-foeg-muted font-light tracking-widest uppercase">
          {coupons.length}{' '}
          {coupons.length === 1
            ? language === 'es'
              ? 'Código Activo'
              : language === 'en'
              ? 'Active Code'
              : 'Code Actif'
            : language === 'es'
            ? 'Códigos Registrados'
            : language === 'en'
            ? 'Registered Codes'
            : 'Codes Enregistrés'}
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-xs font-light flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-light flex items-center space-x-2.5">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Colonne Gauche: Formulaire de Création */}
        <div className="bg-white border border-foeg-border/80 p-4 sm:p-6 md:p-8 space-y-6 shadow-subtle">
          <div className="flex items-center space-x-2.5 border-b border-foeg-border/60 pb-3">
            <span className="p-1.5 bg-foeg-navy/5 text-foeg-navy border border-foeg-navy/10">
              <Plus className="w-4 h-4" strokeWidth={1.5} />
            </span>
            <h2 className="font-serif text-lg font-normal text-foeg-black tracking-wide">
              {language === 'es'
                ? 'Nuevo Código Privilegio'
                : language === 'en'
                ? 'New Privilege Code'
                : 'Nouveau Code Privilège'}
            </h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                {language === 'es'
                  ? 'Código Privilegio *'
                  : language === 'en'
                  ? 'Privilege Code *'
                  : 'Code Privilège *'}
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex. VIP20, CERCLE15"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-foeg-navy text-xs font-mono uppercase tracking-widest focus:outline-none rounded-[2px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {language === 'es'
                    ? 'Tipo de Descuento'
                    : language === 'en'
                    ? 'Discount Type'
                    : 'Type de Remise'}
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 focus:border-foeg-navy text-xs focus:outline-none rounded-[2px]"
                >
                  <option value="PERCENTAGE">
                    {language === 'es'
                      ? 'Porcentaje (%)'
                      : language === 'en'
                      ? 'Percentage (%)'
                      : 'Pourcentage (%)'}
                  </option>
                  <option value="FIXED">
                    {language === 'es'
                      ? 'Importe Fijo (€)'
                      : language === 'en'
                      ? 'Fixed Amount (€)'
                      : 'Montant Fixe (€)'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                  {language === 'es' ? 'Valor *' : language === 'en' ? 'Value *' : 'Valeur *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={1}
                    max={discountType === 'PERCENTAGE' ? 100 : 10000}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-foeg-navy text-xs font-mono focus:outline-none rounded-[2px]"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-foeg-muted font-mono">
                    {discountType === 'PERCENTAGE' ? '%' : '€'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium mb-1">
                {language === 'es'
                  ? 'Fecha de expiración (Opcional)'
                  : language === 'en'
                  ? 'Expiration Date (Optional)'
                  : "Date d'expiration (Optionnel)"}
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-foeg-navy text-xs font-mono focus:outline-none rounded-[2px]"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-foeg-navy text-white hover:bg-foeg-black py-3 px-4 text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer flex items-center justify-center space-x-2 rounded-[2px] disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Tag className="w-4 h-4" strokeWidth={1.5} />
              )}
              <span>
                {language === 'es'
                  ? 'Crear Código Privilegio'
                  : language === 'en'
                  ? 'Create Privilege Code'
                  : 'Créer le Code Privilège'}
              </span>
            </button>
          </form>
        </div>

        {/* Colonne Droite: Liste des Cupons */}
        <div className="lg:col-span-2 bg-white border border-foeg-border/80 overflow-hidden shadow-subtle">
          <div className="p-6 border-b border-foeg-border/60 flex items-center justify-between">
            <h2 className="font-serif text-lg font-normal text-foeg-black tracking-wide">
              {language === 'es'
                ? 'Catálogo de Códigos Disponibles'
                : language === 'en'
                ? 'Available Codes Catalogue'
                : 'Catalogue des Codes Disponibles'}
            </h2>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-foeg-border/80 text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium bg-foeg-surface/40 whitespace-nowrap">
                  <th className="py-4 px-4 sm:px-6">
                    {language === 'es' ? 'Código' : language === 'en' ? 'Code' : 'Code'}
                  </th>
                  <th className="py-4 px-4 sm:px-6">
                    {language === 'es' ? 'Descuento' : language === 'en' ? 'Discount' : 'Remise'}
                  </th>
                  <th className="py-4 px-4 sm:px-6">
                    {language === 'es'
                      ? 'Expiración'
                      : language === 'en'
                      ? 'Expiration'
                      : 'Expiration'}
                  </th>
                  <th className="py-4 px-4 sm:px-6">
                    {language === 'es' ? 'Estado' : language === 'en' ? 'Status' : 'Statut'}
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-right">
                    {language === 'es' ? 'Acciones' : language === 'en' ? 'Actions' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foeg-border/60 font-light whitespace-nowrap">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-foeg-surface/20 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-foeg-navy tracking-wider px-2 py-1 bg-foeg-navy/5 border border-foeg-navy/20 inline-block">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-medium text-foeg-black">
                      {c.discountType === 'PERCENTAGE'
                        ? `-${c.discountValue}%`
                        : `-${c.discountValue} €`}
                    </td>
                    <td className="py-4 px-6 text-foeg-muted text-[11px] font-mono">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString(
                            language === 'es'
                              ? 'es-ES'
                              : language === 'en'
                              ? 'en-US'
                              : 'fr-FR',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )
                        : language === 'es'
                        ? 'Ilimitado'
                        : language === 'en'
                        ? 'Never'
                        : 'Illimité'}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => handleToggle(c.id, c.isActive)}
                        className={`text-[10px] uppercase tracking-wider px-2.5 py-1 border transition-colors cursor-pointer ${
                          c.isActive
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-zinc-100 border-zinc-300 text-zinc-500'
                        }`}
                      >
                        {c.isActive
                          ? language === 'es'
                            ? 'Activo'
                            : language === 'en'
                            ? 'Active'
                            : 'Actif'
                          : language === 'es'
                          ? 'Inactivo'
                          : language === 'en'
                          ? 'Inactive'
                          : 'Inactif'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="text-foeg-muted hover:text-red-700 p-1.5 transition-colors cursor-pointer"
                        title={
                          language === 'es'
                            ? 'Eliminar'
                            : language === 'en'
                            ? 'Delete'
                            : 'Supprimer'
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
