import { Metadata } from 'next';
import { getDbAsync } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const productId = Number(id);
  const db = await getDbAsync();
  const product = db.products.find(p => p.id === productId);
  const settings = db.settings;
  const baseUrl = settings.canonicalUrl || 'https://ohodperfumes.com';
  const cleanBase = baseUrl.replace(/\/+$/, '');

  if (!product) {
    return {
      title: 'المنتج غير موجود | عطور أحد',
      description: 'عفواً، العطر المطلوب غير موجود أو تم حذفه.',
    };
  }

  const category = db.categories.find(c => c.id === product.categoryId);
  const catName = category ? category.nameAr : 'عطور فاخرة';
  const title = `${product.nameAr} - ${catName} | عطور أحد (Ohod Perfumes)`;
  const rawDesc = product.descriptionAr || `تسوق عطر ${product.nameAr} الأصلي من عطور أحد. ثبات يدوم طويلاً بأسعار منافسة في مصر.`;
  const description = rawDesc.replace(/[\r\n]+/g, ' ').slice(0, 160);
  const firstImage = product.images?.[0] || '/images/logo/don-logo-160.png';
  const imageUrl = firstImage.startsWith('http') ? firstImage : `${cleanBase}${firstImage}`;

  const keywords = [
    product.nameAr,
    catName,
    'عطور أحد',
    'Ohod Perfumes',
    'عطور فرنسية أصلية',
    'عطور بدون كحول',
    'شراء عطور أونلاين',
    'زيوت عطرية',
  ];
  if (product.nameEn) keywords.push(product.nameEn);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${cleanBase}/products/${product.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${cleanBase}/products/${product.id}`,
      siteName: settings.storeName || 'عطور أحد | Ohod Perfumes',
      locale: 'ar_EG',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.nameAr,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: settings.twitterHandle || '@ohodperfumes',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);
  const db = await getDbAsync();
  const product = db.products.find(p => p.id === productId);
  const category = product ? db.categories.find(c => c.id === product.categoryId) : null;
  const settings = db.settings;
  const baseUrl = (settings.canonicalUrl || 'https://ohodperfumes.com').replace(/\/+$/, '');

  // Generate Google Schema.org Product JSON-LD for rich snippets
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nameAr,
    image: (product.images || []).map(img => img.startsWith('http') ? img : `${baseUrl}${img}`),
    description: (product.descriptionAr || product.nameAr).replace(/[\r\n]+/g, ' '),
    sku: `OHOD-${product.id}`,
    category: category?.nameAr || 'Perfumes',
    brand: {
      '@type': 'Brand',
      name: 'عطور أحد - Ohod Perfumes',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.id}`,
      priceCurrency: 'EGP',
      price: product.priceAfterDiscount && product.priceAfterDiscount > 0 ? product.priceAfterDiscount : product.price,
      priceValidUntil: '2026-12-31',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'عطور أحد | Ohod Perfumes',
      },
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient
        initialProduct={product || null}
        initialCategories={db.categories || []}
      />
    </>
  );
}
