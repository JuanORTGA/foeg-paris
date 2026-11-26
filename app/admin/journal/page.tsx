'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Plus,
  Eye,
  Clock,
  X,
  Check,
  Pencil,
  Trash2,
  AlertCircle,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Link as LinkIcon,
  Camera,
} from 'lucide-react';
import MediaBox from '@/components/ui/MediaBox';
import { JournalArticle } from '@/lib/journal-data';
import {
  getJournalArticles,
  saveJournalArticle,
  deleteJournalArticle,
} from '@/lib/journal-actions';
import { useLanguage } from '@/lib/language-context';

export default function AdminJournalPage() {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalArticle | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campos del editor
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Savoir-Faire');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [readTime, setReadTime] = useState('5 min de lecture');
  const [image, setImage] = useState(
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85'
  );
  const [internalImages, setInternalImages] = useState<string[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInternalIdx, setUploadingInternalIdx] = useState<number | null>(null);
  const [showManualCoverUrl, setShowManualCoverUrl] = useState(false);
  const [manualInternalInput, setManualInternalInput] = useState('');
  const [showManualInternalUrl, setShowManualInternalUrl] = useState(false);

  const fileCoverInputRef = useRef<HTMLInputElement>(null);
  const fileInternalInputRef = useRef<HTMLInputElement>(null);
  const activeInternalUploadIndex = useRef<number | null>(null);

  // Helper de subida de imágenes a /api/upload
  const handleUploadFile = async (file: File, isCover: boolean, internalIndex?: number) => {
    if (isCover) {
      setUploadingCover(true);
    } else if (typeof internalIndex === 'number') {
      setUploadingInternalIdx(internalIndex);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors du téléversement.');
      }
      const uploadedUrl = data.secure_url;
      if (isCover) {
        setImage(uploadedUrl);
      } else if (typeof internalIndex === 'number') {
        setInternalImages((prev) => {
          const next = [...prev];
          next[internalIndex] = uploadedUrl;
          return next;
        });
      } else {
        setInternalImages((prev) => [...prev, uploadedUrl]);
      }
    } catch (err: any) {
      alert(err?.message || 'Error al subir la imagen');
    } finally {
      setUploadingCover(false);
      setUploadingInternalIdx(null);
      activeInternalUploadIndex.current = null;
    }
  };

  // Carga inicial desde Neon PostgreSQL
  useEffect(() => {
    let isMounted = true;
    getJournalArticles().then((data) => {
      if (isMounted) {
        setArticles(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Abrir modal para CREAR
  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Savoir-Faire');
    setExcerpt('');
    setBody('');
    setReadTime(
      language === 'es'
        ? '5 min de lectura'
        : language === 'en'
        ? '5 min read'
        : '5 min de lecture'
    );
    setImage(
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85'
    );
    setInternalImages([]);
    setShowManualCoverUrl(false);
    setShowManualInternalUrl(false);
    setManualInternalInput('');
    setIsEditorOpen(true);
  };

  // Abrir modal para EDITAR
  const handleOpenEdit = (article: JournalArticle) => {
    setEditingId(article.id);
    setTitle(article.title);
    setCategory(article.category);
    setExcerpt(article.excerpt || article.subtitle || '');
    setBody(Array.isArray(article.content) ? article.content.join('\n\n') : (article.content as string) || '');
    setReadTime(article.readTime || '5 min de lecture');
    setImage(article.image || '');
    setInternalImages(article.internalImages || []);
    setShowManualCoverUrl(false);
    setShowManualInternalUrl(false);
    setManualInternalInput('');
    setIsEditorOpen(true);
  };

  // Guardar (CREATE o UPDATE) en Neon PostgreSQL
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    const res = await saveJournalArticle(
      {
        id: editingId || undefined,
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        body: body.trim(),
        readTime: readTime.trim(),
        image: image.trim(),
        internalImages: internalImages.filter((img) => img.trim().length > 0),
      }
    );

    if (res.success && res.article) {
      if (editingId) {
        setArticles((prev) => prev.map((a) => (a.id === editingId ? res.article! : a)));
        showToast(
          language === 'es'
            ? `Ensayo "${res.article.title}" actualizado con éxito en Neon.`
            : language === 'en'
            ? `Essay "${res.article.title}" updated successfully.`
            : `Essai "${res.article.title}" mis à jour avec succès.`
        );
      } else {
        setArticles((prev) => [res.article!, ...prev]);
        showToast(
          language === 'es'
            ? `Ensayo "${res.article.title}" publicado con éxito en Neon.`
            : language === 'en'
            ? `Essay "${res.article.title}" published successfully.`
            : `Essai "${res.article.title}" publié avec succès.`
        );
      }
      setIsEditorOpen(false);
      // Reset
      setTitle('');
      setExcerpt('');
      setBody('');
    } else {
      alert(res.error || 'Erreur lors de la sauvegarde');
    }
    setIsSubmitting(false);
  };

  // Confirmar eliminación en Neon PostgreSQL
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    const res = await deleteJournalArticle(deleteTarget.id);
    if (res.success) {
      setArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      showToast(
        language === 'es'
          ? `Ensayo "${deleteTarget.title}" eliminado.`
          : language === 'en'
          ? `Essay "${deleteTarget.title}" deleted.`
          : `Essai "${deleteTarget.title}" supprimé.`
      );
    } else {
      alert(res.error || 'Erreur lors de la suppression');
    }
    setIsSubmitting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-10 relative animate-fadeIn">
      {/* Toast de confirmación flotante */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-foeg-navy text-foeg-white px-5 py-3.5 shadow-floating flex items-center space-x-3 text-xs uppercase tracking-[0.16em] animate-fadeIn border border-white/20">
          <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-foeg-border/80 gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-muted block mb-1">
            {language === 'es'
              ? 'Edición Literaria y Fotográfica · Maison FOEG'
              : language === 'en'
              ? 'Literary & Photographic Edition · Maison FOEG'
              : 'Édition Littéraire & Photographique · Maison FOEG'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-foeg-black tracking-tight">
            {language === 'es' ? 'El Journal FOEG' : language === 'en' ? 'FOEG Journal' : 'Le Journal FOEG'}{' '}
            <span className="text-2xl sm:text-3xl font-light text-foeg-muted">({articles.length})</span>
          </h1>
        </div>

        <div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 bg-foeg-navy hover:bg-foeg-black text-foeg-white py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-200 rounded-none shadow-subtle cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>
              {language === 'es'
                ? 'Redactar un Ensayo'
                : language === 'en'
                ? 'Write an Essay'
                : 'Rédiger un Essai'}
            </span>
          </button>
        </div>
      </div>

      {/* Lista de Artículos */}
      {isLoading ? (
        <div className="py-20 text-center text-xs uppercase tracking-[0.2em] text-foeg-muted font-light">
          {language === 'es' ? 'Cargando publicaciones del Atelier...' : 'Chargement des essais d’Atelier...'}
        </div>
      ) : articles.length === 0 ? (
        <div className="py-20 text-center bg-white border border-foeg-border text-xs uppercase tracking-[0.2em] text-foeg-muted font-light">
          {language === 'es' ? 'No hay ensayos registrados.' : 'Aucun essai dans le Journal.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white border border-foeg-border/80 p-6 flex flex-col justify-between group hover:border-foeg-navy transition-colors shadow-subtle"
            >
              <div className="space-y-4">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-foeg-surface">
                  <MediaBox
                    src={article.image}
                    alt={article.title}
                    aspectRatio="full"
                    className="w-full h-full"
                    imageClassName="group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-foeg-muted">
                  <span className="font-medium text-foeg-navy">{article.category}</span>
                  <span className="flex items-center space-x-1 font-light">
                    <Clock className="w-3 h-3" strokeWidth={1} />
                    <span>{article.readTime}</span>
                  </span>
                </div>

                <h2 className="font-serif text-xl font-normal text-foeg-black group-hover:text-foeg-navy transition-colors leading-snug">
                  {article.title}
                </h2>

                <p className="text-xs text-foeg-muted font-light leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
              </div>

              {/* Pie de la tarjeta con acciones completas de CRUD */}
              <div className="pt-6 border-t border-foeg-border/60 flex items-center justify-between mt-6">
                <span className="text-[11px] text-foeg-muted font-light">{article.date}</span>

                <div className="flex items-center space-x-3">
                  {/* Botón Ver en línea */}
                  <Link
                    href={`/journal/${article.slug}`}
                    target="_blank"
                    className="text-xs uppercase tracking-[0.16em] text-foeg-navy hover:text-foeg-black font-medium inline-flex items-center space-x-1"
                    title={language === 'es' ? 'Ver en línea' : 'Consulter en ligne'}
                  >
                    <span className="hidden sm:inline">
                      {language === 'es' ? 'Ver en línea' : language === 'en' ? 'View Online' : 'Consulter en ligne'}
                    </span>
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>

                  <span className="text-foeg-border">|</span>

                  {/* Botón EDITAR (CRUD) */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(article)}
                    className="p-1.5 text-foeg-muted hover:text-foeg-navy transition-colors cursor-pointer border border-transparent hover:border-foeg-border hover:bg-foeg-surface/50"
                    title={language === 'es' ? 'Editar Ensayo' : language === 'en' ? 'Edit Essay' : 'Modifier'}
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>

                  {/* Botón ELIMINAR (CRUD) */}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(article)}
                    className="p-1.5 text-foeg-muted hover:text-red-700 transition-colors cursor-pointer border border-transparent hover:border-red-200 hover:bg-red-50/50"
                    title={language === 'es' ? 'Eliminar Ensayo' : language === 'en' ? 'Delete Essay' : 'Supprimer'}
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* =========================================================================
          MODAL GRANDE / EDITOR DE ENSAYO EDITORIAL (CREATE & UPDATE EN NEON)
      ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-6 md:p-10 animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-floating border border-foeg-border">
            {/* Header del Editor */}
            <div className="p-4 sm:p-6 md:p-8 border-b border-foeg-border/80 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-foeg-navy font-medium block">
                  {language === 'es'
                    ? 'Journal FOEG París · Redacción de Atelier'
                    : 'Journal FOEG Paris · Rédaction d’Atelier'}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-light text-foeg-black tracking-tight mt-1">
                  {editingId
                    ? language === 'es'
                      ? 'Modificar Ensayo Editorial'
                      : language === 'en'
                      ? 'Edit Editorial Essay'
                      : 'Modifier l’Essai Éditorial'
                    : language === 'es'
                    ? 'Nuevo Ensayo Literario'
                    : language === 'en'
                    ? 'New Literary Essay'
                    : 'Nouvel Essai Littéraire'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-foeg-muted hover:text-foeg-black transition-colors cursor-pointer"
                aria-label="Cerrar editor"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1} />
              </button>
            </div>

            {/* Formulario del Editor */}
            <form onSubmit={handleSaveArticle} className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-xs font-light">
              {/* Título */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {language === 'es' ? 'Título del Ensayo *' : language === 'en' ? 'Essay Title *' : 'Titre de l’Essai *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    language === 'es'
                      ? "Ej: La Arquitectura del Drapé: Entre Sombra y Pureza"
                      : "Ex: L'Architecture du Tombé : Entre Ombre et Pureté"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent font-serif text-xl sm:text-2xl text-foeg-black border-b border-gray-300 focus:border-foeg-navy py-2 focus:outline-none transition-colors font-light"
                />
              </div>

              {/* Categoría y Tiempo de Lectura */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                    {language === 'es' ? 'Categoría' : 'Catégorie'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-300 focus:border-foeg-navy text-xs text-foeg-black py-2.5 focus:outline-none transition-colors font-light rounded-none cursor-pointer"
                  >
                    <option value="Savoir-Faire">Savoir-Faire</option>
                    <option value="Matières Nobles">Matières Nobles</option>
                    <option value="Chroniques">Chroniques</option>
                    <option value="Philosophie">Philosophie</option>
                    <option value="Carnet de Ville">Carnet de Ville</option>
                    <option value="Manifiesto">Manifiesto</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                    {language === 'es' ? 'Tiempo Estimado de Lectura' : 'Temps de Lecture Estimé'}
                  </label>
                  <input
                    type="text"
                    placeholder="5 min de lectura"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-300 focus:border-foeg-navy text-xs text-foeg-black py-2.5 focus:outline-none transition-colors font-light"
                  />
                </div>
              </div>

              {/* Resumen / Excerpt */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {language === 'es' ? 'Extracto Editorial (Chapô)' : 'Extrait Éditorial (Chapô)'}
                </label>
                <input
                  type="text"
                  placeholder={
                    language === 'es'
                      ? 'Una frase de presentación para la portada del Journal...'
                      : "Une phrase d'accroche pour la couverture du Journal..."
                  }
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-300 focus:border-foeg-navy text-xs text-foeg-black py-2 focus:outline-none transition-colors font-light"
                />
              </div>

              {/* Input ocultos para subida de fotos (Móvil y Escritorio) */}
              <input
                type="file"
                ref={fileCoverInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file, true);
                  e.target.value = '';
                }}
              />
              <input
                type="file"
                ref={fileInternalInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (typeof activeInternalUploadIndex.current === 'number') {
                      handleUploadFile(file, false, activeInternalUploadIndex.current);
                    } else {
                      handleUploadFile(file, false);
                    }
                  }
                  e.target.value = '';
                }}
              />

              {/* Fotografía de Portada del Ensayo */}
              <div className="space-y-3 pt-2 border-t border-foeg-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-navy block font-semibold">
                      {language === 'es' ? 'Fotografía de Portada' : 'Photographie de Couverture'}
                    </label>
                    <span className="text-[11px] text-foeg-muted font-light">
                      {language === 'es'
                        ? 'Imagen principal visible en la Home, listado del Journal y cabecera del artículo'
                        : "Image principale visible sur l'accueil, le journal et l'en-tête de l'article"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileCoverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="inline-flex items-center space-x-1.5 bg-foeg-navy text-white text-[11px] uppercase tracking-wider px-3.5 py-2 font-medium transition-colors hover:bg-foeg-black cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {uploadingCover ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {uploadingCover
                          ? language === 'es'
                            ? 'Subiendo...'
                            : 'Téléversement...'
                          : language === 'es'
                          ? 'Subir Foto'
                          : 'Téléverser'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualCoverUrl((prev) => !prev)}
                      className="text-[11px] uppercase tracking-wider text-foeg-muted hover:text-foeg-black underline underline-offset-4 px-2 py-1.5 cursor-pointer"
                    >
                      {showManualCoverUrl ? (language === 'es' ? 'Ocultar URL' : 'Masquer URL') : 'URL'}
                    </button>
                  </div>
                </div>

                {/* Vista Previa de la Portada */}
                <div className="relative aspect-[16/9] w-full max-h-56 overflow-hidden bg-foeg-surface border border-foeg-border/80 group">
                  {image ? (
                    <MediaBox
                      src={image}
                      alt="Aperçu couverture"
                      aspectRatio="full"
                      className="w-full h-full"
                      imageClassName="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-foeg-muted text-xs p-4 text-center">
                      <ImageIcon className="w-8 h-8 stroke-[1] mb-2 opacity-50" />
                      <span>
                        {language === 'es'
                          ? 'Sin foto de portada seleccionada'
                          : 'Aucune photo de couverture sélectionnée'}
                      </span>
                    </div>
                  )}

                  {uploadingCover && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white text-xs gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{language === 'es' ? 'Procesando imagen...' : 'Traitement image...'}</span>
                    </div>
                  )}
                </div>

                {showManualCoverUrl && (
                  <div className="pt-1">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-2.5 focus:outline-none focus:border-foeg-navy font-light font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Fotografías Internas del Ensayo (Atelier / Ilustración) */}
              <div className="space-y-4 pt-4 border-t border-foeg-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-navy font-semibold">
                        {language === 'es' ? 'Fotografías Internas del Ensayo' : 'Photographies Internes de l’Essai'}
                      </label>
                      <span className="text-[10px] bg-foeg-surface border border-foeg-border/80 px-2 py-0.5 font-mono text-foeg-muted">
                        {internalImages.length} {language === 'es' ? 'imágenes' : 'images'}
                      </span>
                    </div>
                    <span className="text-[11px] text-foeg-muted font-light block mt-0.5">
                      {language === 'es'
                        ? 'Imágenes de alta costura que ilustran el proceso o atelier dentro del artículo'
                        : "Images illustrant les coulisses et l'atelier au fil de la lecture"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        activeInternalUploadIndex.current = null;
                        fileInternalInputRef.current?.click();
                      }}
                      className="inline-flex items-center space-x-1.5 bg-foeg-surface border border-foeg-border/80 hover:border-foeg-navy text-foeg-black text-[11px] uppercase tracking-wider px-3 py-2 font-medium transition-colors cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'es' ? 'Añadir Foto' : 'Ajouter Photo'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualInternalUrl((prev) => !prev)}
                      className="text-[11px] uppercase tracking-wider text-foeg-muted hover:text-foeg-black underline underline-offset-4 px-2 py-1.5 cursor-pointer"
                    >
                      {showManualInternalUrl ? (language === 'es' ? 'Ocultar URL' : 'Masquer URL') : 'Pegar URL'}
                    </button>
                  </div>
                </div>

                {/* Input para agregar URL manual */}
                {showManualInternalUrl && (
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={manualInternalInput}
                      onChange={(e) => setManualInternalInput(e.target.value)}
                      className="flex-1 bg-foeg-surface/40 border border-foeg-border text-xs text-foeg-black p-2.5 focus:outline-none focus:border-foeg-navy font-light font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (manualInternalInput.trim()) {
                          setInternalImages((prev) => [...prev, manualInternalInput.trim()]);
                          setManualInternalInput('');
                          setShowManualInternalUrl(false);
                        }
                      }}
                      className="bg-foeg-navy text-white text-[11px] uppercase tracking-wider px-4 py-2.5 font-medium cursor-pointer shrink-0"
                    >
                      {language === 'es' ? 'Añadir' : 'Ajouter'}
                    </button>
                  </div>
                )}

                {/* Lista de Imágenes Internas */}
                {internalImages.length === 0 ? (
                  <div className="py-6 px-4 border border-dashed border-foeg-border bg-foeg-surface/20 text-center text-[11px] text-foeg-muted font-light">
                    {language === 'es'
                      ? 'No hay imágenes internas aún. Añade fotos para ilustrar los párrafos del ensayo.'
                      : "Aucune image interne pour l'instant. Ajoutez des photos pour illustrer le récit d'atelier."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {internalImages.map((imgUrl, idx) => {
                      const isUploadingThis = uploadingInternalIdx === idx;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2.5 bg-foeg-surface/30 border border-foeg-border/80 group"
                        >
                          <div className="relative w-20 h-14 shrink-0 overflow-hidden bg-foeg-surface border border-foeg-border">
                            <MediaBox
                              src={imgUrl}
                              alt={`Illustration ${idx + 1}`}
                              aspectRatio="full"
                              className="w-full h-full"
                              imageClassName="w-full h-full object-cover"
                            />
                            {isUploadingThis && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] uppercase tracking-widest text-foeg-navy font-semibold block">
                              {language === 'es' ? `Foto ${idx + 1}` : `Photo ${idx + 1}`}
                            </span>
                            <p className="text-[10px] text-foeg-muted truncate font-mono mt-0.5">
                              {imgUrl}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                activeInternalUploadIndex.current = idx;
                                fileInternalInputRef.current?.click();
                              }}
                              title={language === 'es' ? 'Reemplazar foto' : 'Remplacer photo'}
                              className="p-1.5 text-foeg-muted hover:text-foeg-navy transition-colors cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setInternalImages((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              title={language === 'es' ? 'Eliminar foto' : 'Supprimer photo'}
                              className="p-1.5 text-foeg-muted hover:text-red-700 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Cuerpo del Artículo */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block font-medium">
                  {language === 'es'
                    ? 'Cuerpo del Texto (Separe los párrafos con una línea vacía) *'
                    : 'Corps du Texte (Séparez les paragraphes par une ligne vide) *'}
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder={
                    language === 'es' ? 'Redacte el ensayo aquí...' : "Rédigez l'essai ici..."
                  }
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-foeg-surface/20 border border-foeg-border/80 text-xs text-foeg-black p-4 focus:outline-none focus:border-foeg-navy font-light leading-relaxed resize-y font-serif text-sm"
                />
              </div>

              {/* Footer con Acciones */}
              <div className="pt-6 border-t border-foeg-border/80 flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-6 py-3 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black font-light transition-colors cursor-pointer"
                >
                  {language === 'es' ? 'Cancelar' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-foeg-navy hover:bg-foeg-black text-foeg-white px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors shadow-subtle cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting
                    ? language === 'es'
                      ? 'Guardando...'
                      : 'Enregistrement...'
                    : editingId
                    ? language === 'es'
                      ? 'Guardar Cambios'
                      : 'Enregistrer les Modifications'
                    : language === 'es'
                    ? 'Publicar Ensayo'
                    : 'Publier l’Essai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
      ========================================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-foeg-border shadow-floating w-full max-w-md p-6 space-y-5">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-foeg-black font-normal">
                  {language === 'es' ? 'Confirmar Eliminación' : 'Confirmer la Suppression'}
                </h3>
                <p className="text-xs text-foeg-muted font-light leading-relaxed">
                  {language === 'es'
                    ? `¿Está seguro de que desea eliminar el ensayo "${deleteTarget.title}" del Journal de la Maison?`
                    : `Êtes-vous sûr de vouloir supprimer l'essai "${deleteTarget.title}" du Journal ?`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-foeg-border/80">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-foeg-border text-foeg-black hover:bg-foeg-surface/50 text-xs uppercase tracking-wider cursor-pointer"
              >
                {language === 'es' ? 'Cancelar' : 'Annuler'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-700 text-white hover:bg-red-800 transition-colors text-xs uppercase tracking-wider font-medium cursor-pointer disabled:opacity-50"
              >
                {isSubmitting
                  ? language === 'es'
                    ? 'Eliminando...'
                    : 'Suppression...'
                  : language === 'es'
                  ? 'Sí, Eliminar'
                  : 'Oui, Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
