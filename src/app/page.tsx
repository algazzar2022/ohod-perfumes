import { Metadata } from 'next';
import { getStoreMetadata } from '@/lib/seo';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return await getStoreMetadata();
}

export default function HomePage() {
  return <HomeClient />;
}
