import { getDbAsync } from '@/lib/db';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const db = await getDbAsync();
    const settings = db.settings;
    const baseUrl = (settings.canonicalUrl || 'https://ohodperfumes.com').replace(/\/+$/, '');
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/checkout`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ];

    const categoryRoutes: MetadataRoute.Sitemap = (db.categories || []).map(cat => ({
      url: `${baseUrl}/categories/${cat.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const productRoutes: MetadataRoute.Sitemap = (db.products || []).map(prod => ({
      url: `${baseUrl}/products/${prod.id}`,
      lastModified: prod.updatedAt ? new Date(prod.updatedAt) : now,
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return [
      {
        url: 'https://ohod-perfumes.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}
