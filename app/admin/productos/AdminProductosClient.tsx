'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Search, X, UploadCloud, Check, Trash2, AlertCircle, Pencil } from 'lucide-react';
import MediaBox from '@/components/ui/MediaBox';
import ImageUpload from '@/components/admin/ImageUpload';
import MultiImageUpload from '@/components/admin/MultiImageUpload';
import { useLanguage } from '@/lib/language-context';
import { getTranslatedColor } from '@/lib/i18n';
import { getProductBadge } from '@/lib/badge-helper';
import { createProduct, updateProduct, deleteProduct } from './actions';

export interface AdminProductItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string | null;
  badge?: string | null;
  images: string[];
  description: string;
  composition: string;
  variants?: {
    id?: string;
    size: string;
    stock: number;
    color: string;
  }[];
}

const PRESET_COLORS: { name: string; hex: string }[] = [
  { name: 'Noir Carbone', hex: '#111111' },
  { name: 'Craie Texturée', hex: '#E8E5DF' },
  { name: 'Blanc Ivoire', hex: '#F7F5F0' },
  { name: 'Écru Naturel', hex: '#F5F2EB' },
  { name: 'Bordeaux Séquins', hex: '#581825' },
  { name: 'Bleu Nuit', hex: '#1B2432' },
  { name: 'Bleu Nuit Profond', hex: '#141D2B' },
  { name: 'Camel Doré', hex: '#C19A6B' },
  { name: 'Gris Anthracite', hex: '#4A4A4A' },
  { name: 'Mastic Craie', hex: '#D5D0C7' },
  { name: 'Vert Émeraude', hex: '#1A382B' },
];

interface AdminProductosClientProps {
  initialProducts: AdminProductItem[];
}

