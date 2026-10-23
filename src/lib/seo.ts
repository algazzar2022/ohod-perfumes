import { getDb } from '@/lib/db';
import { Metadata } from 'next';

export function getStoreMetadata(): Metadata {
  try {
    const db = getDb();
    const s = db.settings;
    const title = s.siteTitle || 'عطور أحد | Ohod Perfumes - عطور فرنسية وشرقية أصلية فاخرة في مصر';
    const description = s.metaDescription || 'تسوق أفضل العطور والزيوت العطرية المركزة بدون كحول في مصر من عطور أحد (Ohod Perfumes). عطور فرنسية وشرقية رجالي وحريمي، ثبات عالي وتوصيل سريع لكافة المحافظات مع دفع سهل عبر انستاباي وفودافون كاش.';
    const keywords = (s.metaKeywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const canonical = s.canonicalUrl || 'https://ohod-perfumes.com';
    const ogImage = s.ogImage || '/images/logo/don-logo-160.png';

    const metadata: Metadata = {
      title,
      description,
      keywords: keywords.length > 0 ? keywords : undefined,
      metadataBase: new URL(canonical.startsWith('http') ? canonical : `https://${canonical}`),
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
            url: ogImage,
            width: 800,
            height: 600,
            alt: s.storeName || 'عطور أحد',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
        creator: s.twitterHandle || '@ohodperfumes',
      },
      verification: s.googleSiteVerification ? {
        google: s.googleSiteVerification,
      } : undefined,
      icons: {
        icon: '/icons/favicon-32.png',
        apple: '/icons/apple-touch-icon.png',
      },
    };

    return metadata;
  } catch {
    return {
      title: 'عطور أحد | Ohod Perfumes',
      description: 'عطور أحد - عطور فاخرة وأصلية بأسعار منافسة في مصر',
      icons: {
        icon: '/icons/favicon-32.png',
        apple: '/icons/apple-touch-icon.png',
      },
    };
  }
}
