'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Product, Category } from '@/lib/db';
import { ChevronRight, Loader2, PackageX, SlidersHorizontal } from 'lucide-react';


function CategoryContent() {
  const params = useParams();
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const categoryId = Number(idStr);

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/catalog');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
          const found = (data.categories as Category[]).find(c => c.id === categoryId);
          setCategory(found || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [categoryId]);

  const categoryProducts = useMemo(() => {
    let list = products.filter(p => p.categoryId === categoryId);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(p =>
        (p.nameAr && p.nameAr.toLowerCase().includes(q)) ||
        (p.descriptionAr && p.descriptionAr.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      const priceA = a.priceAfterDiscount && a.priceAfterDiscount > 0 ? a.priceAfterDiscount : a.price;
      const priceB = b.priceAfterDiscount && b.priceAfterDiscount > 0 ? b.priceAfterDiscount : b.price;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      return 0;
    });

    return list;
  }, [products, categoryId, searchTerm, sortBy]);

  return (
    <>
      <Navbar onSearchChange={setSearchTerm} searchTerm={searchTerm} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-6">
          <Link href="/" className="hover:text-amber-700 transition">الرئيسية</Link>
          <ChevronRight className="w-4 h-4 text-stone-400 rotate-180" />
          <span className="text-stone-900 font-bold">{category?.nameAr || 'الفئة'}</span>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-8 sm:p-12 rounded-3xl mb-8 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-2">
              تصنيف العطور
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mb-3">
              {category?.nameAr || 'عطور أحد'}
            </h1>
            <p className="text-stone-300 text-sm max-w-xl">
              تصفح كل ما يتعلق بـ {category?.nameAr} من تركيبات وزيوت عطرية أصلية وفاخرة.
            </p>
          </div>
          <div className="absolute top-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 mb-8 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-amber-700" />
            <span className="text-xs sm:text-sm font-bold text-stone-700">الترتيب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-50 border border-stone-300 text-stone-800 text-xs sm:text-sm rounded-xl px-3 py-1.5 outline-none font-medium"
            >
              <option value="featured">الأحدث والمميز</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
          </div>
          <span className="text-xs sm:text-sm text-stone-500 font-bold">
            {categoryProducts.length} منتج
          </span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-500 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
            <span className="text-sm font-bold">جاري تحميل عطور القسم...</span>
          </div>
        ) : categoryProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto shadow-xs">
            <PackageX className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-800 mb-1">لا توجد منتجات متوفرة في هذا القسم حالياً</h3>
            <Link
              href="/"
              className="mt-4 inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition"
            >
              تصفح كل العطور
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 mb-12">
            {categoryProducts.map(p => (
              <ProductCard key={p.id} product={p} categoryName={category?.nameAr} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default function CategoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Suspense fallback={
        <div className="flex-1 flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      }>
        <CategoryContent />
      </Suspense>
    </div>
  );
}
