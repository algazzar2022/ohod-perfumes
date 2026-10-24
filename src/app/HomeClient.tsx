'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import HeroBanner from '@/components/HeroBanner';
import Footer from '@/components/Footer';
import { Product, Category, StoreSettings } from '@/lib/db';
import { SlidersHorizontal, PackageX, Loader2, ChevronDown, Check } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'featured', label: 'المميز والأحدث' },
  { value: 'discount', label: 'الأعلى خصماً وعروضاً' },
  { value: 'price-asc', label: 'السعر: من الأقل للأعلى' },
  { value: 'price-desc', label: 'السعر: من الأعلى للأقل' },
] as const;

type SortOptionValue = typeof SORT_OPTIONS[number]['value'];

interface HomeClientProps {
  initialProducts?: Product[];
  initialCategories?: Category[];
  initialSettings?: StoreSettings | null;
}

export default function HomeClient({
  initialProducts = [],
  initialCategories = [],
  initialSettings = null
}: HomeClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [settings, setSettings] = useState<StoreSettings | null>(initialSettings);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOptionValue>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close custom sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // If server already provided the catalog, skip blocking client fetch
    if (initialProducts.length > 0 && initialSettings) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/catalog');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
          setCategories(data.categories || []);
          if (data.settings) {
            setSettings(data.settings);
          }
        } else {
          setError(data.error || 'تعذر تحميل المنتجات');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialProducts.length, initialSettings]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach(c => map.set(c.id, c.nameAr));
    return map;
  }, [categories]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(p =>
        (p.nameAr && p.nameAr.toLowerCase().includes(q)) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        (p.descriptionAr && p.descriptionAr.toLowerCase().includes(q))
      );
    }

    // In stock filter
    if (onlyInStock) {
      result = result.filter(p => p.inStock);
    }

    // Sorting
    result.sort((a, b) => {
      const priceA = a.priceAfterDiscount && a.priceAfterDiscount > 0 ? a.priceAfterDiscount : a.price;
      const priceB = b.priceAfterDiscount && b.priceAfterDiscount > 0 ? b.priceAfterDiscount : b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'discount') {
        const discountA = a.priceAfterDiscount && a.priceAfterDiscount > 0 ? (a.price - a.priceAfterDiscount) : 0;
        const discountB = b.priceAfterDiscount && b.priceAfterDiscount > 0 ? (b.price - b.priceAfterDiscount) : 0;
        return discountB - discountA;
      }
      return 0; // featured / original order
    });

    return result;
  }, [products, selectedCategory, searchTerm, sortBy, onlyInStock]);

  const currentSortLabel = useMemo(() => {
    return SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'المميز والأحدث';
  }, [sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar onSearchChange={setSearchTerm} searchTerm={searchTerm} initialSettings={settings} />

      {/* Main Content Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 w-full">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-500 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
            <span className="text-sm sm:text-base font-bold">جاري تحميل المتجر...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-red-50 rounded-2xl border border-red-200 p-8 max-w-lg mx-auto">
            <p className="text-red-700 font-bold mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-red-700"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            {/* Hero Media Banner (Slideshow / Video) - only rendered with actual settings */}
            {settings && <HeroBanner settings={settings} />}

            {/* Category Pills Slider */}
            <div className="mb-6 w-full">
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2.5 pt-0.5 sm:flex-wrap lg:grid lg:grid-cols-8 scrollbar-none no-scrollbar w-full">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex-shrink-0 whitespace-nowrap sm:flex-1 lg:w-full min-h-[48px] py-2.5 px-4 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition duration-200 shadow-2xs flex items-center justify-center gap-2 text-center cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-amber-700 text-white shadow-amber-700/20 shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <span>الكل</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    selectedCategory === 'all' ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {products.length}
                  </span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex-shrink-0 whitespace-nowrap sm:flex-1 lg:w-full min-h-[48px] py-2.5 px-4 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition duration-200 shadow-2xs flex items-center justify-center gap-2 text-center cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-amber-700 text-white shadow-amber-700/20 shadow-xs'
                          : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      <span className="whitespace-nowrap">{cat.nameAr}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        selectedCategory === cat.id ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters and Sorting Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 shadow-xs relative z-20">
              <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <SlidersHorizontal className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-stone-800 whitespace-nowrap">الترتيب:</span>
                
                {/* Custom In-Page Dropdown */}
                <div className="relative flex-1 sm:flex-none" ref={sortDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="w-full sm:w-auto min-w-[190px] bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-900 text-xs sm:text-sm rounded-xl px-3.5 py-2 outline-none flex items-center justify-between gap-2 font-bold cursor-pointer transition shadow-2xs active:scale-[0.99]"
                    aria-expanded={isSortOpen}
                    aria-label="خيارات ترتيب العطور"
                  >
                    <span className="truncate">{currentSortLabel}</span>
                    <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform duration-200 flex-shrink-0 ${isSortOpen ? 'rotate-180 text-amber-700' : ''}`} />
                  </button>

                  {isSortOpen && (
                    <div className="absolute top-full mt-1.5 right-0 z-30 w-full sm:w-56 bg-white border border-stone-200 rounded-xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-right px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-2 transition cursor-pointer font-bold ${
                            sortBy === opt.value
                              ? 'bg-amber-50 text-amber-800 font-extrabold'
                              : 'text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {sortBy === opt.value && <Check className="w-4 h-4 text-amber-700 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t border-stone-100 sm:border-t-0">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-bold text-stone-800 select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded-md border-stone-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>المتوفر بالمخزن فقط</span>
                </label>
                <span className="sm:hidden text-xs sm:text-sm text-stone-500 font-bold">
                  {filteredProducts.length} عطر
                </span>
              </div>
            </div>

            {/* Products Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto shadow-xs">
                <PackageX className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-stone-800 mb-1">لا توجد نتائج مطابقة لبحثك</h3>
                <p className="text-stone-500 text-xs sm:text-sm mb-6 leading-relaxed">
                  جرّب تغيير كلمات البحث أو إلغاء تصفية الفئة لرؤية المزيد من المنتجات.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                    setOnlyInStock(false);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition"
                >
                  مسح جميع الفلاتر
                </button>
              </div>
            ) : (
              /* Products Grid - Single card on mobile, 2 on tablet, 3-4 on desktop */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={categoryMap.get(product.categoryId)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
