import { getDbAsync } from '@/lib/db';
import { MetadataRoute } from 'next';

export default async function robots(): Promise<MetadataRoute.Robots> {
  try {
    const db = await getDbAsync();
    const settings = db.settings;
    const baseUrl = (settings.canonicalUrl || 'https://ohodperfumes.com').replace(/\/+$/, '');
    const isIndexingAllowed = settings.robotsIndexing !== false;

    if (!isIndexingAllowed) {
      return {
        rules: {
          userAgent: '*',
          disallow: '/',
        },
        sitemap: `${baseUrl}/sitemap.xml`,
      };
    }

    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin', '/api/'],
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  } catch {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      sitemap: 'https://ohod-perfumes.com/sitemap.xml',
    };
  }
}
