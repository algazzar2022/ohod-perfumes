'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Product, Category } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  CreditCard,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const productId = Number(idStr);

  const { addToCart, items, openCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await fetch('/api/catalog');
        const data = await res.json();
        if (data.success) {
          const found = (data.products as Product[]).find(p => p.id === productId);
          if (found) {
            setProduct(found);
            setSelectedImage(found.images?.[0] || '/images/logo/don-logo-160.png');
            setCategories(data.categories || []);

            // Related products from same category
            const related = (data.products as Product[])
              .filter(p => p.categoryId === found.categoryId && p.id !== found.id)
              .slice(0, 4);
            setRelatedProducts(related);
          } else {
            setError('المنتج غير موجود أو ربما تم حذفه');
          }
        } else {
          setError(data.error || 'تعذر تحميل المنتج');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-stone-500 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
          <span className="text-sm font-bold">جاري تحميل تفاصيل العطر...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-stone-900">{error || 'عذراً، المنتج غير متوفر'}</h2>
            <p className="text-stone-500 text-sm">
              المنتج الذي تبحث عنه غير موجود حالياً، يمكنك تصفح باقي تشكيلة العطور الفاخرة لدينا.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-full text-sm shadow-md transition"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const category = categories.find(c => c.id === product.categoryId);
  const hasDiscount = Boolean(
    product.priceAfterDiscount &&
    product.priceAfterDiscount > 0 &&
    product.priceAfterDiscount < product.price
  );
  const effectivePrice = hasDiscount ? product.priceAfterDiscount : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100)
    : 0;

  const cartItem = items.find(i => i.productId === product.id);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-6">
          <Link href="/" className="hover:text-amber-700 transition">الرئيسية</Link>
          <ChevronRight className="w-4 h-4 text-stone-400 rotate-180" />
          {category && (
            <>
              <Link href={`/categories/${category.id}`} className="hover:text-amber-700 transition">
                {category.nameAr}
              </Link>
              <ChevronRight className="w-4 h-4 text-stone-400 rotate-180" />
            </>
          )}
          <span className="text-stone-900 font-bold truncate max-w-xs">{product.nameAr}</span>
        </nav>

        {/* Product Details Grid */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm p-6 sm:p-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                <Image
                  src={selectedImage || product.images?.[0] || '/images/logo/don-logo-160.png'}
                  alt={product.nameAr}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {hasDiscount && (
                  <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg">
                    وفر {discountPercent}٪
                  </span>
                )}
                {!product.inStock && (
                  <span className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    نفذت الكمية
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                        selectedImage === img ? 'border-amber-600 shadow-md scale-102' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.nameAr} ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info and Actions */}
            <div className="flex flex-col justify-between">
              <div>
                {category && (
                  <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200/60 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {category.nameAr}
                  </span>
                )}

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 leading-snug mb-3">
                  {product.nameAr}
                </h1>

                {/* Stock status */}
                <div className="flex items-center gap-2 mb-6">
                  {product.inStock ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      متوفر في المخزن للطلب الفوري
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                      نفذت الكمية حالياً
                    </span>
                  )}
                </div>

                {/* Price block */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 mb-6 flex items-baseline gap-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-amber-800">
                      {effectivePrice}
                    </span>
                    <span className="text-base font-bold text-stone-600">جنيه مصري</span>
                  </div>
                  {hasDiscount && (
                    <span className="text-base text-stone-400 line-through font-semibold">
                      {product.price} ج.م
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.descriptionAr && (
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-stone-900 mb-2">عن العطر:</h3>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-stone-50/50 p-4 rounded-xl border border-stone-100">
                      {product.descriptionAr}
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity and CTA */}
              <div className="space-y-4 pt-6 border-t border-stone-200">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-stone-700">الكمية:</span>
                  <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white shadow-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || !product.inStock}
                      className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition"
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-bold text-base min-w-12 text-center text-stone-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={!product.inStock}
                      className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition"
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {cartItem && (
                    <span className="text-xs text-stone-500 font-medium">
                      (يوجد {cartItem.quantity} في سلتك)
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`flex-1 py-4 px-8 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition duration-200 active:scale-98 ${
                      !product.inStock
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                        : isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-600/30'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>تمت الإضافة بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>أضف إلى السلة</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (product.inStock) {
                        addToCart(product, quantity);
                        openCart();
                      }
                    }}
                    disabled={!product.inStock}
                    className="sm:w-auto px-6 py-4 rounded-xl border border-amber-600 text-amber-800 hover:bg-amber-50 font-bold text-sm transition"
                  >
                    شراء مباشر الآن
                  </button>
                </div>

                {/* Assurance details */}
                <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-stone-100 text-center">
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-stone-700 block">أصلي ١٠٠٪</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <Truck className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-stone-700 block">شحن لكل مصر</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <CreditCard className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-stone-700 block">انستاباي وكاش</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>عطور قد تعجبك أيضاً</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} categoryName={category?.nameAr} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
