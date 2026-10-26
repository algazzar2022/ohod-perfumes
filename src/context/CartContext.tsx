'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/db';

export interface CartItem {
  id: string | number;
  productId: number;
  nameAr: string;
  selectedSize?: string;
  price: number;
  priceAfterDiscount?: number;
  quantity: number;
  image: string;
  stockQuantity?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedSize?: string,
    customPrice?: number,
    customPriceAfterDiscount?: number
  ) => void;
  removeFromCart: (cartItemIdOrProductId: string | number, size?: string) => void;
  updateQuantity: (cartItemIdOrProductId: string | number, quantity: number, size?: string) => void;
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

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    customPrice?: number,
    customPriceAfterDiscount?: number
  ) => {
    const availableStock = product.stockQuantity !== undefined ? product.stockQuantity : (product.inStock ? 50 : 0);

    if (!product.inStock || availableStock <= 0) {
      setToast(`عذراً، "${product.nameAr}" نفذت كميته من المخزن حالياً`);
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Determine effective price (custom price for size if passed, otherwise base product price)
    let effectivePrice = product.priceAfterDiscount && product.priceAfterDiscount > 0
      ? product.priceAfterDiscount
      : product.price;

    let finalDiscountPrice: number | undefined = product.priceAfterDiscount;

    if (customPrice !== undefined) {
      effectivePrice = customPrice;
      finalDiscountPrice = customPriceAfterDiscount;
    } else if (selectedSize && product.sizes && product.sizes.length > 0) {
      const foundSize = product.sizes.find(s => s.size === selectedSize);
      if (foundSize) {
        effectivePrice = foundSize.priceAfterDiscount && foundSize.priceAfterDiscount > 0
          ? foundSize.priceAfterDiscount
          : foundSize.price;
        finalDiscountPrice = foundSize.priceAfterDiscount;
      }
    }

    const img = product.images && product.images.length > 0 ? product.images[0] : '/images/logo/don-logo-160.png';
    const itemKey = selectedSize ? `${product.id}_${selectedSize}` : String(product.id);

    let exceeded = false;
    setItems(prev => {
      const existing = prev.find(item =>
        String(item.id) === itemKey || (item.productId === product.id && item.selectedSize === selectedSize)
      );

      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > availableStock) {
          exceeded = true;
          return prev.map(item =>
            (String(item.id) === itemKey || (item.productId === product.id && item.selectedSize === selectedSize))
              ? { ...item, quantity: availableStock, stockQuantity: availableStock }
              : item
          );
        }
        return prev.map(item =>
          (String(item.id) === itemKey || (item.productId === product.id && item.selectedSize === selectedSize))
            ? { ...item, quantity: nextQty, stockQuantity: availableStock }
            : item
        );
      }

      return [
        ...prev,
        {
          id: itemKey,
          productId: product.id,
          nameAr: product.nameAr,
          selectedSize,
          price: effectivePrice,
          priceAfterDiscount: finalDiscountPrice,
          quantity: Math.min(quantity, availableStock),
          image: img,
          stockQuantity: availableStock
        }
      ];
    });

    const sizeSuffix = selectedSize ? ` (حجم ${selectedSize})` : '';
    if (exceeded) {
      setToast(`أقصى كمية متوفرة في المخزن من "${product.nameAr}${sizeSuffix}" هي ${availableStock} قطع`);
    } else {
      setToast(`تمت إضافة "${product.nameAr}${sizeSuffix}" إلى السلة`);
    }
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const removeFromCart = (cartItemIdOrProductId: string | number, size?: string) => {
    setItems(prev =>
      prev.filter(item => {
        if (size) {
          return !(item.productId === Number(cartItemIdOrProductId) && item.selectedSize === size);
        }
        return String(item.id) !== String(cartItemIdOrProductId) && item.productId !== cartItemIdOrProductId;
      })
    );
  };

  const updateQuantity = (cartItemIdOrProductId: string | number, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(cartItemIdOrProductId, size);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        const isMatch = size
          ? item.productId === Number(cartItemIdOrProductId) && item.selectedSize === size
          : String(item.id) === String(cartItemIdOrProductId) || item.productId === cartItemIdOrProductId;

        if (isMatch) {
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

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

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
