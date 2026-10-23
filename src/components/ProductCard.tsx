'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export default function ProductCard({ product, categoryName }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = React.useState(false);

  const cartItem = items.find(i => i.productId === product.id);
  const inCartCount = cartItem?.quantity || 0;

  const hasDiscount = Boolean(
    product.priceAfterDiscount &&
    product.priceAfterDiscount > 0 &&
    product.priceAfterDiscount < product.price
  );
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100)
    : 0;

  const displayPrice = hasDiscount ? product.priceAfterDiscount : product.price;
  const imageSrc = product.images && product.images[0] ? product.images[0] : '/images/logo/don-logo-160.png';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Image Container */}
      <Link href={`/products/${product.id}`} className="relative block aspect-square bg-stone-100 overflow-hidden">
        <Image
          src={imageSrc}
          alt={product.nameAr}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
              وفر {discountPercent}٪
            </span>
          )}
          {!product.inStock && (
            <span className="bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              نفذت الكمية
            </span>
          )}
        </div>

        {/* Quick view hover icon */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/90 backdrop-blur-xs text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-700" />
            عرض التفاصيل
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {categoryName && (
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
              {categoryName}
            </span>
          )}

          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base line-clamp-1 hover:text-amber-700 transition">
              {product.nameAr}
            </h3>
          </Link>

          {product.descriptionAr && (
            <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">
              {product.descriptionAr}
            </p>
          )}
        </div>

        <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Prices */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-amber-800 font-extrabold text-base sm:text-lg">
                {displayPrice}
              </span>
              <span className="text-stone-500 text-xs font-bold">ج.م</span>
            </div>
            {hasDiscount && (
              <span className="text-stone-400 text-xs line-through block">
                {product.price} ج.م
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition duration-200 shadow-xs ${
              !product.inStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden xs:inline">تمت الإضافة</span>
              </>
            ) : inCartCount > 0 ? (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>في السلة ({inCartCount})</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