export default function AdminProductosClient({ initialProducts }: AdminProductosClientProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState<AdminProductItem[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Toutes');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulaire d'ajout / modification
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState<'Mujer' | 'Hombre'>('Hombre');
  const [formSubcategory, setFormSubcategory] = useState('Iconique');
  const [formDescription, setFormDescription] = useState('');
  const [formComposition, setFormComposition] = useState('');
  const [formImage, setFormImage] = useState(
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85'
  );
  const [formImages, setFormImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
  ]);
  const [formBadge, setFormBadge] = useState<string>('NONE');
  const [customBadgeInput, setCustomBadgeInput] = useState<string>('');

  // Tailles & Grille
  const [formSizeType, setFormSizeType] = useState<'standard' | 'pants'>('standard');
  const [formStockXS, setFormStockXS] = useState('5');
  const [formStockS, setFormStockS] = useState('10');
  const [formStockM, setFormStockM] = useState('10');
  const [formStockL, setFormStockL] = useState('8');
  const [formStockXL, setFormStockXL] = useState('4');

  const [formStock26, setFormStock26] = useState('5');
  const [formStock28, setFormStock28] = useState('8');
  const [formStock30, setFormStock30] = useState('10');
  const [formStock32, setFormStock32] = useState('10');
  const [formStock34, setFormStock34] = useState('6');
  const [formStock36, setFormStock36] = useState('4');

  // Couleurs Atelier
  const [formColors, setFormColors] = useState<string[]>(['Noir Carbone']);
  const [customColorInput, setCustomColorInput] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormCategory('Hombre');
    setFormSubcategory('Iconique');
    setFormSizeType('standard');
    setFormDescription('');
    setFormComposition('');
    setFormStockXS('5');
    setFormStockS('10');
    setFormStockM('10');
    setFormStockL('8');
    setFormStockXL('4');
    setFormStock26('5');
    setFormStock28('8');
    setFormStock30('10');
    setFormStock32('10');
    setFormStock34('6');
    setFormStock36('4');
    setFormColors(['Noir Carbone']);
    setCustomColorInput('');
    setFormImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85');
    setFormImages(['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85']);
    setFormBadge('NONE');
    setCustomBadgeInput('');
    setErrorMessage(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (p: AdminProductItem) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormPrice(String(p.price));
    setFormCategory(p.category === 'Hombre' ? 'Hombre' : 'Mujer');
    setFormSubcategory(p.subcategory || 'Manteaux');
    setFormDescription(p.description || '');
    setFormComposition(p.composition || '');

    const hasPantsSize = p.variants?.some((v) => ['26', '28', '30', '32', '34', '36'].includes(v.size));
    const isPants = hasPantsSize || p.subcategory === 'Pantalons';
    setFormSizeType(isPants ? 'pants' : 'standard');

    setFormStockXS(String(p.variants?.find((v) => v.size === 'XS')?.stock ?? 5));
    setFormStockS(String(p.variants?.find((v) => v.size === 'S')?.stock ?? 10));
    setFormStockM(String(p.variants?.find((v) => v.size === 'M')?.stock ?? 10));
    setFormStockL(String(p.variants?.find((v) => v.size === 'L')?.stock ?? 8));
    setFormStockXL(String(p.variants?.find((v) => v.size === 'XL')?.stock ?? 4));

    setFormStock26(String(p.variants?.find((v) => v.size === '26')?.stock ?? 5));
    setFormStock28(String(p.variants?.find((v) => v.size === '28')?.stock ?? 8));
    setFormStock30(String(p.variants?.find((v) => v.size === '30')?.stock ?? 10));
    setFormStock32(String(p.variants?.find((v) => v.size === '32')?.stock ?? 10));
    setFormStock34(String(p.variants?.find((v) => v.size === '34')?.stock ?? 6));
    setFormStock36(String(p.variants?.find((v) => v.size === '36')?.stock ?? 4));

    const extractedColors = Array.from(new Set(p.variants?.map((v) => v.color).filter(Boolean) as string[]));
    setFormColors(extractedColors.length > 0 ? extractedColors : ['Noir Carbone']);
    setCustomColorInput('');

    setFormImage(
      p.images?.[0] ||
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85'
    );
    setFormImages(
      Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85']
    );

    const currentBadge = p.badge || 'NONE';
    if (['NONE', 'LIMITED', 'SALE', 'NEW', 'EXCLUSIVE', 'UNIQUE'].includes(currentBadge)) {
      setFormBadge(currentBadge);
      setCustomBadgeInput('');
    } else {
      setFormBadge('CUSTOM');
      setCustomBadgeInput(currentBadge);
    }

    setErrorMessage(null);
    setIsDrawerOpen(true);
  };

  const handleToggleColor = (colorName: string) => {
    if (formColors.includes(colorName)) {
      if (formColors.length > 1) {
        setFormColors(formColors.filter((c) => c !== colorName));
      }
    } else {
      setFormColors([...formColors, colorName]);
    }
  };

  const handleAddCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customColorInput.trim();
    if (trimmed && !formColors.includes(trimmed)) {
      setFormColors([...formColors, trimmed]);
      setCustomColorInput('');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    const formData = new FormData();
    if (editingProduct) {
      formData.append('id', editingProduct.id);
    }
    formData.append('name', formName);
    formData.append('price', formPrice);
    formData.append('category', formCategory);
    formData.append('subcategory', formSubcategory);
    const activeBadge = formBadge === 'CUSTOM' ? customBadgeInput.trim() : formBadge;
    formData.append('badge', activeBadge || 'NONE');
    formData.append('description', formDescription);
    formData.append('composition', formComposition);
    formData.append('imagesJson', JSON.stringify(formImages.length > 0 ? formImages : [formImage]));
    formData.append('image', formImages[0] || formImage);

    const sizesMap: Record<string, number> =
      formSizeType === 'pants'
        ? {
            '26': Math.max(0, parseInt(formStock26, 10) || 0),
            '28': Math.max(0, parseInt(formStock28, 10) || 0),
            '30': Math.max(0, parseInt(formStock30, 10) || 0),
            '32': Math.max(0, parseInt(formStock32, 10) || 0),
            '34': Math.max(0, parseInt(formStock34, 10) || 0),
            '36': Math.max(0, parseInt(formStock36, 10) || 0),
          }
        : {
            'XS': Math.max(0, parseInt(formStockXS, 10) || 0),
            'S': Math.max(0, parseInt(formStockS, 10) || 0),
            'M': Math.max(0, parseInt(formStockM, 10) || 0),
            'L': Math.max(0, parseInt(formStockL, 10) || 0),
            'XL': Math.max(0, parseInt(formStockXL, 10) || 0),
          };

    formData.append('sizesJson', JSON.stringify(sizesMap));
    formData.append('colorsJson', JSON.stringify(formColors.length > 0 ? formColors : ['Noir Carbone']));
    formData.append('stockS', formStockS);
    formData.append('stockM', formStockM);
    formData.append('stockL', formStockL);

    try {
      if (editingProduct) {
        // Mode ÉDITION
        const res = await updateProduct(formData);
        if (!res.success) {
          const errText = res.error || 'Erreur lors de la modification du produit.';
          setErrorMessage(errText);
          showToast(errText);
          setSubmitting(false);
          return;
        }

        if (res.product) {
          setProducts((prev) =>
            prev.map((item) => (item.id === editingProduct.id ? (res.product as any) : item))
          );
        }

        setIsDrawerOpen(false);
        setEditingProduct(null);
        showToast(
          language === 'es'
            ? `« ${formName} » se ha actualizado con éxito.`
            : language === 'en'
            ? `“${formName}” has been updated successfully.`
            : `« ${formName} » a été mis à jour avec succès.`
        );
      } else {
        // Mode CRÉATION
        const res = await createProduct(formData);
        if (!res.success) {
          const errText = res.error || (language === 'es' ? 'Error al crear el producto.' : 'Erreur lors de la création du produit.');
          setErrorMessage(errText);
          showToast(errText);
          setSubmitting(false);
          return;
        }

        if (res.product) {
          setProducts([res.product as any, ...products]);
        }

        setIsDrawerOpen(false);
        // Nettoyage complet du formulaire
        setFormName('');
        setFormPrice('');
        setFormDescription('');
        setFormComposition('');
        setEditingProduct(null);
        showToast(
          language === 'es'
            ? `« ${formName} » se ha guardado con éxito.`
            : language === 'en'
            ? `“${formName}” has been created successfully.`
            : `« ${formName} » a été créé avec succès.`
        );
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      console.error("Error guardando producto:", err);
      const errText = err?.message || 'Erreur inattendue lors de l’enregistrement.';
      setErrorMessage(errText);
      showToast(errText);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer la pièce "${name}" du catalogue ?`)) {
      return;
    }

    try {
      const res = await deleteProduct(id);
      if (res.success) {
        setProducts(products.filter((p) => p.id !== id));
        showToast(`« ${name} » a été supprimé de la base de données.`);
        startTransition(() => {
          router.refresh();
        });
      } else {
        alert(res.error || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.subcategory || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'Toutes' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast de Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-foeg-navy text-foeg-white px-5 py-3.5 shadow-floating text-xs uppercase tracking-wider flex items-center space-x-3 border border-white/20 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" strokeWidth={2} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabecera de la Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-foeg-border/80 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1 font-medium">
            {t('admin.realtimeData')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-foeg-black tracking-tight">
            {t('admin.products')}
          </h1>
          <p className="text-xs text-foeg-muted font-light mt-1">
            {products.length} {t('admin.products').toLowerCase()}
          </p>
        </div>

        <button
          type="button"
          suppressHydrationWarning
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center space-x-2 bg-foeg-navy hover:bg-foeg-black text-foeg-white px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors duration-200 shadow-subtle cursor-pointer self-start sm:self-auto rounded-none"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span>{t('admin.actions.addProduct')}</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-foeg-surface/40 p-3 sm:p-4 border border-foeg-border/60">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            suppressHydrationWarning
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.actions.searchPlaceholder')}
            className="w-full bg-white border border-foeg-border px-3 py-2 pl-9 text-xs font-light text-foeg-black focus:outline-none focus:border-foeg-navy rounded-none"
          />
          <Search className="w-4 h-4 text-foeg-muted absolute left-2.5 top-2.5" strokeWidth={1} />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-foeg-muted font-light shrink-0">
            {t('admin.table.category')}:
          </span>
          <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            {['Toutes', 'Hombre'].map((cat) => (
              <button
                key={cat}
                type="button"
                suppressHydrationWarning
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 sm:px-3 py-1.5 uppercase tracking-wider text-[10px] sm:text-[11px] transition-colors cursor-pointer shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-foeg-navy text-white font-medium'
                    : 'bg-white border border-foeg-border text-foeg-muted hover:text-foeg-black font-light'
                }`}
              >
                {cat === 'Hombre' ? t('nav.men') : t('admin.actions.all')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cartes de Produits Responsives pour Mobile (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-foeg-border p-8 text-center text-foeg-muted font-light text-xs">
            {t('catalog.noResults')}
          </div>
        ) : (
          filteredProducts.map((p) => {
            const totalStock =
              p.variants?.reduce((acc, curr) => acc + (curr.stock || 0), 0) ?? 15;
            const img =
              p.images?.[0] ||
              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85';

            return (
              <div key={p.id} className="bg-white border border-foeg-border p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-start space-x-3">
                  {/* Miniature Image */}
                  <div className="w-16 h-20 relative bg-foeg-surface border border-foeg-border shrink-0 overflow-hidden">
                    <MediaBox
                      src={img}
                      alt={p.name}
                      aspectRatio="portrait"
                      className="w-full h-full"
                      imageClassName="object-cover"
                      sizes="64px"
                    />
                    {Array.isArray(p.images) && p.images.length > 1 && (
                      <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] font-mono px-1">
                        +{p.images.length - 1}
                      </span>
                    )}
                  </div>

                  {/* Détails du Produit */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="font-serif text-sm font-normal text-foeg-black line-clamp-1">{p.name}</h3>
                      <span className="font-medium text-xs text-foeg-black shrink-0">
                        {Number(p.price).toLocaleString(
                          language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR',
                          { style: 'currency', currency: 'EUR' }
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-foeg-muted mt-0.5">
                      <span className="uppercase tracking-wider font-medium text-foeg-black">
                        {p.category === 'Mujer' ? t('nav.women') : t('nav.men')}
                      </span>
                      {p.subcategory && <span>· {p.subcategory}</span>}
                    </div>

                    {/* Badge */}
                    {(() => {
                      const badgeConfig = getProductBadge(p, t);
                      if (badgeConfig) {
                        return (
                          <span className={`inline-block mt-1 text-[8px] uppercase tracking-wider px-1.5 py-0.5 font-medium ${badgeConfig.className}`}>
                            {badgeConfig.label}
                          </span>
                        );
                      }
                      return null;
                    })()}

                    {/* Stock et Actions */}
                    <div className="mt-2.5 flex items-center justify-between text-[10px] pt-2 border-t border-foeg-border/40">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 text-[9px] tracking-wider font-medium ${
                          totalStock > 5
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {totalStock} {t('admin.table.unitsInAtelier')}
                      </span>

                      <div className="flex items-center space-x-1">
                        <Link
                          href={`/producto/${p.slug.replace(/^\//, '')}`}
                          target="_blank"
                          className="p-1.5 border border-foeg-border text-foeg-muted hover:text-foeg-navy transition-colors"
                          title={t('admin.table.viewPublic')}
                        >
                          <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </Link>
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 border border-foeg-border text-foeg-muted hover:text-foeg-navy transition-colors cursor-pointer"
                          title={t('admin.table.editPiece')}
                        >
                          <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 border border-foeg-border text-foeg-muted hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title={t('admin.table.deletePiece')}
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabla de Productos Conectada a Neon (Desktop) */}
      <div className="hidden md:block bg-white border border-foeg-border shadow-subtle overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[680px]">
          <thead>
            <tr className="border-b border-foeg-border bg-foeg-surface/30 text-[10px] uppercase tracking-[0.22em] text-foeg-muted font-medium">
              <th className="py-4 px-6">{t('admin.table.product')}</th>
              <th className="py-4 px-6">{t('admin.table.category')}</th>
              <th className="py-4 px-6">{t('admin.table.price')}</th>
              <th className="py-4 px-6">{t('admin.table.stock')}</th>
              <th className="py-4 px-6 text-right">{t('admin.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foeg-border/60 font-light">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-foeg-muted font-light">
                  {t('catalog.noResults')}
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const totalStock =
                  p.variants?.reduce((acc, curr) => acc + (curr.stock || 0), 0) ?? 15;
                const img =
                  p.images?.[0] ||
                  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85';

                return (
                  <tr key={p.id} className="hover:bg-foeg-surface/30 transition-colors">
                    {/* Pièce + Image */}
                    <td className="py-4 px-6 flex items-center space-x-4">
                      <div className="w-12 h-16 relative bg-foeg-surface border border-foeg-border/80 shrink-0 overflow-hidden">
                        <MediaBox
                          src={img}
                          alt={p.name}
                          aspectRatio="portrait"
                          className="w-full h-full"
                          imageClassName="object-cover"
                          sizes="48px"
                        />
                        {Array.isArray(p.images) && p.images.length > 1 && (
                          <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] font-mono px-1">
                            +{p.images.length - 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-serif text-sm text-foeg-black font-normal">{p.name}</div>
                        <div className="text-[10px] text-foeg-muted font-mono tracking-tight mt-0.5">
                          /{p.slug}
                        </div>
                        {(() => {
                          const badgeConfig = getProductBadge(p, t);
                          if (badgeConfig) {
                            return (
                              <span className={`inline-block mt-1 text-[8px] uppercase tracking-wider px-1.5 py-0.5 font-medium ${badgeConfig.className}`}>
                                {badgeConfig.label}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </td>

                    {/* Catégorie */}
                    <td className="py-4 px-6">
                      <span className="uppercase tracking-wider text-[10px] font-medium text-foeg-black">
                        {p.category === 'Mujer' ? t('nav.women') : t('nav.men')}
                      </span>
                      {p.subcategory && (
                        <span className="block text-[10px] text-foeg-muted font-light mt-0.5">
                          {p.subcategory === 'Manteaux'
                            ? t('admin.subcat.manteaux')
                            : p.subcategory === 'Chemises'
                            ? t('admin.subcat.chemises')
                            : p.subcategory === 'Pantalons'
                            ? t('admin.subcat.pantalons')
                            : p.subcategory === 'Robes'
                            ? t('admin.subcat.robes')
                            : p.subcategory === 'Chaussures'
                            ? t('admin.subcat.chaussures')
                            : p.subcategory === 'Accessoires'
                            ? t('admin.subcat.accessoires')
                            : p.subcategory}
                        </span>
                      )}
                    </td>

                    {/* Prix */}
                    <td className="py-4 px-6 font-medium text-foeg-black">
                      {Number(p.price).toLocaleString(
                        language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'fr-FR',
                        {
                          style: 'currency',
                          currency: 'EUR',
                        }
                      )}
                    </td>

                    {/* Stock & Variantes */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider font-medium ${
                          totalStock > 5
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {totalStock} {t('admin.table.unitsInAtelier')}
                      </span>
                      {p.variants && p.variants.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1 text-[10px] text-foeg-muted">
                          <span className="font-mono">
                            {Array.from(new Set(p.variants.map((v) => v.size))).join(' · ')}
                          </span>
                          <span className="text-foeg-border">•</span>
                          <span>
                            {Array.from(new Set(p.variants.map((v) => v.color))).length}{' '}
                            {Array.from(new Set(p.variants.map((v) => v.color))).length > 1
                              ? t('admin.table.shadesPlural')
                              : t('admin.table.shades')}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Actions: Voir, Éditer, Supprimer */}
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <Link
                        href={`/producto/${p.slug.replace(/^\//, '')}`}
                        target="_blank"
                        className="p-1.5 text-foeg-muted hover:text-foeg-navy transition-colors inline-block"
                        title={t('admin.table.viewPublic')}
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </Link>

                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-foeg-muted hover:text-foeg-navy transition-colors inline-block cursor-pointer"
                        title={t('admin.table.editPiece')}
                      >
                        <Pencil className="w-4 h-4" strokeWidth={1.5} />
                      </button>

                      <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-foeg-muted hover:text-red-700 transition-colors inline-block cursor-pointer"
                        title={t('admin.table.deletePiece')}
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* DRAWER LATERAL: Ajouter ou Modifier un Produit (Server Action) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
            <div className="w-full sm:w-screen max-w-full sm:max-w-lg bg-white shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto border-l border-foeg-border h-[100dvh] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              {/* Entête Drawer */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-foeg-border">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-foeg-navy block font-medium">
                      {editingProduct ? t('admin.drawer.subtitleEdit') : t('admin.drawer.subtitleCreate')}
                    </span>
                    <h2 className="font-serif text-2xl font-light text-foeg-black">
                      {editingProduct ? `${t('admin.drawer.titleEdit')} : ${editingProduct.name}` : t('admin.drawer.titleCreate')}
                    </h2>
                  </div>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 text-foeg-muted hover:text-foeg-black cursor-pointer"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                {errorMessage && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Formulario */}
                <form id="product-form" onSubmit={handleSubmitForm} className="space-y-5 mt-6 text-xs font-light">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                      {t('admin.form.name')} *
                    </label>
                    <input
                      type="text"
                      required
                      suppressHydrationWarning
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Le Manteau Ceinturé en Laine Froide"
                      className="w-full border border-foeg-border p-2.5 text-xs focus:outline-none focus:border-foeg-navy rounded-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                        {t('admin.form.price')} *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        suppressHydrationWarning
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="1450"
                        className="w-full border border-foeg-border p-2.5 text-xs focus:outline-none focus:border-foeg-navy rounded-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                        {t('admin.form.category')} *
                      </label>
                      <select
                        value={formCategory}
                        suppressHydrationWarning
                        onChange={(e) => setFormCategory(e.target.value as 'Mujer' | 'Hombre')}
                        className="w-full border border-foeg-border p-2.5 text-xs focus:outline-none focus:border-foeg-navy rounded-none bg-white"
                      >
                        <option value="Hombre">{t('nav.men')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                        {t('admin.form.subcategory')}
                      </label>
                      <select
                        value={formSubcategory}
                        suppressHydrationWarning
                        onChange={(e) => {
                          const newSubcat = e.target.value;
                          setFormSubcategory(newSubcat);
                          if (newSubcat === 'Pantalons') {
                            setFormSizeType('pants');
                          } else if (formSizeType === 'pants' && newSubcat !== 'Pantalons') {
                            setFormSizeType('standard');
                          }
                        }}
                        className="w-full border border-foeg-border p-2.5 text-xs focus:outline-none focus:border-foeg-navy rounded-none bg-white"
                      >
                        <option value="Iconique">★ Piezas Icónicas (Sélection Atelier)</option>
                        <option value="Manteaux">{t('admin.subcat.manteaux')}</option>
                        <option value="Chemises">{t('admin.subcat.chemises')}</option>
                        <option value="Pantalons">{t('admin.subcat.pantalons')}</option>
                        <option value="Chaussures">{t('admin.subcat.chaussures')}</option>
                        <option value="Accessoires">{t('admin.subcat.accessoires')}</option>
                      </select>
                    </div>

                    {/* Calificación / Badge del Producto */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                        {t('admin.form.badge') || 'Distintivo / Calificación'}
                      </label>
                      <select
                        value={formBadge}
                        suppressHydrationWarning
                        onChange={(e) => setFormBadge(e.target.value)}
                        className="w-full border border-foeg-border p-2.5 text-xs focus:outline-none focus:border-foeg-navy rounded-none bg-white"
                      >
                        <option value="NONE">{t('admin.badge.none') || 'Sin insignia (Normal)'}</option>
                        <option value="ICONIC">★ Pieza Icónica (Destacar en Home)</option>
                        <option value="LIMITED">{t('admin.badge.limited') || 'Edición Limitada'}</option>
                        <option value="SALE">{t('admin.badge.sale') || 'Oferta / Descuento'}</option>
                        <option value="NEW">{t('admin.badge.new') || 'Novedad / Nueva Colección'}</option>
                        <option value="EXCLUSIVE">{t('admin.badge.exclusive') || 'Exclusivo Atelier'}</option>
                        <option value="UNIQUE">{t('admin.badge.unique') || 'Pieza Única'}</option>
                        <option value="CUSTOM">{t('admin.badge.custom') || 'Texto Personalizado...'}</option>
                      </select>
                    </div>
                  </div>

                  {formBadge === 'CUSTOM' && (
                    <div className="space-y-1 animate-fadeIn">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                        {language === 'es' ? 'Texto del distintivo' : language === 'en' ? 'Badge text' : 'Texte du badge'}
                      </label>
                      <input
                        type="text"
                        value={customBadgeInput}
                        onChange={(e) => setCustomBadgeInput(e.target.value)}
                        placeholder={language === 'es' ? 'Ej: -20% Atelier, Preventa, Archivo...' : language === 'en' ? 'Ex: -20% Atelier, Pre-order...' : 'Ex: -20% Atelier, Précommande...'}
                        className="w-full border border-foeg-border p-2.5 text-xs focus:outline-none focus:border-foeg-navy rounded-none"
                      />
                    </div>
                  )}

                  {/* Previsualización del badge si está activo */}
                  {formBadge !== 'NONE' && (
                    <div className="flex items-center space-x-2.5 p-2.5 bg-foeg-surface/60 border border-foeg-border text-xs animate-fadeIn">
                      <span className="text-[10px] uppercase tracking-wider text-foeg-muted font-medium">
                        {language === 'es' ? 'Vista previa del distintivo:' : language === 'en' ? 'Badge preview:' : 'Aperçu du badge :'}
                      </span>
                      <span
                        className={`text-[9px] uppercase tracking-[0.25em] px-2.5 py-1 font-medium shadow-2xs ${
                          formBadge === 'SALE'
                            ? 'bg-[#581825] text-white border border-red-900/30'
                            : formBadge === 'NEW'
                            ? 'bg-white text-foeg-navy border border-foeg-border'
                            : formBadge === 'EXCLUSIVE'
                            ? 'bg-[#18181B] text-[#D4AF37] border border-[#D4AF37]/40'
                            : formBadge === 'UNIQUE'
                            ? 'bg-[#2D2A26] text-[#E8E5DF] border border-stone-600'
                            : 'bg-foeg-navy text-white border border-white/20'
                        }`}
                      >
                        {formBadge === 'CUSTOM'
                          ? customBadgeInput.trim() || 'Personalizado'
                          : formBadge === 'LIMITED'
                          ? t('admin.badge.limited') || 'Edición Limitada'
                          : formBadge === 'SALE'
                          ? t('admin.badge.sale') || 'Oferta'
                          : formBadge === 'NEW'
                          ? t('admin.badge.new') || 'Novedad'
                          : formBadge === 'EXCLUSIVE'
                          ? t('admin.badge.exclusive') || 'Exclusivo'
                          : formBadge === 'UNIQUE'
                          ? t('admin.badge.unique') || 'Pieza Única'
                          : formBadge}
                      </span>
                    </div>
                  )}

                  <MultiImageUpload
                    images={formImages}
                    onChange={(newImages) => {
                      setFormImages(newImages);
                      if (newImages.length > 0) {
                        setFormImage(newImages[0]);
                      }
                    }}
                    label={t('admin.form.images') || 'Galerie de Photographies (Haute Couture)'}
                  />

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                      {t('admin.form.composition')}
                    </label>
                    <input
                      type="text"
                      suppressHydrationWarning
                      value={formComposition}
                      onChange={(e) => setFormComposition(e.target.value)}
                      placeholder="Ex: 95% Laine Vierge peignée, 5% Cachemire"
                      className="w-full border border-foeg-border p-2.5 text-xs focus:outline-none focus:border-foeg-navy rounded-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                      {t('admin.form.description')}
                    </label>
                    <textarea
                      rows={4}
                      suppressHydrationWarning
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Décrivez l’architecture du vêtement, le drapé et les finitions faites main..."
                      className="w-full border border-foeg-border p-2.5 text-xs focus:outline-none focus:border-foeg-navy rounded-none resize-none"
                    />
                  </div>

                  {/* Palette des Couleurs Atelier */}
                  <div className="pt-3 border-t border-foeg-border/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-navy block font-medium">
                        {t('admin.form.colorsTitle')}
                      </label>
                      <span className="text-[10px] text-foeg-muted">
                        {formColors.length} {t('admin.form.selectedColors')}
                      </span>
                    </div>

                    {/* Nuances prédéfinies */}
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((c) => {
                        const isSelected = formColors.includes(c.name);
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => handleToggleColor(c.name)}
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] transition-all border ${
                              isSelected
                                ? 'border-foeg-navy bg-foeg-surface/60 font-medium text-foeg-black shadow-2xs'
                                : 'border-foeg-border bg-white text-foeg-muted hover:border-foeg-black/30'
                            }`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span>{getTranslatedColor(c.name, language)}</span>
                            {isSelected && <Check className="w-3 h-3 text-foeg-navy ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Champ pour couleur sur mesure */}
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        value={customColorInput}
                        onChange={(e) => setCustomColorInput(e.target.value)}
                        placeholder={t('admin.form.customColorPlaceholder')}
                        className="flex-1 border border-foeg-border p-2 text-xs focus:outline-none focus:border-foeg-navy rounded-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomColor}
                        className="px-3 py-2 bg-foeg-surface hover:bg-foeg-border border border-foeg-border text-xs uppercase tracking-wider text-foeg-black font-medium"
                      >
                        {t('admin.form.addColor')}
                      </button>
                    </div>

                    {/* Tags des couleurs actives */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formColors.map((colorName) => (
                        <span
                          key={colorName}
                          className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] bg-foeg-surface border border-foeg-border/80 text-foeg-black"
                        >
                          <span>{getTranslatedColor(colorName, language)}</span>
                          {formColors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleToggleColor(colorName)}
                              className="text-foeg-muted hover:text-red-700 ml-1.5 cursor-pointer font-bold"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Système de Tailles & Stock Atelier */}
                  <div className="pt-3 border-t border-foeg-border/80 space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-navy block font-medium mb-1.5">
                        {t('admin.form.sizeSystem')}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormSizeType('standard')}
                          className={`py-2 px-3 text-left border text-xs transition-all ${
                            formSizeType === 'standard'
                              ? 'border-foeg-navy bg-foeg-surface/70 font-medium text-foeg-black'
                              : 'border-foeg-border bg-white text-foeg-muted hover:border-foeg-black/30'
                          }`}
                        >
                          <span className="block font-medium">{t('admin.form.standardSizes')}</span>
                          <span className="text-[10px] text-foeg-muted block mt-0.5">XS · S · M · L · XL</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormSizeType('pants')}
                          className={`py-2 px-3 text-left border text-xs transition-all ${
                            formSizeType === 'pants'
                              ? 'border-foeg-navy bg-foeg-surface/70 font-medium text-foeg-black'
                              : 'border-foeg-border bg-white text-foeg-muted hover:border-foeg-black/30'
                          }`}
                        >
                          <span className="block font-medium">{t('admin.form.pantsSizes')}</span>
                          <span className="text-[10px] text-foeg-muted block mt-0.5">26 · 28 · 30 · 32 · 34 · 36</span>
                        </button>
                      </div>
                    </div>

                    {/* Stock par taille selon le type */}
                    {formSizeType === 'standard' ? (
                      <div>
                        <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-2 font-medium">
                          {t('admin.form.stock')} {t('admin.form.standardPiecesAtelier')}
                        </span>
                        <div className="grid grid-cols-5 gap-2">
                          <div>
                            <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-1">XS</span>
                            <input
                              type="number"
                              min="0"
                              suppressHydrationWarning
                              value={formStockXS}
                              onChange={(e) => setFormStockXS(e.target.value)}
                              className="w-full border border-foeg-border p-2 text-xs text-center focus:outline-none focus:border-foeg-navy"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-1">S</span>
                            <input
                              type="number"
                              min="0"
                              suppressHydrationWarning
                              value={formStockS}
                              onChange={(e) => setFormStockS(e.target.value)}
                              className="w-full border border-foeg-border p-2 text-xs text-center focus:outline-none focus:border-foeg-navy"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-1">M</span>
                            <input
                              type="number"
                              min="0"
                              suppressHydrationWarning
                              value={formStockM}
                              onChange={(e) => setFormStockM(e.target.value)}
                              className="w-full border border-foeg-border p-2 text-xs text-center focus:outline-none focus:border-foeg-navy"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-1">L</span>
                            <input
                              type="number"
                              min="0"
                              suppressHydrationWarning
                              value={formStockL}
                              onChange={(e) => setFormStockL(e.target.value)}
                              className="w-full border border-foeg-border p-2 text-xs text-center focus:outline-none focus:border-foeg-navy"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-1">XL</span>
                            <input
                              type="number"
                              min="0"
                              suppressHydrationWarning
                              value={formStockXL}
                              onChange={(e) => setFormStockXL(e.target.value)}
                              className="w-full border border-foeg-border p-2 text-xs text-center focus:outline-none focus:border-foeg-navy"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-2 font-medium">
                          {t('admin.form.stock')} {t('admin.form.pantsAtelier')}
                        </span>
                        <div className="grid grid-cols-6 gap-2">
                          <div>
                            <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-1">26</span>
                            <input
                              type="number"
                              min="0"
                              suppressHydrationWarning
                              value={formStock26}
                              onChange={(e) => setFormStock26(e.target.value)}
                              className="w-full border border-foeg-border p-2 text-xs text-center focus:outline-none focus:border-foeg-navy"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-1">28</span>
                            <input
                              type="number"
                              min="0"
                              suppressHydrationWarning
                              value={formStock28}
                              onChange={(e) => setFormStock28(e.target.value)}
                              className="w-full border border-foeg-border p-2 text-xs text-center focus:outline-none focus:border-foeg-navy"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-1">30</span>
                            <input
                              type="number"
                              min="0"
                              suppressHydrationWarning
                              value={formStock30}
                              onChange={(e) => setFormStock30(e.target.value)}
                              className="w-full border border-foeg-border p-2 text-xs text-center focus:outline-none focus:border-foeg-navy"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-1">32</span>
                            <input
                              type="number"
                              min="0"
                              suppressHydrationWarning
                              value={formStock32}
                              onChange={(e) => setFormStock32(e.target.value)}
                              className="w-full border border-foeg-border p-2 text-xs text-center focus:outline-none focus:border-foeg-navy"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-1">34</span>
                            <input
                              type="number"
                              min="0"
                              suppressHydrationWarning
                              value={formStock34}
                              onChange={(e) => setFormStock34(e.target.value)}
                              className="w-full border border-foeg-border p-2 text-xs text-center focus:outline-none focus:border-foeg-navy"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-foeg-muted uppercase tracking-wider block mb-1">36</span>
                            <input
                              type="number"
                              min="0"
                              suppressHydrationWarning
                              value={formStock36}
                              onChange={(e) => setFormStock36(e.target.value)}
                              className="w-full border border-foeg-border p-2 text-xs text-center focus:outline-none focus:border-foeg-navy"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Botón Guardar / Actualizar */}
              <div className="pt-6 border-t border-foeg-border mt-6">
                <button
                  type="submit"
                  form="product-form"
                  disabled={submitting}
                  suppressHydrationWarning
                  className="w-full bg-foeg-navy hover:bg-foeg-black text-foeg-white py-3.5 text-xs uppercase tracking-[0.22em] font-medium transition-colors shadow-subtle cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? t('admin.drawer.syncing')
                    : editingProduct
                    ? `${t('admin.actions.update')} →`
                    : `${t('admin.actions.save')} →`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
