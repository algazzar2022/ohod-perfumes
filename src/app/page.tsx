'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { Product, Category } from '@/lib/db';
import { SlidersHorizontal, PackageX, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/catalog');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
          setCategories(data.categories || []);
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
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar onSearchChange={setSearchTerm} searchTerm={searchTerm} />

      {/* Main Content Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 w-full">
        {/* Category Pills Slider */}
        <div className="mb-6 w-full">
          <div className="flex items-center gap-2 overflow-x-auto pb-2.5 pt-0.5 sm:flex-wrap lg:grid lg:grid-cols-8 scrollbar-none no-scrollbar w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-[0_0_28%] sm:flex-1 lg:w-full min-h-[46px] py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs xl:text-xs font-bold transition duration-200 shadow-2xs flex items-center justify-center gap-1 flex-shrink-0 text-center ${
                selectedCategory === 'all'
                  ? 'bg-amber-700 text-white shadow-amber-700/20 shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span>الكل</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'all' ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-500'
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
                  className={`flex-[0_0_28%] sm:flex-1 lg:w-full min-h-[46px] py-2 px-1 sm:px-1.5 xl:px-2 rounded-xl text-[10px] sm:text-xs xl:text-xs font-bold transition duration-200 shadow-2xs flex items-center justify-center gap-1 flex-shrink-0 text-center ${
                    selectedCategory === cat.id
                      ? 'bg-amber-700 text-white shadow-amber-700/20 shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <span className="leading-tight text-center">{cat.nameAr}</span>
                  <span className={`text-[10px] font-bold px-1 py-0.2 rounded-full flex-shrink-0 ${
                    selectedCategory === cat.id ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters and Sorting Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-stone-700 whitespace-nowrap">الترتيب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 sm:flex-none bg-stone-50 border border-stone-300 text-stone-800 text-xs sm:text-sm rounded-xl px-3 py-2 sm:py-1.5 outline-none focus:border-amber-600 font-medium cursor-pointer"
            >
              <option value="featured">المميز والأحدث</option>
              <option value="discount">الأعلى خصماً وعروضاً</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t border-stone-100 sm:border-t-0">
            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-stone-700 select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded-md border-stone-300 focus:ring-amber-500"
              />
              <span>المتوفر بالمخزن فقط</span>
            </label>
            <span className="sm:hidden text-xs text-stone-400 font-bold">
              {filteredProducts.length} عطر
            </span>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-500 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
            <span className="text-sm font-bold">جاري تحميل تشكيلة العطور...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-red-50 rounded-2xl border border-red-200 p-8 max-w-lg mx-auto">
            <p className="text-red-700 font-bold mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-red-700"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto shadow-xs">
            <PackageX className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-800 mb-1">لا توجد نتائج مطابقة لبحثك</h3>
            <p className="text-stone-500 text-xs sm:text-sm mb-6">
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
          /* Products Grid */
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
      </main>

      <Footer />
    </div>
  );
}
