'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product, getProduct } from './products';

export type CartItem = { productId: string; quantity: number; variant?: string };

type CartContextValue = {
  items: CartItem[];
  isDrawerOpen: boolean;
  lastAdded?: { name: string; quantity: number };
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (product: Product, quantity?: number, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  removeItem: (productId: string, variant?: string) => void;
  dismissAddedNotice: () => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<{ name: string; quantity: number }>();

  useEffect(() => {
    queueMicrotask(() => {
      const raw = window.localStorage.getItem('prime-academics-cart');
      setItems(raw ? JSON.parse(raw) : []);
      setHasLoadedCart(true);
    });
  }, []);

  useEffect(() => {
    if (hasLoadedCart) window.localStorage.setItem('prime-academics-cart', JSON.stringify(items));
  }, [items, hasLoadedCart]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => {
      const product = getProduct(item.productId);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      isDrawerOpen,
      lastAdded,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem: (product, quantity = 1, variant) => {
        setItems((current) => {
          const found = current.find((item) => item.productId === product.id && item.variant === variant);
          if (found) {
            return current.map((item) =>
              item.productId === product.id && item.variant === variant
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            );
          }
          return [...current, { productId: product.id, quantity, variant }];
        });
        setLastAdded({ name: product.name, quantity });
        setDrawerOpen(true);
      },
      updateQuantity: (productId, quantity, variant) => {
        setItems((current) =>
          current
            .map((item) => (item.productId === productId && item.variant === variant ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        );
      },
      removeItem: (productId, variant) => setItems((current) => current.filter((item) => !(item.productId === productId && item.variant === variant))),
      dismissAddedNotice: () => setLastAdded(undefined),
      clearCart: () => setItems([]),
      count,
      subtotal,
    };
  }, [items, isDrawerOpen, lastAdded]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
