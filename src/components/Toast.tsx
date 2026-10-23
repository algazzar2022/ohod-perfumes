'use client';

import React from 'react';
import { CheckCircle2, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Toast() {
  const { toast, hideToast, openCart } = useCart();

  if (!toast) return null;

  return (
    <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-stone-950/95 backdrop-blur-md text-white px-3.5 sm:px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-stone-100 truncate">
            {toast}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => {
              hideToast();
              openCart();
            }}
            className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>عرض السلة</span>
          </button>
          <button
            onClick={hideToast}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
