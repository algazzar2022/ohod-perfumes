import { getDb } from '@/lib/db';
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  try {
    const db = getDb();
    const settings = db.settings;
    const baseUrl = (settings.canonicalUrl || 'https://ohod-perfumes.com').replace(/\/+$/, '');
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
