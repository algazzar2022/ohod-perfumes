import { getDbAsync } from '@/lib/db';
import { Metadata } from 'next';

export async function getStoreMetadata(): Promise<Metadata> {
  try {
    const db = await getDbAsync();
    const s = db.settings;
    const title = s.siteTitle || 'عطور أحد | Ohod Perfumes - عطور فرنسية وشرقية أصلية فاخرة في مصر';
    const description = s.metaDescription || 'تسوق أفضل العطور والزيوت العطرية المركزة بدون كحول في مصر من عطور أحد (Ohod Perfumes). عطور فرنسية وشرقية رجالي وحريمي، ثبات عالي وتوصيل سريع لكافة المحافظات مع دفع سهل عبر انستاباي وفودافون كاش.';
    const keywords = (s.metaKeywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const canonical = (s.canonicalUrl || 'https://ohodperfumes.com').replace(/\/+$/, '');
    
    // Resolve absolute image URL for WhatsApp / Facebook / Twitter
    let rawOgImage = s.ogImage || '/images/logo/don-logo-160.png';
    const ogImageUrl = rawOgImage.startsWith('http')
      ? rawOgImage
      : `${canonical}${rawOgImage.startsWith('/') ? '' : '/'}${rawOgImage}`;

    const metadata: Metadata = {
      title,
      description,
      keywords: keywords.length > 0 ? keywords : undefined,
      metadataBase: new URL(canonical),
      alternates: {
        canonical: '/',
      },
      robots: s.robotsIndexing === false ? {
        index: false,
        follow: false,
      } : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: s.storeName || 'عطور أحد | Ohod Perfumes',
        locale: 'ar_EG',
        type: 'website',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: s.storeName || 'عطور أحد',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
        creator: s.twitterHandle || '@ohodperfumes',
      },
      verification: s.googleSiteVerification ? {
        google: s.googleSiteVerification,
      } : undefined,
      icons: {
        icon: [
          { url: '/favicon.ico', sizes: 'any' },
          { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
          { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [
          { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
      },
    };

    return metadata;
  } catch {
    return {
      title: 'عطور أحد | Ohod Perfumes',
      description: 'عطور أحد - عطور فاخرة وأصلية بأسعار منافسة في مصر',
      icons: {
        icon: '/favicon.ico',
        apple: '/icons/apple-touch-icon.png',
      },
    };
  }
}
