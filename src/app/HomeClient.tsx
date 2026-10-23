'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { Product, Category } from '@/lib/db';
import { SlidersHorizontal, PackageX, Loader2 } from 'lucide-react';

export default function HomeClient() {
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
    let list = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.categoryId === selectedCategory);
    }

    // In stock filter
    if (onlyInStock) {
      list = list.filter(p => p.inStock);
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(p =>
        (p.nameAr && p.nameAr.toLowerCase().includes(q)) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        (p.descriptionAr && p.descriptionAr.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      const priceA = a.priceAfterDiscount && a.priceAfterDiscount > 0 ? a.priceAfterDiscount : a.price;
      const priceB = b.priceAfterDiscount && b.priceAfterDiscount > 0 ? b.priceAfterDiscount : b.price;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'discount') {
        const discA = a.priceAfterDiscount && a.priceAfterDiscount > 0 ? a.price - a.priceAfterDiscount : 0;
        const discB = b.priceAfterDiscount && b.priceAfterDiscount > 0 ? b.price - b.priceAfterDiscount : 0;
        return discB - discA;
      }
      return 0; // featured (original order)
    });

    return list;
  }, [products, selectedCategory, onlyInStock, searchTerm, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar searchTerm={searchTerm} onSearchChange={(term) => setSearchTerm(term)} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Categories Bar */}
        <section className="mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition duration-200 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-stone-700 border border-stone-200 hover:border-amber-500 hover:text-amber-800'
              }`}
            >
              جميع العطور ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter(p => p.categoryId === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition duration-200 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-amber-500 hover:text-amber-800'
                  }`}
                >
                  <span>{cat.nameAr}</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filters and Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
              <span>
                {selectedCategory === 'all'
                  ? 'تشكيلة عطور أحد الفاخرة'
                  : categoryMap.get(Number(selectedCategory)) || 'العطور'}
              </span>
              <span className="text-xs sm:text-sm font-medium text-stone-500">
                ({filteredProducts.length} عطر)
              </span>
            </h1>
            {searchTerm && (
              <p className="text-xs text-amber-700 mt-1 font-medium">
                نتائج البحث عن: &ldquo;{searchTerm}&rdquo;
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* In stock only toggle */}
            <label className="flex items-center gap-2 text-xs font-bold text-stone-700 bg-white px-3 py-2 rounded-xl border border-stone-200 cursor-pointer hover:border-stone-300">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <span>المتوفر فقط</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
              <SlidersHorizontal className="w-4 h-4 text-stone-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="ترتيب حسب"
                className="bg-transparent text-xs font-bold text-stone-800 outline-none cursor-pointer"
              >
                <option value="featured">المميز أولاً</option>
                <option value="price-asc">الأقل سعراً</option>
                <option value="price-desc">الأعلى سعراً</option>
                <option value="discount">أعلى خصم</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <span className="text-xs font-bold">جاري تحميل تشكيلة العطور...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-center text-sm font-bold my-8">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto my-12 space-y-3">
            <PackageX className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-black text-stone-900">لا توجد عطور مطابقة للبحث</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              لم نعثر على أي عطور تطابق الفلاتر المحددة، جرّب إزالة البحث أو اختيار قسم آخر.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
                setOnlyInStock(false);
              }}
              className="text-xs font-bold text-amber-700 hover:underline pt-2 cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
