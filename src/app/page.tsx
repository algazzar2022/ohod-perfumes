import { Metadata } from 'next';
import { getStoreMetadata } from '@/lib/seo';
import HomeClient from './HomeClient';

export async function generateMetadata(): Promise<Metadata> {
  return await getStoreMetadata();
}

export default function HomePage() {
  return <HomeClient />;
}
