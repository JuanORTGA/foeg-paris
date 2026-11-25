'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import MediaBox from '@/components/ui/MediaBox';
import { useWishlist } from '@/lib/wishlist-context';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import { useLanguage } from '@/lib/language-context';
import { MOCK_PRODUCTS, MockProduct } from '@/lib/mock-data';
import { getWishlistProductsAction } from './actions';

export default function WishlistClient() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItems() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        // Tente de récupérer les pièces depuis la base de données
        const dbItems = await getWishlistProductsAction(wishlistIds);
        if (dbItems && dbItems.length > 0) {
          setProducts(dbItems as unknown as MockProduct[]);
        } else {
          // Fallback sur le catalogue des créations FOEG
          const fallback = MOCK_PRODUCTS.filter(
            (p) => wishlistIds.includes(p.id) || wishlistIds.includes(p.slug)
          );
          setProducts(fallback);
        }
      } catch (_) {
        const fallback = MOCK_PRODUCTS.filter(
          (p) => wishlistIds.includes(p.id) || wishlistIds.includes(p.slug)
        );
        setProducts(fallback);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [wishlistIds]);

  const handleAddToCart = (product: MockProduct) => {
    addItem(product, 'M', product.variants?.[0]?.color || 'Noir Carbone', 1);
  };

  return (
    <div className="pt-28 md:pt-36 pb-32 px-6 md:px-12 max-w-7xl mx-auto text-left animate-fadeIn">
      {/* Navigation de retour */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/cuenta"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black transition-colors font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1} />
          <span>Mon Compte</span>
        </Link>

        <Link
          href="/mujer"
          className="text-xs uppercase tracking-[0.2em] text-foeg-muted hover:text-foeg-black transition-colors font-light"
        >
          {t('wishlist.explore')} →
        </Link>
      </div>

      {/* En-tête */}
      <div className="border-b border-foeg-border/80 pb-6 mb-12 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-foeg-muted block mb-2 font-medium">
            Maison FOEG Paris · Vestiaire Privé
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foeg-black tracking-tight">
            {t('wishlist.title')}
          </h1>
        </div>
        <div className="text-xs font-mono uppercase tracking-widest text-foeg-muted">
          {products.length} {products.length === 1 ? 'pièce' : 'pièces'}
        </div>
      </div>

      {/* Grille des pièces de la Wishlist */}
      {products.length === 0 ? (
        <div className="py-24 text-center max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-foeg-surface flex items-center justify-center text-foeg-muted border border-foeg-border">
            <Heart className="w-6 h-6" strokeWidth={1} />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl text-foeg-black font-light">
              {t('wishlist.empty')}
            </h3>
            <p className="text-xs text-foeg-muted font-light leading-relaxed">
              {t('wishlist.emptyDesc')}
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/mujer"
              className="inline-block bg-foeg-navy text-white hover:bg-foeg-black py-3.5 px-8 text-xs uppercase tracking-[0.22em] font-medium transition-colors"
            >
              {t('wishlist.explore')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id || product.slug}
              className="group border border-foeg-border/60 bg-white p-4 flex flex-col justify-between hover:border-foeg-navy transition-colors"
            >
              <div>
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-foeg-surface mb-4">
                  <Link href={`/producto/${product.slug}`}>
                    <MediaBox
                      src={product.images[0]}
                      alt={product.name}
                      aspectRatio="portrait"
                      className="w-full h-full"
                      imageClassName="object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </Link>

                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => toggleWishlist(product.id || product.slug)}
                    className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white text-foeg-black rounded-full shadow-xs cursor-pointer"
                    title={language === 'es' ? 'Eliminar de la lista' : language === 'en' ? 'Remove from wishlist' : 'Retirer de la liste'}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-foeg-muted hover:text-red-600 transition-colors" />
                  </button>
                </div>

                <span className="text-[10px] uppercase tracking-[0.2em] text-foeg-muted block mb-1">
                  {product.category}
                </span>
                <Link
                  href={`/producto/${product.slug}`}
                  className="font-serif text-base text-foeg-black hover:text-foeg-navy transition-colors block font-normal"
                >
                  {product.name}
                </Link>
                <div className="text-xs font-medium text-foeg-black mt-1">
                  {formatPrice(product.price)}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-foeg-border/50">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-foeg-surface hover:bg-foeg-navy text-foeg-black hover:text-white py-2.5 px-3 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center space-x-2 cursor-pointer border border-foeg-border"
                >
                  <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{t('pdp.addToBag')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
