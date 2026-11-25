'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Search, ArrowRight, Loader2 } from 'lucide-react';
import { MockProduct } from '@/lib/mock-data';
import { useLanguage } from '@/lib/language-context';
import { useCurrency } from '@/lib/currency-context';
import MediaBox from '@/components/ui/MediaBox';
import { searchProducts } from '@/app/search/actions';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // Auto-focus en el input al abrir y bloquear scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
      setIsLoading(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Búsqueda asíncrona real mediante Server Action con Debounce de 300ms
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchProducts(trimmed);
        setResults(found);
      } catch (err) {
        console.error('[SEARCH OVERLAY ERROR]:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Manejador tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Navegación a la página completa de resultados /search?q=...
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recherche globale"
      className="fixed inset-0 z-50 bg-foeg-white flex flex-col justify-start animate-fadeIn overflow-y-auto"
    >
      {/* Botón Cerrar "X" arriba a la derecha */}
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 pt-8 flex items-center justify-between">
        <span className="font-serif text-xl tracking-[0.25em] text-foeg-navy uppercase">
          FOEG
        </span>

        <button
          type="button"
          onClick={onClose}
          className="p-2 text-foeg-black hover:text-foeg-navy transition-colors focus:outline-none cursor-pointer"
          aria-label="Fermer la recherche"
        >
          <X className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1} />
        </button>
      </div>

      {/* Contenedor Principal Central */}
      <div className="max-w-4xl w-full mx-auto px-6 md:px-12 pt-12 md:pt-20 pb-24 space-y-10">
        {/* Formulario con Input Gigante */}
        <form onSubmit={handleSubmit} className="relative border-b border-foeg-border/80 pb-4 flex items-center focus-within:border-foeg-navy transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder') || 'Rechercher un manteau, un cachemire...'}
            className="w-full bg-transparent font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foeg-black placeholder:text-gray-300 focus:outline-none tracking-tight font-light"
          />
          <div className="flex items-center space-x-2">
            {isLoading && (
              <Loader2 className="w-5 h-5 text-foeg-muted animate-spin" />
            )}
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black px-2 py-1 cursor-pointer"
              >
                {t('search.clear') || 'Effacer'}
              </button>
            )}
            <button
              type="submit"
              className="p-2 text-foeg-black hover:text-foeg-navy cursor-pointer transition-colors"
              aria-label="Lancer la recherche"
            >
              <Search className="w-6 h-6" strokeWidth={1} />
            </button>
          </div>
        </form>

        {/* Sugerencias Rápidas de Lujo */}
        {!query && (
          <div className="space-y-4 pt-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-foeg-muted font-light block">
              {t('search.suggestions') || 'Suggestions d’Atelier'}
            </span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {['Manteau Cachemire', 'Chemise Soie', 'Pantalon Laine', 'Accessoires'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className="border border-foeg-border hover:border-foeg-navy text-xs uppercase tracking-[0.18em] px-4 py-2 font-medium text-foeg-black hover:text-foeg-navy transition-all duration-200 cursor-pointer bg-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados de Búsqueda Dinámicos en Vivo */}
        {query && (
          <div className="space-y-6 pt-4 animate-fadeIn">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-foeg-muted border-b border-foeg-border/60 pb-3">
              <span>{results.length} {results.length === 1 ? 'résultat' : 'résultats'}</span>
              <button
                type="button"
                onClick={handleSubmit}
                className="hover:text-foeg-navy flex items-center space-x-1 cursor-pointer"
              >
                <span>Voir la page complète</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {results.length === 0 && !isLoading ? (
              <div className="py-12 text-center space-y-3">
                <p className="font-serif text-2xl font-light text-foeg-black">
                  {t('search.empty') || 'Aucune création trouvée'}
                </p>
                <p className="text-xs text-foeg-muted font-light">
                  {t('search.emptySubtitle') || 'Vérifiez l’orthographe ou explorez nos vestiaires permanents.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.slice(0, 6).map((product) => (
                  <Link
                    key={product.id}
                    href={`/producto/${product.slug}`}
                    onClick={onClose}
                    className="group flex flex-col space-y-3"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-foeg-surface border border-foeg-border/60">
                      <MediaBox
                        src={product.images[0]}
                        alt={product.name}
                        aspectRatio="full"
                        className="w-full h-full"
                        imageClassName="transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted">
                        {product.category} {product.subcategory ? `· ${product.subcategory}` : ''}
                      </div>
                      <h3 className="font-serif text-lg font-normal text-foeg-black group-hover:text-foeg-navy transition-colors">
                        {product.name}
                      </h3>
                      <div className="text-xs font-medium tracking-wider text-foeg-black">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
