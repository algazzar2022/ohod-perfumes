'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/db';

export interface CartItem {
  id: number;
  productId: number;
  nameAr: string;
  price: number;
  priceAfterDiscount?: number;
  quantity: number;
  image: string;
  stockQuantity?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  subtotal: number;
  toast: string | null;
  hideToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('don_perfumes_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('don_perfumes_cart', JSON.stringify(items));
      } catch {
        // Ignore
      }
    }
  }, [items, isLoaded]);

  const addToCart = (product: Product, quantity = 1) => {
    const availableStock = product.stockQuantity !== undefined ? product.stockQuantity : (product.inStock ? 50 : 0);

    if (!product.inStock || availableStock <= 0) {
      setToast(`عذراً، "${product.nameAr}" نفذت كميته من المخزن حالياً`);
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const effectivePrice = product.priceAfterDiscount && product.priceAfterDiscount > 0
      ? product.priceAfterDiscount
      : product.price;

    const img = product.images && product.images.length > 0 ? product.images[0] : '/images/logo/don-logo-160.png';

    let exceeded = false;
    setItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > availableStock) {
          exceeded = true;
          return prev.map(item =>
            item.productId === product.id
              ? { ...item, quantity: availableStock, stockQuantity: availableStock }
              : item
          );
        }
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: nextQty, stockQuantity: availableStock }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          productId: product.id,
          nameAr: product.nameAr,
          price: effectivePrice,
          priceAfterDiscount: product.priceAfterDiscount,
          quantity: Math.min(quantity, availableStock),
          image: img,
          stockQuantity: availableStock
        }
      ];
    });

    if (exceeded) {
      setToast(`أقصى كمية متوفرة في المخزن من "${product.nameAr}" هي ${availableStock} قطع`);
    } else {
      setToast(`تمت إضافة "${product.nameAr}" إلى السلة`);
    }
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          const max = item.stockQuantity !== undefined ? item.stockQuantity : 999;
          const clamped = Math.min(quantity, max);
          if (quantity > max) {
            setToast(`أقصى كمية متوفرة في المخزن هي ${max} قطع`);
            setTimeout(() => setToast(null), 3000);
          }
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);
  const hideToast = () => setToast(null);

  const totalItems = items.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        totalItems,
        subtotal,
        toast,
        hideToast
      }}
    >
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
