'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  onSearchChange?: (term: string) => void;
  searchTerm?: string;
}

export default function Navbar({ onSearchChange, searchTerm = '' }: NavbarProps) {
  const { totalItems, toggleCart } = useCart();
  const [showSearch, setShowSearch] = useState(false);

  const [banner, setBanner] = useState<{ enabled: boolean; text: string }>({
    enabled: true,
    text: '🚚 شحن سريع لجميع محافظات مصر | دفع سهل وآمن عبر انستاباي وفودافون كاش | خصومات حصرية لفترة محدودة'
  });

  useEffect(() => {
    async function loadBannerSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setBanner({
            enabled: Boolean(data.settings.bannerEnabled),
            text: data.settings.bannerText || ''
          });
        }
      } catch (err) {
        console.error('Failed to load banner settings in Navbar:', err);
      }
    }
    loadBannerSettings();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Promotional Top Announcement Banner */}
      {banner.enabled && banner.text && (
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white text-xs sm:text-sm font-bold py-2 sm:py-2.5 px-4 text-center shadow-inner transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <span>{banner.text}</span>
          </div>
        </div>
      )}

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/images/logo/don-logo-160.png"
                alt="عطور أحد - Ohod Perfumes"
                fill
                priority
                className="object-contain"
                sizes="48px"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-none group-hover:text-amber-700 transition">
                عطور أحد
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-amber-700 tracking-widest uppercase mt-0.5">
                Ohod Perfumes
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث عن عطرك المفضل بالاسم..."
                value={searchTerm}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 focus:border-amber-600 focus:bg-white rounded-full py-2.5 pr-11 pl-4 text-sm text-stone-800 placeholder-stone-400 outline-none transition duration-200"
              />
              <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-2.5 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="absolute left-3.5 top-2.5 text-xs text-stone-400 hover:text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 text-stone-700 hover:text-amber-700 hover:bg-amber-50 rounded-full transition"
              aria-label="بحث"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Cart Trigger */}
            <button
              onClick={toggleCart}
              className="relative flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-3.5 sm:px-5 py-2.5 rounded-full font-semibold text-sm shadow-md hover:from-amber-700 hover:to-amber-800 transition transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">السلة</span>
              {totalItems > 0 && (
                <span className="bg-white text-amber-800 font-bold text-xs px-2 py-0.5 rounded-full shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search expanded */}
        {showSearch && (
          <div className="md:hidden pb-4 pt-1">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="ابحث عن عطرك المفضل بالاسم..."
                value={searchTerm}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full bg-stone-50 border border-amber-300 rounded-full py-2.5 pr-11 pl-4 text-sm sm:text-base outline-none focus:bg-white"
              />
              <Search className="w-5 h-5 text-amber-600 absolute right-3.5 top-2.5 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="absolute left-3.5 top-2.5 text-xs text-stone-400 bg-stone-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
