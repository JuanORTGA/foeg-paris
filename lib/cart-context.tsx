'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { MockProduct } from '@/lib/mock-data';

export interface CartItem {
  id: string; // Composite: `${product.id}-${size}-${color || 'default'}`
  product: MockProduct;
  size: string;
  color?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: MockProduct,
    size: string,
    colorOrQty?: string | number,
    quantity?: number
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  subtotal: number;
  totalItems: number;
  freeShippingThreshold: number;
  amountUntilFreeShipping: number;
  isFreeShipping: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 150.0;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { status } = useSession();

  // Sincronización estricta con la sesión del usuario
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Si no hay sesión iniciada, el carrito DEBE estar vacío y sin residuos
      setItems([]);
      try {
        localStorage.removeItem('foeg_cart_items');
      } catch (_) {}
      setIsInitialized(true);
    } else if (status === 'authenticated') {
      // Cargar del almacenamiento únicamente para usuarios autenticados
      try {
        const savedCart = localStorage.getItem('foeg_cart_items');
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (_) {}
      setIsInitialized(true);
    }
  }, [status]);

  // Escuchar evento de desconexión / logout para purga inmediata
  useEffect(() => {
    const handleLogout = () => {
      setItems([]);
      try {
        localStorage.removeItem('foeg_cart_items');
      } catch (_) {}
    };
    window.addEventListener('foeg-session-logout', handleLogout);
    return () => window.removeEventListener('foeg-session-logout', handleLogout);
  }, []);

  // Guardar en localStorage solo si el usuario está autenticado y se ha inicializado
  useEffect(() => {
    if (isInitialized && status === 'authenticated') {
      try {
        localStorage.setItem('foeg_cart_items', JSON.stringify(items));
      } catch (_) {}
    }
  }, [items, isInitialized, status]);

  const addItem = useCallback(
    (
      product: MockProduct,
      size: string,
      colorOrQty?: string | number,
      quantityArg: number = 1
    ) => {
      let selectedColor: string = product.variants?.[0]?.color || 'Noir Carbone';
      let quantity = quantityArg;

      if (typeof colorOrQty === 'number') {
        quantity = colorOrQty;
      } else if (typeof colorOrQty === 'string' && colorOrQty.trim()) {
        selectedColor = colorOrQty.trim();
      }

      const itemId = `${product.id}-${size}-${selectedColor}`;

      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === itemId);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { id: itemId, product, size, color: selectedColor, quantity }];
      });

      // Abrir automáticamente el Mini-cart al añadir
      setIsCartOpen(true);
    },
    []
  );

  const removeItem = useCallback((itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem('foeg_cart_items');
      localStorage.removeItem('foeg_applied_coupon');
    } catch (_) {}
  }, []);

  // Écoute de l'événement global de déconnexion
  useEffect(() => {
    const handleLogout = () => {
      setItems([]);
      try {
        localStorage.removeItem('foeg_cart_items');
        localStorage.removeItem('foeg_applied_coupon');
      } catch (_) {}
    };
    window.addEventListener('foeg-session-logout', handleLogout);
    return () => window.removeEventListener('foeg-session-logout', handleLogout);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  // Cálculos de subtotal y envío gratuito memoizados
  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items]
  );

  const amountUntilFreeShipping = useMemo(
    () => Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    [subtotal]
  );

  const isFreeShipping = useMemo(
    () => subtotal >= FREE_SHIPPING_THRESHOLD,
    [subtotal]
  );

  const contextValue = useMemo<CartContextType>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      subtotal,
      totalItems,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountUntilFreeShipping,
      isFreeShipping,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      subtotal,
      totalItems,
      amountUntilFreeShipping,
      isFreeShipping,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
