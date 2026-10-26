'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItems
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-700" />
              <h2 className="text-lg sm:text-xl font-bold text-stone-900">سلة التسوق</h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {totalItems} {totalItems === 1 ? 'منتج' : 'منتجات'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">سلة التسوق فارغة</h3>
                <p className="text-stone-500 text-sm max-w-xs mb-6">
                  لم تقم بإضافة أي عطور إلى سلتك بعد. تصفح تشكيلتنا الفاخرة واختر ما يناسبك!
                </p>
                <button
                  onClick={closeCart}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm shadow-md transition"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id || `${item.productId}-${item.selectedSize || 'default'}`} className="py-4 flex gap-4 items-center">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.nameAr}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 text-sm truncate mb-0.5">
                      {item.nameAr}
                    </h4>
                    {item.selectedSize && (
                      <span className="inline-block bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md mb-1">
                        الحجم: {item.selectedSize}
                      </span>
                    )}
                    <div className="text-amber-700 font-extrabold text-sm mb-2">
                      {item.price} ج.م
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition"
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-0.5 text-sm font-bold text-stone-800 min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-500 p-1.5 transition"
                        title="حذف من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right flex-shrink-0">
                    <span className="text-stone-900 font-bold text-sm">
                      {item.price * item.quantity} ج.م
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              <div className="flex justify-between items-center text-stone-600 text-sm">
                <span>المجموع الفرعي</span>
                <span className="text-stone-900 font-bold text-base">{subtotal} ج.م</span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>رسوم الشحن</span>
                <span className="text-amber-700 font-medium">يتم حسابها عند إتمام الطلب</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-base font-extrabold text-stone-900">
                <span>الإجمالي التقريبي</span>
                <span className="text-amber-700 text-xl">{subtotal} ج.م</span>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 text-base transition transform active:scale-98"
              >
                <span>إتمام الطلب الآن</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
