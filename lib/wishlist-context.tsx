'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toggleWishlistAction, getWishlistProductIdsAction } from '@/app/(shop)/cuenta/deseos/actions';

interface WishlistContextType {
  wishlistIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const { data: session, status } = useSession();

  // Synchronisation stricte de la Wishlist avec le statut d'authentification
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Hors session : la liste de souhaits reste rigoureusement vide
      setWishlistIds([]);
      try {
        localStorage.removeItem('foeg_wishlist');
      } catch (_) {}
    } else if (status === 'authenticated') {
      try {
        const stored = localStorage.getItem('foeg_wishlist');
        if (stored) {
          setWishlistIds(JSON.parse(stored));
        }
      } catch (_) {}
    }
  }, [status]);

  // Synchronisation dynamique avec la base de données Prisma dès que l'utilisateur est authentifié
  useEffect(() => {
    if (status === 'authenticated') {
      getWishlistProductIdsAction()
        .then((serverIds) => {
          if (Array.isArray(serverIds)) {
            setWishlistIds((prev) => {
              const merged = Array.from(new Set([...prev, ...serverIds]));
              try {
                localStorage.setItem('foeg_wishlist', JSON.stringify(merged));
              } catch (_) {}
              return merged;
            });
          }
        })
        .catch(() => {});
    }
  }, [status, session?.user?.id]);

  const isWishlisted = useCallback(
    (productId: string) => {
      return wishlistIds.includes(productId);
    },
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const exists = wishlistIds.includes(productId);
      const updated = exists
        ? wishlistIds.filter((id) => id !== productId)
        : [...wishlistIds, productId];

      setWishlistIds(updated);
      try {
        localStorage.setItem('foeg_wishlist', JSON.stringify(updated));
      } catch (_) {}

      // Appel à la Server Action en arrière-plan
      try {
        await toggleWishlistAction(productId);
      } catch (err) {
        console.warn('[WISHLIST SYNC NOTE]:', err);
      }

      return !exists;
    },
    [wishlistIds]
  );

  const clearWishlist = useCallback(() => {
    setWishlistIds([]);
    try {
      localStorage.removeItem('foeg_wishlist');
    } catch (_) {}
  }, []);

  // Écoute de l'événement global de déconnexion
  useEffect(() => {
    const handleLogout = () => {
      setWishlistIds([]);
      try {
        localStorage.removeItem('foeg_wishlist');
      } catch (_) {}
    };
    window.addEventListener('foeg-session-logout', handleLogout);
    return () => window.removeEventListener('foeg-session-logout', handleLogout);
  }, []);

  const contextValue = useMemo<WishlistContextType>(
    () => ({
      wishlistIds,
      isWishlisted,
      toggleWishlist,
      clearWishlist,
      wishlistCount: wishlistIds.length,
    }),
    [wishlistIds, isWishlisted, toggleWishlist, clearWishlist]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
