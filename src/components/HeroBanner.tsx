'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StoreSettings, HeroSlide } from '@/lib/types';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface HeroBannerProps {
  settings?: StoreSettings | null;
}

export default function HeroBanner({ settings }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const isEnabled = settings?.heroBannerEnabled ?? true;
  const bannerType = settings?.heroBannerType ?? 'slideshow';
  const videoUrl = settings?.heroVideoUrl || '';

  const slides: HeroSlide[] = (settings?.heroSlides && settings.heroSlides.length > 0)
    ? settings.heroSlides.filter(s => Boolean(s.image))
    : [
        {
          image: 'https://res.cloudinary.com/kuypfdzb/image/upload/v1792719223/807590317_1763755772421552_7849880766636249819_n.jpg',
          title: 'عطور أحد | فخامة وثبات استثنائي',
          subtitle: 'أرقى العطور الفرنسية والشرقية الأصلية بدون كحول',
          link: '/categories/7'
        }
      ];

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Autoplay slideshow every 3.8 seconds
  useEffect(() => {
    if (bannerType !== 'slideshow' || totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3800);

    return () => clearInterval(timer);
  }, [bannerType, totalSlides, isPaused, nextSlide]);

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    // RTL swipe: diff < -50 swipe right (next in RTL), diff > 50 swipe left (prev in RTL)
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isEnabled) {
    return null;
  }

  // 1. Video Mode
  if (bannerType === 'video' && videoUrl) {
    return (
      <section className="mb-6 sm:mb-8 w-full">
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-stone-200/90 bg-stone-950">
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            preload="auto"
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    );
  }

  // 2. Slideshow Mode
  if (totalSlides === 0) {
    return null;
  }

  return (
    <section
      className="mb-6 sm:mb-8 w-full select-none"
      aria-label="البانر الترويجي"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-stone-200/90 bg-stone-900 group">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const content = (
            <div
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title || 'عطور أحد'}
                fill
                priority={idx === 0}
                className="object-cover group-hover:scale-102 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 95vw, 1200px"
              />

              {/* Gradient Scrim for text readability if title exists */}
              {(slide.title || slide.subtitle) && (
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex items-end p-4 sm:p-8">
                  <div className="max-w-xl text-white">
                    {slide.title && (
                      <h2 className="text-base sm:text-2xl font-black mb-1 drop-shadow-md text-amber-100">
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="text-xs sm:text-sm font-medium text-stone-200 drop-shadow-sm line-clamp-2">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );

          return slide.link ? (
            <Link key={idx} href={slide.link} className="block w-full h-full">
              {content}
            </Link>
          ) : (
            <div key={idx} className="w-full h-full">
              {content}
            </div>
          );
        })}

        {/* Previous / Next Arrow Controls */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="الشريحة السابقة"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-900/40 hover:bg-stone-900/70 text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="الشريحة التالية"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-900/40 hover:bg-stone-900/70 text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots (Outside the image to keep the full banner clear) */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-2 pt-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`الانتقال إلى الشريحة ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-amber-600 shadow-xs'
                  : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-stone-300 hover:bg-stone-400'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
