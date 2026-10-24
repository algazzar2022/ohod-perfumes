'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MapPin, ShieldCheck } from 'lucide-react';
import { StoreSettings } from '@/lib/db';

export default function Footer() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'عطور أحد | Ohod Perfumes',
    storeTagline: 'عطور فاخرة بأسعار منافسة في مصر',
    phone: '01015192223',
    whatsapp: '01015192223',
    facebookUrl: 'https://www.facebook.com/groups/448204199913696',
    instagramUrl: 'https://www.instagram.com/nehalmahmoud2022/',
    tiktokUrl: 'https://www.tiktok.com/@nehalmahmoud7',
    bannerEnabled: true,
    bannerText: '🚚 شحن سريع لجميع محافظات مصر | دفع سهل وآمن عبر انستاباي وفودافون كاش | خصومات حصرية لفترة محدودة',
    instapayAccount: '01015192223',
    instapayInstructions: 'يرجى تحويل إجمالي المبلغ عبر تطبيق انستاباي إلى رقم الهاتف أعلاه ثم إدخال رقم هاتفك المحول منه لتأكيد الطلب.',
    vodafoneCashNumber: '01015192223',
    vodafoneCashInstructions: 'يرجى تحويل إجمالي المبلغ لمحفظة فودافون كاش على الرقم أعلاه ثم إدخال رقم المحفظة المحول منها.',
    footerAboutText: 'عطور أحد (Ohod Perfumes) - وجهتك الأولى لأرقى العطور الفرنسية والشرقية الأصلية المركزة بدون كحول في مصر. ثبات يدوم طويلاً بأسعار منافسة وتوصيل فوري لجميع المحافظات.',
    footerAddress: 'جمهورية مصر العربية - توصيل لكافة المحافظات',
    footerGuarantees: [
      'ضمان أصالة المنتجات ١٠٠٪',
      'توصيل سريع وآمن لجميع المحافظات',
      'دفع إلكتروني فوري وموثوق عبر انستاباي وفودافون كاش',
      'خدمة عملاء ومتابعة مستمرة بعد الطلب'
    ],
    footerCopyrightText: '© 2026 عطور أحد - Ohod Perfumes. جميع الحقوق محفوظة.',
    footerDeveloperName: 'MOHAMED ALGAZZAR',
    footerDeveloperUrl: 'https://www.facebook.com/algazzar2015'
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(prev => ({
            ...prev,
            ...data.settings
          }));
        }
      } catch (err) {
        console.error('Failed to load settings in footer:', err);
      }
    }
    loadSettings();
  }, []);

  const guarantees = Array.isArray(settings.footerGuarantees) && settings.footerGuarantees.length > 0
    ? settings.footerGuarantees
    : [
        'ضمان أصالة المنتجات ١٠٠٪',
        'توصيل سريع وآمن لجميع المحافظات',
        'دفع إلكتروني فوري وموثوق عبر انستاباي وفودافون كاش',
        'خدمة عملاء ومتابعة مستمرة بعد الطلب'
      ];

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/images/logo/don-logo-160.png"
                  alt={settings.storeName || 'عطور أحد - Ohod Perfumes'}
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight leading-none">
                  عطور أحد
                </span>
                <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase mt-0.5">
                  Ohod Perfumes
                </span>
              </div>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed">
              {settings.footerAboutText}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {/* Facebook */}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-stone-800 hover:bg-amber-600 flex items-center justify-center text-stone-300 hover:text-white transition duration-200"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" />
                  </svg>
                </a>
              )}
              {/* Instagram */}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-stone-800 hover:bg-pink-600 flex items-center justify-center text-stone-300 hover:text-white transition duration-200"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {/* TikTok */}
              {settings.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-stone-800 hover:bg-amber-600 flex items-center justify-center text-stone-300 hover:text-white transition duration-200 font-bold text-xs"
                  aria-label="TikTok"
                >
                  TikTok
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-b border-stone-800 pb-2">
              أقسام المتجر
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/?category=1" className="hover:text-amber-400 transition">
                  عطور رجالية
                </Link>
              </li>
              <li>
                <Link href="/?category=2" className="hover:text-amber-400 transition">
                  عطور نسائية
                </Link>
              </li>
              <li>
                <Link href="/?category=3" className="hover:text-amber-400 transition">
                  عطور للجنسين
                </Link>
              </li>
              <li>
                <Link href="/?category=4" className="hover:text-amber-400 transition">
                  عطور جاهزة
                </Link>
              </li>
              <li>
                <Link href="/?category=5" className="hover:text-amber-400 transition">
                  بخور ومباخر
                </Link>
              </li>
              <li>
                <Link href="/?category=6" className="hover:text-amber-400 transition">
                  شخصية ومنزلية
                </Link>
              </li>
              <li>
                <Link href="/?category=7" className="hover:text-amber-400 transition text-amber-400 font-bold">
                  عروض وخصومات خاصة 🔥
                </Link>
              </li>
            </ul>
          </div>

          {/* Features / Guarantees */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-b border-stone-800 pb-2">
              خدماتنا وضماناتنا
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              {guarantees.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Admin */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-b border-stone-800 pb-2">
              تواصل معنا
            </h4>
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{settings.footerAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span dir="ltr">{settings.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© 2026 عطور أحد - Ohod Perfumes. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1.5">
            <span>تم التطوير بواسطة</span>
            <a
              href="https://www.facebook.com/algazzar2015"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-bold transition hover:underline"
            >
              MOHAMED ALGAZZAR
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
