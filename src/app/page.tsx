import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getStoreMetadata } from '@/lib/seo';
import { getDbAsync } from '@/lib/db';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return await getStoreMetadata();
}

export default async function HomePage() {
  const db = await getDbAsync();

  return (
    <Suspense fallback={null}>
      <HomeClient
        initialProducts={db.products || []}
        initialCategories={db.categories || []}
        initialSettings={db.settings}
      />
    </Suspense>
  );
}
