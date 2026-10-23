import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Truck, Banknote } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-300 text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>عطور فاخرة وأصلية بأعلى معايير الجودة</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 leading-tight">
            عطور استثنائية تعكس فخامة حضورك
          </h1>

          <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            مجموعة مختارة من أرقى الزيوت العطرية الفرنسية والشرقية، عطور رجالية ونسائية ثبات يدوم طويلاً، مع توصيل لجميع محافظات مصر والدفع عند الاستلام.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <a
              href="#products-section"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold px-8 py-3.5 rounded-full shadow-lg hover:shadow-amber-500/25 transition duration-200 transform hover:-translate-y-0.5"
            >
              تسوق المنتجات الآن
            </a>
            <Link
              href="/categories/27"
              className="bg-stone-800/80 hover:bg-stone-800 border border-amber-500/30 text-amber-300 font-bold px-8 py-3.5 rounded-full transition duration-200"
            >
              العروض والخصومات 🔥
            </Link>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-stone-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">عطور أصلية ١٠٠٪</h3>
              <p className="text-stone-400 text-xs sm:text-sm mt-0.5">زيوت فرنسية مركزة بدون كحول وثبات يدوم 48 ساعة</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">توصيل سريع لكل مصر</h3>
              <p className="text-stone-400 text-xs sm:text-sm mt-0.5">شحن آمن ومباشر لجميع المحافظات حتى باب منزلك</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">الدفع عند الاستلام</h3>
              <p className="text-stone-400 text-xs sm:text-sm mt-0.5">عاين طلبك وتأكد من جودته قبل السداد براحة تامة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
