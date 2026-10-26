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

  const availableSizes = (product.sizes && product.sizes.length > 0)
    ? product.sizes.filter(s => s.price > 0)
    : [];

  const [selectedSize, setSelectedSize] = React.useState<string>(
    availableSizes.length > 0 ? availableSizes[0].size : '50 مل'
  );

  const currentSizeOpt = availableSizes.find(s => s.size === selectedSize) || (availableSizes.length > 0 ? availableSizes[0] : null);

  const cartItem = items.find(
    i => i.productId === product.id && (!availableSizes.length || i.selectedSize === (currentSizeOpt?.size || selectedSize))
  );
  const inCartCount = cartItem?.quantity || 0;

  const hasDiscount = Boolean(
    currentSizeOpt
      ? (currentSizeOpt.priceAfterDiscount && currentSizeOpt.priceAfterDiscount > 0 && currentSizeOpt.priceAfterDiscount < currentSizeOpt.price)
      : (product.priceAfterDiscount && product.priceAfterDiscount > 0 && product.priceAfterDiscount < product.price)
  );

  const displayPrice = currentSizeOpt
    ? (currentSizeOpt.priceAfterDiscount && currentSizeOpt.priceAfterDiscount > 0 ? currentSizeOpt.priceAfterDiscount : currentSizeOpt.price)
    : (hasDiscount ? product.priceAfterDiscount : product.price);

  const originalPrice = currentSizeOpt ? currentSizeOpt.price : product.price;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const imageSrc = product.images && product.images[0] ? product.images[0] : '/images/logo/don-logo-160.png';

  const isOutOfStock = !product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const sizeToPass = availableSizes.length > 0 ? (currentSizeOpt?.size || selectedSize) : undefined;
    const customPriceToPass = availableSizes.length > 0 ? displayPrice : undefined;
    const customDiscountToPass = availableSizes.length > 0 ? (currentSizeOpt?.priceAfterDiscount || 0) : undefined;
    addToCart(product, 1, sizeToPass, customPriceToPass, customDiscountToPass);
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
            <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
              وفر {discountPercent}٪
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-stone-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full">
              نفذت الكمية
            </span>
          )}
        </div>

        {/* Quick view hover icon */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/90 backdrop-blur-xs text-stone-900 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-700" />
            عرض التفاصيل
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {categoryName && (
            <span className="text-xs sm:text-sm font-bold text-amber-700 uppercase tracking-wider block mb-1">
              {categoryName}
            </span>
          )}

          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-stone-900 text-base sm:text-lg line-clamp-1 hover:text-amber-700 transition">
              {product.nameAr}
            </h3>
          </Link>

          {product.descriptionAr && (
            <p className="text-stone-600 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed font-normal">
              {product.descriptionAr}
            </p>
          )}

          {/* Size Pills */}
          {availableSizes.length > 0 && (
            <div className="pt-2.5">
              <div className="flex items-center gap-1 sm:gap-1.5 w-full flex-nowrap">
                {availableSizes.map((s) => {
                  const isSelected = (currentSizeOpt?.size || selectedSize) === s.size;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSize(s.size);
                      }}
                      className={`flex-1 min-w-0 text-center text-[10px] sm:text-[11px] font-bold py-1 px-1 sm:px-1.5 rounded-lg border transition cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          {/* Prices */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-amber-800 font-extrabold text-lg sm:text-xl">
                {displayPrice}
              </span>
              <span className="text-stone-600 text-xs sm:text-sm font-bold">ج.م</span>
            </div>
            {hasDiscount && (
              <span className="text-stone-400 text-xs sm:text-sm line-through block font-medium">
                {product.price} ج.م
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition duration-200 shadow-xs cursor-pointer ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
            }`}
          >
            {isOutOfStock ? (
              <span>نفذت الكمية</span>
            ) : added ? (
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
